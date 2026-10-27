import z from "@deepseek-ai/schemastery";
import { createHash } from "node:crypto";
import { lstat, mkdir, open, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { writeFileAtomic } from "@deepseek-ai/dsh-atomic-write";
// src/host/errors.ts
var StyleError = class extends Error {
	code;
	constructor(code, message) {
		super(message);
		this.code = code;
		this.name = "StyleError";
	}
};
function describeError(error) {
	return error instanceof Error ? error.message : String(error);
}
// src/host/commands.ts
const USAGE = "用法：/custom-style status|enable|disable|reload|reset confirm";
function renderStatus(status) {
	return [
		`状态：${status.enabled ? "已启用" : "已禁用"}`,
		`文件：${status.path}`,
		`字节：${String(status.bytes)}`,
		`revision：${status.revision}`
	].join("\n");
}
async function execute(service, invocation) {
	const args = invocation.rawInput.trim().split(/\s+/u).filter(Boolean);
	const subcommand = args[0];
	try {
		if (subcommand === "status" && args.length === 1) return {
			kind: "success",
			text: renderStatus(await service.status())
		};
		if (subcommand === "enable" && args.length === 1) {
			await service.setEnabled(true);
			return {
				kind: "success",
				text: "自定义样式已启用。"
			};
		}
		if (subcommand === "disable" && args.length === 1) {
			await service.setEnabled(false);
			return {
				kind: "success",
				text: "自定义样式已禁用；CSS 文件仍保留。"
			};
		}
		if (subcommand === "reload" && args.length === 1) {
			const state = await service.reload();
			return {
				kind: "success",
				text: `已重新载入 ${String(state.bytes)} 字节，revision ${state.revision}。`
			};
		}
		if (subcommand === "reset" && args.length === 2 && (args[1] === "confirm" || args[1] === "--confirm")) {
			const current = await service.read();
			await service.reset(current.revision);
			return {
				kind: "success",
				text: "CSS 已重置为空白安全模板。"
			};
		}
		return {
			kind: "error",
			text: USAGE
		};
	} catch (error) {
		if (invocation.signal.aborted) return {
			kind: "error",
			text: "自定义样式操作已取消。"
		};
		return {
			kind: "error",
			text: `自定义样式操作失败：${describeError(error)}`
		};
	}
}
function registerCommands(ctx, service) {
	return ctx.commands.register({
		name: "custom-style",
		description: "查看或管理 Desktop 自定义 CSS",
		input: { hint: "status | enable | disable | reload | reset confirm" },
		handler: (invocation) => execute(service, invocation)
	});
}
// src/shared/protocol.ts
const ENTRY_ID = "minimal-custom-style";
const RPC_CHANNEL = "/minimal-custom-style";
// src/host/rpc.ts
function failure(error) {
	if (error instanceof StyleError) return {
		ok: false,
		error: {
			code: `custom-style/${error.code}`,
			message: error.message,
			details: {}
		}
	};
	return {
		ok: false,
		error: {
			code: "custom-style/io",
			message: `自定义样式操作失败：${describeError(error)}`,
			details: {}
		}
	};
}
function objectPayload(payload) {
	return typeof payload === "object" && payload !== null && !Array.isArray(payload) ? payload : void 0;
}
function registerRpc(connection, service) {
	return connection.rpc.handle(RPC_CHANNEL, async (endpoint, payload) => {
		try {
			if (endpoint === "read") return {
				ok: true,
				value: await service.read()
			};
			if (endpoint === "reload") return {
				ok: true,
				value: await service.reload()
			};
			const body = objectPayload(payload);
			if (body === void 0) throw new StyleError("invalid-request", "请求正文必须是对象。");
			if (endpoint === "save") {
				if (typeof body.css !== "string" || typeof body.revision !== "string") throw new StyleError("invalid-request", "保存请求缺少 css 或 revision。");
				return {
					ok: true,
					value: await service.save(body.css, body.revision)
				};
			}
			if (endpoint === "reset") {
				if (body.confirm !== true || typeof body.revision !== "string") throw new StyleError("invalid-request", "重置需要 confirm: true 和 revision。");
				return {
					ok: true,
					value: await service.reset(body.revision)
				};
			}
			if (endpoint === "set-enabled") {
				if (typeof body.enabled !== "boolean") throw new StyleError("invalid-request", "启用请求缺少布尔 enabled。");
				return {
					ok: true,
					value: await service.setEnabled(body.enabled)
				};
			}
			throw new StyleError("invalid-request", `未知操作：${endpoint}`);
		} catch (error) {
			return failure(error);
		}
	});
}
// src/host/serial-queue.ts
/** 让所有状态操作依提交顺序执行；单个失败不会毒化后续队列。 */
var SerialQueue = class {
	tail = Promise.resolve();
	run(operation) {
		const result = this.tail.then(operation, operation);
		this.tail = result.then(() => void 0, () => void 0);
		return result;
	}
};
// src/host/style-store.ts
const EMPTY_TEMPLATE = `/* DSH Minimal Custom Style
 * 只粘贴你自己编写或已审计的 CSS。
 * CSS 可以隐藏或伪造界面，url() / @import 还可能请求外部资源。
 */
`;
function revisionOf(bytes) {
	return `sha256:${createHash("sha256").update(bytes).digest("base64url")}`;
}
function encodeCss(css) {
	if (!css.isWellFormed()) throw new StyleError("invalid-utf8", "CSS 含有无法编码为 UTF-8 的孤立代理字符。");
	return Buffer.from(css, "utf8");
}
function decodeCss(bytes) {
	try {
		const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
		return text.startsWith("﻿") ? text.slice(1) : text;
	} catch {
		throw new StyleError("invalid-utf8", "CSS 文件不是有效的 UTF-8 文本。");
	}
}
/** 固定单文件存储；公开方法从不接受路径。 */
var StyleStore = class {
	path;
	maxBytes;
	atomicWrite;
	constructor(path, options = {}) {
		this.path = path;
		this.maxBytes = options.maxBytes ?? 262144;
		this.atomicWrite = options.atomicWrite ?? ((target, content) => writeFileAtomic(target, content, {
			mode: 384,
			dirMode: 448
		}));
	}
	async initialize() {
		const directory = dirname(this.path);
		await mkdir(directory, {
			recursive: true,
			mode: 448
		});
		const directoryInfo = await lstat(directory);
		if (!directoryInfo.isDirectory() || directoryInfo.isSymbolicLink()) throw new StyleError("io", "自定义样式目录必须是普通目录，不能是符号链接。");
		try {
			await writeFile(this.path, EMPTY_TEMPLATE, {
				encoding: "utf8",
				flag: "wx",
				mode: 384
			});
		} catch (error) {
			if (error.code !== "EEXIST") throw new StyleError("io", `无法创建 CSS 文件：${describeError(error)}`);
		}
		await this.assertRegularFile();
		await this.read();
	}
	async read() {
		await this.assertRegularFile();
		let handle;
		try {
			handle = await open(this.path, "r");
			const before = await handle.stat();
			if (!before.isFile()) throw new StyleError("io", "CSS 路径不是普通文件。");
			if (before.size > this.maxBytes) throw new StyleError("too-large", `CSS 文件超过 ${String(this.maxBytes)} 字节上限。`);
			const buffer = Buffer.alloc(this.maxBytes + 1);
			const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
			const after = await handle.stat();
			if (before.size !== after.size || before.mtimeMs !== after.mtimeMs) throw new StyleError("io", "CSS 文件在读取过程中发生变化，请重新载入。");
			if (bytesRead > this.maxBytes) throw new StyleError("too-large", `CSS 文件超过 ${String(this.maxBytes)} 字节上限。`);
			const bytes = buffer.subarray(0, bytesRead);
			return {
				css: decodeCss(bytes),
				path: this.path,
				bytes: bytesRead,
				revision: revisionOf(bytes)
			};
		} catch (error) {
			if (error instanceof StyleError) throw error;
			throw new StyleError("io", `无法读取 CSS 文件：${describeError(error)}`);
		} finally {
			await handle?.close();
		}
	}
	async write(css, expectedRevision) {
		const bytes = encodeCss(css);
		if (bytes.byteLength > this.maxBytes) throw new StyleError("too-large", `CSS 内容超过 ${String(this.maxBytes)} 字节上限。`);
		const current = await this.read();
		if (current.revision !== expectedRevision) throw new StyleError("conflict", "CSS 文件已在编辑器外发生变化；草稿未覆盖，请重新载入后再合并。");
		if (revisionOf(bytes) === current.revision) return current;
		try {
			await this.atomicWrite(this.path, bytes);
			return await this.read();
		} catch (error) {
			if (error instanceof StyleError) throw error;
			throw new StyleError("io", `无法原子写入 CSS 文件：${describeError(error)}`);
		}
	}
	reset(expectedRevision) {
		return this.write(EMPTY_TEMPLATE, expectedRevision);
	}
	async assertRegularFile() {
		try {
			const info = await lstat(this.path);
			if (!info.isFile() || info.isSymbolicLink()) throw new StyleError("io", "CSS 路径必须是普通文件，不能是目录或符号链接。");
		} catch (error) {
			if (error instanceof StyleError) throw error;
			throw new StyleError("io", `无法检查 CSS 文件：${describeError(error)}`);
		}
	}
};
// src/host/service.ts
/** UI、RPC 与命令共用的唯一业务服务。 */
var CustomStyleService = class {
	ctx;
	config;
	store;
	queue = new SerialQueue();
	constructor(ctx, config, store) {
		this.ctx = ctx;
		this.config = config;
		this.store = store;
	}
	read() {
		return this.queue.run(async () => this.snapshot());
	}
	status() {
		return this.queue.run(async () => {
			const { css: _css, ...status } = await this.snapshot();
			return status;
		});
	}
	save(css, expectedRevision) {
		return this.queue.run(async () => {
			const file = await this.store.write(css, expectedRevision);
			await this.bumpRefreshToken();
			return {
				...file,
				enabled: this.config.enabled.get()
			};
		});
	}
	reset(expectedRevision) {
		return this.queue.run(async () => {
			const file = await this.store.reset(expectedRevision);
			await this.bumpRefreshToken();
			return {
				...file,
				enabled: this.config.enabled.get()
			};
		});
	}
	reload() {
		return this.queue.run(async () => {
			const snapshot = await this.snapshot();
			await this.bumpRefreshToken();
			return snapshot;
		});
	}
	setEnabled(enabled) {
		return this.queue.run(async () => {
			if (this.config.enabled.get() !== enabled) {
				const revision = this.settingsRevision();
				await this.ctx.settings.update(ENTRY_ID, {
					enabled,
					refreshToken: this.nextRefreshToken()
				}, revision);
			}
			return this.snapshot();
		});
	}
	async snapshot() {
		return {
			...await this.store.read(),
			enabled: this.config.enabled.get()
		};
	}
	settingsRevision() {
		const descriptor = this.ctx.settings.describe().find((row) => row.ns === ENTRY_ID);
		if (descriptor === void 0) throw new Error(`找不到设置命名空间 ${ENTRY_ID}`);
		return descriptor.revision;
	}
	nextRefreshToken() {
		const current = this.config.refreshToken.get();
		return current >= Number.MAX_SAFE_INTEGER ? 0 : current + 1;
	}
	async bumpRefreshToken() {
		try {
			await this.ctx.settings.update(ENTRY_ID, { refreshToken: this.nextRefreshToken() }, this.settingsRevision());
		} catch (error) {
			this.ctx.logger.warn("minimal-custom-style: CSS 已提交，但活动 Client 刷新通知失败", error);
		}
	}
};
// src/host/index.ts
const name = "minimal-custom-style";
const inject = ["commands", "settings"];
const Config = z.object({
	enabled: z.boolean().default(true).volatile(),
	refreshToken: z.number().step(1).min(0).max(Number.MAX_SAFE_INTEGER).default(0).volatile()
});
async function apply(ctx, config) {
	const resolveHome = ctx.dshHomePath;
	if (resolveHome === void 0) throw new Error("minimal-custom-style: DSH home 路径服务不可用");
	const store = new StyleStore(resolveHome("dsh-minimal-custom-style", "custom.css"));
	await store.initialize();
	const service = new CustomStyleService(ctx, config, store);
	ctx.effect(() => ctx.settings.configure({ auto: false }, ctx.fiber), "minimal-custom-style: settings presentation");
	ctx.effect(() => registerCommands(ctx, service), "minimal-custom-style: command");
	ctx.inject(["connection"], (scope) => {
		const connection = scope.root.get("connection");
		if (connection === void 0) return;
		scope.effect(() => registerRpc(connection, service), "minimal-custom-style: authenticated RPC");
	});
	ctx.logger.info("minimal-custom-style: CSS 文件 %s", store.path);
}
export { Config, apply, inject, name };

//# sourceMappingURL=index.mjs.map
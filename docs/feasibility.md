# 可行性调查

调查基线：本机 `dsh --version` 实测为 `0.2.1-rc.3`；官方源码固定到 tag `dsh-v0.2.1-rc.3`（commit `1f81c047fc48fa190a683e469daa699857e9afe8`）。

## 结论

第一版可完全使用公开 API 实现，不需要私有 API、DOM 猜测、未认证自定义 HTTP route、源码/app.asar patch、文件 watcher、轮询、子进程或外部服务器。

1. 外部 Client 插件由一个顶层 Loader row 挂载。包清单声明 `dsh.bundle.patch`、`dsh.client.platform: "web"` 和 `./client` export；`dsh-client-modules` 扫描该 row 的包清单并加载 `lib/client.js`。
2. Desktop 的项目管理器以官方 `web` Profile bundle 初始化 `desktop` Profile；因此这里的 `web` 表示 Electron 内嵌浏览器的 Client 平面，不表示产品支持普通浏览器。本插件仍严格限制为 Desktop-only。
3. 设置页公开扩展点是 `settings.section`。插件通过 `ctx.slots.inject()`/`ctx.slots.register()` 注册独立分区；locale 通过 `ctx.locale.register()` 注册；Cordis effect disposer、Client entry teardown 和 `style[data-plugin]` 所有权共同负责清理。
4. Host 与 Client 使用 `@deepseek-ai/dsh-client-connection` 的公开 `ctx.connection.rpc.handle()` 与 `ctx.connection.rpc.call()`。该调用经过 Desktop 自有 carrier 或 Web carrier 的认证/信任边界，无需插件注册 `webServer` route。
5. 通道继承 Connection 的 Host/Origin、认证 Cookie/Peer 与 Desktop carrier 权限边界。本插件不接触 cookie、token 或凭据。
6. command service 的公开注册面是 `ctx.commands.register({ name, description, input?, handler })`，返回 disposer。命令名为 `custom-style`，子命令由 `invocation.rawInput` 解析。
7. `ctx.commands.execute()` 在 handler 前后只记录命令生命周期，直接调用 handler，不创建 Agent turn；Desktop 斜杠菜单是正式入口。普通 headless prompt 中的 `/custom-style` 不是命令验证入口。
8. `enabled` 使用插件 `Config` 的 `.volatile()` 字段，并通过官方 `ctx.settings.update()` 持久化到活动 Profile patch。`refreshToken` 是同一命名空间的内部易变字段，用于在文件变化后触发官方 `settings/document-updated` 推送；CSS 文件仍是样式内容的唯一持久真源。
9. `StyleStore` 固定到 `ctx.dshHomePath('dsh-minimal-custom-style', 'custom.css')`。revision 为原始文件字节的 SHA-256；保存比较旧 revision 后才通过官方 `writeFileAtomic()` 同目录替换。Host 所有 UI/命令操作还经过一个进程内串行队列。
10. UI 自身操作使用 RPC 返回值立即更新；其它活动 Client 监听公开的 `settings/document-updated`，在本插件 `refreshToken` 改变后重新读取。没有轮询或 watcher。
11. Client effect dispose 主动移除 style、slot、locale 和事件订阅；HMR/替换完成后官方 Client module 生命周期还会移除该包拥有的 `style[data-plugin]`。用户 CSS 文件位于包外，不参与卸载。
12. `desktop` Profile 由 Electron 管理，不能用普通 `dsh --profile desktop --dump-config` 启动/导出；插件安装管理仍使用官方 `dsh plugin --profile desktop ...`。自动验证使用隔离 Profile，真实 Desktop 重启与 UI smoke test 交给用户。

## 最小原型证据

- `packages/client/modules/README.md` 明确要求 `platform: 'web'`、`./client` export 和已构建 Client bundle。
- `apps/desktop/src/project-manager.ts` 使用 `PROFILE_TEMPLATES.web` 创建 Desktop 插件 Profile。
- `packages/client/ui-settings/src/client/contract/slots.ts` 声明 `settings.section`；`ui-settings-general` 实际渲染该 slot。
- `packages/client/connection/src/rpc.ts` 暴露通用认证 RPC；Host `rpc.handle` 的注册随调用方 fiber 清理。
- `packages/interaction/commands/src/index.ts` 的 `execute()` 直接运行 handler，并注明“不发送给模型”。
- `packages/settings/settings/src/index.ts` 为 volatile Config 提供 revisioned、持久化的 `update/mutate`。

## 边界与降级

- 通用 Connection RPC 本身只有 unary call，没有任意第三方事件注册入口；官方 Remote event allowlist 是编译期固定的。因此本插件用自己 Config 中的单调 `refreshToken` 产生合法的 settings invalidation，Client 收到后再做一次 unary read。
- command service 依赖具体会话/Agent 的 UI command adapter，因此 README 只描述 Desktop 交互式 `/custom-style ...`，不会伪造 `dsh custom-style` CLI 子命令。
- 没有发现需要停止并向用户申请突破权限边界的问题。

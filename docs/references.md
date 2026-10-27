# 参考来源

## DeepSeek Harness

- URL：<https://github.com/deepseek-ai/deepseek-harness.git>
- tag：`dsh-v0.2.1-rc.3`
- commit：`1f81c047fc48fa190a683e469daa699857e9afe8`
- 重点查看：
  - `packages/client/modules/README.md`、`src/index.ts`、`src/client/entry-lifecycle.ts`
  - `packages/client/connection/README.md`、`src/rpc.ts`、`src/rpc-host.ts`
  - `packages/client/ui-settings/README.md`、`src/client/contract/slots.ts`
  - `packages/client/ui-settings-general/src/client/index.ts`
  - `packages/client/locale/src/client/index.ts`
  - `packages/interaction/commands/README.md`、`src/index.ts`
  - `packages/compaction/command-compact/src/index.ts`
  - `packages/settings/settings/README.md`、`src/index.ts`
  - `packages/util/atomic-write/src/index.ts`
  - `apps/desktop/src/project-manager.ts`
- 结论：外部包通过顶层 Loader row、`dsh.bundle.patch`、`dsh.client.platform: "web"` 和 `./client` export 进入 Desktop 内嵌 Web Client；设置扩展点为公开的 `settings.section` slot；认证 Host↔Client 调用可使用 `ctx.connection.rpc`；正式斜杠命令通过 `ctx.commands.register()` 注册并由 UI 直接执行，不启动 Agent turn。
- 代码关系：本项目依据上述公开接口独立实现。原子替换直接依赖官方发布包 `@deepseek-ai/dsh-atomic-write`，不复制其实现；没有复制其它官方源码。

## dsh-custom-style

- URL：<https://github.com/yutao8/dsh-custom-style.git>
- commit：`a16170efe109a61226bd29d2fd9b3000f1e40a18`
- 重点查看：`package.json`、`cordis.patch.yml`、`README.md`、`index.js` 与 `client.js` 的行为边界；未运行 `install.mjs`、预览工具或 `tools/asar` 下脚本。
- 结论：仅参考“在设置页编辑 CSS”和 `data-plugin-css` 可审计标记的产品行为；明确不采用其多文件/多主题、图片管理、自定义 Web 路由、约两秒轮询、打开目录、子进程或手写大型 Client bundle 架构。
- 代码关系：没有复制或实质改编该仓库代码，因此不需要第三方代码归属文件。

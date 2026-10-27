# 安全不变量

- 只读写 `$DSH_HOME/dsh-minimal-custom-style/custom.css` 一个固定普通文件。
- API 不接受路径，不枚举目录，不管理图片、字体或其它资源。
- 不使用子进程、自定义 HTTP server/route、轮询、watcher、遥测或自动更新。
- 不读取凭据、会话、工作区、模型上下文或其它插件数据。
- 不 patch `app.asar`、DSH 源码或内置 bundle。
- 写入有 256 KiB 上限、严格 UTF-8 校验、同目录原子替换与 revision 冲突保护。
- UI、RPC 和命令共用同一个核心服务和串行队列。
- CSS 通过 `textContent` 注入；不使用 `innerHTML`、`dangerouslySetInnerHTML`、`eval`、`new Function` 或 `node:vm`。
- 插件自身不发起外部网络请求。用户 CSS 仍可能通过 `url()`/`@import` 请求资源，也可能隐藏、遮挡或伪造 UI；插件不声称能用正则安全净化任意 CSS。
- Desktop UI 不可用时，用户可通过正式插件管理命令禁用/卸载插件；交互式 `/custom-style disable` 或 `/custom-style reset confirm` 适用于 UI 仍可操作的情况。
- 卸载插件不删除用户 CSS 文件。

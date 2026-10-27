# 验证记录

## 自动化范围

- TypeScript 严格类型检查。
- Host ESM、Client module factory 和声明文件构建。
- 固定文件初始化、UTF-8、BOM、空文件、体积上限、原子写失败和 revision 冲突。
- 核心服务串行化、Settings 刷新通知失败语义和启停持久化。
- Connection RPC 请求校验，以及 `/custom-style` 命令适配。
- 单一 `<style>` 所有权、禁用清理、dispose 中止和迟到 RPC 结果丢弃。
- 发布清单、安全禁止项、tarball 内容和解包后入口加载。
- 隔离 Profile 的安装、配置合成与卸载；不使用日常 `desktop` Profile。

验证命令：

```powershell
pnpm run build
pnpm test
npm pack --dry-run
```

## 2026-10-27 本机验证结果

- `pnpm run build` 成功；Host、Client、source map 和声明文件均生成。
- `pnpm test` 成功：7 个测试文件、19 项测试全部通过。
- `npm pack --dry-run --json` 成功：tarball 共 27 个文件，约 31.0 KiB；未包含源码、测试、`_references`、Profile、凭据或临时文件。
- 实际 tarball 解包后，Host ESM 入口导入成功，Client bundle 语法检查和 factory materialization 成功。
- 发布版 `lib` 未发现子进程、watcher、轮询、动态代码执行、自定义 Web route 或危险 HTML 注入机制。
- 使用工作区临时 `DSH_HOME` 和基于 `web` 的 `css-verify` Profile 安装成功；依赖列表只出现 `dsh-minimal-custom-style-plugin@0.1.0`，合成配置只出现一个 `minimal-custom-style` row；卸载成功。
- 隔离 tarball、Profile 和临时 DSH Home 已清理。未启动 Desktop，未修改日常 Desktop Profile。

## 文件提交后的通知失败语义

`custom.css` 原子提交成功后，如果 Settings 的 `refreshToken` 更新失败，Host 会记录 warning，但保存 RPC 仍返回成功。原因是把操作伪装成失败会诱导用户重试已经提交的写入。此时当前 Client 可能不会立即刷新；执行 reload 或重启 Desktop 即可重新读取稳定文件。

## 待用户执行的 Desktop smoke test

1. 备份现有 `custom.css`，完全退出 Desktop，安装生成的 tarball，再启动 Desktop。
2. 确认设置页只出现一个“自定义 CSS”区块，文件路径符合预期。
3. 保存一条容易识别且无网络资源的规则，确认样式立即生效；重启后仍生效。
4. 禁用再启用，确认样式节点随之移除和恢复，文件内容保持不变。
5. 在外部编辑器改动文件后尝试保存旧草稿，确认冲突提示且外部内容未被覆盖。
6. 确认 reload 会读取外部改动；有脏草稿时需要明确确认才丢弃草稿。
7. 确认 reset 需要确认，并恢复为空白安全模板。
8. 验证 `/custom-style status`、`disable`、`enable`、`reload` 和 `reset confirm`。
9. 完全退出 Desktop 后移除插件，确认再次启动正常，且 `custom.css` 仍保留。

人工测试不要使用含 `url()`、`@import`、凭据、隐私数据或来源不明的 CSS。

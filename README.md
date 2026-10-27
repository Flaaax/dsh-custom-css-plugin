# DSH Minimal Custom Style

为 DeepSeek Harness Desktop 提供最小化的自定义 CSS 编辑、持久化和启停能力。插件面向 DSH `0.2.1-rc.3`，当前版本为 `0.1.0`。

> 自定义 CSS 可以隐藏、遮挡或伪造界面，`url()` / `@import` 还可能发起网络请求。只使用你自己编写或已经审计的 CSS。

## 功能

- 在 Desktop 设置页编辑、保存、重新载入、重置和启停 CSS。
- 将内容固定保存到 `$DSH_HOME/dsh-minimal-custom-style/custom.css`；默认 DSH Home 下通常是 `%USERPROFILE%\.dsh\dsh-minimal-custom-style\custom.css`。
- 使用原子写入、256 KiB 上限、严格 UTF-8 校验和 SHA-256 revision 冲突保护。
- 提供 `/custom-style status|enable|disable|reload|reset confirm` 命令。
- 禁用或卸载插件时保留 CSS 文件。

项目内置 CSS 预设已列入后续 TODO，第一版不实现。未来预设仍会写入同一个 `custom.css`，不会成为第二套持久数据。

## 构建

需要 Node.js `22.19.0` 以上的兼容版本，以及 pnpm。

```powershell
pnpm install --frozen-lockfile
pnpm run verify
npm pack
```

`verify` 会执行类型检查、Host/Client 构建、测试和发布清单预检。

## 安装与更新

先构建并生成 `.tgz`，再由用户在完全退出 Desktop 后执行：

```powershell
dsh plugin --profile desktop add "E:\绝对路径\dsh-minimal-custom-style-plugin-0.1.0.tgz"
```

重新启动 Desktop 后，在设置页找到“自定义 CSS”。更新到新包时重复 `add` 命令即可。不要把项目源码目录作为长期 `link:` 安装源；发布 tarball 更接近真实安装结果。

本插件只声明 Desktop 使用的 Web Client 平面，不支持把它当作普通 Web/Headless 产品功能使用。

## 使用

设置页中的“保存并应用”只应用 Host 已确认写入的内容。文件若被外部编辑，旧草稿保存会被 revision 检查拒绝；使用“重新载入”后手工合并。

交互命令：

```text
/custom-style status
/custom-style enable
/custom-style disable
/custom-style reload
/custom-style reset confirm
```

`reset` 必须显式带 `confirm`，并会把文件替换为安全空白模板。

## 禁用、恢复与卸载

界面仍可使用时，在设置页关闭开关，或执行 `/custom-style disable`。如果错误 CSS 导致界面不可用，完全退出 Desktop 后从 Profile 移除插件：

```powershell
dsh plugin --profile desktop remove dsh-minimal-custom-style-plugin
```

移除不会删除 `custom.css`。修复文件后可重新执行安装命令；也可以先把文件重命名为备份，再安装插件，让插件创建新的空白模板。

默认 DSH Home 的备份示例：

```powershell
$css = Join-Path $env:USERPROFILE '.dsh\dsh-minimal-custom-style\custom.css'
Copy-Item -LiteralPath $css -Destination "$css.backup" -Force
```

恢复时先完全退出 Desktop，再把已审计的备份复制回原路径。若设置了 `DSH_HOME`，请使用该目录下的 `dsh-minimal-custom-style\custom.css`。

## 验证状态

自动化已覆盖存储安全边界、并发 revision 冲突、RPC 校验、命令适配、Client 样式所有权、卸载竞态和发布清单。打包及隔离 Profile 验证记录见 [docs/verification.md](docs/verification.md)。

真实 Desktop 设置页、样式效果和重启持久化必须由用户人工验证；本项目不会自动启动、关闭或修改日常 Desktop Profile 来做 UI 测试。

更多设计与安全说明：

- [架构](docs/architecture.md)
- [安全不变量](docs/security.md)
- [路线图 / TODO](docs/roadmap.md)
- [参考与版本钉扎](docs/references.md)

## 许可证

[MIT](LICENSE)

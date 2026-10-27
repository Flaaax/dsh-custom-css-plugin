# Custom CSS

为 DeepSeek Harness **Desktop** 提供最小化、易审计的自定义 CSS 编辑、持久化和启停能力。可在 Desktop 设置页编辑、保存、重新载入、重置和启停 CSS。插件面向 DSH `0.2.1-rc.3`，当前版本 `0.1.0`。

> **安全提示：** 自定义 CSS 可以隐藏、遮挡或伪造界面，`url()` / `@import` 还可能发起网络请求。只使用你自己编写或已经审计的 CSS。

## 安装

从 GitHub 安装正式发布版本：

```powershell
dsh plugin --profile desktop add "https://github.com/Flaaax/dsh-custom-css-plugin.git#v0.1.0"
```

之后重启 Desktop，设置页中会出现“Custom CSS”区块。

> 本插件只声明 Desktop 使用的 Web Client 平面，不支持把它当作普通 Web/Headless 产品功能使用。

## 功能

- 在 Desktop 设置页编辑、保存、重新载入、重置和启停 CSS。
- 将内容固定保存到 `$DSH_HOME/dsh-minimal-custom-style/custom.css`；默认 DSH Home 下通常是 `%USERPROFILE%\.dsh\dsh-minimal-custom-style\custom.css`。
- 使用原子写入、256 KiB 上限、严格 UTF-8 校验和 SHA-256 revision 冲突保护。
- 提供 `/custom-style status|enable|disable|reload|reset confirm` 命令。
- 禁用或卸载插件时保留 CSS 文件。

项目内置 CSS 预设已列入后续 TODO，第一版不实现。未来预设仍会写入同一个 `custom.css`，不会成为第二套持久数据。

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

移除不会删除 `custom.css`。修复文件后可重新安装；也可以先把文件重命名为备份，再安装插件，让插件创建新的空白模板。默认 DSH Home 的备份示例：

```powershell
$css = Join-Path $env:USERPROFILE '.dsh\dsh-minimal-custom-style\custom.css'
Copy-Item -LiteralPath $css -Destination "$css.backup" -Force
```

## 从源码构建

需要 Node.js `22.19.0` 以上的兼容版本，以及 pnpm。

```powershell
pnpm install --frozen-lockfile
pnpm run verify
```

`verify` 会执行类型检查、Host/Client 构建、测试和发布清单预检。

## 文档

- [架构](docs/architecture.md)
- [安全不变量](docs/security.md)
- [验证记录](docs/verification.md)
- [路线图 / TODO](docs/roadmap.md)
- [参考与版本钉扎](docs/references.md)

[English documentation](README.md)

## 许可证

[MIT](LICENSE) © Flaaax

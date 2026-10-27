# 架构

项目使用 TypeScript。Host 编译为 Node.js ESM；Client 编译为 DSH 动态 Client module 所需的浏览器 CJS factory。运行时只增加官方零依赖原子写工具和 DSH API peer。

`StyleStore` 只知道一个固定路径，负责模板创建、严格 UTF-8/体积校验、内容 hash revision 与原子替换。`CustomStyleService` 在其上提供串行化的读取、保存、重置、启停和 reload，并由 RPC 与 command adapter 共同调用。Client 的状态控制器保留已应用快照和未保存草稿；写失败或 revision 冲突都不丢草稿。

```text
settings UI ─┐
             ├─ authenticated Connection RPC ─┐
/custom-style┘                                ├─ CustomStyleService ─ StyleStore ─ custom.css
                                              └─ Settings(enabled, refreshToken)
```

Client 始终最多拥有一个带包标识的 `<style>`。启用时用 `textContent` 写入 Host 已确认的 CSS；禁用和 dispose 时移除。外部编辑只有在 reload、命令 reload 或下次 Desktop 启动时生效。

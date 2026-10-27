# 任务：为 DeepSeek Harness 开发 Desktop 专用的轻量自定义 CSS 插件

请在一个新的空白工作区中，从零设计、实现、测试并交付一个 DeepSeek Harness（DSH）原生插件，为官方 DSH Desktop 提供容易审计、权限克制的自定义 CSS 能力。

暂定命名如下；如果新工作区已经确定其它名称，沿用现有名称并保持所有标识一致：

- 产品名：`DSH Minimal Custom Style`
- 仓库名：`dsh-minimal-custom-style`
- npm 包名：`dsh-minimal-custom-style-plugin`
- Cordis row id：`minimal-custom-style`
- Client module id：使用 npm 包名
- DSH 用户命令：以可行性调查确认的公开 command service 语法为准，建议使用 `/custom-style`

目标不是复刻一个完整主题平台，而是实现以下最小闭环：

1. 用户可以在 DSH Desktop 的设置界面中编辑、应用、重新载入和重置自定义 CSS；
2. CSS 以一个稳定、可备份、可直接编辑的普通文件持久化；
3. 用户也可以通过 DSH 正式命令入口查看状态、配置启用状态、重新载入或重置；
4. 插件只影响 Desktop UI，不修改 DSH 应用本体，不 patch `app.asar`；
5. 不使用轮询、文件监视、任意目录浏览、图片上传、背景图管理或多主题系统；
6. 最终 Desktop smoke test 由用户执行，开发 Agent 不得操作用户的 Desktop UI。

不要只给出方案或代码片段。请实际初始化项目、使用 Git 管理实现过程、完成代码、自动化测试、打包检查和所有不需要操作 Desktop UI 的验证。最终把准确的 Desktop 安装与人工 smoke test 步骤交给用户。

## 开始前必须完成

1. 阅读并遵循当前工作区及其父目录中所有适用的 `AGENTS.md`。
2. 如果插件项目没有 `AGENTS.md`，创建它；如果已经存在，补充而不是覆盖。
3. 插件项目的 `AGENTS.md` 必须明确要求：凡涉及本机 DeepSeek Harness 的安装位置、版本、运行时、Profile 行为、插件安装和验证，必须先读取并遵循：

   ```text
   E:\Projects\Python\PythonWorkspace\Project_DeepSeekHarness\README.md
   ```

4. 不要把上述本机信息复制进插件项目；使用跨工作区引用，避免以后过时。
5. 通过说明文件和只读命令重新确认本机 DSH 版本。当前记录版本为 `0.2.1-rc.3`，但不得只凭本提示词沿用。
6. 阅读当前版本 DSH 的官方 Client module、Cordis、settings slot、locale、Connection/RPC、command service、插件配置和生命周期接口。必要时检查本机安装内容或官方源码，不要根据第三方插件猜测接口。
7. 明确区分：本插件只支持 Desktop，但 `dsh.client.platform` 仍可能必须声明为 `web`，因为它表示 Desktop 内嵌浏览器的 Client 平面。以当前官方源码为准，不要因产品范围是 Desktop 就擅自改成不存在的平台值。

## Git 与工作方式

新工作区若还不是 Git 仓库，自行执行：

```powershell
git init -b main
```

然后：

- 创建适合 Node.js/DSH 插件的 `.gitignore`；
- 排除 `_references/`、`node_modules/`、临时包、覆盖率、测试输出、日志、凭据和 DSH Profile 内容；
- 使用 Git 做小步、语义清楚的提交；
- 每次提交前检查 diff 和 `git status`；
- 不重写或删除用户已有的 Git 历史；
- 不推送远端、不创建 GitHub 仓库、不发布 npm 包、不创建 PR，除非用户之后明确要求；
- 最终报告中列出主要提交，并确认工作树状态。

## 参考仓库

可以按需把参考仓库拉取到当前工作区的 `_references/`。不要求为了形式完整下载所有仓库；只拉取实际需要的内容，并优先使用 shallow clone、partial clone 或 sparse checkout。

允许参考：

```text
_references/deepseek-harness
https://github.com/deepseek-ai/deepseek-harness.git

_references/dsh-custom-style
https://github.com/yutao8/dsh-custom-style.git
```

对 `deepseek-harness`：

- 固定到本机实际 DSH 版本对应的 tag/commit；
- 重点阅读 Client module manifest、bundle 交付、样式所有权与卸载清理、settings slot、locale、Connection/RPC、command service、Desktop Host 与插件安装机制；
- 官方公开接口是实现依据。

对 `dsh-custom-style`：

- 仅作为产品行为、兼容性、选择器和测试场景参考；
- 调查开始时记录实际参考 commit，不要依赖浮动的 `main`；
- 不安装、不启用、不运行该插件；
- 不执行它的安装器、预览工具或 `tools/asar` 中的脚本；
- 不继承其多文件、多主题、图片上传、HTTP 路由、两秒轮询、打开目录或自定义安装器架构；
- 不复制其大型手写 `client.js` 或 Host 实现。

把 `_references/` 加入 `.gitignore`，不得把嵌套仓库打包、发布或提交。

创建 `docs/references.md`，记录每个实际参考仓库的：

- URL；
- tag 和完整 commit SHA；
- 查看过的关键文件；
- 得到的接口或行为结论；
- 是否复制或实质改编了代码。

## 许可证与代码来源

优先基于 DSH 官方公开接口独立实现，不机械复制第三方插件。

如果复制或实质性改编任何代码：

1. 记录来源仓库、文件、commit 和许可证；
2. 保留适用的版权与许可证文本；
3. 在 `THIRD_PARTY_NOTICES.md` 中列明来源和改编内容；
4. 在相关源码中添加准确 attribution；
5. 不要把看过源码后的同结构重写描述为严格 clean-room implementation。

仅借鉴行为和公开接口时，也要在 `docs/references.md` 中诚实记录参考关系。添加本项目 LICENSE 前，先核对实际复用内容的许可证兼容性。

## 第一版产品语义

### 1. 稳定 CSS 文件

插件只管理一个稳定的普通 CSS 文件。默认建议位置：

```text
$DSH_HOME/dsh-minimal-custom-style/custom.css
```

实际路径必须通过当前 DSH 的 Profile/Host 环境规则确认。要求：

- 文件位于插件安装包之外，插件更新或重装不得覆盖它；
- 首次缺失时创建目录和一个只含说明、默认不改变 UI 的空白 CSS 文件；
- 已存在时绝不自动覆盖、迁移或改写；
- UTF-8 文本；
- 单文件体积设置严格上限，建议 256 KiB；
- 写入使用同目录临时文件加原子替换；
- 写入失败时保留原文件；
- 重置表示把文件恢复为可审计的空白模板，不删除目录或其它用户文件；
- 不接受用户指定任意路径；第一版没有自定义目录功能；
- 不读取该目录以外的文件；
- 不管理图片、字体或其它资源文件。

CSS 文件本身是唯一持久真源。Client 内存、组件 state 或 localStorage 只能作为临时草稿，不能成为唯一持久副本。README 必须说明备份位置和恢复方法。

### 2. Desktop 设置 UI

通过 DSH 官方公开 settings slot 注册一个极简设置分区，至少包含：

- 启用/禁用开关；
- CSS 文本编辑框；
- “应用”按钮；
- “重新载入文件”按钮；
- “重置为空白模板”按钮；
- 当前文件路径的只读显示；
- 保存/加载/冲突/超限错误提示；
- 简短安全警告：只粘贴自己编写或审计过的 CSS。

UI 行为：

- 打开页面时通过官方 Host↔Client 通道读取当前文件内容和 revision；
- “应用”先带 revision 提交 Host，Host 原子写入成功后才更新已注入样式；
- 写入失败时保留编辑框草稿，不更新已应用样式；
- 文件在 UI 外被修改后，旧 revision 的保存必须被拒绝，不能静默覆盖；
- “重新载入文件”明确丢弃当前草稿前应要求用户确认，或只在无未保存草稿时直接执行；
- “重置”必须有明确确认，并走同一原子写入路径；
- 禁用时移除插件拥有的 `<style>`，但保留 CSS 文件内容；
- 重新启用时重新读取并应用文件；
- 不使用定时轮询或文件 watcher；外部编辑后的变化由“重新载入”或 Desktop 下次启动读取；
- 不使用 `innerHTML`、`dangerouslySetInnerHTML` 或 DOM 猜测实现设置页。

### 3. CSS 注入与生命周期

Client 只创建一个插件拥有的样式标签，例如：

```html
<style
  data-plugin="dsh-minimal-custom-style-plugin"
  data-plugin-css="dsh-minimal-custom-style-plugin/custom.css"
></style>
```

要求：

- 使用当前 DSH 官方 Client 插件机制；
- 样式内容通过 `textContent` 设置；
- 不解析或执行 JavaScript；
- 不创建重复 style 标签；
- 插件 disable、unload、HMR replacement 或 dispose 时清理样式、订阅和 pending 请求；
- Client 启动后只读取一次；保存、重新载入、重置或启用状态变化时才重新读取；
- 不扫描或修改 DSH 自己的 style 标签；
- 不 patch DSH bundle 或 `app.asar`；
- 允许用户 CSS 使用 DSH 的稳定 `data-*`、ARIA、role 和主题变量，但 README 必须警告哈希类名不稳定。

### 4. DSH 正式命令入口

必须通过当前 DSH 的公开 command service 或其它正式 DSH 命令扩展点提供 Host 入口。不要把普通 headless prompt 中输入的斜杠文本当作命令验证。

建议以一个命令族提供：

```text
/custom-style status
/custom-style enable
/custom-style disable
/custom-style reload
/custom-style reset
```

如果当前公开 API 的准确命令语法不同，以实测为准，但必须实现等价能力：

- `status`：返回启用状态、文件路径、字节数和 revision，不返回完整 CSS；
- `enable` / `disable`：持久保存启用状态；
- `reload`：重新读取稳定文件并通知活动 Client；
- `reset`：明确重置为空白模板，不能删除其它文件；
- 所有命令与 UI 调用同一核心服务和并发锁，不能有两套状态逻辑；
- 命令错误应简短、可诊断，不包含完整 CSS 或无关路径；
- reset 属于破坏性操作，命令语义必须要求明确参数或确认机制，不能误触。

如果 DSH CLI 另有公开的命令调用入口，应在 README 中给出实际验证过的 PowerShell 命令。若当前版本只有交互式 command service，则准确说明边界，不要伪造 `dsh custom-style ...` 子命令。

可以通过 `dsh` 正式插件/config 命令完成安装、启用、禁用、配置检查或恢复；不得要求用户手工修改 Profile 的 `package.json`。开发 Agent可以使用安全的 DSH CLI 配置或重置隔离开发 Profile，但不得操作 Desktop UI。

## 开发前的可行性 spike

正式实现前创建 `docs/feasibility.md`，用官方源码证据和最小原型回答：

1. DSH `0.2.1-rc.3` 的外部 Client 插件怎样声明、构建和随 Desktop 加载？
2. Desktop 是否使用 `dsh.client.platform: "web"`，其准确 manifest 与 `./client` export 要求是什么？
3. settings section、locale 和 style 生命周期的公开接口是什么？
4. 哪个官方 Host↔Client RPC/Connection API可以安全地读取、写入、重置 CSS 文件并返回 revision？
5. 该通道是否继承 Desktop 的认证与权限边界，是否无需自建 HTTP 路由？
6. 当前 command service 的准确注册、调用、dispose 和参数解析接口是什么？
7. command handler 能否在不启动 Agent turn 的情况下调用同一核心服务？
8. enable 状态应通过哪个官方配置或 settings 扩展点持久化？
9. UI 保存、命令 reset 和外部文件编辑之间如何进行 revision 冲突检测和串行化？
10. Client 如何在 reload/reset/enable 事件后得到更新：官方 RPC push、订阅、显式 UI reload，还是需要用户重启？
11. 插件卸载时如何保证样式和订阅清理，同时保留用户 CSS 文件？
12. `desktop` Profile 的 CLI 管理边界是什么，哪些检查可以自动做，哪些必须交给用户在 UI 中完成？

优先验证这一架构：

- Host 持有一个极小的 `StyleStore`：固定路径、原子读写、revision、enable 状态和进程内互斥；
- Host command 与 Client RPC 共享 `StyleStore`；
- Client 通过官方认证 RPC 读写，不注册自定义 HTTP route；
- Client 使用官方 settings slot 提供单页编辑器；
- CSS 文件是持久真源，Client 只保存未提交草稿；
- 没有轮询、文件 watcher、子进程或任意路径。

不要未经验证就假设上述 API 存在。如果当前公开 DSH API 无法同时满足安全 Host↔Client 通信、正式命令入口或 Desktop Client 加载，先记录证据、缺失接口和最小可接受降级，然后停止询问用户。不得用以下方式绕过：

- 私有 API；
- DOM 猜测；
- 未认证自定义 HTTP 路由；
- 修改 DSH 源码；
- patch `app.asar`；
- 让 Client 直接访问本机文件系统；
- 通过普通模型 prompt 假装执行 DSH 命令。

## 技术约束

- 使用现代 TypeScript 或现代 JavaScript；优先选择能保持源码清晰且构建最小的方案，并在架构文档解释选择；
- Host 编译为 Node.js ESM；Client 使用 DSH 官方浏览器 Client bundle 格式；
- 运行时只使用 Node.js 内置模块和必要的 DSH peer/API；
- 不增加普通 production dependencies，除非可行性调查证明不可避免并先向用户报告；
- 提供正确的 `package.json`、`cordis.patch.yml`、Host 入口和 `./client` export；
- 使用 `dsh.bundle.patch` 挂载一个稳定 row；
- `dsh.client.immediately` 只在官方语义确实要求时使用，不把普通样式插件伪装成基础设施；
- 不提供 `preinstall`、`install`、`postinstall` 或自动下载钩子；
- 不使用 `eval`、`new Function`、`node:vm`；
- 不使用 `node:child_process`；
- 不启动浏览器、外部进程或本地服务器；
- 不注册自定义 HTTP route；
- 不访问凭据、API key、会话内容、工作区文件或模型上下文；
- 不发送遥测、更新检查或与插件功能无关的网络请求；
- 不提供远程字体、壁纸、图片上传或 URL 抓取；
- 不修改用户全局提示词、个人 `AGENTS.md`、OpenCode 配置、DSH 内置文件或其它插件；
- 不删除 CSS 文件作为卸载步骤；卸载只移除插件，用户样式保留供备份或重装。

## CSS 安全边界

README 和 UI 必须说明：CSS 不是完全无害的数据。它可以隐藏、遮挡或伪造界面，也可以通过 `url()`、`@import` 等方式触发外部资源请求。

第一版要求：

- 插件自身不主动发起外部网络请求；
- 默认模板不包含任何外部 URL；
- 不把“插件零网络”误写成“任意用户 CSS 绝不会联网”；
- 只建议粘贴用户自己编写或审计过的 CSS；
- 提供可见的禁用和重置路径；
- CSS 读取或解析失败时保持上一次已知可用样式，不能把编辑器草稿静默丢失；
- 不尝试用脆弱正则声称能够安全净化任意 CSS；若要限制 `url()` 或 `@import`，必须使用可靠解析方案并单独评估，否则只做清晰警告。

## 建议项目结构

可以依据官方 API 调整，但职责必须保持清晰：

```text
.
├─ AGENTS.md
├─ package.json
├─ cordis.patch.yml
├─ README.md
├─ LICENSE
├─ THIRD_PARTY_NOTICES.md       # 仅在实际复用时需要
├─ src/
│  ├─ host/
│  │  ├─ index.ts              # Cordis 入口、服务装配与生命周期
│  │  ├─ style-store.ts        # 固定文件、revision、原子写和并发锁
│  │  ├─ commands.ts           # DSH 正式命令入口
│  │  └─ rpc.ts                # 官方认证 Host↔Client 通道
│  ├─ client/
│  │  ├─ index.tsx             # Client 入口、样式生命周期
│  │  ├─ StyleSection.tsx      # 极简设置页
│  │  └─ state.ts              # 草稿、revision 与错误状态机
│  └─ shared/
│     └─ protocol.ts           # 请求/响应与错误契约
├─ test/
│  ├─ style-store.test.*
│  ├─ commands.test.*
│  ├─ rpc.test.*
│  ├─ client.test.*
│  ├─ lifecycle.test.*
│  ├─ security.test.*
│  └─ package.test.*
└─ docs/
   ├─ architecture.md
   ├─ feasibility.md
   ├─ references.md
   ├─ security.md
   └─ verification.md
```

## 自动化测试要求

使用 DSH 当前工具链兼容的 Vitest、`node:test` 或同等轻量方案。至少覆盖：

1. manifest、ESM 入口、`dsh.bundle.patch` 和 `./client` export 正确；
2. 只挂载一个插件 row，不重复注册；
3. CSS 文件缺失时创建空白模板；
4. 已有 CSS 永不被启动流程覆盖；
5. UTF-8 读写、BOM、空文件和体积上限；
6. 原子写成功与 rename/write 失败恢复；
7. 固定路径不接受路径穿越或任意路径；
8. revision 在内容变化时更新，未变化时稳定；
9. 旧 revision 保存被拒绝，草稿不丢失；
10. UI 读取、应用、重新载入、重置和 enable/disable 状态机；
11. 保存失败时不替换已应用样式；
12. 只创建一个 style 标签并使用 `textContent`；
13. disable、dispose、HMR replacement 时清理 style 和订阅；
14. `/custom-style status|enable|disable|reload|reset` 或实测等价命令 handler；
15. 命令与 UI 共享核心服务和互斥锁；
16. 并发 UI 保存、命令 reset 和 reload 不会破坏文件；
17. status 和错误日志不泄露完整 CSS；
18. 不注册自定义 HTTP route；
19. 发布代码不存在 `node:child_process`、浏览器启动、任意目录扫描、图片上传、文件 watcher、定时轮询、遥测或安装钩子；
20. `npm pack --dry-run` 或打到临时目录的 tarball 内容完整，不包含 `_references/`、测试输出、日志、Profile、凭据或开发工具；
21. tarball 解包后 Host 和 Client 入口仍可加载；
22. README 中的安装、配置、恢复和卸载命令与实际验证一致。

不得以单元测试通过代替真实 DSH 的非 UI 集成检查，也不得把未执行的 Desktop UI smoke test描述成已验证。

## 本机 DSH 验证边界

开发 Agent可以自行执行不操作 Desktop UI 的验证：

- `dsh --version`；
- 使用 DSH 官方插件命令在隔离开发 Profile 安装、更新、启用、禁用或移除当前插件；
- 配置 dump；
- Host command service 集成测试；
- RPC 集成测试；
- bundle、tarball 和依赖检查；
- 必要时创建并在验证后清理本任务专用临时 Profile；
- 通过 DSH 正式命令配置或重置隔离 Profile 中的插件状态。

不得：

- 启动、关闭、重启或控制用户的 DeepSeek Harness Desktop；
- 使用 computer-use、UI 自动化、鼠标键盘模拟或屏幕读取操作 Desktop；
- 为了 smoke test 修改用户正在使用的 Desktop 状态；
- 把用户尚未执行的检查记为通过。

真实 Desktop smoke test必须交给用户。开发完成后提供一组简短、准确的人工步骤，至少验证：

1. 使用 DSH 官方命令安装到 `desktop` Profile；
2. 完全退出并重新启动 Desktop；
3. “设置”中出现自定义 CSS 页面；
4. 输入一条容易识别、可恢复的测试规则并应用；
5. 重启 Desktop 后样式仍存在；
6. 直接编辑稳定 CSS 文件，使用“重新载入”后生效；
7. DSH 命令的 status、disable、enable 和 reset 行为正确；
8. disable 后样式消失但 CSS 文件仍保留；
9. reset 后恢复默认外观；
10. 卸载插件后 Desktop 正常启动，CSS 文件仍可备份。

用户完成后可以把结果和日志反馈给开发 Agent继续修复，但开发 Agent不得替用户执行这些 UI 步骤。

## 文档要求

`README.md` 默认使用中文，至少包括：

- 插件目标与严格的 Desktop-only 第一版边界；
- 为什么 manifest 可能仍使用 `platform: "web"`；
- CSS 稳定文件的准确路径、备份和恢复方法；
- 设置 UI 的使用方法；
- DSH 正式命令的准确语法；
- 本地目录、未来 GitHub URL 和未来 npm 包三种安装形式，但不得声称未发布渠道已经可用；
- 使用 DSH 官方插件命令安装、更新、禁用和卸载；
- Desktop 完整重启要求；
- CSS 的视觉欺骗与外部资源请求风险；
- 插件自身没有网络、遥测、凭据、任意文件、子进程或 app patch 权限；
- 外部编辑后如何重新载入；
- revision 冲突时如何恢复草稿；
- 样式导致 UI 不可用时，如何通过 DSH CLI disable/reset 恢复，不能要求先打开已经不可用的设置页；
- 卸载不会删除用户 CSS 文件；
- 已验证与尚未由用户验证的项目清单；
- 许可证和参考来源。

`docs/security.md` 应列出安全不变量：

- 固定单一 CSS 文件；
- 无任意路径；
- 无目录枚举接口；
- 无图片或其它资源管理；
- 无子进程；
- 无自定义 HTTP server/route；
- 无轮询和 watcher；
- 无凭据；
- 无遥测；
- 无自动更新；
- 无 `app.asar` 或 DSH 源码 patch；
- 所有写入原子化并有 revision 冲突保护；
- Desktop UI 失败时存在不依赖 UI 的 DSH 命令恢复路径。

## 推进顺序

1. 读取 AGENTS 与本机 DSH 说明；
2. 初始化 Git，创建 `.gitignore` 并提交项目骨架；
3. 重新确认 DSH 版本；
4. 按需拉取并固定参考仓库；
5. 完成 `docs/references.md`；
6. 完成 feasibility spike 和 `docs/feasibility.md`；
7. 先向用户报告接口结论、架构和边界问题；
8. 若公开 API 可行，继续完成 `docs/architecture.md` 与 `docs/security.md`；
9. 先实现 StyleStore、revision、原子写和测试；
10. 接入 DSH command service；
11. 接入官方 Host↔Client RPC；
12. 实现 Client 样式生命周期；
13. 实现极简 settings UI；
14. 完成并发、失败恢复和安全测试；
15. 构建、打包并检查 tarball；
16. 在隔离 Profile 完成所有非 UI 集成验证；
17. 编写 Desktop 人工 smoke test清单，但不要执行；
18. 检查 Git 历史、diff 和工作树，确保没有参考仓库、秘密或临时产物。

普通实现问题自行调查和解决，不要在每一步等待确认。只有出现以下情况才停止询问用户：

- 当前公开 DSH API 无法安全实现 Host↔Client CSS 读写；
- 无公开正式 command service 或等价 DSH 命令扩展点；
- 必须自建未认证 HTTP 路由；
- 必须使用私有 API、DOM 猜测、DSH 源码 patch 或 `app.asar` patch；
- 必须启动子进程、浏览器或外部服务器；
- 无法保证稳定 CSS 文件不被更新/卸载覆盖；
- 无法提供不依赖 Desktop UI 的安全恢复路径；
- 需要突破本提示词的第一版权限或产品边界。

## 首次汇报内容

完成调查和 feasibility spike 后，先向用户简短报告：

1. 实际 DSH 版本和对应官方 commit；
2. 实际参考仓库及 commit；
3. Desktop Client、settings slot、RPC 和 command service 接口结论；
4. 纯公开 API 架构是否可行；
5. 稳定 CSS 文件路径与原子/revision 方案；
6. 最终项目目录和实施计划；
7. 是否发现必须停止确认的边界问题。

如果没有边界问题，汇报后继续实现，不等待不必要的确认。

## 完成标准

只有同时满足以下条件才算开发完成：

- 项目已自行初始化 Git，并具有清晰的小步提交；
- 插件只面向 DSH Desktop `0.2.1-rc.3` 或实际确认版本；
- 使用 DSH 官方 Client、settings、RPC 和 command API；
- CSS 稳定存储在包外的单一普通文件；
- UI 与 DSH 命令都能操作同一份状态；
- UI 保存失败不丢草稿，外部修改有 revision 冲突保护；
- 样式注入可即时更新且生命周期清理正确；
- 无轮询、watcher、自定义 HTTP route、任意路径、图片管理、子进程、网络、遥测、凭据或安装钩子；
- 自动测试、包测试、安全不变量测试和非 UI DSH 集成测试全部通过；
- README 中的命令与实际执行结果一致；
- `_references/`、凭据、Profile 和临时产物未提交或打包；
- 已生成真实 Desktop 人工 smoke test步骤；
- Desktop smoke test明确标记为“等待用户执行”，不得虚报通过。

## 最终汇报格式

完成后简洁汇报：

1. 实现结果、DSH 版本和参考 commit；
2. 主要文件及职责；
3. CSS 文件位置、UI 与命令行为；
4. 第一版安全边界是否全部保持；
5. 实际运行过的测试、打包和非 UI 集成验证；
6. Git 提交摘要和工作树状态；
7. 用户安装、更新、配置、重置和卸载所需的准确命令；
8. 用户需要亲自执行的 Desktop smoke test清单；
9. 已知限制。

不要把未运行的检查描述为已验证，不要把用户尚未执行的 Desktop smoke test描述为通过，也不要把候选安装渠道描述为已发布版本。

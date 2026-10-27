export const zh = {
  nav: '自定义样式',
  title: 'DSH Minimal Custom Style',
  enable: '启用自定义 CSS',
  path: 'CSS 文件',
  editor: 'CSS 编辑器',
  apply: '应用',
  reload: '重新载入文件',
  reset: '重置为空白模板',
  warning: '只粘贴你自己编写或已经审计过的 CSS。CSS 可以隐藏或伪造界面，也可能通过 url() / @import 请求外部资源。',
  dirty: '有未保存草稿',
  reloadConfirm: '重新载入会丢弃当前未保存草稿，是否继续？',
  resetConfirm: '确定把 CSS 文件重置为空白安全模板吗？此操作会覆盖当前文件。',
  bytes: '字节',
  revision: 'revision',
} as const

export const en: Record<keyof typeof zh, string> = {
  nav: 'Custom Style',
  title: 'DSH Minimal Custom Style',
  enable: 'Enable custom CSS',
  path: 'CSS file',
  editor: 'CSS editor',
  apply: 'Apply',
  reload: 'Reload file',
  reset: 'Reset to blank template',
  warning: 'Only paste CSS you wrote or audited. CSS can hide or spoof UI and may request external resources through url() or @import.',
  dirty: 'Unsaved draft',
  reloadConfirm: 'Reloading discards the unsaved draft. Continue?',
  resetConfirm: 'Reset the CSS file to the blank safety template? This overwrites the current file.',
  bytes: 'bytes',
  revision: 'revision',
}

export type LocaleKey = keyof typeof zh

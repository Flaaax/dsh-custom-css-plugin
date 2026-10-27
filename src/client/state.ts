import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { ConnectionRpcResult } from '@deepseek-ai/dsh-client-connection/client'
import { ENTRY_ID, RPC_CHANNEL, type StyleSnapshot } from '../shared/protocol.ts'
import type { StyleOwner } from './style-owner.ts'

export type NoticeTone = 'info' | 'success' | 'error'

export interface ClientState {
  status: 'loading' | 'ready' | 'error'
  snapshot?: StyleSnapshot
  draft: string
  dirty: boolean
  busy: boolean
  notice: { readonly tone: NoticeTone; readonly text: string } | undefined
}

export interface ClientRpc {
  call(channel: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<ConnectionRpcResult<unknown>>
}

function isSnapshot(value: unknown): value is StyleSnapshot {
  if (typeof value !== 'object' || value === null) return false
  const row = value as Record<string, unknown>
  return typeof row.enabled === 'boolean'
    && typeof row.css === 'string'
    && typeof row.path === 'string'
    && typeof row.bytes === 'number'
    && typeof row.revision === 'string'
}

/** 保存已确认快照与草稿；任何 Host 失败都不覆盖草稿或已应用样式。 */
export class StyleController {
  readonly state = createSnapshotStore<ClientState>({
    status: 'loading', draft: '', dirty: false, busy: false, notice: undefined,
  })
  private readonly lifetime = new AbortController()
  private disposed = false

  constructor(private readonly rpc: ClientRpc, private readonly styles: StyleOwner) {}

  async start(): Promise<void> {
    await this.read(false, false)
  }

  setDraft(draft: string): void {
    this.state.update((state) => {
      state.draft = draft
      state.dirty = draft !== state.snapshot?.css
      state.notice = undefined
    })
  }

  async save(): Promise<void> {
    const current = this.state.getSnapshot()
    if (current.busy || current.snapshot === undefined) return
    await this.perform('save', { css: current.draft, revision: current.snapshot.revision }, true)
  }

  async setEnabled(enabled: boolean): Promise<void> {
    if (this.state.getSnapshot().busy) return
    await this.perform('set-enabled', { enabled }, false)
  }

  async reload(discardDraft: boolean): Promise<void> {
    if (this.state.getSnapshot().dirty && !discardDraft) return
    await this.read(true, true)
  }

  async reset(): Promise<void> {
    const current = this.state.getSnapshot()
    if (current.busy || current.snapshot === undefined) return
    await this.perform('reset', { revision: current.snapshot.revision, confirm: true }, true)
  }

  async refreshFromSettings(namespace: string): Promise<void> {
    if (namespace !== ENTRY_ID || this.state.getSnapshot().busy) return
    await this.read(false, false)
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.lifetime.abort(new DOMException('插件已卸载', 'AbortError'))
    this.styles.remove()
  }

  private async read(replaceDraft: boolean, explicit: boolean): Promise<void> {
    if (this.disposed) return
    this.state.update((state) => { state.busy = true; state.notice = undefined })
    try {
      const result = await this.rpc.call(RPC_CHANNEL, explicit ? 'reload' : 'read', {}, this.lifetime.signal)
      if (this.disposed) return
      if (!result.ok) throw new Error(result.error.message)
      this.accept(result.value, replaceDraft, explicit ? '已重新载入 CSS 文件。' : undefined)
    } catch (error) {
      if (this.disposed) return
      this.fail(error)
    }
  }

  private async perform(endpoint: string, payload: unknown, replaceDraft: boolean): Promise<void> {
    this.state.update((state) => { state.busy = true; state.notice = undefined })
    try {
      const result = await this.rpc.call(RPC_CHANNEL, endpoint, payload, this.lifetime.signal)
      if (this.disposed) return
      if (!result.ok) throw new Error(result.error.message)
      this.accept(result.value, replaceDraft, endpoint === 'save' ? 'CSS 已保存并应用。'
        : endpoint === 'reset' ? 'CSS 已重置为空白模板。'
          : undefined)
    } catch (error) {
      if (this.disposed) return
      this.fail(error)
    }
  }

  private accept(value: unknown, replaceDraft: boolean, success?: string): void {
    if (!isSnapshot(value)) throw new Error('Host 返回了无效的样式快照。')
    this.styles.apply(value)
    this.state.update((state) => {
      const keepDraft = state.dirty && !replaceDraft
      state.status = 'ready'
      state.snapshot = value
      state.draft = keepDraft ? state.draft : value.css
      state.dirty = state.draft !== value.css
      state.busy = false
      state.notice = success === undefined
        ? keepDraft ? { tone: 'info', text: '文件状态已更新；未保存草稿仍保留。' } : undefined
        : { tone: 'success', text: success }
    })
  }

  private fail(error: unknown): void {
    const text = error instanceof Error ? error.message : String(error)
    this.state.update((state) => {
      state.status = state.snapshot === undefined ? 'error' : 'ready'
      state.busy = false
      state.notice = { tone: 'error', text }
    })
  }
}

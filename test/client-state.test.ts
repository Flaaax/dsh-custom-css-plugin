// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StyleController, type ClientRpc } from '../src/client/state.ts'
import { StyleOwner } from '../src/client/style-owner.ts'
import type { StyleSnapshot } from '../src/shared/protocol.ts'

function snapshot(css: string, revision = 'r1', enabled = true): StyleSnapshot {
  return { css, revision, enabled, path: 'C:\\fake\\custom.css', bytes: css.length }
}

describe('StyleController', () => {
  beforeEach(() => { document.head.innerHTML = '' })

  it('初次读取、保存和禁用会更新已确认样式', async () => {
    const answers = [snapshot('a{}'), snapshot('b{}', 'r2'), snapshot('b{}', 'r2', false)]
    const rpc: ClientRpc = { call: vi.fn(async () => ({ ok: true as const, value: answers.shift() })) }
    const controller = new StyleController(rpc, new StyleOwner())
    await controller.start()
    expect(document.head.querySelector('style')?.textContent).toBe('a{}')
    controller.setDraft('b{}')
    await controller.save()
    expect(controller.state.getSnapshot()).toMatchObject({ draft: 'b{}', dirty: false })
    await controller.setEnabled(false)
    expect(document.head.querySelector('style')).toBeNull()
    controller.dispose()
  })

  it('保存失败保留草稿和上一次已应用样式', async () => {
    const rpc: ClientRpc = { call: vi.fn()
      .mockResolvedValueOnce({ ok: true, value: snapshot('good{}') })
      .mockResolvedValueOnce({ ok: false, error: { code: 'custom-style/conflict', message: '冲突', details: {} } }) }
    const controller = new StyleController(rpc, new StyleOwner())
    await controller.start()
    controller.setDraft('draft{}')
    await controller.save()
    expect(controller.state.getSnapshot()).toMatchObject({ draft: 'draft{}', dirty: true })
    expect(document.head.querySelector('style')?.textContent).toBe('good{}')
  })

  it('推送刷新保留脏草稿，但应用 Host 已确认样式', async () => {
    const rpc: ClientRpc = { call: vi.fn()
      .mockResolvedValueOnce({ ok: true, value: snapshot('old{}') })
      .mockResolvedValueOnce({ ok: true, value: snapshot('external{}', 'r2') }) }
    const controller = new StyleController(rpc, new StyleOwner())
    await controller.start()
    controller.setDraft('draft{}')
    await controller.refreshFromSettings('minimal-custom-style')
    expect(controller.state.getSnapshot()).toMatchObject({ draft: 'draft{}', dirty: true })
    expect(document.head.querySelector('style')?.textContent).toBe('external{}')
  })

  it('dispose 会中止在途请求、移除样式，且忽略迟到结果', async () => {
    let resolve: ((value: { readonly ok: true; readonly value: StyleSnapshot }) => void) | undefined
    let signal: AbortSignal | undefined
    const rpc: ClientRpc = { call: vi.fn((_channel, _endpoint, _payload, requestSignal) => {
      signal = requestSignal
      return new Promise<{ readonly ok: true; readonly value: StyleSnapshot }>(value => { resolve = value })
    }) }
    const owner = new StyleOwner()
    owner.apply(snapshot('old{}'))
    const controller = new StyleController(rpc, owner)
    const pending = controller.start()
    controller.dispose()
    expect(signal?.aborted).toBe(true)
    expect(document.head.querySelector('style')).toBeNull()
    resolve?.({ ok: true, value: snapshot('late{}') })
    await pending
    expect(document.head.querySelector('style')).toBeNull()
  })
})

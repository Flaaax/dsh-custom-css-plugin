import type { ConnectionRpcHandler, HostConnectionHandle } from '@deepseek-ai/dsh-client-connection'
import { describe, expect, it, vi } from 'vitest'
import { registerRpc } from '../src/host/rpc.ts'
import type { CustomStyleService } from '../src/host/service.ts'

describe('认证 RPC', () => {
  it('只注册官方 Connection channel，并校验写入与重置请求', async () => {
    let handler: ConnectionRpcHandler | undefined
    const dispose = vi.fn(async () => undefined)
    const connection = { rpc: { handle: vi.fn((_channel: string, value: ConnectionRpcHandler) => {
      handler = value
      return dispose
    }) } } as unknown as HostConnectionHandle
    const snapshot = { enabled: true, css: '', path: 'x', bytes: 0, revision: 'r1' }
    const service = {
      read: vi.fn(async () => snapshot), reload: vi.fn(async () => snapshot),
      save: vi.fn(async () => snapshot), reset: vi.fn(async () => snapshot), setEnabled: vi.fn(async () => snapshot),
    } as unknown as CustomStyleService
    expect(registerRpc(connection, service)).toBe(dispose)
    const signal = new AbortController().signal
    const peer = {} as Parameters<ConnectionRpcHandler>[3]
    expect(await handler?.('read', {}, signal, peer)).toMatchObject({ ok: true })
    expect(await handler?.('save', { css: 'a{}' }, signal, peer)).toMatchObject({ ok: false, error: { code: 'custom-style/invalid-request' } })
    expect(await handler?.('reset', { revision: 'r1' }, signal, peer)).toMatchObject({ ok: false })
    expect(await handler?.('reset', { revision: 'r1', confirm: true }, signal, peer)).toMatchObject({ ok: true })
  })
})

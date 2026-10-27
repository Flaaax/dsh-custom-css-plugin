import type {} from '@deepseek-ai/dsh-client-connection'
import type { Context } from '@deepseek-ai/cordis'
import { RPC_CHANNEL, type RpcFailure } from '../shared/protocol.ts'
import { StyleError, describeError } from './errors.ts'
import type { CustomStyleService } from './service.ts'

function failure(error: unknown): { ok: false; error: RpcFailure } {
  if (error instanceof StyleError) {
    return { ok: false, error: { code: `custom-style/${error.code}`, message: error.message, details: {} } }
  }
  return {
    ok: false,
    error: { code: 'custom-style/io', message: `自定义样式操作失败：${describeError(error)}`, details: {} },
  }
}

function objectPayload(payload: unknown): Record<string, unknown> | undefined {
  return typeof payload === 'object' && payload !== null && !Array.isArray(payload)
    ? payload as Record<string, unknown>
    : undefined
}

export function registerRpc(ctx: Context, service: CustomStyleService): () => Promise<void> {
  return ctx.connection.rpc.handle(RPC_CHANNEL, async (endpoint, payload) => {
    try {
      if (endpoint === 'read') return { ok: true, value: await service.read() }
      if (endpoint === 'reload') return { ok: true, value: await service.reload() }
      const body = objectPayload(payload)
      if (body === undefined) throw new StyleError('invalid-request', '请求正文必须是对象。')
      if (endpoint === 'save') {
        if (typeof body.css !== 'string' || typeof body.revision !== 'string') {
          throw new StyleError('invalid-request', '保存请求缺少 css 或 revision。')
        }
        return { ok: true, value: await service.save(body.css, body.revision) }
      }
      if (endpoint === 'reset') {
        if (body.confirm !== true || typeof body.revision !== 'string') {
          throw new StyleError('invalid-request', '重置需要 confirm: true 和 revision。')
        }
        return { ok: true, value: await service.reset(body.revision) }
      }
      if (endpoint === 'set-enabled') {
        if (typeof body.enabled !== 'boolean') {
          throw new StyleError('invalid-request', '启用请求缺少布尔 enabled。')
        }
        return { ok: true, value: await service.setEnabled(body.enabled) }
      }
      throw new StyleError('invalid-request', `未知操作：${endpoint}`)
    } catch (error) {
      return failure(error)
    }
  })
}

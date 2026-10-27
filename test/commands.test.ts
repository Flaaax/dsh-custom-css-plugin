import type { Context } from '@deepseek-ai/cordis'
import type { CommandDefinition, CommandInvocation } from '@deepseek-ai/dsh-commands'
import { describe, expect, it, vi } from 'vitest'
import { registerCommands } from '../src/host/commands.ts'
import type { CustomStyleService } from '../src/host/service.ts'

function invocation(rawInput: string): CommandInvocation {
  return { rawInput, signal: new AbortController().signal } as CommandInvocation
}

describe('/custom-style', () => {
  it('注册正式命令并处理 status/enable/disable/reload/reset', async () => {
    let definition: CommandDefinition | undefined
    const ctx = { commands: { register: (value: CommandDefinition) => { definition = value; return () => undefined } } } as unknown as Context
    const service = {
      status: vi.fn(async () => ({ enabled: true, path: 'C:\\custom.css', bytes: 12, revision: 'sha256:x' })),
      setEnabled: vi.fn(async () => ({ })),
      reload: vi.fn(async () => ({ bytes: 12, revision: 'sha256:x' })),
      read: vi.fn(async () => ({ revision: 'sha256:x' })),
      reset: vi.fn(async () => ({ })),
    } as unknown as CustomStyleService
    registerCommands(ctx, service)
    expect(definition?.name).toBe('custom-style')
    expect(await definition?.handler(invocation('status'))).toMatchObject({ kind: 'success', text: expect.not.stringContaining('body') })
    await definition?.handler(invocation('enable'))
    await definition?.handler(invocation('disable'))
    await definition?.handler(invocation('reload'))
    expect((await definition?.handler(invocation('reset')))?.kind).toBe('error')
    expect((await definition?.handler(invocation('reset confirm')))?.kind).toBe('success')
    expect(service.setEnabled).toHaveBeenNthCalledWith(1, true)
    expect(service.setEnabled).toHaveBeenNthCalledWith(2, false)
    expect(service.reset).toHaveBeenCalledWith('sha256:x')
  })
})

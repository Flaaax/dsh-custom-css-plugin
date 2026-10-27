import type { Context, Volatile } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-client-connection'
import type {} from '@deepseek-ai/dsh-commands'
import type {} from '@deepseek-ai/dsh-settings'
import { registerCommands } from './commands.ts'
import { registerRpc } from './rpc.ts'
import { CustomStyleService, type RuntimeConfig } from './service.ts'
import { StyleStore } from './style-store.ts'

export const name = 'minimal-custom-style'
export const inject = ['commands', 'connection', 'settings']

export interface Config extends RuntimeConfig {
  readonly enabled: Volatile<boolean>
  readonly refreshToken: Volatile<number>
}

export const Config = z.object({
  enabled: z.boolean().default(true).volatile(),
  refreshToken: z.number().step(1).min(0).max(Number.MAX_SAFE_INTEGER).default(0).volatile(),
})

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** App Boot 提供的官方 Harness home 路径解析器。 */
    dshHomePath?: (...segments: string[]) => string
  }
}

export async function apply(ctx: Context, config: Config): Promise<void> {
  const resolveHome = ctx.dshHomePath
  if (resolveHome === undefined) throw new Error('minimal-custom-style: DSH home 路径服务不可用')
  const store = new StyleStore(resolveHome('dsh-minimal-custom-style', 'custom.css'))
  await store.initialize()
  const service = new CustomStyleService(ctx, config, store)
  ctx.effect(() => ctx.settings.configure({ auto: false }, ctx.fiber), 'minimal-custom-style: settings presentation')
  ctx.effect(() => registerCommands(ctx, service), 'minimal-custom-style: command')
  ctx.effect(() => registerRpc(ctx, service), 'minimal-custom-style: authenticated RPC')
  ctx.logger.info('minimal-custom-style: CSS 文件 %s', store.path)
}

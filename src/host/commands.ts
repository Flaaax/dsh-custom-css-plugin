import type { Context } from '@deepseek-ai/cordis'
import type { CommandInvocation, CommandResult } from '@deepseek-ai/dsh-commands'
import type {} from '@deepseek-ai/dsh-commands'
import { describeError } from './errors.ts'
import type { CustomStyleService } from './service.ts'

const USAGE = '用法：/custom-style status|enable|disable|reload|reset confirm'

function renderStatus(status: Awaited<ReturnType<CustomStyleService['status']>>): string {
  return [
    `状态：${status.enabled ? '已启用' : '已禁用'}`,
    `文件：${status.path}`,
    `字节：${String(status.bytes)}`,
    `revision：${status.revision}`,
  ].join('\n')
}

async function execute(service: CustomStyleService, invocation: CommandInvocation): Promise<CommandResult> {
  const args = invocation.rawInput.trim().split(/\s+/u).filter(Boolean)
  const subcommand = args[0]
  try {
    if (subcommand === 'status' && args.length === 1) return { kind: 'success', text: renderStatus(await service.status()) }
    if (subcommand === 'enable' && args.length === 1) {
      await service.setEnabled(true)
      return { kind: 'success', text: '自定义样式已启用。' }
    }
    if (subcommand === 'disable' && args.length === 1) {
      await service.setEnabled(false)
      return { kind: 'success', text: '自定义样式已禁用；CSS 文件仍保留。' }
    }
    if (subcommand === 'reload' && args.length === 1) {
      const state = await service.reload()
      return { kind: 'success', text: `已重新载入 ${String(state.bytes)} 字节，revision ${state.revision}。` }
    }
    if (subcommand === 'reset' && args.length === 2 && (args[1] === 'confirm' || args[1] === '--confirm')) {
      const current = await service.read()
      await service.reset(current.revision)
      return { kind: 'success', text: 'CSS 已重置为空白安全模板。' }
    }
    return { kind: 'error', text: USAGE }
  } catch (error) {
    if (invocation.signal.aborted) return { kind: 'error', text: '自定义样式操作已取消。' }
    return { kind: 'error', text: `自定义样式操作失败：${describeError(error)}` }
  }
}

export function registerCommands(ctx: Context, service: CustomStyleService): () => void {
  return ctx.commands.register({
    name: 'custom-style',
    description: '查看或管理 Desktop 自定义 CSS',
    input: { hint: 'status | enable | disable | reload | reset confirm' },
    handler: invocation => execute(service, invocation),
  })
}

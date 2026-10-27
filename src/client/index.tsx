import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { StyleSection, type StyleSectionInjected } from './StyleSection.tsx'
import { en, zh } from './locales.ts'
import { StyleController } from './state.ts'
import { StyleOwner } from './style-owner.ts'

export const name = 'minimal-custom-style-client'
export const inject = ['slots', 'locale', 'connection', 'remote']

export function apply(ctx: Context): void {
  const locale = 'settings.minimalCustomStyle'
  const connection = ctx.get('connection') as unknown as ConnectionHandle
  const controller = new StyleController(connection.rpc, new StyleOwner())
  const t = ctx.locale.bind(locale)
  ctx.effect(() => ctx.locale.register(locale, { zh, en }), 'minimal-custom-style: dictionaries')
  ctx.effect(() => {
    void controller.start()
    return () => { controller.dispose() }
  }, 'minimal-custom-style: style lifecycle')
  ctx.effect(() => ctx.remote.$on('settings/document-updated', (namespace: string) => {
    void controller.refreshFromSettings(String(namespace))
  }), 'minimal-custom-style: settings invalidation')
  const injectFace = (): StyleSectionInjected => ({
    hooks: { styleState: controller.state },
    controller,
  })
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'minimal-custom-style',
    order: 70,
    label: () => t('nav'),
    locale,
    inject: injectFace,
  }, StyleSection))
}

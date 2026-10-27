import type { InjectFace, Translate } from '@deepseek-ai/dsh-client-ui-slots'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { ClientState, StyleController } from './state.ts'
import type { LocaleKey } from './locales.ts'

export interface StyleSectionInjected {
  hooks: { styleState: ObservableSnapshot<ClientState> }
  controller: Pick<StyleController, 'setDraft' | 'save' | 'reload' | 'reset' | 'setEnabled'>
  t: Translate<LocaleKey>
}

/** `plugins.bundle.config` 由插件页注入的视图选择。 */
interface PluginConfigViewProps {
  readonly view: 'summary' | 'page'
}

type Props = PluginConfigViewProps & InjectFace<StyleSectionInjected>

const sectionStyle = { display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 2px 24px' } as const
const rowStyle = { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } as const
const labelStyle = { fontWeight: 600 } as const
const buttonStyle = { padding: '7px 12px', borderRadius: 8, border: '1px solid currentColor', cursor: 'pointer' } as const

export function StyleSection({ view, useStyleState, controller, t }: Props) {
  const state = useStyleState(value => value)
  const snapshot = state.snapshot
  if (view === 'summary') {
    const summary = snapshot === undefined
      ? t('title')
      : `${snapshot.enabled ? t('enabledState') : t('disabledState')} · ${snapshot.bytes} ${t('bytes')}`
    return <span style={{ opacity: 0.8 }}>{summary}</span>
  }
  const confirmReload = (): void => {
    if (!state.dirty || globalThis.confirm(t('reloadConfirm'))) void controller.reload(true)
  }
  const confirmReset = (): void => {
    if (globalThis.confirm(t('resetConfirm'))) void controller.reset()
  }
  return <section style={sectionStyle} aria-labelledby="minimal-custom-style-title">
    <h2 id="minimal-custom-style-title" style={{ margin: 0 }}>{t('title')}</h2>
    <p style={{ margin: 0, color: 'var(--dsw-alias-label-secondary, #6b7280)' }}>{t('warning')}</p>
    <label style={rowStyle}>
      <input type="checkbox" checked={snapshot?.enabled === true} disabled={state.busy || snapshot === undefined}
        onChange={event => { void controller.setEnabled(event.currentTarget.checked) }} />
      <span style={labelStyle}>{t('enable')}</span>
    </label>
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={labelStyle}>{t('path')}</span>
      <input readOnly value={snapshot?.path ?? ''} style={{ fontFamily: 'monospace', padding: 8, borderRadius: 6 }} />
    </label>
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={labelStyle}>{t('editor')}</span>
      <textarea value={state.draft} disabled={state.status === 'loading'} spellCheck={false}
        onChange={event => { controller.setDraft(event.currentTarget.value) }}
        style={{ minHeight: 320, resize: 'vertical', padding: 12, borderRadius: 8, fontFamily: 'monospace', lineHeight: 1.5 }} />
    </label>
    <div style={rowStyle}>
      <button type="button" style={buttonStyle} disabled={state.busy || snapshot === undefined || !state.dirty}
        onClick={() => { void controller.save() }}>{t('apply')}</button>
      <button type="button" style={buttonStyle} disabled={state.busy} onClick={confirmReload}>{t('reload')}</button>
      <button type="button" style={buttonStyle} disabled={state.busy || snapshot === undefined} onClick={confirmReset}>{t('reset')}</button>
      {state.dirty && <span role="status">{t('dirty')}</span>}
    </div>
    {snapshot !== undefined && <small>
      {snapshot.bytes} {t('bytes')} · {t('revision')}: <code>{snapshot.revision}</code>
    </small>}
    {state.notice !== undefined && <p role={state.notice.tone === 'error' ? 'alert' : 'status'}
      style={{ margin: 0, color: state.notice.tone === 'error' ? '#c2410c' : undefined }}>{state.notice.text}</p>}
  </section>
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'settings.minimalCustomStyle': LocaleKey
  }
  interface SlotMap {
    'plugins.bundle.config': {
      kind: 'keyed'
      scope: 'root'
      owner: { readonly view: 'summary' | 'page' }
      keyProps: Record<string, object>
    }
  }
}

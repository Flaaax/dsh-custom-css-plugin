// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { StyleOwner } from '../src/client/style-owner.ts'
import { PACKAGE_ID, type StyleSnapshot } from '../src/shared/protocol.ts'

function snapshot(css: string, enabled = true): StyleSnapshot {
  return { css, enabled, path: 'C:\\fake\\custom.css', bytes: css.length, revision: `r-${css.length}` }
}

beforeEach(() => { document.head.innerHTML = '' })

describe('StyleOwner', () => {
  it('只创建一个 style，并通过 textContent 更新', () => {
    const owner = new StyleOwner()
    owner.apply(snapshot('body { color: red; }'))
    owner.apply(snapshot('body { color: blue; }'))
    const styles = document.querySelectorAll(`style[data-plugin="${PACKAGE_ID}"]`)
    expect(styles).toHaveLength(1)
    expect(styles[0]?.textContent).toBe('body { color: blue; }')
    expect(styles[0]?.getAttribute('data-plugin-css')).toBe(`${PACKAGE_ID}/custom.css`)
  })

  it('禁用和 dispose 路径会清理样式', () => {
    const owner = new StyleOwner()
    owner.apply(snapshot('body {}'))
    owner.apply(snapshot('body {}', false))
    expect(document.querySelectorAll(`style[data-plugin="${PACKAGE_ID}"]`)).toHaveLength(0)
    owner.apply(snapshot('body {}'))
    owner.remove()
    expect(document.querySelectorAll(`style[data-plugin="${PACKAGE_ID}"]`)).toHaveLength(0)
  })
})

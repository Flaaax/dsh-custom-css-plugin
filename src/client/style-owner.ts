import { PACKAGE_ID, type StyleSnapshot } from '../shared/protocol.ts'

const STYLE_SELECTOR = `style[data-plugin=${JSON.stringify(PACKAGE_ID)}][data-plugin-css=${JSON.stringify(`${PACKAGE_ID}/custom.css`)}]`

/** 只管理本插件拥有的单一样式节点。 */
export class StyleOwner {
  apply(snapshot: StyleSnapshot): void {
    if (!snapshot.enabled) {
      this.remove()
      return
    }
    let style = document.head.querySelector<HTMLStyleElement>(STYLE_SELECTOR)
    if (style === null) {
      style = document.createElement('style')
      style.setAttribute('data-plugin', PACKAGE_ID)
      style.setAttribute('data-plugin-css', `${PACKAGE_ID}/custom.css`)
      document.head.append(style)
    }
    style.textContent = snapshot.css
  }

  remove(): void {
    for (const style of document.head.querySelectorAll<HTMLStyleElement>(STYLE_SELECTOR)) style.remove()
  }
}

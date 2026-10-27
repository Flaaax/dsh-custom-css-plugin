import type { Context, Volatile } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import { ENTRY_ID, type StyleSnapshot, type StyleStatus } from '../shared/protocol.ts'
import { SerialQueue } from './serial-queue.ts'
import { StyleStore } from './style-store.ts'

export interface RuntimeConfig {
  readonly enabled: Volatile<boolean>
  readonly refreshToken: Volatile<number>
}

/** UI、RPC 与命令共用的唯一业务服务。 */
export class CustomStyleService {
  private readonly queue = new SerialQueue()

  constructor(
    private readonly ctx: Context,
    private readonly config: RuntimeConfig,
    readonly store: StyleStore,
  ) {}

  read(): Promise<StyleSnapshot> {
    return this.queue.run(async () => this.snapshot())
  }

  status(): Promise<StyleStatus> {
    return this.queue.run(async () => {
      const { css: _css, ...status } = await this.snapshot()
      return status
    })
  }

  save(css: string, expectedRevision: string): Promise<StyleSnapshot> {
    return this.queue.run(async () => {
      const file = await this.store.write(css, expectedRevision)
      await this.bumpRefreshToken()
      return { ...file, enabled: this.config.enabled.get() }
    })
  }

  reset(expectedRevision: string): Promise<StyleSnapshot> {
    return this.queue.run(async () => {
      const file = await this.store.reset(expectedRevision)
      await this.bumpRefreshToken()
      return { ...file, enabled: this.config.enabled.get() }
    })
  }

  reload(): Promise<StyleSnapshot> {
    return this.queue.run(async () => {
      const snapshot = await this.snapshot()
      await this.bumpRefreshToken()
      return snapshot
    })
  }

  setEnabled(enabled: boolean): Promise<StyleSnapshot> {
    return this.queue.run(async () => {
      if (this.config.enabled.get() !== enabled) {
        const revision = this.settingsRevision()
        await this.ctx.settings.update(ENTRY_ID, {
          enabled,
          refreshToken: this.nextRefreshToken(),
        }, revision)
      }
      return this.snapshot()
    })
  }

  private async snapshot(): Promise<StyleSnapshot> {
    return { ...await this.store.read(), enabled: this.config.enabled.get() }
  }

  private settingsRevision(): number {
    const descriptor = this.ctx.settings.describe().find(row => row.ns === ENTRY_ID)
    if (descriptor === undefined) throw new Error(`找不到设置命名空间 ${ENTRY_ID}`)
    return descriptor.revision
  }

  private nextRefreshToken(): number {
    const current = this.config.refreshToken.get()
    return current >= Number.MAX_SAFE_INTEGER ? 0 : current + 1
  }

  private async bumpRefreshToken(): Promise<void> {
    try {
      await this.ctx.settings.update(ENTRY_ID, { refreshToken: this.nextRefreshToken() }, this.settingsRevision())
    } catch (error) {
      // 文件提交已经成功；通知失败不能把成功伪装成可安全重试的写失败。
      this.ctx.logger.warn('minimal-custom-style: CSS 已提交，但活动 Client 刷新通知失败', error)
    }
  }
}

import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Context, Volatile } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CustomStyleService } from '../src/host/service.ts'
import { StyleStore, type AtomicWriter } from '../src/host/style-store.ts'

const roots: string[] = []

function volatile<T>(initial: T): { readonly ref: Volatile<T>; set(value: T): void } {
  let value = initial
  return { ref: { get: () => value } as Volatile<T>, set: (next: T) => { value = next } }
}

async function fixture(writer?: AtomicWriter) {
  const root = await mkdtemp(join(tmpdir(), 'minimal-custom-style-service-'))
  roots.push(root)
  const store = new StyleStore(join(root, 'custom.css'), writer === undefined ? {} : { atomicWrite: writer })
  await store.initialize()
  const enabledBox = volatile(true)
  const refreshTokenBox = volatile(0)
  const enabled = enabledBox.ref
  const refreshToken = refreshTokenBox.ref
  const update = vi.fn(async (_namespace: string, patch: { enabled?: boolean; refreshToken?: number }) => {
    if (patch.enabled !== undefined) enabledBox.set(patch.enabled)
    if (patch.refreshToken !== undefined) refreshTokenBox.set(patch.refreshToken)
  })
  const warn = vi.fn()
  const ctx = {
    settings: { describe: () => [{ ns: 'minimal-custom-style', revision: 1 }], update },
    logger: { warn },
  } as unknown as Context
  return { store, enabled, refreshToken, update, warn, service: new CustomStyleService(ctx, { enabled, refreshToken }, store) }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map(path => rm(path, { recursive: true, force: true })))
})

describe('CustomStyleService', () => {
  it('串行化并发写入，旧 revision 不会覆盖先完成的保存', async () => {
    const writes: string[] = []
    const { service } = await fixture(async (path, content) => {
      writes.push(String(content))
      await writeFile(path, content)
    })
    const original = await service.read()
    const first = service.save('first{}', original.revision)
    const second = service.save('second{}', original.revision)
    await expect(first).resolves.toMatchObject({ css: 'first{}' })
    await expect(second).rejects.toMatchObject({ code: 'conflict' })
    expect(writes).toEqual(['first{}'])
  })

  it('文件已提交后刷新通知失败仍返回成功并记录警告', async () => {
    const { service, update, warn } = await fixture()
    const original = await service.read()
    update.mockRejectedValueOnce(new Error('settings unavailable'))
    await expect(service.save('saved{}', original.revision)).resolves.toMatchObject({ css: 'saved{}' })
    await expect(service.read()).resolves.toMatchObject({ css: 'saved{}' })
    expect(warn).toHaveBeenCalledOnce()
  })

  it('启停通过 Settings 持久化并返回最新状态', async () => {
    const { service, update, refreshToken } = await fixture()
    await expect(service.setEnabled(false)).resolves.toMatchObject({ enabled: false })
    expect(update).toHaveBeenCalledWith('minimal-custom-style', { enabled: false, refreshToken: 1 }, 1)
    expect(refreshToken.get()).toBe(1)
  })
})

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { EMPTY_TEMPLATE, StyleStore } from '../src/host/style-store.ts'
import { StyleError } from '../src/host/errors.ts'

const roots: string[] = []

async function fixture(options: ConstructorParameters<typeof StyleStore>[1] = {}) {
  const root = await mkdtemp(join(tmpdir(), 'minimal-custom-style-'))
  roots.push(root)
  const path = join(root, 'data', 'custom.css')
  const store = new StyleStore(path, options)
  return { root, path, store }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map(path => rm(path, { recursive: true, force: true })))
})

describe('StyleStore', () => {
  it('缺失时创建空白模板，已有文件绝不覆盖', async () => {
    const { path, store } = await fixture()
    await store.initialize()
    expect(await readFile(path, 'utf8')).toBe(EMPTY_TEMPLATE)
    await writeFile(path, 'body { color: red; }', 'utf8')
    await store.initialize()
    expect((await store.read()).css).toBe('body { color: red; }')
  })

  it('处理 UTF-8、BOM、空文件和稳定 revision', async () => {
    const { path, store } = await fixture()
    await store.initialize()
    await writeFile(path, Buffer.from('\uFEFF/* 你好 */', 'utf8'))
    const first = await store.read()
    const second = await store.read()
    expect(first.css).toBe('/* 你好 */')
    expect(second.revision).toBe(first.revision)
    await writeFile(path, '')
    expect(await store.read()).toMatchObject({ css: '', bytes: 0 })
  })

  it('拒绝超限、无效 UTF-8 和孤立代理字符', async () => {
    const { path, store } = await fixture({ maxBytes: 8 })
    await store.initialize().catch(() => undefined)
    await writeFile(path, '123456789')
    await expect(store.read()).rejects.toMatchObject({ code: 'too-large' })
    await writeFile(path, Buffer.from([0xff]))
    await expect(store.read()).rejects.toMatchObject({ code: 'invalid-utf8' })
    await writeFile(path, '')
    const current = await store.read()
    await expect(store.write('\uD800', current.revision)).rejects.toMatchObject({ code: 'invalid-utf8' })
  })

  it('旧 revision 被拒绝且不覆盖外部编辑', async () => {
    const { path, store } = await fixture()
    await store.initialize()
    const original = await store.read()
    await writeFile(path, '/* external */', 'utf8')
    await expect(store.write('/* draft */', original.revision)).rejects.toMatchObject({ code: 'conflict' })
    expect(await readFile(path, 'utf8')).toBe('/* external */')
  })

  it('原子 writer 失败时保留原文件', async () => {
    const { path, store } = await fixture({
      atomicWrite: async () => { throw new Error('rename failed') },
    })
    await store.initialize()
    const original = await store.read()
    await expect(store.write('body {}', original.revision)).rejects.toBeInstanceOf(StyleError)
    expect(await readFile(path, 'utf8')).toBe(EMPTY_TEMPLATE)
  })

  it('重置走同一 revision 和原子写路径', async () => {
    let writes = 0
    const { path, store } = await fixture({
      atomicWrite: async (target, content) => {
        writes++
        await writeFile(target, content)
      },
    })
    await store.initialize()
    const first = await store.read()
    const changed = await store.write('body {}', first.revision)
    const reset = await store.reset(changed.revision)
    expect(reset.css).toBe(EMPTY_TEMPLATE)
    expect(writes).toBe(2)
    expect(await readFile(path, 'utf8')).toBe(EMPTY_TEMPLATE)
  })
})

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('包清单与安全边界', () => {
  it('声明一个 bundle row、web Client 平面和 ./client export', async () => {
    const pkg = JSON.parse(await readFile(resolve('package.json'), 'utf8')) as Record<string, any>
    const patch = await readFile(resolve('cordis.patch.yml'), 'utf8')
    expect(pkg.dsh.bundle.patch).toBe('./cordis.patch.yml')
    expect(pkg.dsh.client.platform).toBe('web')
    expect(pkg.dsh.client.immediately).toBeUndefined()
    expect(pkg.exports['./client'].default).toBe('./lib/client.js')
    expect((patch.match(/- id: minimal-custom-style/gu) ?? [])).toHaveLength(1)
  })

  it('发布源码不含被禁止的高权限机制', async () => {
    const files = [
      'src/host/index.ts', 'src/host/style-store.ts', 'src/host/service.ts', 'src/host/rpc.ts',
      'src/host/commands.ts', 'src/client/index.tsx', 'src/client/state.ts', 'src/client/StyleSection.tsx',
    ]
    const source = (await Promise.all(files.map(file => readFile(resolve(file), 'utf8')))).join('\n')
    for (const forbidden of [
      'node:child_process', 'setInterval(', 'fs.watch', 'watchFile(', 'innerHTML',
      'dangerouslySetInnerHTML', 'new Function(', 'node:vm', '.webServer.register(',
    ]) expect(source).not.toContain(forbidden)
    const pkg = await readFile(resolve('package.json'), 'utf8')
    expect(pkg).not.toMatch(/"(?:preinstall|install|postinstall)"\s*:/u)
  })
})

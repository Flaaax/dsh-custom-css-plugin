import { createHash } from 'node:crypto'
import { mkdir, lstat, open, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { MAX_CSS_BYTES, type StyleSnapshot } from '../shared/protocol.ts'
import { StyleError, describeError } from './errors.ts'

export const EMPTY_TEMPLATE = `/* DSH Minimal Custom Style
 * 只粘贴你自己编写或已审计的 CSS。
 * CSS 可以隐藏或伪造界面，url() / @import 还可能请求外部资源。
 */
`

export type AtomicWriter = (path: string, content: string | Uint8Array) => Promise<void>

export interface StyleStoreOptions {
  readonly maxBytes?: number
  readonly atomicWrite?: AtomicWriter
}

function revisionOf(bytes: Uint8Array): string {
  return `sha256:${createHash('sha256').update(bytes).digest('base64url')}`
}

function encodeCss(css: string): Uint8Array {
  if (!css.isWellFormed()) throw new StyleError('invalid-utf8', 'CSS 含有无法编码为 UTF-8 的孤立代理字符。')
  return Buffer.from(css, 'utf8')
}

function decodeCss(bytes: Uint8Array): string {
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return text.startsWith('\uFEFF') ? text.slice(1) : text
  } catch {
    throw new StyleError('invalid-utf8', 'CSS 文件不是有效的 UTF-8 文本。')
  }
}

/** 固定单文件存储；公开方法从不接受路径。 */
export class StyleStore {
  readonly path: string
  private readonly maxBytes: number
  private readonly atomicWrite: AtomicWriter

  constructor(path: string, options: StyleStoreOptions = {}) {
    this.path = path
    this.maxBytes = options.maxBytes ?? MAX_CSS_BYTES
    this.atomicWrite = options.atomicWrite ?? ((target, content) =>
      writeFileAtomic(target, content, { mode: 0o600, dirMode: 0o700 }))
  }

  async initialize(): Promise<void> {
    const directory = dirname(this.path)
    await mkdir(directory, { recursive: true, mode: 0o700 })
    const directoryInfo = await lstat(directory)
    if (!directoryInfo.isDirectory() || directoryInfo.isSymbolicLink()) {
      throw new StyleError('io', '自定义样式目录必须是普通目录，不能是符号链接。')
    }
    try {
      await writeFile(this.path, EMPTY_TEMPLATE, { encoding: 'utf8', flag: 'wx', mode: 0o600 })
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw new StyleError('io', `无法创建 CSS 文件：${describeError(error)}`)
      }
    }
    await this.assertRegularFile()
    await this.read()
  }

  async read(): Promise<Omit<StyleSnapshot, 'enabled'>> {
    await this.assertRegularFile()
    let handle
    try {
      handle = await open(this.path, 'r')
      const before = await handle.stat()
      if (!before.isFile()) throw new StyleError('io', 'CSS 路径不是普通文件。')
      if (before.size > this.maxBytes) throw new StyleError('too-large', `CSS 文件超过 ${String(this.maxBytes)} 字节上限。`)
      const buffer = Buffer.alloc(this.maxBytes + 1)
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0)
      const after = await handle.stat()
      if (before.size !== after.size || before.mtimeMs !== after.mtimeMs) {
        throw new StyleError('io', 'CSS 文件在读取过程中发生变化，请重新载入。')
      }
      if (bytesRead > this.maxBytes) throw new StyleError('too-large', `CSS 文件超过 ${String(this.maxBytes)} 字节上限。`)
      const bytes = buffer.subarray(0, bytesRead)
      return { css: decodeCss(bytes), path: this.path, bytes: bytesRead, revision: revisionOf(bytes) }
    } catch (error) {
      if (error instanceof StyleError) throw error
      throw new StyleError('io', `无法读取 CSS 文件：${describeError(error)}`)
    } finally {
      await handle?.close()
    }
  }

  async write(css: string, expectedRevision: string): Promise<Omit<StyleSnapshot, 'enabled'>> {
    const bytes = encodeCss(css)
    if (bytes.byteLength > this.maxBytes) {
      throw new StyleError('too-large', `CSS 内容超过 ${String(this.maxBytes)} 字节上限。`)
    }
    const current = await this.read()
    if (current.revision !== expectedRevision) {
      throw new StyleError('conflict', 'CSS 文件已在编辑器外发生变化；草稿未覆盖，请重新载入后再合并。')
    }
    const nextRevision = revisionOf(bytes)
    if (nextRevision === current.revision) return current
    try {
      await this.atomicWrite(this.path, bytes)
      return await this.read()
    } catch (error) {
      if (error instanceof StyleError) throw error
      throw new StyleError('io', `无法原子写入 CSS 文件：${describeError(error)}`)
    }
  }

  reset(expectedRevision: string): Promise<Omit<StyleSnapshot, 'enabled'>> {
    return this.write(EMPTY_TEMPLATE, expectedRevision)
  }

  private async assertRegularFile(): Promise<void> {
    try {
      const info = await lstat(this.path)
      if (!info.isFile() || info.isSymbolicLink()) {
        throw new StyleError('io', 'CSS 路径必须是普通文件，不能是目录或符号链接。')
      }
    } catch (error) {
      if (error instanceof StyleError) throw error
      throw new StyleError('io', `无法检查 CSS 文件：${describeError(error)}`)
    }
  }
}

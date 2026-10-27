export type StyleErrorCode = 'conflict' | 'invalid-request' | 'io' | 'too-large' | 'invalid-utf8'

export class StyleError extends Error {
  constructor(readonly code: StyleErrorCode, message: string) {
    super(message)
    this.name = 'StyleError'
  }
}

export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

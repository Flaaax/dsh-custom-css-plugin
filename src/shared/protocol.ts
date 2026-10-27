export const PACKAGE_ID = 'dsh-minimal-custom-style-plugin'
export const ENTRY_ID = 'minimal-custom-style'
export const RPC_CHANNEL = '/minimal-custom-style'
export const MAX_CSS_BYTES = 256 * 1024

export interface StyleSnapshot {
  readonly enabled: boolean
  readonly css: string
  readonly path: string
  readonly bytes: number
  readonly revision: string
}

export interface StyleStatus {
  readonly enabled: boolean
  readonly path: string
  readonly bytes: number
  readonly revision: string
}

export type RpcFailureCode =
  | 'custom-style/conflict'
  | 'custom-style/invalid-request'
  | 'custom-style/io'
  | 'custom-style/too-large'
  | 'custom-style/invalid-utf8'

export interface RpcFailure {
  readonly code: RpcFailureCode
  readonly message: string
  readonly details: object
}

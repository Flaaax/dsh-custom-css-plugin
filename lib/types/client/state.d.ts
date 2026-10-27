import type { ConnectionRpcResult } from '@deepseek-ai/dsh-client-connection/client';
import { type StyleSnapshot } from '../shared/protocol.ts';
import type { StyleOwner } from './style-owner.ts';
export type NoticeTone = 'info' | 'success' | 'error';
export interface ClientState {
    status: 'loading' | 'ready' | 'error';
    snapshot?: StyleSnapshot;
    draft: string;
    dirty: boolean;
    busy: boolean;
    notice: {
        readonly tone: NoticeTone;
        readonly text: string;
    } | undefined;
}
export interface ClientRpc {
    call(channel: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<ConnectionRpcResult<unknown>>;
}
/** 保存已确认快照与草稿；任何 Host 失败都不覆盖草稿或已应用样式。 */
export declare class StyleController {
    private readonly rpc;
    private readonly styles;
    readonly state: import("@deepseek-ai/dsh-client-store").SnapshotStore<ClientState>;
    private readonly lifetime;
    private disposed;
    constructor(rpc: ClientRpc, styles: StyleOwner);
    start(): Promise<void>;
    setDraft(draft: string): void;
    save(): Promise<void>;
    setEnabled(enabled: boolean): Promise<void>;
    reload(discardDraft: boolean): Promise<void>;
    reset(): Promise<void>;
    refreshFromSettings(namespace: string): Promise<void>;
    dispose(): void;
    private read;
    private perform;
    private accept;
    private fail;
}

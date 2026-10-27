import type { Context, Volatile } from '@deepseek-ai/cordis';
import { type StyleSnapshot, type StyleStatus } from '../shared/protocol.ts';
import { StyleStore } from './style-store.ts';
export interface RuntimeConfig {
    readonly enabled: Volatile<boolean>;
    readonly refreshToken: Volatile<number>;
}
/** UI、RPC 与命令共用的唯一业务服务。 */
export declare class CustomStyleService {
    private readonly ctx;
    private readonly config;
    readonly store: StyleStore;
    private readonly queue;
    constructor(ctx: Context, config: RuntimeConfig, store: StyleStore);
    read(): Promise<StyleSnapshot>;
    status(): Promise<StyleStatus>;
    save(css: string, expectedRevision: string): Promise<StyleSnapshot>;
    reset(expectedRevision: string): Promise<StyleSnapshot>;
    reload(): Promise<StyleSnapshot>;
    setEnabled(enabled: boolean): Promise<StyleSnapshot>;
    private snapshot;
    private settingsRevision;
    private nextRefreshToken;
    private bumpRefreshToken;
}

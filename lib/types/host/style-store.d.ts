import { type StyleSnapshot } from '../shared/protocol.ts';
export declare const EMPTY_TEMPLATE = "/* DSH Minimal Custom Style\n * \u53EA\u7C98\u8D34\u4F60\u81EA\u5DF1\u7F16\u5199\u6216\u5DF2\u5BA1\u8BA1\u7684 CSS\u3002\n * CSS \u53EF\u4EE5\u9690\u85CF\u6216\u4F2A\u9020\u754C\u9762\uFF0Curl() / @import \u8FD8\u53EF\u80FD\u8BF7\u6C42\u5916\u90E8\u8D44\u6E90\u3002\n */\n";
export type AtomicWriter = (path: string, content: string | Uint8Array) => Promise<void>;
export interface StyleStoreOptions {
    readonly maxBytes?: number;
    readonly atomicWrite?: AtomicWriter;
}
/** 固定单文件存储；公开方法从不接受路径。 */
export declare class StyleStore {
    readonly path: string;
    private readonly maxBytes;
    private readonly atomicWrite;
    constructor(path: string, options?: StyleStoreOptions);
    initialize(): Promise<void>;
    read(): Promise<Omit<StyleSnapshot, 'enabled'>>;
    write(css: string, expectedRevision: string): Promise<Omit<StyleSnapshot, 'enabled'>>;
    reset(expectedRevision: string): Promise<Omit<StyleSnapshot, 'enabled'>>;
    private assertRegularFile;
}

export type StyleErrorCode = 'conflict' | 'invalid-request' | 'io' | 'too-large' | 'invalid-utf8';
export declare class StyleError extends Error {
    readonly code: StyleErrorCode;
    constructor(code: StyleErrorCode, message: string);
}
export declare function describeError(error: unknown): string;

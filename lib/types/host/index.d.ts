import type { Context, Volatile } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { type RuntimeConfig } from './service.ts';
export declare const name = "minimal-custom-style";
export declare const inject: string[];
export interface Config extends RuntimeConfig {
    readonly enabled: Volatile<boolean>;
    readonly refreshToken: Volatile<number>;
}
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    enabled: z<boolean, boolean, "volatile-defined">;
    refreshToken: z<number, number, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: z<boolean, boolean, "volatile-defined">;
    refreshToken: z<number, number, "volatile-defined">;
}>>, "plain">;
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** App Boot 提供的官方 Harness home 路径解析器。 */
        dshHomePath?: (...segments: string[]) => string;
    }
}
export declare function apply(ctx: Context, config: Config): Promise<void>;

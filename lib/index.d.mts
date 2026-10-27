import z from "@deepseek-ai/schemastery";
import { Context, Volatile } from "@deepseek-ai/cordis";
interface RuntimeConfig {
  readonly enabled: Volatile<boolean>;
  readonly refreshToken: Volatile<number>;
}
declare const name = "minimal-custom-style";
declare const inject: string[];
interface Config extends RuntimeConfig {
  readonly enabled: Volatile<boolean>;
  readonly refreshToken: Volatile<number>;
}
declare const Config: z<Schemastery.ObjectS<NoInfer<{
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
declare function apply(ctx: Context, config: Config): Promise<void>;
export { Config, apply, inject, name };
//# sourceMappingURL=index.d.mts.map
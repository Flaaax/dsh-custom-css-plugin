import type { HostConnectionHandle } from '@deepseek-ai/dsh-client-connection';
import type { CustomStyleService } from './service.ts';
export declare function registerRpc(connection: HostConnectionHandle, service: CustomStyleService): () => Promise<void>;

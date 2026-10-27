import type { InjectFace, Translate } from '@deepseek-ai/dsh-client-ui-slots';
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store';
import type { ClientState, StyleController } from './state.ts';
import type { LocaleKey } from './locales.ts';
export interface StyleSectionInjected {
    hooks: {
        styleState: ObservableSnapshot<ClientState>;
    };
    controller: Pick<StyleController, 'setDraft' | 'save' | 'reload' | 'reset' | 'setEnabled'>;
    t: Translate<LocaleKey>;
}
/** `plugins.bundle.config` 由插件页注入的视图选择。 */
interface PluginConfigViewProps {
    readonly view: 'summary' | 'page';
}
type Props = PluginConfigViewProps & InjectFace<StyleSectionInjected>;
export declare function StyleSection({ view, useStyleState, controller, t }: Props): import("react").JSX.Element;
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'settings.minimalCustomStyle': LocaleKey;
    }
    interface SlotMap {
        'plugins.bundle.config': {
            kind: 'keyed';
            scope: 'root';
            owner: {
                readonly view: 'summary' | 'page';
            };
            keyProps: Record<string, object>;
        };
    }
}
export {};

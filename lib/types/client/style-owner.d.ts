import { type StyleSnapshot } from '../shared/protocol.ts';
/** 只管理本插件拥有的单一样式节点。 */
export declare class StyleOwner {
    apply(snapshot: StyleSnapshot): void;
    remove(): void;
}

import type * as Y from "yjs";

export type BlockMap = Y.Map<Y.XmlFragment | Y.Text | string>;

export type BlockHeights = { [name: string]: number };

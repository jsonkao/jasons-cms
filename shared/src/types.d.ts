import type { Map, XmlFragment, Text } from "yjs";

export type BlockMap = Map<XmlFragment | Text | string>;

export type BlockHeights = { [name: string]: number };

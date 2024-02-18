import type * as Y from 'yjs';

export type Subscriber<T> = (value: T) => void;
export type Unsubscriber = () => void;
export type Invalidator<T> = (value?: T) => void;
export interface Readable<T> {
	/**
	 * Subscribe on value changes.
	 * @param run subscription callback
	 * @param invalidate cleanup callback
	 */
	subscribe(run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber;
}

export type YReadableArray<T> = Readable<Array<T>> & { y: Y.Array<T> };
export type YReadableMap<T> = Readable<Map<string, T>> & { y: Y.Map<T> };

export function readableMap<T>(map: Y.Map<T>): YReadableMap<T>;
export function readableArray<T>(array: Y.Array<T>): YReadableArray<T>;

interface TextBlock {
	type: 'text';
	text: string;
}

interface GraphicBlock {
	type: 'graphic';
	name: string;
	code: string;
}

type Block = TextBlock | GraphicBlock;

interface InitialGraphic {
	name: string;
	code: string;
}

type BlockMap = Y.Map<Y.XmlFragment | Y.Text | string>;

type BlockHeights = { [name: string]: number };

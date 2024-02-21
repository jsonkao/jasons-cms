import type * as Y from 'yjs';

export interface TextBlock {
	type: 'text';
	text: string;
}

export interface GraphicBlock {
	type: 'graphic';
	name: string;
	code: string;
}

export type Block = TextBlock | GraphicBlock;

export interface InitialGraphic {
	name: string;
	code: string;
}

export type BlockMap = Y.Map<Y.XmlFragment | Y.Text | string>;

export type BlockHeights = { [name: string]: number };

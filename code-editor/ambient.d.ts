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

// TODO: these are all duplicated /should be shared

type BlockMap = import('yjs').Map<import('yjs').XmlFragment | import('yjs').Text | string>;

type BlockHeights = { [name: string]: number };

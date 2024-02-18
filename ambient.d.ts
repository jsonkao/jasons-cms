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

// Types that ideally would be in shared
type BlockMap = import('yjs').Map<import('yjs').XmlFragment | import('yjs').Text | string>;

type BlockHeights = { [name: string]: number };

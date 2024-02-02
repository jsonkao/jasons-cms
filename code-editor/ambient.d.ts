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

// TODO: share this
type BlockMap = import('yjs').Map<import('yjs').XmlFragment | import('yjs').Text | string>;

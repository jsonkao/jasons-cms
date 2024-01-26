interface TextBlock {
	type: 'text';
	text: string;
	uid: string;
}

interface GraphicBlock {
	type: 'graphic';
	name: string;
	code: string;
}

type Block = TextBlock | GraphicBlock;

type RenderedBlock = Block & {
	id: number;
	element: HTMLElement | null;
};

interface TextBlock {
	text: string;
}

interface GraphicBlock {
	name: string;
	code: string;
}

type Block = { type: string } & (TextBlock | GraphicBlock);

type RenderedBlock = Block & {
	id: number;
	element: HTMLElement | null;
};

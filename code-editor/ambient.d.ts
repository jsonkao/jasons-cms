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

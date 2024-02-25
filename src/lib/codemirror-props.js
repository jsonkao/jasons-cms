import { svelte } from '@replit/codemirror-lang-svelte';
import { coolGlow } from 'thememirror';

export default {
	nodebounce: true,
	lang: svelte(),
	theme: coolGlow,
	tabSize: 4,
	styles: {
		'&': {
			padding: '36px 12px 12px',
			borderRadius: '6px',
			height: '100%'
		}
	}
};

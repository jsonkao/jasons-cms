import * as Y from 'yjs';
import { readFileSync, writeFileSync } from 'fs';
import exampleData from '../src/lib/server/database/example-data.json' assert { type: 'json' };

// TODO: remove when Liveblocks integration is complete

const ydoc = new Y.Doc();

exampleData.forEach((block) => {
	if (block.type === 'graphic') {
		const ytext = ydoc.getText(`/src/lib/generated/${block.name}.svelte`);
		ytext.insert(0, block.code);
	}
});

ydoc.getText('/src/routes/+page.server.js').insert(0, '');
ydoc.getText('/src/routes/styles.css').insert(0, '');
ydoc.getText('/src/routes/Blocks.svelte').insert(0, readFileSync('editor/src/routes/Blocks.svelte', 'utf8'));

let docState = Y.encodeStateAsUpdate(ydoc);
writeFileSync('./src/lib/yjs/example-ydoc.bin', Buffer.from(docState));

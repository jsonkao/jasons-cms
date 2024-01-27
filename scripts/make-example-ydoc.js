import * as Y from 'yjs';
import { writeFileSync } from 'fs';
import exampleData from '../src/lib/server/database/example-data.json' assert { type: "json" };

const ydoc = new Y.Doc();

exampleData.forEach((block) => {
	if (block.type === 'graphic') {
		const ytext = ydoc.getText(block.name);
		ytext.insert(0, block.code);
	}
});

// const yxml = ydoc.getXmlFragment('test');
// const el = new Y.XmlElement('p');
// el.insert(0, [new Y.XmlText('example ydoc test text')]);
// yxml.insert(0, [el]);

let docState = Y.encodeStateAsUpdate(ydoc);
writeFileSync('./src/lib/yjs/example-ydoc.bin', Buffer.from(docState));

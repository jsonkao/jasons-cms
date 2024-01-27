import * as Y from 'yjs';
import { writeFileSync } from 'fs';

const ydoc = new Y.Doc();
const yxml = ydoc.getXmlFragment('test');

const el = new Y.XmlElement('p');
el.insert(0, [new Y.XmlText('example ydoc test text')]);
yxml.insert(0, [el]);

let docState = Y.encodeStateAsUpdate(ydoc);
writeFileSync('./example-ydoc.bin', Buffer.from(docState));

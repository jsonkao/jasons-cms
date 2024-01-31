import { createClient } from '@liveblocks/client';
import LiveblocksProvider from '@liveblocks/yjs';
import WebSocket from 'ws';
import * as Y from 'yjs';
import { LIVEBLOCKS_ROOM } from '../../shared/constants.js';

const client = createClient({
	publicApiKey: 'pk_dev_1iisK8HmLpmVOreEDPQqeruOVvHWUPlchIagQpCKP-VIRyGkCF4DDymphQiiVJ6A',
	polyfills: {
		WebSocket
	}
});

const { room, leave } = client.enterRoom(LIVEBLOCKS_ROOM, {
	initialPresence: {}
});

const ydoc = new Y.Doc();
new LiveblocksProvider(room, ydoc);
const yarray = ydoc.getArray('blocks-test');

// Wait 1 second for ydoc to sync
await new Promise((r) => setTimeout(r, 1000));

function seedArray() {
	console.log(`Seeding (deleting ${yarray.length} elements)...`);
	yarray.delete(0, yarray.length); // Clear the array
	yarray.insert(0, [
		makeTextBlock('text1'),
		makeGraphicBlock('graphic1'),
		makeTextBlock('text2')
	]);
}
seedArray();

/**
 * @param {string} uid
 * @returns {Y.Map<Y.XmlFragment>}
 */
function makeTextBlock(uid) {
	const ymap = new Y.Map();
	ymap.set('type', 'text');
	ymap.set('uid', uid);

	const yxmlFragment = new Y.XmlFragment();
	const yxmlElement = new Y.XmlElement('paragraph');
	yxmlElement.insert(0, [new Y.XmlText('Test p' + uid)]);

	yxmlFragment.insert(0, [yxmlElement]);
	ymap.set('text', yxmlFragment);

	return ymap;
}

/**
 * @param {string} name
 * @returns {Y.Map<string>}
 */
function makeGraphicBlock(name) {
	const ymap = new Y.Map();
	ymap.set('type', 'graphic');
	ymap.set('name', name);
	return ymap;
}

await new Promise((r) => setTimeout(r, 500));
console.log();
function testArray() {
	console.log('Testing...');
	console.log('  - length:', yarray.length);
	console.log('  - content:', yarray.toJSON());
}
testArray();

// Leave the room after a second
await new Promise((r) => setTimeout(r, 500));
leave();

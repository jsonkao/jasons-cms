import { createClient } from '@liveblocks/client';
import { Liveblocks as LiveblocksNode } from '@liveblocks/node';
import LiveblocksProvider from '@liveblocks/yjs';
import fs from 'fs/promises';
import WebSocket from 'ws';
import * as Y from 'yjs';
import { BLOCKS_KEY } from '../src/lib/shared/constants.js';

/** @typedef {'demo' | 'tutorial'} RoomName */

/** @type {Array<RoomName>} */
const ROOMS = ['demo', 'tutorial'];

const TESTING = process.argv.includes('--test');

if (!TESTING) await createRoom();

await populateRoomWithData('demo', [
	makeTextBlock(''),
	makeCodingBlock(
		'graphic1',
		await useLocalFile('../text-editor/src/lib/generated/graphic1.svelte')
	),
	makeTextBlock(
		'Hundreds of thousands of people poured into the streets of Hong Kong on Sunday, June 16, and marched almost two miles (three kilometers), protesting a proposed extradition bill and calling for the city’s leader to step down.',
		'A Bird’s-Eye View of How Protesters Have Flooded Hong Kong Streets'
	),
	makeCodingBlock(
		'graphic2',
		await useLocalFile('../text-editor/src/lib/generated/graphic2.svelte')
	),
	makeTextBlock(
		'In the governor’s race, large swaths of satellite Chinatowns in Brooklyn flipped party support. Many precincts in Flushing and Bayside in Queens, which are predominantly Chinese and Korean, turned red as well.'
	)
]);
await populateRoomWithData('tutorial', [
	makeTextBlock(''),
	makeCodingBlock(
		'graphic1',
		[
			'<div>',
			'\t<!-- Your code here -->',
			'</div>',
			'',
			'<style>',
			'\tdiv {',
			'\t\theight: 300px;',
			'\t\twidth: 100%;',
			'\t\tbackground: #6495ed66;',
			'\t}',
			'</style>\n'
		].join('\n')
	),
	makeTextBlock(
		'Hundreds of thousands of people poured into the streets of Hong Kong on Sunday, June 16, and marched almost two miles (three kilometers), protesting a proposed extradition bill and calling for the city’s leader to step down.',
		'My Headline is Nice'
	),
	makeCodingBlock(
		'graphic2',
		[
			'<div>',
			'\t<!-- Your code here -->',
			'</div>',
			'',
			'<style>',
			'\tdiv {',
			'\t\theight: 300px;',
			'\t\twidth: 100%;',
			'\t\tbackground: rgba(255, 0, 255, 0.1);',
			'\t}',
			'</style>\n'
		].join('\n')
	),
	makeTextBlock('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
]);

/**
 * Delete all rooms, then create a new one
 */
async function createRoom() {
	const liveblocks = new LiveblocksNode({
		secret: /** @type {string} */ (process.env.LIVEBLOCKS_SECRET_KEY)
	});

	// Delete all rooms
	const { data: rooms } = await liveblocks.getRooms();
	if (rooms.length > 0) {
		await Promise.all(rooms.map((room) => liveblocks.deleteRoom(room.id)));
		console.log(`Deleted rooms: ${rooms.map((room) => room.id).join(', ')}\n`);
	}

	// Create a new room
	ROOMS.forEach(async (liveblocksRoom) => {
		const room = await liveblocks.createRoom(liveblocksRoom, {
			defaultAccesses: ['room:write']
		});
		console.log(`Created room: ${room.id}\n`);
	});
}

/**
 * Populate the room with data
 * @param {RoomName} liveblocksRoom The room slug
 * @param {Array<Y.Map<any>>} contents The data to seed the room with
 */
async function populateRoomWithData(liveblocksRoom, contents) {
	const client = createClient({
		publicApiKey: /** @type {string} */ (process.env.LIVEBLOCKS_PUBLIC_KEY),
		polyfills: { WebSocket }
	});

	const { room, leave } = client.enterRoom(liveblocksRoom, {
		initialPresence: {}
	});

	const ydoc = new Y.Doc();
	new LiveblocksProvider(room, ydoc);
	const yarray = ydoc.getArray(BLOCKS_KEY);

	if (!TESTING) await seedArray();
	await testArray();
	leave();

	async function seedArray() {
		// Wait 1 second for ydoc to sync
		await new Promise((r) => setTimeout(r, 1000));
		if (yarray.length > 0) {
			console.log(`Deleting ${yarray.length} elements...\n`);
			yarray.delete(0, yarray.length); // Clear the array
		}
		console.log(`Seeding... ${liveblocksRoom}\n`);
		yarray.insert(0, contents);
	}

	async function testArray() {
		await new Promise((r) => setTimeout(r, 2000));
		console.log(`Testing... ${liveblocksRoom}`);
		console.log('  - length:', yarray.length);
		console.log('  - content:', JSON.stringify(yarray.toJSON(), null, 2));
	}
}

/**
 * @param {string} name
 * @param {string} code
 * @returns {BlockMap}
 */
function makeCodingBlock(name, code) {
	const ymap = new Y.Map();
	ymap.set('type', 'graphic');
	ymap.set('name', name);
	ymap.set('code', new Y.Text(code));

	const proseMap = new Y.Map();
	ymap.set('prose', proseMap);

	return ymap;
}

/**
 * @param {string} initialContent
 * @param {string} [headline]
 * @returns {Y.XmlFragment}
 */
function makeFragment(initialContent, headline = '') {
	const yxmlFragment = new Y.XmlFragment();
	const yxmlElement = new Y.XmlElement('paragraph');
	yxmlElement.insert(0, [new Y.XmlText(initialContent)]);
	yxmlFragment.insert(0, [yxmlElement]);
	if (headline) {
		const yxmlElement = new Y.XmlElement('headline');
		yxmlElement.insert(0, [new Y.XmlText(headline)]);
		yxmlFragment.insert(0, [yxmlElement]);
	}
	return yxmlFragment;
}

/**
 * @param {string} initialContent
 * @param {string} [headline]
 * @returns {Y.Map<Y.XmlFragment>}
 */
function makeTextBlock(initialContent, headline = '') {
	const ymap = new Y.Map();
	ymap.set('type', 'text');
	ymap.set('text', makeFragment(initialContent, headline));

	return ymap;
}

/**
 * @param {string} filename
 */
async function useLocalFile(filename) {
	const contents = await fs.readFile(filename, 'utf-8');

	// Remove things we don't want seeded
	const startString = '// SEED REMOVE START';
	const endString = '// SEED REMOVE END';
	const start = contents.indexOf(startString);
	const end = contents.indexOf(endString);
	if (start !== -1 && end !== -1) {
		return contents.slice(0, start) + contents.slice(end + endString.length).trim();
	}

	return contents;
}

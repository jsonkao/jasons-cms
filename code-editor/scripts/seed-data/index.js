import { createClient } from '@liveblocks/client';
import { Liveblocks as LiveblocksNode } from '@liveblocks/node';
import LiveblocksProvider from '@liveblocks/yjs';
import fs from 'fs/promises';
import WebSocket from 'ws';
import * as Y from 'yjs';
import { BLOCKS_KEY, PAGE_FILES_KEY } from '../../src/lib/shared/constants.js';

/** @typedef {'louisiana-fifth-circuit' | 'oil-wells' | 'tutorial'} RoomName */
/** @typedef {{text: string, hed?: string}} TextSeedData */
/** @typedef {{graphic: string}} GraphicSeedData */
/** @typedef {TextSeedData | GraphicSeedData} SeedData */

/** @type {Array<RoomName>} */
const ROOMS = ['louisiana-fifth-circuit', 'oil-wells', 'tutorial'];

const TESTING = process.argv.includes('--test');
if (!TESTING) await createRoom();

/**
 * @type {Record<RoomName, Array<SeedData>>}
 */
const seedingData = {
	'louisiana-fifth-circuit': [
		{ text: '' },
		{ graphic: 'graphic1' },
		{
			hed: 'A Bird’s-Eye View of How Protesters Have Flooded Hong Kong Streets',
			text: 'Hundreds of thousands of people poured into the streets of Hong Kong on Sunday, June 16, and marched almost two miles (three kilometers), protesting a proposed extradition bill and calling for the city’s leader to step down.'
		},
		{ graphic: 'graphic2' },
		{
			text: 'In the governor’s race, large swaths of satellite Chinatowns in Brooklyn flipped party support. Many precincts in Flushing and Bayside in Queens, which are predominantly Chinese and Korean, turned red as well.'
		}
	],
	'oil-wells': [
		{
			text: 'McKinney school officials long took pride in their students’ participation in the nationwide Youth and Government program, calling the district a “perennial standout”.\nEvery year, students researched current issues, proposed and debated their own public policy, and competed in a mock legislature and elections process for statewide offices.',
			hed: 'McKinney school officials cancel Youth and Gov. class'
		},
		{ graphic: 'graphic4' },
		{
			text: 'Since the program’s arrival to McKinney in 2005 as a club, seven of the district’s middle school students have been elected governor — the program’s top honor — at the statewide conference in Austin. In 2017, the district added an elective option: Seventh and eighth graders in two of the district’s middle schools could now receive course credit for participating in the program.'
		},
		{ graphic: 'graphic5' },
		{ text: '' }
	],
	tutorial: [
		{ text: '' },
		{ graphic: 'graphic5' },
		{
			text: 'Hundreds of thousands of people poured into the streets of Hong Kong on Sunday, June 16, and marched almost two miles (three kilometers), protesting a proposed extradition bill and calling for the city’s leader to step down.',
			hed: 'My Headline is Nice'
		}
	]
};

await Promise.all(ROOMS.map((room) => populateRoomWithData(room, seedingData[room])));

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
	await Promise.all(
		ROOMS.map((liveblocksRoom) =>
			liveblocks
				.createRoom(liveblocksRoom, { defaultAccesses: ['room:write'] })
				.then((room) => console.log(`Created room: ${room.id}\n`))
		)
	);
}

/**
 * Populate the room with data
 * @param {RoomName} liveblocksRoom The room slug
 * @param {Array<SeedData>} contents The contents to seed the room with
 */
async function populateRoomWithData(liveblocksRoom, contents) {
	if (!('text' in contents[0]) || !('text' in contents[contents.length - 1])) {
		throw new Error('First and last elements must be text');
	}

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

	if (!TESTING) await seedRoom();
	await testArray();
	leave();

	async function seedRoom() {
		// Wait 1 second for ydoc to sync
		await new Promise((r) => setTimeout(r, 1000));
		if (yarray.length > 0) {
			console.log(`Deleting ${yarray.length} elements...\n`);
			yarray.delete(0, yarray.length); // Clear the array
		}
		console.log(`Seeding... ${liveblocksRoom}\n`);

		const blockMaps = await Promise.all(
			contents.map(async (c) => {
				if ('graphic' in c) return makeCodingBlockFromLocalFile(c.graphic);
				return makeTextBlock(c.text, c.hed);
			})
		);
		yarray.insert(0, blockMaps);

		const yFilesMap = ydoc.getMap(PAGE_FILES_KEY);
		yFilesMap.set('+page.server.js', new Y.Text('/* This is the page server file */\nexport function load() { return { testData: "hi" } }'));
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
 */
async function makeCodingBlockFromLocalFile(name) {
	const code = await useLocalFile(`../text-editor/src/lib/generated/${name}.svelte`);
	return makeCodingBlock(name, code);
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

/** @param {string} str */
function makeElement(str) {
	const yxmlElement = new Y.XmlElement('paragraph');
	yxmlElement.insert(0, [new Y.XmlText(str)]);
	return yxmlElement;
}

/**
 * @param {string} initialContent
 * @param {string} [headline]
 * @returns {Y.XmlFragment}
 */
function makeFragment(initialContent, headline) {
	const yxmlFragment = new Y.XmlFragment();
	yxmlFragment.insert(0, initialContent.split('\n').map(makeElement));

	if (headline) {
		const yxmlElement = new Y.XmlElement('headline');
		yxmlElement.insert(0, [new Y.XmlText(headline)]);
		yxmlFragment.insert(0, [yxmlElement]);
	}
	return yxmlFragment;
}

/**
 * @param {string} initialContent
 * @param {string | undefined} headline
 * @returns {Y.Map<Y.XmlFragment>}
 */
function makeTextBlock(initialContent, headline) {
	const ymap = new Y.Map();
	ymap.set('type', 'text');
	ymap.set('text', makeFragment(initialContent, headline || ''));

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

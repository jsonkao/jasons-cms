import { createClient } from '@liveblocks/client';
import { Liveblocks as LiveblocksNode } from '@liveblocks/node';
import LiveblocksProvider from '@liveblocks/yjs';
import WebSocket from 'ws';
import * as Y from 'yjs';
import { LIVEBLOCKS_ROOM } from '../src/lib/constants.js';

await createRoom();
await populateRoomWithData();

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
	const room = await liveblocks.createRoom(LIVEBLOCKS_ROOM, {
		defaultAccesses: ['room:write']
	});
	console.log(`Created room: ${room.id}\n`);
}

/**
 * Populate the room with data
 */
async function populateRoomWithData() {
	const client = createClient({
		publicApiKey: /** @type {string} */ (process.env.LIVEBLOCKS_PUBLIC_KEY),
		polyfills: { WebSocket }
	});

	const { room, leave } = client.enterRoom(LIVEBLOCKS_ROOM, {
		initialPresence: {}
	});

	const ydoc = new Y.Doc();
	new LiveblocksProvider(room, ydoc);
	const yarray = ydoc.getArray('blocks-test');

	async function seedArray() {
		// Wait 1 second for ydoc to sync
		await new Promise((r) => setTimeout(r, 1000));
		if (yarray.length > 0) {
			console.log(`Deleting ${yarray.length} elements...\n`);
			yarray.delete(0, yarray.length); // Clear the array
		}
		console.log('Seeding...\n');
		yarray.insert(0, [
			makeTextBlock('text1'),
			makeGraphicBlock(
				'graphic1',
				"<script>\n\timport { onMount, onDestroy } from 'svelte';\n\timport { flip } from 'svelte/animate';\n\timport { fade, fly }from 'svelte/transition';\n\n\tlet interval;\n\tlet dots = [10];\n\n\tonMount(() => {\n\t\tinterval = setInterval(() => {\n\t\t\tdots = [...dots, dots.pop() + 2];\n\t\t\tif (dots.length > 20) clearInterval(interval);\n\t\t}, 2000);\n\t})\n\tonDestroy(() => {\n\t\tinterval && clearInterval(interval);\n\t})\n</script>\n\n<div>\n\t{#each dots as dot (dot)}\n\t\t<span style:--size=\"{dot}px\" transition:fly={{ x: -dot }} animate:flip />\n\t{/each}\n</div>\n\n<style>\n\tdiv {\n\t\tmin-height: 300px;\n\t\tbackground-color: rgba(255, 0, 255, 0.1);\n\t\tdisplay: flex;\n\t\tflex-wrap: wrap;\n\t\tgap: 3px;\n\t\talign-items: center;\n\t\tjustify-content: center;\n\t}\n\n\tspan {\n\t\twidth: var(--size);\n\t\theight: var(--size);\n\t\tborder: 1px solid black;\n\t\tborder-radius: 50%;\n\t}\n</style>"
			),
			makeTextBlock(
				'text2',
				'Hundreds of thousands of people poured into the streets of Hong Kong on Sunday, June 16, and marched almost two miles (three kilometers), protesting a proposed extradition bill and calling for the city’s leader to step down.',
				'A Bird’s-Eye View of How Protesters Have Flooded Hong Kong Streets'
			),
			makeGraphicBlock(
				'graphic2',
				'<script>\n\timport { onMount } from \'svelte\';\n\n\tlet scale = 1;\n\n\tonMount(() => {\n\t\tconst interval = setInterval(() => (scale = 1 + (Math.random() - 0.5) / 4), 1000);\n\t\treturn () => clearInterval(interval);\n\t});\n</script>\n\n<div>\n\t<p style="transform: scale({scale})">Hallo warld</p>\n</div>\n\n<style>\n\tdiv {\n\t\tdisplay: flex;\n\t\tjustify-content: center;\n\t\talign-items: center;\n\t\theight: 400px;\n\t\tbackground: aliceblue;\n\t}\n\n\tp {\n\t\tfont-family: Arial;\n\t\ttransition-duration: 0.2s;\n\t\tfont-size: 50px;\n\t}\n</style>'
			),
			makeTextBlock(
				'text2',
				'Lorem ipsum dolor sit amtet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel, luctus ornare lacus.'
			)
		]);
	}
	await seedArray();

	/**
	 * @param {string} uid
	 * @param {string} [initialContent]
	 * @param {string} [headline]
	 * @returns {Y.Map<Y.XmlFragment>}
	 */
	function makeTextBlock(uid, initialContent = '', headline = '') {
		const ymap = new Y.Map();
		ymap.set('type', 'text');
		ymap.set('uid', uid);

		const yxmlFragment = new Y.XmlFragment();
		const yxmlElement = new Y.XmlElement('paragraph');
		yxmlElement.insert(0, [new Y.XmlText(initialContent)]);
		yxmlFragment.insert(0, [yxmlElement]);
		if (headline) {
			const yxmlElement = new Y.XmlElement('headline');
			yxmlElement.insert(0, [new Y.XmlText(headline)]);
			yxmlFragment.insert(0, [yxmlElement]);
		}

		ymap.set('text', yxmlFragment);

		return ymap;
	}

	/**
	 * @param {string} name
	 * @param {string} code
	 * @returns {Y.Map<string>}
	 */
	function makeGraphicBlock(name, code) {
		const ymap = new Y.Map();
		ymap.set('type', 'graphic');
		ymap.set('name', name);
		ymap.set('code', new Y.Text(code));
		return ymap;
	}

	async function testArray() {
		await new Promise((r) => setTimeout(r, 500));
		console.log('Testing...');
		console.log('  - length:', yarray.length);
		console.log('  - content:', JSON.stringify(yarray.toJSON()));
	}
	await testArray();

	// Leave the room
	leave();
}

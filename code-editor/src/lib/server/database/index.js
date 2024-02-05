import { LIVEBLOCKS_ROOM } from '$lib/constants.js';
import { createClient } from '@liveblocks/client';
import LiveblocksProvider from '@liveblocks/yjs';
import { BLOCKS_KEY } from 'shared/src/constants.js';
import WebSocket from 'ws';
import * as Y from 'yjs';

const client = createClient({
	publicApiKey: 'pk_dev_1iisK8HmLpmVOreEDPQqeruOVvHWUPlchIagQpCKP-VIRyGkCF4DDymphQiiVJ6A',
	polyfills: {
		WebSocket
	}
});

/**
 * @returns {Promise<InitialGraphic[]>} - The blocks data
 */
export async function getInitialGraphics() {
	const { room, leave } = client.enterRoom(LIVEBLOCKS_ROOM, {
		initialPresence: {}
	});

	const ydoc = new Y.Doc();
	new LiveblocksProvider(room, ydoc);
	const yarray = ydoc.getArray(BLOCKS_KEY);

	const populatePromise = new Promise((resolve) => {
		yarray.observe((event) => {
			const blockMaps = /** @type {Array<Y.Map<string | Y.Text>>} */ (
				event.changes.delta[0].insert
			);

			resolve(
				blockMaps
					.filter((ymap) => ymap.get('type') === 'graphic')
					.map((ymap) => ({
						name: ymap.get('name'),
						code: ymap.get('code')?.toString()
					}))
			);
		});
	});

	const output = await populatePromise;
	leave();
	return output;
}

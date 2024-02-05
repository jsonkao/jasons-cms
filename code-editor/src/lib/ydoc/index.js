/**
 * This module creates and manages the Yjs document for code editing, as well as awareness features.
 */

import { createClient } from '@liveblocks/client';
import { LIVEBLOCKS_ROOM, userColor, userName } from '$lib/constants.js';
import * as Y from 'yjs';
import LiveblocksProvider from '@liveblocks/yjs';
import { otherCoders } from '$lib/stores/code-editor.js';
import { readableArray } from 'shared';

const user = { color: userColor, name: userName };

export function createYDoc() {
	const client = createClient({
		publicApiKey: 'pk_dev_1iisK8HmLpmVOreEDPQqeruOVvHWUPlchIagQpCKP-VIRyGkCF4DDymphQiiVJ6A'
	});
	const { room, leave } = client.enterRoom(LIVEBLOCKS_ROOM, { initialPresence: { user } });

	const ydoc = new Y.Doc();
	const { awareness } = new LiveblocksProvider(room, ydoc);
	setupAwarenessListener(awareness);

	const yarrayStore = readableArray(ydoc.getArray('blocks-test'));

	return {
		ydoc,
		yarrayStore,
		leave,
		awareness,

		/** @param {boolean} showCodeEditor */
		updateCodingPresence: (showCodeEditor) =>
			awareness.setLocalStateField('user', { ...user, coding: showCodeEditor })
	};

	// TODO: Create a different ydoc under a normal WebRTC connection for the files we dont want
	// persistence for? (e.g. Blocks.svelte, but not +page.server.js)
	// TODO: Create a ydoc top-level map for non-block files we do want persistance for (e.g. +page.server.js)
}

/**
 * Listen to the number of coders on an awareness instance
 * @param {import('y-protocols').Awareness} awareness
 */
function setupAwarenessListener(awareness) {
	awareness.on('change', ({ added, updated, removed }) => {
		otherCoders.set(
			[...awareness.getStates().values()]
				.map((state) => state.user)
				.filter((user) => user && user.coding)
		);
	});
}

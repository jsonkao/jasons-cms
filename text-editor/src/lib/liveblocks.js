import { userColor, userName, LIVEBLOCKS_ROOM } from '$lib/generated/globals.js';
import { createClient } from '@liveblocks/client';
import LiveblocksProvider from '@liveblocks/yjs';

/**
 * A helper function for creating a Liveblocks room and provider for Yjs.
 * @param {import('yjs').Doc} ydoc
 * @returns {{ awareness: import('y-protocols/awareness').Awareness, leave: () => void }}
 */
export function createLiveblocksProvider(ydoc) {
	const client = createClient({
		publicApiKey: 'pk_dev_1iisK8HmLpmVOreEDPQqeruOVvHWUPlchIagQpCKP-VIRyGkCF4DDymphQiiVJ6A'
	});
	const { room, leave } = client.enterRoom(LIVEBLOCKS_ROOM, {
		initialPresence: {}
	});

	const yProvider = new LiveblocksProvider(room, ydoc);
	yProvider.awareness.setLocalStateField('user', { color: userColor, name: userName });

	return {
		awareness: /** @type {import('y-protocols/awareness').Awareness} */ (yProvider.awareness),
		leave
	};
}
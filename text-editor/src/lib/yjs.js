import { LIVEBLOCKS_ROOM, userColor, userName } from '$lib/generated/globals.js';
import { createClient } from '@liveblocks/client';
import LiveblocksProvider from '@liveblocks/yjs';
import { UndoManager } from 'yjs';

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

/**
 * Since y-prosemirror uses the `destroy` method to clean up all plugins, we need to
 * prevent that from happening to our shared/global UndoManager. Instead, we provide
 * an `actuallyDestroy` method that can be called when we actually want to destroy.
 * This is a bit of a hack, but it works.
 *
 * See https://github.com/yjs/y-prosemirror/issues/114
 */
export class IndestructibleUndoManager extends UndoManager {
	constructor(type, opts) {
		super(type, opts);
	}

	destroy() {
		// Do nothing
	}

	actuallyDestroy() {
		super.destroy();
	}
}

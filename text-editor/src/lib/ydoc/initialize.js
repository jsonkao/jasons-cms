import { LIVEBLOCKS_ROOM, userColor, userName } from '$lib/generated/globals.js';
import { createEditor, cursorBuilder, selectionBuilder } from '$lib/prosemirror/index.js';
import { createClient } from '@liveblocks/client';
import LiveblocksProvider from '@liveblocks/yjs';
import { readableArray } from 'shared';
import { yCursorPlugin, ySyncPlugin, ySyncPluginKey, yUndoPlugin } from 'y-prosemirror';
import * as Y from 'yjs';

/** @typedef {import('shared').BlockMap} BlockMap */

/**
 * Creates a Liveblocks room, provider, and doc for Yjs.
 */
export default function () {
	const client = createClient({
		publicApiKey: 'pk_dev_1iisK8HmLpmVOreEDPQqeruOVvHWUPlchIagQpCKP-VIRyGkCF4DDymphQiiVJ6A'
	});
	const { room, leave } = client.enterRoom(LIVEBLOCKS_ROOM, {
		initialPresence: { user: { color: userColor, name: userName } }
	});

	const ydoc = new Y.Doc();
	const transactionOrigin = ydoc.clientID;
	const yProvider = new LiveblocksProvider(room, ydoc);
	const awareness = /** @type {import('y-protocols/awareness').Awareness} */ (yProvider.awareness);

	/** @type {Y.Array<BlockMap>} */
	const yarray = ydoc.getArray('blocks-test');
	const yarrayStore = readableArray(yarray);

	const undoManager = new /** @type {typeof Y.UndoManager} */ (IndestructibleUndoManager)(yarray, {
		trackedOrigins: new Set([ySyncPluginKey, transactionOrigin]),
		captureTransaction: (tr) => tr.meta.get('addToHistory') !== false
	});

	return {
		ydoc,
		transactionOrigin,
		yarrayStore,

		/** @param {BlockMap} blockMap */
		createEditorForBlock: (blockMap) =>
			createEditor([
				ySyncPlugin(/** @type {Y.XmlFragment} */ (blockMap.get('text'))),
				yCursorPlugin(awareness, { cursorBuilder, selectionBuilder }),
				yUndoPlugin({ undoManager })
			]),

		destroy: () => {
			leave();
			ydoc.destroy();
			/** @type {IndestructibleUndoManager} */ (undoManager).actuallyDestroy();
		}
	};
}

/**
 * y-prosemirror uses the `destroy` method to clean up each plugin, but that would destroy our global UndoManager.
 * Instead, we have an `actuallyDestroy` method that can be called when we actually want to destroy.
 * This is a bit of a hack, but it works. See https://github.com/yjs/y-prosemirror/issues/114.
 */
export class IndestructibleUndoManager extends Y.UndoManager {
	constructor(type, opts) {
		super(type, opts);
	}

	// Do nothing
	destroy() {}

	actuallyDestroy() {
		super.destroy();
	}
}

import { LIVEBLOCKS_ROOM, userColor, userName } from '$lib/generated/globals.js';
import { createClient } from '@liveblocks/client';
import LiveblocksProvider from '@liveblocks/yjs';
import { prosemirrorToYXmlFragment } from 'y-prosemirror';
import { readableArray } from 'shared';
import { yCursorPlugin, ySyncPlugin, ySyncPluginKey, yUndoPlugin } from 'y-prosemirror';
import { createEditor, cursorBuilder, selectionBuilder } from '$lib/prosemirror/index.js';
import * as Y from 'yjs';

/** @typedef {import('shared').BlockMap} BlockMap */

/**
 * A helper function for creating a Liveblocks room, provider, and doc for Yjs.
 */
export function create() {
	const client = createClient({
		publicApiKey: 'pk_dev_1iisK8HmLpmVOreEDPQqeruOVvHWUPlchIagQpCKP-VIRyGkCF4DDymphQiiVJ6A'
	});
	const { room, leave } = client.enterRoom(LIVEBLOCKS_ROOM, {
		initialPresence: {}
	});

	const ydoc = new Y.Doc();
	const transactionOrigin = ydoc.clientID;
	const yProvider = new LiveblocksProvider(room, ydoc);
	const awareness = /** @type {import('y-protocols/awareness').Awareness} */ (yProvider.awareness);
	awareness.setLocalStateField('user', { color: userColor, name: userName });

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
 * Since y-prosemirror uses the `destroy` method to clean up all plugins, we need to
 * prevent that from happening to our shared/global UndoManager. Instead, we provide
 * an `actuallyDestroy` method that can be called when we actually want to destroy.
 * This is a bit of a hack, but it works.
 *
 * See https://github.com/yjs/y-prosemirror/issues/114
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

/**
 * Insert a graphic
 * @param {BlockInsertionParams} arguments
 * @param {string} newGraphicName
 * @returns {Array<BlockMap>}
 */
export function prepareInsertion({ docNode, cursorPosition }, newGraphicName) {
	const textBefore = makeTextBlock(docNode.cut(0, cursorPosition - 1));
	const textAfter = makeTextBlock(docNode.cut(cursorPosition + 1));

	return [
		textBefore,
		makeCodingBlock(
			newGraphicName,
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
				'</style>'
			].join('\n')
		),
		textAfter
	];
}

/**
 * @param {import('prosemirror-model').Node} node
 * @returns {BlockMap}
 */
function makeTextBlock(node) {
	const ymap = new Y.Map();
	const yxmlFragment = prosemirrorToYXmlFragment(node);
	ymap.set('type', 'text');
	ymap.set('text', yxmlFragment);

	return ymap;
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
	return ymap;
}

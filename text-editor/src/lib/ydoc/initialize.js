import { createEditor, cursorBuilder, selectionBuilder } from '$lib/prosemirror/index.js';
import { IndestructibleUndoManager, SharedDoc } from 'shared/src/shared-doc.js';
import { yCursorPlugin, ySyncPlugin, ySyncPluginKey, yUndoPlugin } from 'y-prosemirror';
import { userColor, userName } from '$lib/generated/globals.js';

/** @typedef {import('shared').BlockMap} BlockMap */

const user = { color: userColor, name: userName };

/**
 * Start an undo manager for an instantiated SharedDoc.
 * Also, provide a utility for creating a prosemirror editor for a given block.
 */
export default function () {
	const doc = new SharedDoc(user);
	const undoManager = new /** @type {typeof import('yjs').UndoManager} */ (
		IndestructibleUndoManager
	)(doc.yarray, {
		trackedOrigins: new Set([ySyncPluginKey, doc.transactionOrigin]),
		captureTransaction: (tr) => tr.meta.get('addToHistory') !== false
	});

	return {
		doc,

		/** @param {BlockMap} blockMap */
		createEditorForBlock: (blockMap) =>
			createEditor([
				ySyncPlugin(/** @type {import('yjs').XmlFragment} */ (blockMap.get('text'))),
				yCursorPlugin(doc.awareness, { cursorBuilder, selectionBuilder }),
				yUndoPlugin({ undoManager })
			]),

		destroy: () => {
			doc.destroy();
			/** @type {IndestructibleUndoManager} */ (undoManager).actuallyDestroy();
		}
	};
}

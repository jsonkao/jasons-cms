import { userColor, userName } from '$lib/generated/globals.js';
import { createEditor, cursorBuilder, selectionBuilder } from '$lib/prosemirror/index.js';
import { IndestructibleUndoManager, SharedDoc } from 'shared/src/shared-doc.js';
import { yCursorPlugin, ySyncPlugin, ySyncPluginKey, yUndoPlugin } from 'y-prosemirror';

/** @typedef {import('shared').BlockMap} BlockMap */

export class SharedDocForProsemirror extends SharedDoc {
	constructor() {
		super({ color: userColor, name: userName });

		this.undoManager = new /** @type {typeof import('yjs').UndoManager} */ (
			IndestructibleUndoManager
		)(this.yarray, {
			trackedOrigins: new Set([ySyncPluginKey, this.transactionOrigin]),
			captureTransaction: (tr) => tr.meta.get('addToHistory') !== false
		});
	}

	destroy = () => {
		super.destroy();
		/** @type {IndestructibleUndoManager} */ (this.undoManager).actuallyDestroy();
	};

	/** @param {BlockMap} blockMap */
	createEditorForBlock(blockMap) {
		return createEditor([
			ySyncPlugin(/** @type {import('yjs').XmlFragment} */ (blockMap.get('text'))),
			yCursorPlugin(this.awareness, { cursorBuilder, selectionBuilder }),
			yUndoPlugin({ undoManager: this.undoManager })
		]);
	}
}

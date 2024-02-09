/**
 * This file contains helper functions for creating ProseMirror state and schema
 */

import { userColor, userName } from '$lib/generated/globals.js';

import { keymap } from 'prosemirror-keymap';
import { EditorState, Plugin } from 'prosemirror-state';
import { IndestructibleUndoManager, SharedDoc } from '$lib/shared/shared-doc.js';
import {
	redo,
	undo,
	yCursorPlugin,
	ySyncPlugin,
	ySyncPluginKey,
	yUndoPlugin,
	prosemirrorToYXmlFragment
} from 'y-prosemirror';

import { FloatingMenuPlugin } from './floating-menu.js';
import { richTextKeyMap } from './keymap.js';
import { richTextSchema } from './schema.ts';

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

	/**
	 * @param {import('yjs').XmlFragment} fragment
	 * @param {{ hasFloatingMenu?: boolean }} [options]
	 */
	createEditorForBlock(fragment, { hasFloatingMenu = false } = {}) {
		const plugins = [
			ySyncPlugin(fragment),
			yCursorPlugin(this.awareness, { cursorBuilder, selectionBuilder }),
			yUndoPlugin({ undoManager: this.undoManager })
		];
		if (hasFloatingMenu) plugins.push(FloatingMenuPlugin());
		return createEditor(plugins);
	}

	/** @param {BlockInsertionParams} params */
	insertGraphic({ docNode, cursorPosition, activeYXmlFragment }) {
		const currentBlockMap = /** @type {BlockMap} */ (activeYXmlFragment.parent);
		const ymapIndex = this.indexOf(currentBlockMap);
		if (ymapIndex === -1) throw new Error('Could not find the current block map');

		const idAboutToBeDeleted = getId(this.yarrayStore.y.get(ymapIndex));

		this.insertGraphicSandwich(ymapIndex, {
			name: 'graphic' + idAboutToBeDeleted,
			textBefore: prosemirrorToYXmlFragment(docNode.cut(0, cursorPosition - 1)),
			textAfter: prosemirrorToYXmlFragment(docNode.cut(cursorPosition + 1))
		});
	}
}

export const doc = new SharedDocForProsemirror();

/**
 * Uses internal ID to create a unique key for each block
 * @param {import('yjs').Map<any> | import('yjs').XmlFragment} yjsThing
 */
export function getId(yjsThing) {
	if (yjsThing._item === null) throw new Error('I thought Y.Map._item would never be null');
	return Object.values(yjsThing._item.id).join('_');
}

/**
 * A helper function to create a minimal rich text editor.
 * @param {Plugin[]} plugins
 * @returns {EditorState}
 */
export function createEditor(plugins) {
	return EditorState.create({
		schema: richTextSchema,
		plugins: [
			...plugins,
			keymap({
				'Mod-z': undo,
				'Mod-y': redo,
				'Mod-Shift-z': redo
			}),
			richTextKeyMap(richTextSchema)
		]
	});
}

/**
 * Generator for a cursor element. Based off y-prosemirror cursor-plugin.js, but really
 * is copying structure from y-codemirror.next/src/y-remote-selections.js
 * @param {{ name: string, color: string }} user
 * @returns {HTMLElement}
 */
export function cursorBuilder(user) {
	const cursor = document.createElement('span');
	cursor.classList.add('cm-ySelectionCaret');
	cursor.setAttribute('style', `border-color: ${user.color}; background-color: ${user.color}`);

	const divCaretDot = document.createElement('div');
	divCaretDot.classList.add('cm-ySelectionCaretDot');

	const divSelectionInfo = document.createElement('div');
	divSelectionInfo.classList.add('cm-ySelectionInfo');
	divSelectionInfo.insertBefore(document.createTextNode(user.name), null);

	/** @type {ReturnType<typeof setTimeout>} Show the cursor on hover; hide the cursor after 2 seconds of not hovering */
	let timeout;
	cursor.addEventListener('mouseover', () => {
		clearTimeout(timeout);
		cursor.classList.add('caret-hover');
	});
	cursor.addEventListener('mouseout', () => {
		timeout = setTimeout(() => cursor.classList.remove('caret-hover'), 2000);
	});

	cursor.insertBefore(document.createTextNode('\u2060'), null);
	cursor.insertBefore(divCaretDot, null);
	cursor.insertBefore(document.createTextNode('\u2060'), null);
	cursor.insertBefore(divSelectionInfo, null);
	cursor.insertBefore(document.createTextNode('\u2060'), null);
	return cursor;
}

/**
 * Took the default generator for the selection attributes and made it more transparent
 *
 * @param {{ name: string, color: string }} user
 * @return {import('prosemirror-view').DecorationAttrs}
 */
export function selectionBuilder(user) {
	return {
		style: `background-color: ${user.color}44`,
		class: 'ProseMirror-yjs-selection'
	};
}

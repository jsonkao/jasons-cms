/**
 * This file contains helper functions for creating ProseMirror state and schema
 */

import { liveblocksRoom, userColor, userName } from '$lib/generated/globals.js';

import { DEFAULT_CODE_BLOCK } from '$shared/constants.js';
import { setupProvider } from '$shared/provider.js';
import {
	IndestructibleUndoManager,
	SharedDoc,
	makeCodingBlock,
	makeTextBlock
} from '$shared/shared-doc.js';
import { EditorState } from 'prosemirror-state';
import {
	prosemirrorToYXmlFragment,
	yCursorPlugin,
	ySyncPlugin,
	ySyncPluginKey,
	yUndoPlugin
} from 'y-prosemirror';
import { corePlugins } from './plugins.js';
import { richTextSchema } from './schema.ts';

export class SharedDocForProsemirror extends SharedDoc {
	/**
	 * @param {ReturnType<import('$shared/provider').setupProvider>} provider
	 */
	constructor(provider) {
		super(provider);

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
	createEditor(fragment, { hasFloatingMenu = false } = {}) {
		const yPlugins = () => [
			ySyncPlugin(fragment),
			yCursorPlugin(this.awareness, { cursorBuilder, selectionBuilder }),
			yUndoPlugin({ undoManager: this.undoManager })
		];

		return EditorState.create({
			schema: richTextSchema,
			plugins: [...yPlugins(), ...corePlugins(hasFloatingMenu)]
		});
	}

	/** @param {BlockInsertionParams} params */
	insertGraphic({ docNode, cursorPosition, activeYXmlFragment }) {
		// @ts-ignore
		const currentBlockMap = /** @type {import('$shared/types').BlockMap} */ (
			activeYXmlFragment.parent
		);
		const ymapIndex = this.indexOf(currentBlockMap);
		if (ymapIndex === -1) throw new Error('Could not find the current block map');

		const idAboutToBeDeleted = getId(this.yarray.get(ymapIndex));

		const name = 'graphic' + idAboutToBeDeleted;
		const textBefore = prosemirrorToYXmlFragment(docNode.cut(0, cursorPosition - 1));
		const textAfter = prosemirrorToYXmlFragment(docNode.cut(cursorPosition + 1));

		const newElements = [
			// @ts-ignore
			makeTextBlock(textBefore),
			makeCodingBlock(name, DEFAULT_CODE_BLOCK),
			// @ts-ignore
			makeTextBlock(textAfter)
		];

		this.ydoc.transact(() => {
			this.yarray.delete(ymapIndex);
			this.yarray.insert(ymapIndex, newElements);
		}, this.transactionOrigin);
	}
}

export const doc = new SharedDocForProsemirror(
	setupProvider({ color: userColor, name: userName }, liveblocksRoom)
);

/**
 * Uses internal ID to create a unique key for each block
 * @param {import('yjs').Map<any> | import('yjs').XmlFragment | import('$shared/types').BlockMap} yjsThing
 */
export function getId(yjsThing) {
	// @ts-ignore
	const { _item } = yjsThing;

	if (_item === null) throw new Error('I thought Y.Map._item would never be null');
	return Object.values(_item.id).join('_');
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

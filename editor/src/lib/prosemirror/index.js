/**
 * This file contains helper functions for creating ProseMirror state and schema
 */

import { EditorState, TextSelection, Plugin } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { redo, undo, yCursorPlugin, ySyncPlugin, ySyncPluginKey, yUndoPlugin } from 'y-prosemirror';
import { richTextKeyMap } from './keymap.js';
import { richTextSchema } from './schema.ts';
import { UndoManager } from 'yjs';

/**
 * Convert raw blocks to blocks that have an editor state
 * @param {{ydoc: import('yjs').Doc, provider: import('@liveblocks/yjs').default, rawBlocks: Block[] }}
 * @returns {BlockWithState[]}
 */
export function createBlocksWithState({ ydoc, provider, rawBlocks }) {
	const undoManager = new UndoManager(
		rawBlocks.filter((b) => b.type === 'text').map((b) => ydoc.getXmlFragment('graphic-' + b.uid)),
		{
			trackedOrigins: new Set([ySyncPluginKey]),
			captureTransaction: (tr) => tr.meta.get('addToHistory') !== false
		}
	);

	return rawBlocks.map((d) => {
		if (d.type === 'text') {
			const state = createEditor(undefined, [
				ySyncPlugin(ydoc.getXmlFragment('graphic-' + d.uid)),
				yCursorPlugin(provider.awareness, { cursorBuilder }),
				yUndoPlugin({ undoManager }),
				keymap({
					'Mod-z': undo,
					'Mod-y': redo,
					'Mod-Shift-z': redo
				})
			]);
			return {
				...d,
				state,
				editor: undefined
			};
		}
		return d;
	});
}

/**
 * A function that creates a minimal rich text editor with a starter doc.
 * Based on the createRichTextEditor function from prosemirror-svelte.
 * @param {import('prosemirror-model').Node | undefined} doc
 * @param {Plugin[]} plugins
 * @returns {EditorState}
 */
export const createEditor = (doc, plugins) =>
	EditorState.create({
		schema: richTextSchema,
		doc,
		selection: doc ? TextSelection.atStart(doc) : undefined,
		plugins: [...plugins, richTextKeyMap(richTextSchema)]
	});

/**
 * Generator for a cursor element. Based off y-prosemirror cursor-plugin.js, but really
 * is copying structure from y-codemirror.next/src/y-remote-selections.js
 * @param {{ name: string, color: string }} user
 * @returns {HTMLElement}
 */
function cursorBuilder(user) {
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

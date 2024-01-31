/**
 * This file contains helper functions for creating ProseMirror state and schema
 */

import { EditorState, TextSelection, Plugin } from 'prosemirror-state';
import { Schema, DOMParser } from 'prosemirror-model';
import { richTextKeyMap } from './keymap.js';
import { richTextSchema } from './schema.ts';

/**
 * When Backspace is pressed on an empty prosemirror state,
 * delete the entire block, unmounting the ProsemirrorEditor component.
 * @param {import('prosemirror-view').EditorProps['handleKeyDown']} handleKeyDown
 */
export const makePlugin = (handleKeyDown) =>
	new Plugin({
		props: {
			handleKeyDown
		}
	});

/**
 * Converts the editor state to plain text. Taken from prosemirror-svelte
 * @param {EditorState} editorState
 * @returns {string}
 */
export const toPlainText = (editorState) => {
	if (editorState.doc.childCount === 0) {
		return '';
	} else if (editorState.doc.childCount === 1) {
		return editorState.doc.textContent;
	} else {
		/** @type {string[]} */
		let paragraphs = [];
		for (let i = 0; i < editorState.doc.childCount; i++) {
			paragraphs.push(editorState.doc.child(i).textContent);
		}
		return paragraphs.join('\n');
	}
};

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
export const cursorBuilder = (user) => {
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
};

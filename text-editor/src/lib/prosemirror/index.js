/**
 * This file contains helper functions for creating ProseMirror state and schema
 */

import { keymap } from 'prosemirror-keymap';
import { EditorState, Plugin } from 'prosemirror-state';
import { redo, undo } from 'y-prosemirror';
import { richTextKeyMap } from './keymap.js';
import { richTextSchema } from './schema.ts';
import { popupStore } from '$lib/stores.js';

/**
 * A helper function to create a minimal rich text editor.
 * @param {Plugin[]} plugins
 * @returns {EditorState}
 */
export const createEditor = (plugins) =>
	EditorState.create({
		schema: richTextSchema,
		plugins: [
			...plugins,
			keymap({
				'Mod-z': undo,
				'Mod-y': redo,
				'Mod-Shift-z': redo
			}),
			richTextKeyMap(richTextSchema),
			customCommands()
		]
	});

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
 * Creates a plugin that listens to custom commands being typed — in the style of Notion (e.g. /graphic)
 */
function customCommands() {
	return new Plugin({
		view(editorView) {
			return new CustomCommandView(editorView);
		}
	});
}

/**
 * A view for the custom command plugin.
 * References:
 *   - https://github.com/ueberdosis/tiptap/blob/main/packages/extension-floating-menu/src/floating-menu-plugin.ts
 *   - https://github.com/ProseMirror/prosemirror-dropcursor/blob/master/src/dropcursor.ts
 */
class CustomCommandView {
	/**
	 * @param {import('prosemirror-view').EditorView} editorView
	 */
	constructor(editorView) {
		this.editorView = editorView;
		// On focus, also call update
		editorView.dom.addEventListener('focus', () => setTimeout(() => this.update(this.editorView)));
		editorView.dom.addEventListener('blur', this.blurHandler);
	}

	/**
	 * @param {FocusEvent} event
	 */
	blurHandler(event) {
		const targetNode = /** @type {Node} */ (event.target);
		const relatedTarget = /** @type {Node} */ (event.relatedTarget);

		if (relatedTarget?.id === 'popup-button') return;
		if (targetNode?.parentNode?.contains(relatedTarget)) return;

		popupStore.set({ visible: false });
	}

	/**
	 * @param {import('prosemirror-view').EditorView} editorView
	 * @param {EditorState} [prevState]
	 */
	update(editorView, prevState) {
		const { selection } = editorView.state;
		const { $anchor, empty } = selection;
		const isRootDepth = $anchor.depth === 1;
		const isEmptyTextBlock =
			$anchor.parent.isTextblock && !$anchor.parent.type.spec.code && !$anchor.parent.textContent;
		const textElement = editorView.domAtPos($anchor.pos).node;

		if (!editorView.hasFocus() || !empty || !isRootDepth || !isEmptyTextBlock) {
			popupStore.set({ visible: false });
			return;
		}

		// TODO: add a resize event listener
		const rect = /** @type {HTMLElement} */ (textElement).getBoundingClientRect();
		popupStore.set({
			visible: true,
			left: rect.left + window.scrollX,
			top: rect.top + window.scrollY
		});
	}
}

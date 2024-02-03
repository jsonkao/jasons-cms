/**
 * This file contains helper functions for creating ProseMirror state and schema
 */

import { keymap } from 'prosemirror-keymap';
import { EditorState, Plugin } from 'prosemirror-state';
import { redo, undo, ySyncPluginKey } from 'y-prosemirror';
import { richTextKeyMap } from './keymap.js';
import { richTextSchema } from './schema.ts';
import { popupStore } from '$lib/stores.js';

/** @typedef {import('prosemirror-view').EditorView} EditorView */

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
			FloatingMenuPlugin()
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
 * Took the default generator for the selection attributes and made it more transparent
 *
 * @param {any} user user data
 * @return {import('prosemirror-view').DecorationAttrs}
 */
export const selectionBuilder = (user) => {
	return {
		style: `background-color: ${user.color}44`,
		class: 'ProseMirror-yjs-selection'
	};
};

/**
 * Creates a floating menu plugin
 */
function FloatingMenuPlugin() {
	return new Plugin({
		view: (editorView) => new FloatingMenuView(editorView)
	});
}

/**
 * A view for the floating menu plugin.
 * References:
 *   - https://github.com/ueberdosis/tiptap/blob/main/packages/extension-floating-menu/src/floating-menu-plugin.ts
 *   - https://github.com/ProseMirror/prosemirror-dropcursor/blob/master/src/dropcursor.ts
 */
class FloatingMenuView {
	/** @type {EditorView} The editor view */
	editorView;

	/** @type {boolean} Whether to prevent hiding on next blur */
	preventHide = false;

	/**
	 * @param {EditorView} editorView
	 */
	constructor(editorView) {
		this.editorView = editorView;
		// On focus, also call update
		editorView.dom.addEventListener('focus', this.focusHandler);
		// On blur, hide the floating menu (in some cases)
		editorView.dom.addEventListener('blur', this.blurHandler);
		// On mousedown, prevent blur from hiding the floating menu
		editorView.dom.addEventListener('mousedown', this.mousedownHandler, { capture: true });
	}

	focusHandler = () => {
		// Tiptap code says this `setTimeout` makes sure `selection` is already updated
		setTimeout(() => this.update(this.editorView));
	};

	/**
	 * @param {FocusEvent} event
	 */
	blurHandler = (event) => {
		if (this.preventHide) {
			// Prevent a blur event caused by clicking the floating menu from hiding the floating menu
			this.preventHide = false;
			return;
		}

		const targetNode = /** @type {Node} */ (event.target);
		const relatedTarget = /** @type {Node} */ (event.relatedTarget);

		if (targetNode?.parentNode?.contains(relatedTarget)) return;

		popupStore.set({ visible: false });
	};

	mousedownHandler = () => {
		this.preventHide = true;
	};

	/**
	 * @param {EditorView} editorView
	 */
	update(editorView) {
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

		const ysyncPlugin = ySyncPluginKey.get(editorView.state);
		if (ysyncPlugin === undefined) throw new Error('ySyncPlugin not found');
		const ysyncPluginState = ysyncPlugin.getState(editorView.state);

		const docNode = editorView.state.doc;
		const cursorPosition = $anchor.pos;

		// TODO: add a resize event listener
		// TODO: Use cursor pos method?
		const rect = /** @type {HTMLElement} */ (textElement).getBoundingClientRect();

		popupStore.set({
			visible: true,
			left: rect.left + window.scrollX,
			top: rect.top + window.scrollY,
			docNode,
			cursorPosition,
			activeYXmlFragment: ysyncPluginState.type
		});
	}
}

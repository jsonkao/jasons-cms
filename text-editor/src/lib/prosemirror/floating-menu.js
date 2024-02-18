import { floatingMenuStore } from '$lib/stores.js';
import { Plugin } from 'prosemirror-state';
import { ySyncPluginKey } from 'y-prosemirror';

/** @typedef {import('prosemirror-view').EditorView} EditorView */

/**
 * Creates a floating menu plugin
 */
export function FloatingMenuPlugin() {
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

		floatingMenuStore.set({ visible: false });
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
			floatingMenuStore.set({ visible: false });
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

		floatingMenuStore.set({
			visible: true,
			left: rect.left + window.scrollX,
			top: rect.top + window.scrollY,
			docNode,
			cursorPosition,
			activeYXmlFragment: ysyncPluginState.type
		});
	}
}

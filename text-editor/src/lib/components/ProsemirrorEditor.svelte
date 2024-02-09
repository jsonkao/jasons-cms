<script>
	/**
	 * This component was copied from https://github.com/christianheine/prosemirror-svelte and lightly modified to:
	 * - Use an editor state creator function instead of a static editor state
	 * - Clean up type annotations and styles
	 * - Propogate blur events to parent (this might've not been needed)
	 * - Import a custom CSS file
	 *
	 * And finally, there is a slight chance that prosemirror-svelte was causing a duplicate import of yjs.
	 *
	 * Copyright 2019 Christian Heine
	 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
	 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE
	 */

	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { EditorView } from 'prosemirror-view';

	const dispatch = createEventDispatcher();

	/** @type {string} */
	export let className = 'ui-editor';

	/** @type {() => import('prosemirror-state').EditorState}*/
	export let editorStateCreator;

	/** @type {import('prosemirror-state').EditorState} */
	let editorState = editorStateCreator();

	/** @type {string} */
	export let placeholder = '';

	/** Reference to the editor view
	 *  @type {EditorView | null} */
	export let view = null;

	/** Debounce change events (set to zero for immediate updates) */
	export let debounceChangeEventsInterval = 50;

	/** Reference to the editor component
	 *  @type {HTMLDivElement} */
	let editor;

	/** Initial EditorView props */
	export let editorViewProps = {};

	/** Focus the content-editable div */
	export function focus() {
		view && view.focus();
	}

	/** Blur the content-editable div */
	export function blur() {
		editor && editor.blur();
	}

	/** Tracks the timeout id of the last time the change event was dispatched
	 * @type {number}
	 */
	let dispatchLastEditTimeout;

	/** Tracks whether changes to editor state were not yet dispatched */
	let isDirty = false;

	$: if (view && editorState && !isDirty) {
		view.updateState(editorState); // necessary to keep the DOM in sync with the editor state on external updates
	}

	/** Tracks whether the editor is empty (i.e. has a content size of 0)
	 * @type {boolean}
	 */
	let editorIsEmpty;
	$: editorIsEmpty = editorState
		? editorState.doc.content.size === 0 ||
			(editorState.doc.textContent === '' && editorState.doc.content.size < 3)
		: true;

	/** Dispatches a change event and resets whether the editor state is dirty */
	const dispatchChangeEvent = () => {
		if (isDirty) {
			dispatch('change', { editorState });
			isDirty = false;
		}
	};

	/**
	 * Captures custom events from plugins and dispatches them with a new event type (based on event.detail.type)
	 * @param event {CustomEvent}
	 */
	const onCustomEvent = (event) => {
		if (event.detail) {
			const { type, ...detail } = event.detail;
			dispatch(type || 'custom', detail);
		}
	};

	onMount(() => {
		view = new EditorView(
			{ mount: editor },
			{
				...editorViewProps,
				state: editorState,
				dispatchTransaction: (transaction) => {
					if (view === null) return;

					editorState = view.state.apply(transaction);

					const contentHasChanged = !editorState.doc.eq(view.state.doc);

					if (contentHasChanged) {
						isDirty = true;
						if (debounceChangeEventsInterval > 0) {
							if (dispatchLastEditTimeout) clearTimeout(dispatchLastEditTimeout);
							dispatchLastEditTimeout = setTimeout(dispatchChangeEvent, 50);
						} else {
							setTimeout(dispatchChangeEvent, 0);
						}
					}

					view.updateState(editorState);

					dispatch('transaction', { view, editorState, isDirty, contentHasChanged });
				}
			}
		);
	});

	onDestroy(() => {
		view && view.destroy();
	});
</script>

<!-- Is this blur event needed? See https://stackoverflow.com/questions/69688236/dispatch-event-from-child-to-grandparent-in-svelte -->

<div
	class={className}
	class:ProseMirror={true}
	class:editor_empty={editorIsEmpty}
	data-placeholder={placeholder}
	bind:this={editor}
	on:focus
	on:blur={() => dispatch('blur')}
	on:custom={onCustomEvent}
></div>

<style>
	:global(body) {
		--ui-color-placeholder: #aaaaaa;
	}

	:global(.ProseMirror) {
		position: relative;
	}

	:global(.ProseMirror) {
		word-wrap: break-word;
		white-space: pre-wrap;
		-webkit-font-variant-ligatures: none;
		font-variant-ligatures: none;
	}

	:global(.ProseMirror pre) {
		white-space: pre-wrap;
	}

	:global(.ProseMirror li) {
		position: relative;
	}

	:global(.ProseMirror-hideselection *::selection) {
		background: transparent;
	}

	:global(.ProseMirror-hideselection *::-moz-selection) {
		background: transparent;
	}

	:global(.ProseMirror-hideselection) {
		caret-color: transparent;
	}

	:global(.ProseMirror-selectednode) {
		outline: 2px solid #8cf;
	}

	/* Make sure li selections wrap around markers */

	:global(li.ProseMirror-selectednode) {
		outline: none;
	}

	:global(li.ProseMirror-selectednode:after) {
		content: '';
		position: absolute;
		left: -32px;
		right: -2px;
		top: -2px;
		bottom: -2px;
		border: 2px solid #8cf;
		pointer-events: none;
	}

	:global(.ProseMirror .empty-node::before) {
		position: absolute;
		color: #aaa;
		cursor: text;
	}

	:global(.ProseMirror .empty-node:hover::before) {
		color: #777;
	}

	:global(.ProseMirror.editor_empty::before) {
		position: absolute;
		content: attr(data-placeholder);
		pointer-events: none;
		color: var(--ui-color-placeholder);
	}
</style>
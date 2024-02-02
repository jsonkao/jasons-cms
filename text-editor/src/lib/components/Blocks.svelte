<script lang="ts">
	import { browser } from '$app/environment';
	import { createLiveblocksProvider } from '$lib/liveblocks.js';
	import { createObserver } from '$lib/utils.js';
	import { onMount } from 'svelte';
	import Component from './Component.svelte';
	import FloatingMenu from './FloatingMenu.svelte';
	import ProsemirrorEditor from './ProsemirrorEditor.svelte';

	import { createEditor, cursorBuilder, selectionBuilder } from '$lib/prosemirror/index.js';
	import type { EditorState } from 'prosemirror-state';
	import { readableArray, type YReadableArray } from 'shared';
	import { yCursorPlugin, ySyncPlugin, ySyncPluginKey, yUndoPlugin } from 'y-prosemirror';
	import * as Y from 'yjs';
	import './prosemirror.css';

	let lastTextFocused: string;

	/**
	 * Listen for messages from the parent window
	 */
	function onMessage(event: MessageEvent) {
		if (event.data.type === 'focusText') {
			pmEditors[lastTextFocused]?.focus();
		}
	}

	let destroy = () => {};
	let createEditorForBlock: (blockMap: BlockMap) => EditorState;
	let ydoc: Y.Doc;
	let yarrayStore: YReadableArray<BlockMap>;
	let transactionOrigin: number;

	if (browser) {
		// TODO: Move this logic into a separate JavaScript file?
		ydoc = new Y.Doc();
		transactionOrigin = ydoc.clientID;
		const { awareness, leave } = createLiveblocksProvider(ydoc);
		destroy = leave;

		const yarray: Y.Array<BlockMap> = ydoc.getArray('blocks-test');
		yarrayStore = readableArray(yarray);

		// BUG: Undo/Redo is buggy with insertion
		const undoManager = new Y.UndoManager(yarray, {
			trackedOrigins: new Set([ySyncPluginKey, transactionOrigin]),
			captureTransaction: (tr) => {
				return tr.meta.get('addToHistory') !== false;
			}
		});
		undoManager.on('stack-item-added', ({ stackItem }) =>
			console.log('undo stack item added', stackItem)
		);

		createEditorForBlock = (blockMap: BlockMap) => {
			console.log('creating editor for block', blockMap);
			return createEditor([
				ySyncPlugin(blockMap.get('text') as Y.XmlFragment),
				yCursorPlugin(awareness, { cursorBuilder, selectionBuilder }),
				yUndoPlugin({ undoManager })
			]);
		};
	}

	let contentEl: HTMLElement;
	onMount(() => {
		window.parent?.postMessage({ type: 'editorMounted' }, '*');
		const observer = createObserver(contentEl.querySelectorAll('[data-name]'));

		return () => {
			observer && observer.disconnect();
			destroy();
		};
	});

	const pmEditors: Record<string, any> = {};

	const getName = (blockMap: BlockMap) => blockMap.get('name') as string;
	const getInternalId = (blockMap: BlockMap) => {
		if (blockMap._item === null) throw new Error('I thought Y.Map._item would never be null');
		return Object.values(blockMap._item.id).join('-');
	};

	/**
	 * A WIP!!
	 * @param {CustomEvent} e
	 */
	function insertNewGraphic(e) {
		console.log('inserting', e);
		const ymap = new Y.Map();

		const yxmlFragment = new Y.XmlFragment();
		const yxmlElement = new Y.XmlElement('paragraph');
		yxmlElement.insert(0, [new Y.XmlText('TESTING INSERT')]);
		yxmlFragment.insert(0, [yxmlElement]);

		ymap.set('type', 'text');
		ymap.set('text', yxmlFragment);

		ydoc.transact(() => {
			yarrayStore.y.push([ymap]);
		}, transactionOrigin);
	}
</script>

<svelte:window on:message={onMessage} />

<div class="content" bind:this={contentEl}>
	{#if createEditorForBlock && $yarrayStore}
		{#each $yarrayStore || [] as blockMap (getInternalId(blockMap))}
			{#if blockMap.get('type') === 'graphic'}
				<Component name={getName(blockMap)} />
			{:else if blockMap.get('type') === 'text'}
				<ProsemirrorEditor
					bind:this={pmEditors[getInternalId(blockMap)]}
					on:blur={() => (lastTextFocused = getInternalId(blockMap))}
					editorStateCreator={() => createEditorForBlock(blockMap)}
				/>
			{/if}
		{/each}
	{/if}
</div>

<FloatingMenu on:new-graphic={insertNewGraphic} />

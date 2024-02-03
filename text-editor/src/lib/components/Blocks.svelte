<script lang="ts">
	import { browser } from '$app/environment';
	import {
		createLiveblocksProvider,
		IndestructibleUndoManager,
		prepareInsertion,
		yFindIndex
	} from '$lib/yjs.js';
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

		const undoManager = new (IndestructibleUndoManager as typeof Y.UndoManager)(yarray, {
			trackedOrigins: new Set([ySyncPluginKey, transactionOrigin]),
			captureTransaction: (tr) => tr.meta.get('addToHistory') !== false
		});

		destroy = () => {
			leave();
			ydoc.destroy();
			(undoManager as IndestructibleUndoManager).actuallyDestroy();
		};

		createEditorForBlock = (blockMap: BlockMap) => {
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
	 * Let parent handle the insertion of new graphics so we can still safely develop the text-editor
	 */
	function insertNewGraphic(e: CustomEvent<BlockInsertionParams>) {
		// if (window === window.parent) return;
		const newElements = prepareInsertion(e.detail);

		const currentIndex = yFindIndex(
			yarrayStore.y as Y.Array<BlockMap>,
			e.detail.activeYXmlFragment.parent as BlockMap
		);
		if (currentIndex === -1) throw new Error('Could not find the current index');

		ydoc.transact(() => {
			yarrayStore.y.delete(currentIndex);
			yarrayStore.y.push(newElements);
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

<FloatingMenu on:insert={insertNewGraphic} />

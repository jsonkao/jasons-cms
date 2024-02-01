<script lang="ts">
	import { browser } from '$app/environment';
	import { createLiveblocksProvider } from '$lib/liveblocks.js';
	import { createObserver } from '$lib/utils.js';
	import { onMount } from 'svelte';
	import Component from './Component.svelte';
	import ProsemirrorEditor from './ProsemirrorEditor.svelte';

	import { createEditor, cursorBuilder } from '$lib/prosemirror/index.js';
	import type { EditorState } from 'prosemirror-state';
	import { readableArray, type YReadableArray } from 'shared';
	import type { Readable } from 'svelte/store';
	import { yCursorPlugin, ySyncPlugin, ySyncPluginKey, yUndoPlugin } from 'y-prosemirror';
	import * as Y from 'yjs';
	import './prosemirror.css';

	type BlockMap = Y.Map<Y.XmlFragment | string>;

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
	let yarrayStore: YReadableArray<BlockMap>;

	if (browser) {
		const ydoc = new Y.Doc();
		const { awareness, leave } = createLiveblocksProvider(ydoc);
		destroy = leave;

		const yarray: Y.Array<BlockMap> = ydoc.getArray('blocks-test');
		yarrayStore = readableArray(yarray);

		const undoManager = new Y.UndoManager(yarray, {
			trackedOrigins: new Set([ySyncPluginKey]),
			captureTransaction: (tr) => tr.meta.get('addToHistory') !== false
		});

		createEditorForBlock = (blockMap: BlockMap) =>
			createEditor([
				ySyncPlugin(blockMap.get('text') as Y.XmlFragment),
				yCursorPlugin(awareness, { cursorBuilder }),
				yUndoPlugin({ undoManager })
			]);
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
	const getUid = (blockMap: BlockMap) => blockMap.get('uid') as string;
</script>

<svelte:window on:message={onMessage} />

<div class="content" bind:this={contentEl}>
	{#if createEditorForBlock && $yarrayStore}
		{#each $yarrayStore || [] as blockMap}
			{#if blockMap.get('type') === 'graphic'}
				<Component name={getName(blockMap)} />
			{:else if blockMap.get('type') === 'text'}
				<ProsemirrorEditor
					bind:this={pmEditors[getUid(blockMap)]}
					on:blur={() => (lastTextFocused = getUid(blockMap))}
					editorState={createEditorForBlock(blockMap)}
				/>
			{/if}
		{/each}
	{/if}
</div>

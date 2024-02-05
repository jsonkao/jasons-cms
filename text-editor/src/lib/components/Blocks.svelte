<script lang="ts">
	import { browser } from '$app/environment';
	import { postHeights, startHMRListening } from '$lib/post-heights.js';
	import { create, prepareInsertion } from '$lib/ydoc';
	import { yFindIndex, type BlockMap } from 'shared';
	import { onMount } from 'svelte';
	import Component from './Component.svelte';
	import FloatingMenu from './FloatingMenu.svelte';
	import ProsemirrorEditor from './ProsemirrorEditor/index.svelte';

	if (!browser) throw new Error('This component is only meant to be used in the browser');

	let lastTextFocused: string;

	/**
	 * Listen for messages from the parent window
	 */
	function onMessage(event: MessageEvent) {
		switch (event.data.type) {
			case 'focusText':
				pmEditors[lastTextFocused]?.focus();
				break;
			case 'scrollTo':
				contentEl
					?.querySelector(`[data-name="${event.data.name}"]`)
					?.scrollIntoView({ behavior: 'smooth' });
				break;
		}
	}

	const { ydoc, transactionOrigin, yarrayStore, createEditorForBlock, destroy } = create();

	let contentEl: HTMLElement;

	$: if ($yarrayStore?.length > 0) {
		// On first prosemirror editor mount, text from ysyncplugin might not have populated yet
		setTimeout(() => postHeights(contentEl), 500);
		postHeights(contentEl);
	}

	onMount(() => {
		startHMRListening(contentEl);
		window.parent.postMessage({ type: 'editorMounted' }, '*');
		return destroy;
	});

	const pmEditors: Record<string, any> = {};

	const getName = (blockMap: BlockMap) => blockMap.get('name') as string;
	const getInternalId = (blockMap: BlockMap) => {
		if (blockMap._item === null) throw new Error('I thought Y.Map._item would never be null');
		return Object.values(blockMap._item.id).join('_');
	};

	/**
	 * Insert new graphic block
	 */
	function insertNewGraphic(e: CustomEvent<BlockInsertionParams>) {
		const ymapIndex = yFindIndex(yarrayStore.y, e.detail.activeYXmlFragment.parent as BlockMap);
		if (ymapIndex === -1) throw new Error('Could not find the current index');

		const idAboutToBeDeleted = getInternalId(yarrayStore.y.get(ymapIndex));
		const newElements = prepareInsertion(e.detail, 'graphic' + idAboutToBeDeleted);

		ydoc.transact(() => {
			yarrayStore.y.delete(ymapIndex);
			yarrayStore.y.insert(ymapIndex, newElements);
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

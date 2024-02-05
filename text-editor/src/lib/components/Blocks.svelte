<script>
	import { browser } from '$app/environment';
	import { postHeights, startHMRListening } from '$lib/post-heights.js';
	import initialize from '$lib/ydoc/initialize.js';
	import { prepareInsertion } from '$lib/ydoc/insert.js';
	import { yFindIndex } from 'shared';
	import { onMount } from 'svelte';
	import Component from './Component.svelte';
	import FloatingMenu from './FloatingMenu.svelte';
	import ProsemirrorEditor from './ProsemirrorEditor/index.svelte';

	/** @typedef {import('shared').BlockMap} BlockMap */

	/** @type {string} */
	let lastTextFocused;

	/** @type {HTMLElement} */
	let contentEl;

	/** @type {Object<string, any>} */
	const pmEditors = {};

	if (!browser) throw new Error('This component is only meant to be used in the browser');

	const { ydoc, transactionOrigin, yarrayStore, createEditorForBlock, destroy } = initialize();

	/**
	 * Listen for messages from the parent window
	 * @param {MessageEvent} event
	 */
	function onMessage(event) {
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

	/** @param {BlockMap} blockMap */
	const getName = (blockMap) => /** @type {string} */ (blockMap.get('name'));

	/**
	 * Uses internal ID to create a unique key for each block
	 * @param {BlockMap} blockMap
	 */
	const getId = (blockMap) => {
		if (blockMap._item === null) throw new Error('I thought Y.Map._item would never be null');
		return Object.values(blockMap._item.id).join('_');
	};

	/**
	 * Insert new graphic block
	 * @param {CustomEvent<BlockInsertionParams>} e
	 */
	function insertNewGraphic(e) {
		const currentBlockMap = /** @type {BlockMap} */ (e.detail.activeYXmlFragment.parent);
		const ymapIndex = yFindIndex(yarrayStore.y, currentBlockMap);
		if (ymapIndex === -1) throw new Error('Could not find the current block map');

		const idAboutToBeDeleted = getId(yarrayStore.y.get(ymapIndex));
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
		{#each $yarrayStore || [] as blockMap (getId(blockMap))}
			{#if blockMap.get('type') === 'graphic'}
				<Component name={getName(blockMap)} />
			{:else if blockMap.get('type') === 'text'}
				<ProsemirrorEditor
					bind:this={pmEditors[getId(blockMap)]}
					on:blur={() => (lastTextFocused = getId(blockMap))}
					editorStateCreator={() => createEditorForBlock(blockMap)}
				/>
			{/if}
		{/each}
	{/if}
</div>

<FloatingMenu on:insert={insertNewGraphic} />

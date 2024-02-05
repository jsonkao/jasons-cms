<script>
	import { browser } from '$app/environment';
	import { postHeights, startHMRListening } from '$lib/post-heights.js';
	import { SharedDocForProsemirror } from '$lib/ydoc/index.js';
	import { onMount } from 'svelte';
	import Component from './Component.svelte';
	import FloatingMenu from './FloatingMenu.svelte';
	import ProsemirrorEditor from './ProsemirrorEditor/index.svelte';
	import { prosemirrorToYXmlFragment } from 'y-prosemirror';

	/** @typedef {import('shared').BlockMap} BlockMap */

	/** @type {string} */
	let lastTextFocused;

	/** @type {HTMLElement} */
	let contentEl;

	/** @type {Object<string, any>} */
	const pmEditors = {};

	if (!browser) throw new Error('This component is only meant to be used in the browser');

	const doc = new SharedDocForProsemirror();
	const { yarrayStore } = doc;

	$: console.log(doc, $yarrayStore)

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

	// On first prosemirror editor mount, text from ysyncplugin might not have populated yet
	$: if ($yarrayStore?.length > 0) {
		setTimeout(() => postHeights(contentEl), 500);
		postHeights(contentEl);
	}

	onMount(() => {
		startHMRListening(contentEl);
		window.parent.postMessage({ type: 'editorMounted' }, '*');
		return doc.destroy;
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
		const ymapIndex = doc.indexOf(currentBlockMap);
		if (ymapIndex === -1) throw new Error('Could not find the current block map');

		const { docNode, cursorPosition } = e.detail;

		const idAboutToBeDeleted = getId(yarrayStore.y.get(ymapIndex));

		doc.insertGraphic(ymapIndex, {
			name: 'graphic' + idAboutToBeDeleted,
			textBefore: prosemirrorToYXmlFragment(docNode.cut(0, cursorPosition - 1)),
			textAfter: prosemirrorToYXmlFragment(docNode.cut(cursorPosition + 1))
		});
	}
</script>

<svelte:window on:message={onMessage} />

<div class="content" bind:this={contentEl}>
	{#each $yarrayStore || [] as blockMap (getId(blockMap))}
		{#if blockMap.get('type') === 'graphic'}
			<Component name={getName(blockMap)} />
		{:else if blockMap.get('type') === 'text'}
			<ProsemirrorEditor
				bind:this={pmEditors[getId(blockMap)]}
				on:blur={() => (lastTextFocused = getId(blockMap))}
				editorStateCreator={() => doc.createEditorForBlock(blockMap)}
			/>
		{/if}
	{/each}
</div>

<FloatingMenu on:insert={insertNewGraphic} />

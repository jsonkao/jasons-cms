<script>
	import { browser } from '$app/environment';
	import { postHeights, startHMRListening } from '$lib/post-heights.js';
	import { doc, getId } from '$lib/prosemirror/index.js';
	import { onMount } from 'svelte';
	import { lastTextFocused } from '$lib/stores.js';

	import Component from './Component.svelte';
	import FloatingMenu from './FloatingMenu.svelte';
	import Editable from './Editable.svelte';

	/** @type {HTMLElement} */
	let contentEl;

	/** @type {Object<string, any>} */
	const pmEditors = {};

	if (!browser) throw new Error('This component is only meant to be used in the browser');

	const { yarrayStore } = doc;

	/**
	 * Listen for messages from the parent window
	 * @param {MessageEvent} event
	 */
	function onMessage(event) {
		switch (event.data.type) {
			case 'focusText':
				pmEditors[$lastTextFocused]?.focus();
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
</script>

<svelte:window on:message={onMessage} />

<div class="content" bind:this={contentEl}>
	{#each $yarrayStore || [] as blockMap (getId(blockMap))}
		{#if blockMap.get('type') === 'graphic'}
			<Component name={getName(blockMap)} {blockMap} />
		{:else if blockMap.get('type') === 'text'}
			{@const fragment = /** @type {import('yjs').XmlFragment} */ (blockMap.get('text'))}
			<Editable {pmEditors} {fragment} hasFloatingMenu />
		{/if}
	{/each}
</div>

<FloatingMenu on:insert={(e) => doc.insertGraphic(e.detail)} />

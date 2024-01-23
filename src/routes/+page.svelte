<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onDestroy, onMount } from 'svelte';
	import { startWebContainer, stopWebContainer, saveFile } from '$lib/webcontainer/index';
	import { base, status } from '$lib/stores';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import type { PageData } from './$types';
	import { browser } from '$app/environment';

	export let data: PageData;
	const { blocks } = data;

	/**
	 * Starting and stopping webcontainer
	 */

	let currentGraphic = (blocks.find((d) => d.type === 'graphic') as GraphicBlock)?.name;

	onMount(() => startWebContainer(blocks));
	onDestroy(() => browser && stopWebContainer);

	/**
	 * Handling the iframe
	 */

	let iframe: HTMLIFrameElement;
	$: if ($base && iframe) iframe.src = $base;

	let showCodeEditor = false;

	function onKeyDown(e: KeyboardEvent) {
		if (e.metaKey && e.key === 'e') {
			e.preventDefault();
			showCodeEditor = !showCodeEditor;
			iframe.contentWindow?.postMessage({ type: 'focusText' }, '*');
		}
	}

	function onMessage(event: MessageEvent) {
		console.log('Message received from the child: ' + JSON.stringify(event.data)); // Message received from child

		if (event.data.type === 'toggleEditor') showCodeEditor = !showCodeEditor;
		if (event.data.type === 'saveFile') handleSave();
		if (event.data.type === 'focusGraphic') currentGraphic = event.data.name;
		if (event.data.type === 'iframeMounted')
			iframe.contentWindow?.postMessage({ type: 'setBlocks', blocks }, '*');
	}

	function handleSave() {
		saveFile(currentGraphic);
	}
</script>

<svelte:window on:message={onMessage} on:keydown={onKeyDown} />

<div class="container">
	<CodeEditor on:save={handleSave} {showCodeEditor} {currentGraphic} />
	<div class="iframe-container">
		<iframe bind:this={iframe} title="Embed" class:loading={$base === null} />
		{#if $status}
			<p transition:fade class:error={$status?.startsWith('Error:')}>{$status}</p>
		{/if}
	</div>
</div>

<style>
	.container {
		display: grid;
	}

	p {
		font-family: Helvetica;
		font-size: 16px;
		line-height: 1.4;
	}

	p.error {
		color: red;
	}

	iframe {
		display: block;
		width: 100%;
		height: 100vh;
		resize: none;
		box-sizing: border-box;
		border: none;
	}

	iframe.loading {
		background: #eee;
	}

	.iframe-container {
		display: grid;
	}

	.iframe-container,
	.iframe-container > * {
		grid-area: 1 / 1;
	}

	.iframe-container p {
		z-index: 1;
		position: relative;
		justify-self: center;
		align-self: center;
		margin: 0;
	}
</style>

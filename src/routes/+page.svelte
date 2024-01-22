<script lang="ts">
	import { startWebContainer, stopWebContainer, saveFile } from '$lib/webcontainer';
	import { base, codeContent, status } from '$lib/stores.js';
	import { fade } from 'svelte/transition';
	import { onDestroy, onMount } from 'svelte';

	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import { browser } from '$app/environment';

	onMount(() => {
		startWebContainer();
		window.addEventListener('message', onMessage);
		window.addEventListener('keydown', onKeyDown);
	});

	onDestroy(async () => {
		await stopWebContainer();
		if (browser) {
			window.removeEventListener('message', onMessage);
			window.removeEventListener('keydown', onKeyDown);
		}
	});

	let iframe: HTMLIFrameElement;

	$: if ($base && iframe) iframe.src = $base;

	let showCodeEditor = false;

	function onKeyDown(e: KeyboardEvent) {
		// This gets called when the iframe is not in focus)
		if (e.metaKey && e.key === 'e') {
			e.preventDefault();
			showCodeEditor = !showCodeEditor;
			if (iframe) {
				iframe.contentWindow?.postMessage("focusText", "*");
			}
		}
	}

	function onMessage(event) {
		console.log('Message received from the child: ' + JSON.stringify(event.data)); // Message received from child
		if (event.data.type === 'toggleEditor') showCodeEditor = !showCodeEditor;
		if (event.data.type === 'saveFile') handleSave();
	}

	function handleSave() {
		saveFile('Graphic', $codeContent);
	}
</script>

<div class="container">
	<CodeEditor on:save={handleSave} {showCodeEditor} />
	<div class="iframe-container">
		<iframe bind:this={iframe} title="Embed" class:loading={!$base} />
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

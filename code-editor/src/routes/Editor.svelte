<script>
	/**
	 * This is the highest-level component. It defines the layout of the iframe and the code editor.
	 * It handles all communication with the iframe. It listens for keyboard shortcuts to toggle the editor.
	 * It also places the Loading and Menubar components on top of the iframe.
	 */

	import { browser } from '$app/environment';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Menubar from '$lib/components/Menubar.svelte';
	import { STEPS } from '$lib/constants.js';
	import { blockHeights } from '$lib/stores/block-heights.js';
	import { codeEditorPosition, openComponentName } from '$lib/stores/code-editor.js';
	import { currentStep, iframeUrl } from '$lib/stores/status.js';
	import { onMount } from 'svelte';

	/** @type {HTMLIFrameElement} */
	let iframeElement;
	let showCodeEditor = false;
	let setSrcAfterMount = false;

	$: {
		console.log($iframeUrl, iframeElement);
		if ($iframeUrl) {
			if (iframeElement) iframeElement.src = $iframeUrl.url;
			else setSrcAfterMount = true;
		}
	}

	const toggleEditor = () => (showCodeEditor = !showCodeEditor);

	/**
	 * Pressing Cmd+E toggles the editor
	 * @param {KeyboardEvent} e
	 */
	function onKeyDown(e) {
		if (e.metaKey && e.key === 'e') {
			e.preventDefault();
			toggleEditor();
		}
	}

	/**
	 * Tell the iframe to focus on text when the editor is hidden
	 */
	$: if (!showCodeEditor) iframeElement?.contentWindow?.postMessage({ type: 'focusText' }, '*');

	/**
	 * This function handles all messages from the iframe
	 * @param {MessageEvent} event
	 */
	function onMessage(event) {
		switch (event.data.type) {
			case 'toggleEditor':
				toggleEditor();
				break;
			case 'editorMounted':
				currentStep.set(STEPS.EDITOR_READY);
				break;
			case 'blockHeights':
				blockHeights.set(event.data.blockHeights);
				break;
		}
	}

	onMount(() => {
		if (setSrcAfterMount && $iframeUrl) iframeElement.src = $iframeUrl.url;
	});
</script>

<svelte:window on:message={onMessage} on:keydown={onKeyDown} />

<div class="container layout-{$codeEditorPosition}" class:showing-editor={showCodeEditor}>
	<div class="code-container">
		{#if browser}
			<CodeEditor
				{showCodeEditor}
				on:select-graphic={(e) => {
					openComponentName.set(e.detail);
					iframeElement?.contentWindow?.postMessage({ type: 'scrollTo', name: e.detail }, '*');
				}}
			/>
		{/if}
	</div>

	<div class="iframe-container">
		<iframe bind:this={iframeElement} title="" />
		<Loading />
		<Menubar on:toggle-editor={toggleEditor} />
	</div>
</div>

<style>
	iframe {
		display: block;
		width: 100vw;
		height: 100vh;
		border: none;
		grid-area: 1 / 1;
		transition:
			width 0.2s,
			height 0.2s;
	}

	.container {
		display: grid;
		width: 100%;
		height: 100vh;
	}

	.code-container {
		min-width: 0;
		justify-self: center;
		align-self: center;
		z-index: 10;
		pointer-events: none;
		height: 100vh;
		display: flex;
		align-items: center;
	}

	.iframe-container {
		display: grid;
		position: relative;
	}

	/* Styles for layout-center */

	.layout-center > div {
		grid-area: 1 / 1;
	}

	.layout-center .code-container {
		max-width: min(calc(100% - 30px), 720px);
		width: 100%;
	}

	/* Styles for layout-bottom */

	.layout-bottom {
		grid-template-rows: min-content 1fr;
	}

	.layout-bottom .code-container {
		height: 50vh;
		width: 100%;
	}

	.layout-bottom .iframe-container {
		grid-row: 1;
		grid-column: 1;
	}

	.layout-bottom.showing-editor iframe {
		height: 50vh;
	}

	/* Styles for layout-left */

	.layout-left {
		grid-template-columns: 1fr min-content;
	}

	.layout-left .code-container {
		width: 100%;
	}

	.layout-left .iframe-container {
		grid-row: 1;
		grid-column: 2;
	}

	.layout-left.showing-editor iframe {
		width: 390px;
	}

	@media (min-width: 780px) {
		.layout-left.showing-editor iframe {
			width: 50vw;
		}
	}
</style>

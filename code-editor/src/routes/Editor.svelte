<script lang="ts">
	import { codeEditorPosition, openComponentName } from '$lib/stores/code-editor.js';
	import { base, progress } from '$lib/stores/status.ts';
	import { steps } from '$lib/constants.js';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import Loading from '$lib/components/Loading.svelte';

	let showCodeEditor = false;

	/**
	 * Handling the iframe
	 */
	let iframe: HTMLIFrameElement;
	$: if ($base && iframe) iframe.src = $base;

	/**
	 * Pressing Cmd+E toggles the editor
	 */
	function onKeyDown(e: KeyboardEvent) {
		if (e.metaKey && e.key === 'e') {
			e.preventDefault();
			showCodeEditor = !showCodeEditor;
			iframe.contentWindow?.postMessage({ type: 'focusText' }, '*');
		}
	}

	/**
	 * Handles all messages from the iframe
	 */
	function onMessage(event: MessageEvent) {
		console.log('child', event);
		switch (event.data.type) {
			case 'toggleEditor':
				showCodeEditor = !showCodeEditor;
				break;
			case 'focusGraphic':
				openComponentName.set(event.data.name);
				break;
			case 'editorMounted':
				progress.set(steps.EDITOR_READY);
				break;
		}
	}
</script>

<svelte:window on:message={onMessage} on:keydown={onKeyDown} />

<div class="container layout-{$codeEditorPosition}" class:showing-editor={showCodeEditor}>
	<div class="code-container">
		<CodeEditor
			on:changePosition={(p) => codeEditorPosition.set(p.detail)}
			on:save
			{showCodeEditor}
		/>
	</div>

	<div class="iframe-container">
		<iframe bind:this={iframe} title="Content" />
		<Loading />
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
		height: 100%;
		justify-self: center;
		align-self: center;
		z-index: 10;
		pointer-events: none;
	}

	.iframe-container {
		display: grid;
	}

	/* Styles for layout-center */

	.layout-center > div {
		grid-area: 1 / 1;
	}

	.layout-center .code-container {
		max-width: max(80%, 720px);
	}

	/* Styles for layout-bottom */

	.layout-bottom {
		grid-template-rows: min-content 1fr;
	}

	.layout-bottom .code-container {
		min-height: 0;
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

<script lang="ts">
	import { codeEditorPosition, openComponentName } from '$lib/stores/code-editor.js';
	import { base, progress } from '$lib/stores/status.ts';
	import { steps } from '$lib/constants.js';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Helper from '$lib/components/Helper.svelte';

	let showCodeEditor = false;

	/**
	 * Handling the iframe
	 */
	let iframe: HTMLIFrameElement;
	$: if ($base) {
		console.log($base, iframe);
		// removing the iframe from the document allows us to
		// change the src without adding a history entry, which
		// would make back/forward traversal very annoying
		const parentNode = /** @type {HTMLElement} */ (iframe.parentNode);
		parentNode?.removeChild(iframe);
		iframe.src = $base;
		parentNode?.appendChild(iframe);
	}

	/**
	 * Pressing Cmd+E toggles the editor
	 */
	function onKeyDown(e: KeyboardEvent) {
		if (e.metaKey && e.key === 'e') {
			e.preventDefault();
			toggleEditor();
		}
	}

	function toggleEditor() {
		showCodeEditor = !showCodeEditor;
	}

	$: if (!showCodeEditor) iframe?.contentWindow?.postMessage({ type: 'focusText' }, '*');

	/**
	 * Handles all messages from the iframe
	 */
	function onMessage(event: MessageEvent) {
		// console.log('child', event);
		switch (event.data.type) {
			case 'toggleEditor':
				toggleEditor();
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
		<CodeEditor {showCodeEditor} />
	</div>

	<div class="iframe-container">
		<iframe bind:this={iframe} title="" />
		<Loading />
	</div>

	<Helper on:toggle={toggleEditor} />
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

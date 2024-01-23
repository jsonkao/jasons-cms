<script lang="ts">
	import { saveFile } from '$lib/webcontainer/index';
	import { base } from '$lib/stores';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import LoadingMask from '$lib/components/LoadingMask.svelte';

	export let blocks: Block[];

	let currentGraphic = (blocks.find((d) => d.type === 'graphic') as GraphicBlock)?.name;

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
		console.log('Message from child: ', event.data);

		if (event.data.type === 'toggleEditor') showCodeEditor = !showCodeEditor;
		if (event.data.type === 'saveFile') handleSave();
		if (event.data.type === 'focusGraphic') currentGraphic = event.data.name;
	}

	function handleSave() {
		saveFile(currentGraphic);
	}

	let editorPosition = 'center';
</script>

<svelte:window on:message={onMessage} on:keydown={onKeyDown} />

<div class="container editor-{editorPosition}" class:showing-editor={showCodeEditor}>
	<div class="code-editor">
		<CodeEditor
			on:changePosition={(p) => (editorPosition = p.detail)}
			on:save={handleSave}
			{showCodeEditor}
			{currentGraphic}
		/>
	</div>

	<div class="iframe-container">
		<iframe bind:this={iframe} title="Content" />
		<LoadingMask />
	</div>
</div>

<style>
	.container {
		display: grid;
		width: 100%;
		height: 100vh;
	}

	iframe {
		display: block;
		width: 100%;
		height: 100%;
		resize: none;
		box-sizing: border-box;
		border: none;
		grid-area: 1 / 1;
	}

	.iframe-container {
		display: grid;
	}

	.editor-center > :global(*) {
		grid-row: 1;
		grid-column: 1;
	}

	.code-editor {
		min-width: 0;
		width: 100%;
		justify-self: center;
		align-self: center;
	}

	.editor-center .code-editor {
		max-width: 600px;
	}

	.editor-bottom .code-editor {
		height: 100%;
		max-height: auto;
	}

	.editor-left {
		grid-template-columns: 1fr 390px;
	}

	.editor-left:not(.showing-editor) {
		grid-template-columns: 0fr 1fr;
	}

	.editor-bottom {
		grid-template-rows: 50% 50%;
	}

	.editor-bottom:not(.showing-editor) {
		grid-template-rows: 1fr 0;
	}

	.editor-left .iframe-container {
		grid-row: 1;
		grid-column: 2;
	}

	.editor-bottom .iframe-container {
		grid-row: 1;
		grid-column: 1;
	}
</style>

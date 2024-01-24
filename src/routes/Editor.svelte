<script lang="ts">
	import { base, codeEditorPosition, progress } from '$lib/stores';
	import { writeFile } from '$lib/webcontainer';

	import CodeMirror from '$lib/components/CodeMirror.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { steps } from '$lib/constants';

	export let blocks: Block[];

	/**
	 * The graphic in focus (and whose code is in the CodeEditor)
	 */
	let currentGraphic = (blocks.find((d) => d.type === 'graphic') as GraphicBlock)?.name;

	let showCodeEditor = false;

	/**
	 * Handling the iframe
	 */
	let iframe: HTMLIFrameElement;
	$: if ($base && iframe) iframe.src = $base;

	/**
	 * Pressing Cmd+# toggles the editor
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
		// console.log('Message from child: ', event.data);
		switch (event.data.type) {
			case 'toggleEditor':
				showCodeEditor = !showCodeEditor;
				break;
			case 'saveFile':
				handleSave();
				break;
			case 'focusGraphic':
				currentGraphic = event.data.name;
				break;
			case 'editorMounted':
				progress.set(steps.EDITOR_READY);
				break;
		}
	}

	/**
	 * Handles saving the file. Eventually, will probably communicate with a database.
	 */
	function handleSave() {
		writeFile(currentGraphic);
	}
</script>

<svelte:window on:message={onMessage} on:keydown={onKeyDown} />

<div class="container layout-{$codeEditorPosition}" class:showing-editor={showCodeEditor}>
	<div class="code-editor-container">
		<CodeMirror
			on:changePosition={(p) => codeEditorPosition.set(p.detail)}
			on:save={handleSave}
			{showCodeEditor}
			{currentGraphic}
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
		width: 100%;
		height: 100%;
		border: none;
		grid-area: 1 / 1;
	}

	.container {
		display: grid;
		width: 100%;
		height: 100vh;
	}

	.container > div > :global([slot]) {
		display: contents;
	}

	.code-editor-container {
		min-width: 0;
		width: 100%;
		justify-self: center;
		align-self: center;
	}

	.iframe-container {
		display: grid;
	}

	.layout-center > :global(*) {
		grid-row: 1;
		grid-column: 1;
	}

	.layout-center .code-editor-container {
		max-width: 720px;
	}

	.layout-bottom .code-editor-container {
		height: 100%;
		max-height: auto;
	}

	.layout-left {
		grid-template-columns: 0fr 1fr;
	}
	.layout-left.showing-editor {
		grid-template-columns: 1fr 390px;
	}

	.layout-bottom {
		grid-template-rows: 1fr 0;
	}
	.layout-bottom.showing-editor {
		grid-template-rows: 50% 50%;
	}

	.layout-left .iframe-container {
		grid-row: 1;
		grid-column: 2;
	}

	.layout-bottom .iframe-container {
		grid-row: 1;
		grid-column: 1;
	}
</style>

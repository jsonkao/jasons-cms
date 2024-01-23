<script lang="ts">
	import { base, codeEditorPosition } from '$lib/stores';
	import { saveFile } from '$lib/webcontainer';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import LoadingMask from '$lib/components/LoadingMask.svelte';

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
		}
	}

	/**
	 * Handles saving the file. Eventually, will probably communicate with a database.
	 */
	function handleSave() {
		saveFile(currentGraphic);
	}
</script>

<svelte:window on:message={onMessage} on:keydown={onKeyDown} />

<div class="container editor-{$codeEditorPosition}" class:showing-editor={showCodeEditor}>
	<div class="code-editor">
		<CodeEditor
			on:changePosition={(p) => codeEditorPosition.set(p.detail)}
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
		grid-template-columns: 0fr 1fr;
	}
	.editor-left.showing-editor {
		grid-template-columns: 1fr 390px;
	}

	.editor-bottom {
		grid-template-rows: 1fr 0;
	}
	.editor-bottom.showing-editor {
		grid-template-rows: 50% 50%;
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

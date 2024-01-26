<script lang="ts">
	import { base, codeEditorPosition, openComponent, progress } from '$lib/stores';
	import { writeFile } from '$lib/webcontainer';

	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { steps } from '$lib/constants';

	export let blocks: Block[];

	/**
	 * The graphic in focus (and whose code is in the CodeEditor)
	 */
	openComponent.set((blocks.find((d) => d.type === 'graphic') as GraphicBlock)?.name);

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
				openComponent.set(event.data.name);
				break;
			case 'editorMounted':
				progress.set(steps.EDITOR_READY);
				break;
		}
	}

	/**
	 * Handles saving the file. Eventually, will probably communicate with a database.
	 * TODO: Incorporate $openGlobalFile
	 */
	function handleSave(event: CustomEvent) {
		writeFile($openComponent, event.detail);
	}
</script>

<svelte:window on:message={onMessage} on:keydown={onKeyDown} />

<div class="container layout-{$codeEditorPosition}" class:showing-editor={showCodeEditor}>
	<div class="code-container">
		<CodeEditor
			on:changePosition={(p) => codeEditorPosition.set(p.detail)}
			on:save={handleSave}
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
		width: 100%;
		height: 100%;
		justify-self: center;
		align-self: center;
		z-index: 10;
	}

	.iframe-container {
		display: grid;
	}

	/* Styles for layout-center */

	.layout-center > div {
		grid-area: 1 / 1;
	}

	.layout-center .code-container {
		max-width: 720px;
	}

	/* Styles for layout-bottom */

	.layout-bottom {
		grid-template-rows: min-content 1fr;
	}

	.layout-bottom .code-container {
		min-height: 0;
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

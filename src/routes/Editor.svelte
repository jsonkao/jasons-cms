<script lang="ts">
	import { base, codeEditorPosition } from '$lib/stores';
	import { saveFile } from '$lib/webcontainer';

	import Panes from '$lib/components/Panes.svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import Loading from '$lib/components/Loading.svelte';

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

<Panes {showCodeEditor}>
	<div slot="code-editor-container">
		<CodeEditor
			on:changePosition={(p) => codeEditorPosition.set(p.detail)}
			on:save={handleSave}
			{showCodeEditor}
			{currentGraphic}
		/>
	</div>

	<div slot="iframe-container">
		<iframe bind:this={iframe} title="Content" />
		<Loading />
	</div>
</Panes>

<style>
	iframe {
		display: block;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		border: none;
		grid-area: 1 / 1;
	}
</style>

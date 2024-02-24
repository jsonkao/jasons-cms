<script>
	// @ts-expect-error - y-codemirror.next is not typed
	import { yCollab } from 'y-codemirror.next';
	import { trackOtherCoders } from '$lib/awareness';
	import { user } from '$lib/constants.js';
	import {
		codeEditorPosition,
		openComponentName,
		openGlobalFile
	} from '$lib/stores/code-editor.js';
	import { createWebContainerManager } from '$lib/webcontainer/manager.js';
	import { setupProvider } from '$shared/provider';
	import { SharedDoc } from '$shared/shared-doc.js';
	import { onDestroy } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import CodingOverlay from './CodingOverlay.svelte';
	import codemirrorProps from './codemirror-props.js';

	/** @type {string} */
	export let slug;
	export let showCodeEditor = false;

	/** @type {HTMLElement} */
	let codeEditorElement;

	/** @type {import('yjs').Text | undefined} */
	let ytext;

	/* Setup shared doc */
	const doc = new SharedDoc(setupProvider(user, slug));
	const { yarrayStore, yPageFilesStore, awareness } = doc;
	trackOtherCoders(awareness);
	onDestroy(doc.destroy);

	/* Setup webcontainer and its manager */
	const { syncFileSystem, saveFile } = createWebContainerManager();
	$: ytext = doc.findYText($openComponentName, $openGlobalFile);
	$: syncFileSystem($yarrayStore, $yPageFilesStore);

	/* Focus the editor when it's shown; and keep other clients updated */
	$: {
		if (showCodeEditor) {
			/** @type {HTMLElement} */
			(codeEditorElement?.querySelector('[contenteditable=true]'))?.focus();
		}
		awareness.setLocalStateField('user', { ...user, coding: showCodeEditor });
	}

	/** @param {CustomEvent} e */
	const deleteComponent = (e) => doc.deleteComponent(e.detail);

	/**
	 * Save the component when the user presses cmd+s
	 * @param {KeyboardEvent} e
	 */
	function onKeyDown(e) {
		if (e.metaKey && e.key === 's' && ytext) {
			e.preventDefault();
			saveFile($openComponentName, $openGlobalFile, ytext.toString());
		}
	}
</script>

<div
	bind:this={codeEditorElement}
	class="code-editor position-{$codeEditorPosition}"
	class:show-editor={showCodeEditor}
	on:keydown={onKeyDown}
	role="none"
>
	<div class="code-mirror-container">
		{#if ytext}
			<CodeMirror
				value={ytext.toString()}
				extensions={[yCollab(ytext, awareness)]}
				{...codemirrorProps}
			/>
		{/if}
	</div>

	<CodingOverlay
		{showCodeEditor}
		on:delete-graphic={deleteComponent}
		componentIsPresent={!!ytext}
		blocks={$yarrayStore}
	/>
</div>

<style>
	.code-editor {
		position: relative;
		height: 100%;
		width: 100%;
		margin: 0 auto;
		pointer-events: none;
		display: grid;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.1s;
	}

	:global(.codemirror-wrapper) {
		height: 100%;
	}

	:global(.cm-ySelectionCaret .cm-ySelectionInfo) {
		-webkit-font-smoothing: antialiased;
		font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
	}

	.code-mirror-container {
		grid-area: 1 / 1;
	}

	.code-mirror-container {
		display: grid;
		height: 100%;
		overflow-y: scroll;
		align-self: center;
		border-radius: 6px;
		position: relative;
		font-size: 14px;
	}

	.code-mirror-container > :global(*) {
		grid-area: 1 / 1;
	}

	.code-editor.show-editor {
		opacity: 1;
		pointer-events: all;
	}

	.code-editor.position-center {
		max-height: min(80%, calc(100vh - 30px));
	}

	.code-editor:not(.position-center) .code-mirror-container,
	.code-editor:not(.position-center) :global(.cm-editor) {
		border-radius: 0;
	}
</style>

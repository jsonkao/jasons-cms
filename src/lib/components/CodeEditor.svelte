<script>
	import { browser } from '$app/environment';
	import { trackOtherCoders } from '$lib/awareness';
	import { userColor, userName } from '$lib/constants.js';
	import {
		codeEditorPosition,
		openComponentName,
		openGlobalFile
	} from '$lib/stores/code-editor.js';
	import {
		initializeWebContainerPageFiles,
		saveComponentOrGlobalFile,
		syncWebContainerFileSystem
	} from '$lib/webcontainer/index.js';
	import { setupProvider } from '$shared/provider';
	import { SharedDoc } from '$shared/shared-doc.js';
	import { onDestroy } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import codemirrorProps from './codemirror-props.js';
	// @ts-ignore
	import { yCollab } from 'y-codemirror.next';
	import CodingOverlay from './CodingOverlay.svelte';

	/** @type {string} */
	export let slug;

	if (!browser) throw new Error('This component should only be used in the browser.');

	export let showCodeEditor = false;
	const user = { color: userColor, name: userName };

	/** @type {HTMLElement} */
	let codeEditorElement;

	/**
	 * Create Y.Text
	 */

	/** @type {import('@codemirror/state').Extension | undefined} */
	let yExtension;
	/** @type {import('yjs').Text | undefined} */
	let ytext;

	const doc = new SharedDoc(setupProvider(user, slug));
	const { yarrayStore, yPageFilesStore } = doc;
	trackOtherCoders(doc.awareness);

	onDestroy(() => doc.destroy());

	$: syncWebContainerFileSystem($yarrayStore);
	$: initializeWebContainerPageFiles($yPageFilesStore);
	$: setComponentInEditor($openComponentName, $openGlobalFile);
	$: updateCodingPresence(showCodeEditor);

	/**
	 * Set the ytext and ycollab extension for the open component or global file
	 * @param {string | null} componentName
	 * @param {string | null} globalFile
	 */
	function setComponentInEditor(componentName, globalFile) {
		if (componentName === null && globalFile === null) {
			ytext = yExtension = undefined;
			return;
		}

		const foundYtext = doc.findYText(componentName, globalFile);
		if (foundYtext !== undefined) {
			ytext = foundYtext;
			yExtension = yCollab(ytext, doc.awareness);
		}
	}

	/**
	 * Focuses the code editor when it's shown; and update doc awareness
	 * @param {boolean} showCodeEditor
	 */
	function updateCodingPresence(showCodeEditor) {
		if (showCodeEditor) {
			/** @type {HTMLElement} */
			(codeEditorElement?.querySelector('[contenteditable=true]'))?.focus();
		}
		doc.awareness.setLocalStateField('user', { ...user, coding: showCodeEditor });
	}

	/**
	 * Delete a component from the yarray
	 * @param {CustomEvent} e
	 */
	function deleteComponent(e) {
		doc.deleteComponent(e.detail);
	}

	/**
	 * Save the component when the user presses cmd+s
	 * @param {KeyboardEvent} e
	 */
	function onKeyDown(e) {
		if (e.metaKey && e.key === 's' && ytext) {
			e.preventDefault();
			saveComponentOrGlobalFile($openGlobalFile || $openComponentName, ytext.toString());
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
		{#if ytext && yExtension}
			<CodeMirror value={ytext.toString()} extensions={[yExtension]} {...codemirrorProps} />
		{/if}
	</div>

	<CodingOverlay
		{showCodeEditor}
		on:delete-graphic={deleteComponent}
		componentIsPresent={!!(ytext && yExtension)}
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

<script>
	import { svelte } from '@replit/codemirror-lang-svelte';
	import { yFindGraphicIndex } from 'shared';
	import CodeMirror from 'svelte-codemirror-editor';
	import { coolGlow } from 'thememirror';

	// @ts-ignore
	import { yCollab } from 'y-codemirror.next';
	import * as Y from 'yjs';

	import { browser } from '$app/environment';
	import { codeEditorPosition, openComponentName } from '$lib/stores/code-editor.js';
	import { syncWebContainerFileSystem, saveComponent } from '$lib/webcontainer/instance.js';
	import { onDestroy } from 'svelte';
	import PlacementButtons from './PlacementButtons.svelte';
	import Minimap from './Minimap.svelte';
	import { createYDoc } from '$lib/ydoc';

	if (!browser) throw new Error('This component should only be used in the browser.');

	export let showCodeEditor = false;

	/** @type {HTMLElement} */
	let codeEditorElement;

	/**
	 * Create Y.Text
	 */

	/** @type {import('@codemirror/state').Extension} */
	let yExtension;
	/** @type {Y.Text} */
	let ytext;

	let { ydoc, leave, yarrayStore, awareness, updateCodingPresence } = createYDoc();
	onDestroy(() => leave());

	$: syncWebContainerFileSystem($yarrayStore);
	$: setComponentInEditor($openComponentName);
	$: updateCodingPresence(showCodeEditor);
	$: focusCodeEditing(showCodeEditor);

	/**
	 * Set the ytext and ycollab extension for the open component
	 * @param {string | null} name
	 */
	function setComponentInEditor(name) {
		if (name === null) return;

		/** @type {Y.Text | undefined} Find the Y.Text for the requested component name */
		let foundYtext;
		for (const ymap of $yarrayStore) {
			if (ymap.get('name') === name) foundYtext = /** @type {Y.Text} */ (ymap.get('code'));
		}

		if (foundYtext !== undefined) {
			ytext = foundYtext;
			yExtension = yCollab(ytext, awareness);
		}
	}

	/**
	 * Delete a component from the yarray
	 * @param {CustomEvent} e
	 */
	function deleteComponent(e) {
		// First, find the index for the requested component name
		const componentIndex = yFindGraphicIndex($yarrayStore, e.detail);
		if (componentIndex === -1)
			throw new Error(`Could not find index of component to delete, ${e.detail}`);

		// This should all work because we enforce having blank text before and after all components
		const textBlockBefore = /** @type {BlockMap} */ (yarrayStore.y.get(componentIndex - 1));
		const textBlockAfter = /** @type {BlockMap} */ (yarrayStore.y.get(componentIndex + 1));
		if (textBlockBefore.get('type') !== 'text' || textBlockAfter.get('type') !== 'text')
			throw new Error('Expected text before and after component');

		// Clone textBlockBefore to create a new Y.XmlFragment
		const textBefore = /** @type {Y.XmlFragment} */ (textBlockBefore.get('text'));
		const textAfter = /** @type {Y.XmlFragment} */ (textBlockAfter.get('text'));

		const newXmlFragment = new Y.XmlFragment();
		for (let i = 0; i < textBefore.length; i++) newXmlFragment.push([textBefore.get(i).clone()]);
		for (let i = 0; i < textAfter.length; i++) newXmlFragment.push([textAfter.get(i).clone()]);

		const newMap = new Y.Map();
		newMap.set('type', 'text');
		newMap.set('text', newXmlFragment);

		// Then, delete the component from the array
		ydoc.transact(() => {
			yarrayStore.y.insert(componentIndex - 1, [newMap]);
			yarrayStore.y.delete(componentIndex, 3);
		});
	}

	/**
	 * Focus the code editor when it is shown
	 * @param {boolean} showCodeEditor
	 */
	function focusCodeEditing(showCodeEditor) {
		if (showCodeEditor) {
			/** @type {HTMLElement} */
			(codeEditorElement?.querySelector('[contenteditable=true]'))?.focus();
		}
	}

	/**
	 * Save the component when the user presses cmd+s
	 * @param {KeyboardEvent} e
	 */
	function onKeyDown(e) {
		if (e.metaKey && e.key === 's') {
			e.preventDefault();
			saveComponent($openComponentName, ytext.toString());
		}
	}
</script>

<div
	class="code-editor position-{$codeEditorPosition}"
	bind:this={codeEditorElement}
	class:show-editor={$codeEditorPosition !== 'center' || showCodeEditor}
	role="none"
	on:keydown={onKeyDown}
>
	<div class="code-mirror-container">
		{#if ytext && yExtension}
			<CodeMirror
				value={ytext.toString()}
				lang={svelte()}
				nodebounce
				theme={coolGlow}
				extensions={[yExtension]}
				tabSize={4}
				styles={{
					'&': {
						padding: '12px 12px 12px',
						borderRadius: '6px',
						height: '100%'
					}
				}}
			/>
			<PlacementButtons />
			<Minimap on:select-graphic on:delete-graphic={deleteComponent} />
		{/if}
	</div>
</div>

<style>
	.code-editor {
		position: relative;
		height: 100%;
		margin: 0 auto;
		pointer-events: none;
		display: grid;
	}

	:global(.codemirror-wrapper) {
		height: 100%;
	}

	:global(.cm-ySelectionCaret .cm-ySelectionInfo) {
		-webkit-font-smoothing: antialiased;
		font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
	}

	.code-mirror-container {
		display: grid;
		height: 100%;
		overflow-y: scroll;
		align-self: center;
		transition: opacity 0.1s;
		border-radius: 6px;
		opacity: 0;
		pointer-events: none;
		position: relative;
	}

	.code-mirror-container > :global(*) {
		grid-area: 1 / 1;
	}

	.code-editor.show-editor .code-mirror-container {
		opacity: 1;
		pointer-events: all;
	}

	.code-editor.position-center .code-mirror-container {
		max-height: min(80%, calc(100vh - 30px));
	}

	.code-editor:not(.position-center) .code-mirror-container,
	.code-editor:not(.position-center) :global(.cm-editor) {
		border-radius: 0;
	}
</style>

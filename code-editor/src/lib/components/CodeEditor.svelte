<script>
	import { svelte } from '@replit/codemirror-lang-svelte';
	import { javascript } from '@codemirror/lang-javascript';
	import { SharedDoc } from '$lib/shared/shared-doc.js';
	import CodeMirror from 'svelte-codemirror-editor';
	import { coolGlow } from 'thememirror';

	// @ts-ignore
	import { yCollab } from 'y-codemirror.next';

	import { browser } from '$app/environment';
	import { userColor, userName } from '$lib/constants.js';
	import {
		codeEditorPosition,
		openComponentName,
		openGlobalFile,
		otherCoders
	} from '$lib/stores/code-editor.js';
	import {
		saveComponentOrGlobalFile,
		syncWebContainerFileSystem,
		initializeWebContainerPageFiles
	} from '$lib/webcontainer/instance.js';
	import { onDestroy } from 'svelte';
	import Minimap from './Minimap.svelte';
	import PlacementButtons from './PlacementButtons.svelte';
	import Tabs from './Tabs.svelte';

	/** @type {string} */
	export let slug;

	if (!browser) throw new Error('This component should only be used in the browser.');

	export let showCodeEditor = false;
	const user = { color: userColor, name: userName };

	/** @type {HTMLElement} */
	let codeEditorElement;

	let language = svelte();

	/**
	 * Create Y.Text
	 */

	/** @type {import('@codemirror/state').Extension} */
	let yExtension;
	/** @type {import('yjs').Text} */
	let ytext;

	const doc = new SharedDoc(user, slug);
	const { yarrayStore, yPageFilesStore } = doc;
	doc.awareness.on('change', () =>
		otherCoders.set(
			[...doc.awareness.getStates().values()]
				.map((state) => state.user)
				.filter((user) => user && user.coding)
		)
	);

	onDestroy(() => doc.destroy());

	$: syncWebContainerFileSystem($yarrayStore);
	$: initializeWebContainerPageFiles($yPageFilesStore);
	$: setComponentInEditor($openComponentName, $openGlobalFile);
	$: updateCodingPresence(showCodeEditor);
	$: focusCodeEditing(showCodeEditor);

	/**
	 * Set the ytext and ycollab extension for the open component or global file
	 * @param {string | null} componentName
	 * @param {string | null} globalFile
	 */
	function setComponentInEditor(componentName, globalFile) {
		if (componentName === null && globalFile === null) return;

		/** @type {import('yjs').Text | undefined} Find the Y.Text for the requested component name */
		let foundYtext;

		if (globalFile) {
			foundYtext = yPageFilesStore.y.get(globalFile);
		} else if (componentName) {
			for (const ymap of $yarrayStore) {
				if (ymap.get('name') === componentName)
					foundYtext = /** @type {import('yjs').Text} */ (ymap.get('code'));
			}
		}

		if (foundYtext !== undefined) {
			ytext = foundYtext;
			yExtension = yCollab(ytext, doc.awareness);
			language = globalFile ? javascript() : svelte();
		}
	}

	/**
	 * @param {boolean} showCodeEditor
	 */
	function updateCodingPresence(showCodeEditor) {
		if (showCodeEditor) {
			doc.awareness.setLocalStateField('user', { ...user, coding: showCodeEditor });
		}
	}

	/**
	 * Delete a component from the yarray
	 * @param {CustomEvent} e
	 */
	function deleteComponent(e) {
		doc.deleteComponent(e.detail);
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
			saveComponentOrGlobalFile($openGlobalFile || $openComponentName, ytext.toString());
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
		<Tabs />
		{#if ytext && yExtension}
			<CodeMirror
				value={ytext.toString()}
				lang={language}
				nodebounce
				theme={coolGlow}
				extensions={[yExtension]}
				tabSize={4}
				styles={{
					'&': {
						padding: '36px 12px 12px',
						borderRadius: '6px',
						height: '100%'
					}
				}}
			/>
		{/if}
	</div>
	<div class="overlay">
		<PlacementButtons />
		<Minimap on:select-graphic on:delete-graphic={deleteComponent} blocks={$yarrayStore} />
	</div>
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

	.code-mirror-container,
	.overlay {
		grid-area: 1 / 1;
	}

	.code-mirror-container {
		display: grid;
		height: 100%;
		overflow-y: scroll;
		align-self: center;
		border-radius: 6px;
		position: relative;
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

	.overlay {
		pointer-events: none;
	}

	.overlay > :global(*) {
		pointer-events: all;
	}
</style>

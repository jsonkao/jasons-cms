<script lang="ts">
	import type { Extension } from '@codemirror/state';
	import { svelte } from '@replit/codemirror-lang-svelte';
	import { readableArray, type YReadableArray, yFindGraphicIndex } from 'shared';
	import CodeMirror from 'svelte-codemirror-editor';
	import { coolGlow } from 'thememirror';

	// @ts-ignore
	import { yCollab } from 'y-codemirror.next';
	import { createClient } from '@liveblocks/client';
	import LiveblocksProvider from '@liveblocks/yjs';
	import * as Y from 'yjs';

	import { browser } from '$app/environment';
	import { LIVEBLOCKS_ROOM, userColor, userName } from '$lib/constants.js';
	import { listenToNumberOfCoders } from '$lib/yjs.js';
	import { codeEditorPosition, openComponentName } from '$lib/stores/code-editor.js';
	import { syncWebContainerFileSystem, saveComponent } from '$lib/webcontainer/instance.js';
	import { onDestroy } from 'svelte';
	import PlacementButtons from './PlacementButtons.svelte';
	import Minimap from './Minimap.svelte';

	const client = createClient({
		publicApiKey: 'pk_dev_1iisK8HmLpmVOreEDPQqeruOVvHWUPlchIagQpCKP-VIRyGkCF4DDymphQiiVJ6A'
	});

	/**
	 * Create Y.Text
	 */

	let ydoc: Y.Doc;
	let ytext: Y.Text;
	let yarrayStore: YReadableArray<BlockMap>;
	let yExtension: Extension;
	let yProvider: LiveblocksProvider<any, any, any, any>;

	let destroy = () => {};

	if (browser) {
		const { room, leave } = client.enterRoom(LIVEBLOCKS_ROOM, {
			initialPresence: {}
		});
		destroy = leave;

		ydoc = new Y.Doc();
		yProvider = new LiveblocksProvider(room, ydoc);
		yProvider.awareness.setLocalStateField('user', { color: userColor, name: userName });
		yarrayStore = readableArray(ydoc.getArray('blocks-test'));

		// TODO: Create a different ydoc under a normal WebRTC connection for the files we dont want
		// persistence for? (e.g. Blocks.svelte, but not +page.server.js)
		// TODO: Create a ydoc top-level map for non-block files we do want persistance for (e.g. +page.server.js)

		listenToNumberOfCoders(yProvider.awareness);
	}

	onDestroy(() => destroy());

	$: if ($yarrayStore && $openComponentName) setExtension($openComponentName);

	$: syncWebContainerFileSystem($yarrayStore);

	function setExtension(name: string) {
		// First, find the Y.Text for the requested component name
		let foundYtext: Y.Text | undefined;
		for (const ymap of $yarrayStore) {
			if (ymap.get('name') === name) foundYtext = ymap.get('code') as Y.Text;
		}
		if (foundYtext !== undefined) {
			ytext = foundYtext;
			yExtension = yCollab(ytext, yProvider.awareness);
		}
	}

	function deleteComponent(e: CustomEvent) {
		// First, find the index for the requested component name
		const componentIndex = yFindGraphicIndex($yarrayStore, e.detail);
		if (componentIndex === -1) throw new Error(`Could not find index of component to delete, ${e.detail}`);

		// This should all work because we enforce having blank text before and after all components
		const textBlockBefore = yarrayStore.y.get(componentIndex - 1) as BlockMap;
		const textBlockAfter = yarrayStore.y.get(componentIndex + 1) as BlockMap;
		if (textBlockBefore.get('type') !== 'text' || textBlockAfter.get('type') !== 'text')
			throw new Error('Expected text before and after component');

		// Clone textBlockBefore to create a new Y.
		const textBefore = textBlockBefore.get('text') as Y.XmlFragment;
		const textAfter = textBlockAfter.get('text') as Y.XmlFragment;
		const newXmlFragment = new Y.XmlFragment();
		for (let i = 0; i < textBefore.length; i++) {
			newXmlFragment.push([textBefore.get(i)]);
			console.log('pushed before', i)
		}
		for (let i = 0; i < textAfter.length; i++) {
			newXmlFragment.push([textAfter.get(i)]);
			console.log('pushed after', i)
		}

		const newMap = new Y.Map();
		newMap.set('type', 'text');
		newMap.set('text', newXmlFragment);

		// Nothing is working here.
		console.log(newMap);

		return;

		// Then, delete the component from the array
		ydoc.transact(() => {
			yarrayStore.y.delete(componentIndex - 1, 3);
			yarrayStore.y.insert(newMap);
		});
	}

	/**
	 * Set up elements and dispatchers
	 */

	export let showCodeEditor: boolean;

	let containerElement: HTMLElement;

	// If the editor gets shown, focus the contenteditable element
	// TODO: This is null for some reason
	$: if (showCodeEditor && containerElement)
		(containerElement.querySelector('[contenteditable=true]') as HTMLElement)?.focus();

	function onKeyDown(e: KeyboardEvent) {
		if (e.metaKey && e.key === 's') {
			e.preventDefault();
			saveComponent($openComponentName, ytext.toString());
		}
	}

	$: yProvider &&
		yProvider.awareness.setLocalStateField('user', {
			color: userColor,
			name: userName,
			coding: showCodeEditor
		});
</script>

<div
	class="code-editor position-{$codeEditorPosition}"
	bind:this={containerElement}
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

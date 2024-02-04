<script lang="ts">
	import type { Extension } from '@codemirror/state';
	import { svelte } from '@replit/codemirror-lang-svelte';
	import { readableArray, type YReadableArray } from 'shared';
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
	import { hydrateWebContainerFileSystem, saveComponent } from '$lib/webcontainer/instance.js';
	import { onDestroy } from 'svelte';
	import PlacementButtons from './PlacementButtons.svelte';
	import Minimap from './Minimap.svelte';

	const client = createClient({
		publicApiKey: 'pk_dev_1iisK8HmLpmVOreEDPQqeruOVvHWUPlchIagQpCKP-VIRyGkCF4DDymphQiiVJ6A'
	});

	/**
	 * Create Y.Text
	 */

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

		const ydoc = new Y.Doc();
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

	$: hydrateWebContainerFileSystem($yarrayStore);

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
			<Minimap on:select-graphic />
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
		max-height: calc(100vh - 30px);
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

	.code-editor:not(.position-center) .code-mirror-container {
		height: 100%;
	}

	.code-editor.position-bottom .code-mirror-container {
		border-radius: 0;
	}

	.code-editor.position-left {
		max-width: calc(100% - 30px);
	}
</style>

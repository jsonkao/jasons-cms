<script lang="ts">
	import rawBlocks from '$lib/generated/data.json';
	import { userColor, userName } from '$lib/generated/globals.js';

	import { browser } from '$app/environment';
	import { createObserver } from '$lib/utils.js';
	import { onMount } from 'svelte';
	import Component from './Component.svelte';
	import ProsemirrorEditor from './ProsemirrorEditor.svelte';

	import { createBlocksWithState } from '$lib/prosemirror/index.js';
	import { createClient } from '@liveblocks/client';
	import LiveblocksProvider from '@liveblocks/yjs';
	import * as Y from 'yjs';

	const client = createClient({
		publicApiKey: 'pk_dev_1iisK8HmLpmVOreEDPQqeruOVvHWUPlchIagQpCKP-VIRyGkCF4DDymphQiiVJ6A'
	});

	let lastTextFocused = 0;

	/**
	 * Listen for messages from the parent window
	 */
	function onMessage(event: MessageEvent) {
		if (event.data.type === 'focusText') {
			const lastBlock = blocksWithState[lastTextFocused];
			if (lastBlock.type === 'text') {
				const editor = lastBlock.editor;
				editor?.focus();
			}
		}
	}

	let blocksWithState: BlockWithState[] = [];
	let destroy = () => {};

	if (browser) {
		const { room, leave } = client.enterRoom('my-room', {
			initialPresence: {}
		});
		destroy = leave;

		const ydoc = new Y.Doc();
		const yProvider = new LiveblocksProvider(room, ydoc);
		yProvider.awareness.setLocalStateField('user', { color: userColor, name: userName });

		blocksWithState = createBlocksWithState({
			rawBlocks: rawBlocks as Block[],
			ydoc,
			provider: yProvider
		});
	}

	let contentEl: HTMLElement;
	onMount(() => {
		window.parent?.postMessage({ type: 'editorMounted' }, '*');
		const observer = createObserver(contentEl.querySelectorAll('[data-name]'));

		return () => {
			observer && observer.disconnect();
			destroy();
		};
	});
</script>

<svelte:window on:message={onMessage} />

<div class="content" bind:this={contentEl}>
	{#each blocksWithState as b, i}
		{#if b.type === 'text'}
			<ProsemirrorEditor
				bind:this={b.editor}
				editorState={b.state}
				on:blur={() => (lastTextFocused = i)}
			/>
		{:else if b.type === 'graphic'}
			<Component block={b} />
		{/if}
	{/each}
</div>

<style>
	:global(.ui-editor:not(.editor_empty):first-child, .ui-editor.ProseMirror-focused:first-child) {
		margin-top: 60px;
	}

	:global(.ui-editor:not(.editor_empty):last-child, .ui-editor.ProseMirror-focused:last-child) {
		padding-bottom: 60px;
	}

	:global(.ui-editor) {
		outline: none;
		margin: 0 auto;
	}

	:global(.ui-editor p, .ui-editor h1) {
		margin: 1.5rem auto;
		width: calc(100% - 30px);
	}

	:global(.ui-editor p) {
		max-width: 520px;
	}

	:global(.ui-editor h1) {
		font-size: 3.2rem;
		max-width: 710px;
		text-align: center;
		line-height: 1.1;
		letter-spacing: -0.04em;
	}

	:global(.ui-editor),
	:global(.ui-editor p) {
		-webkit-font-smoothing: antialiased;
		font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
		font-size: 1.1rem;
		line-height: 1.5;
		color: #121212;
	}

	/* Use this instead of Prosemirror's built in placeholder to account for multiline content */
	:global(.ui-editor:not(.editor_empty) p:has(br:only-child):last-child:before),
	:global(.ui-editor.ProseMirror-focused p:has(br:only-child):last-child:before) {
		position: absolute;
		content: 'Write something...';
		pointer-events: none;
		color: #aaa;
		z-index: -1;
	}

	/* Empty ui-editors should take up zero space */
	:global(.ui-editor.editor_empty:not(.ProseMirror-focused) p) {
		height: 0;
		margin: 0;
	}
</style>

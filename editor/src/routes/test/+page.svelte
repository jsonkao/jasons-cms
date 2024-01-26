<script lang="ts">
	import { browser } from '$app/environment';
	import rawBlocks from '$lib/generated/data.json';

	// ProsemirrorEditor core component and state helpers
	import ProsemirrorEditor from 'prosemirror-svelte';
	import { toPlainText } from 'prosemirror-svelte/state';
	import { createEditor } from '../prosemirror';
	import { Plugin, type EditorState } from 'prosemirror-state';
	import Component from '../Component.svelte';

	type BlockWithState = Block & { state?: EditorState };

	/**
	 * When Backspace is pressed on an empty prosemirror state,
	 * delete the entire block, unmounting the ProsemirrorEditor component.
	 */
	const blockDeletionPlugin = new Plugin({
		props: {
			handleKeyDown(view, event) {
				if (event.key === 'Backspace' && toPlainText(view.state) === '') {
					blocksWithState = blocksWithState.filter(
						(b) => !(b.state && toPlainText(b.state) === '')
					);
				}
				return false;
			}
		}
	});

	let blocksWithState: BlockWithState[] = !browser
		? []
		: (rawBlocks as Block[]).map((d) => ({
				...d,
				state: d.type === 'text' ? createEditor(d.text, [blockDeletionPlugin]) : undefined
			}));
</script>

<div class="pm-container">
	{#each blocksWithState as b, i}
		{#if b.type === 'text'}
			<ProsemirrorEditor
				editorState={b.state}
				on:change={(e) => (blocksWithState[i].state = e.detail.editorState)}
				debounceChangeEventsInterval={0}
			/>
		{:else if b.type === 'graphic'}
			<Component block={b} />
		{/if}
	{/each}
</div>

<style>
	:global(.ui-editor:first-child) {
		margin-top: 60px;
	}

	:global(.ui-editor:last-child) {
		padding-bottom: 60px;
	}

	:global(.ui-editor) {
		outline: none;
		max-width: 520px;
		width: calc(100% - 30px);
		margin: 0 auto;
	}

	:global(.ui-editor p) {
		margin: 1.5em auto;
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
	:global(.ui-editor p:has(br:only-child):last-child:before) {
		position: absolute;
		content: 'Write something...';
		pointer-events: none;
		color: #aaa;
	}
</style>

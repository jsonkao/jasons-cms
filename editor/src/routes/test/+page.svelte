<script lang="ts">
	import { browser } from '$app/environment';
	import rawBlocks from '$lib/generated/data.json';
	import components from '$lib/generated/index.js';

	// Import ProsemirrorEditor core component and state helpers
	import ProsemirrorEditor from 'prosemirror-svelte';
	import { createRichTextEditor } from 'prosemirror-svelte/state';
	import type { EditorState } from 'prosemirror-state';

	type BlockWithState = Block & { state?: EditorState };

	const blocksWithState: BlockWithState[] = !browser
		? []
		: (rawBlocks as Block[]).map((d) => ({
				...d,
				state: d.type === 'text' ? createRichTextEditor((d as TextBlock).text) : undefined
			}));
</script>

<div class="pm-container">
	{#each blocksWithState as b, i}
		{#if b.type === 'text'}
			<ProsemirrorEditor
				placeholder="Write something..."
				editorState={b.state}
				on:change={(e) => (blocksWithState[i].state = e.detail.editorState)}
				debounceChangeEventsInterval={0}
			/>
		{:else if b.type === 'graphic'}
			<div class="graphic" data-name={b.name}>
				<svelte:component this={components[b.name]} />
			</div>
		{/if}
	{/each}
</div>

<style>
	.pm-container {
		padding: 60px 0;
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
</style>

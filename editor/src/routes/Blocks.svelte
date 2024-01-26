<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { createObserver } from './utils.js';
	import rawBlocks from '$lib/generated/data.json';

	import { Plugin, type EditorState } from 'prosemirror-state';
	import { toPlainText } from 'prosemirror-svelte/state';
	import { createEditor } from './prosemirror';
	import ProsemirrorEditor from './ProsemirrorEditor.svelte';
	import Component from './Component.svelte';

	type BlockWithState =
		| (TextBlock & { state: EditorState; editor?: ProsemirrorEditor })
		| GraphicBlock;

	/**
	 * When Backspace is pressed on an empty prosemirror state,
	 * delete the entire block, unmounting the ProsemirrorEditor component.
	 */
	const blockDeletionPlugin = new Plugin({
		props: {
			handleKeyDown(view, event) {
				if (event.key === 'Backspace' && toPlainText(view.state) === '') {
					blocksWithState = blocksWithState.filter(
						(b) => !(b.type === 'text' && b.state && toPlainText(b.state) === '')
					);
				}
				return false;
			}
		}
	});

	let blocksWithState: BlockWithState[] = !browser
		? []
		: (rawBlocks as Block[]).map((d) => {
				if (d.type === 'text') {
					return {
						...d,
						state: createEditor(d.text, [blockDeletionPlugin]),
						editor: undefined
					};
				}
				return d;
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
				console.log('Trying to focus text with', editor);
				editor?.focus();
			}
		}
	}

	/**
	 * Listen for Cmd+E to toggle the editor or Cmd+S to save the file
	 */
	function onKeydown(e: KeyboardEvent) {
		if (e.metaKey && e.key === 'e') {
			e.preventDefault();
			window.parent.postMessage({ type: 'toggleEditor' }, '*');
		} else if (e.metaKey && e.key === 's') {
			e.preventDefault();
			window.parent.postMessage({ type: 'saveFile' }, '*');
		}
	}

	let contentEl: HTMLElement;
	onMount(() => {
		window.parent.postMessage({ type: 'editorMounted' }, '*');
		const observer = createObserver(contentEl.querySelectorAll('.graphic'));
		return () => observer && observer.disconnect();
	});
</script>

<svelte:window on:message={onMessage} on:keydown={onKeydown} />

<div class="content" bind:this={contentEl}>
	{#each blocksWithState as b, i}
		{#if b.type === 'text'}
			<ProsemirrorEditor
				bind:this={b.editor}
				editorState={b.state}
				on:change={(e) => (blocksWithState[i].state = e.detail.editorState)}
				on:blur={() => (lastTextFocused = i)}
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

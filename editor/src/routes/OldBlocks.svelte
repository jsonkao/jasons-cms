<script>
	import { onMount } from 'svelte';
	import { placeCaretAtEnd, createObserver } from './utils.js';

	/** @type {Block[]} */
	import rawBlocks from '$lib/generated/data.json';
	import components from '$lib/generated/index.js';
	import { browser } from '$app/environment';

	export let data;

	/**
	 * Focuses a block by index
	 * @param {number} index
	 */
	function focusBlock(index) {
		content[index].element?.focus();
	}

	/**
	 * @param {MessageEvent} event
	 */
	function onMessage(event) {
		if (event.data.type === 'focusText') focusBlock(lastTextFocused);
	}

	/**
	 * Getting content and hydrating it with id's and such
	 */

	let uid = 0;

	/** @type {RenderedBlock[]} */
	let content = rawBlocks.map((d) => ({
		...d,
		id: uid++,
		element: null
	}));

	/**
	 * Delete a text block. Called when the user presses backspace on an empty text block.
	 * @param {number} index
	 */
	async function deleteTextBlock(index) {
		content = content.filter((_, i) => i !== index);
		placeCaretAtEnd(content[index === 0 ? index : index - 1].element);
	}

	/**
	 * Create a new text block. Called when the user presses enter in a text block.
	 * @param {number} index
	 */
	async function newTextBlock(index) {
		content = [
			...content.slice(0, index + 1),
			{ type: 'text', text: '', id: uid++, element: null },
			...content.slice(index + 1)
		];
	}

	/**
	 * @param {KeyboardEvent} e
	 */
	function onKeydown(e) {
		if (e.metaKey && e.key === 'e') {
			e.preventDefault();
			window.parent.postMessage({ type: 'toggleEditor' }, '*');
		} else if (e.metaKey && e.key === 's') {
			e.preventDefault();
			window.parent.postMessage({ type: 'saveFile' }, '*');
		}
	}

	/** @type {HTMLElement} */
	let contentEl;
	let lastTextFocused = 0;
	let mounted = false;

	if (browser) window.addEventListener('keydown', onKeydown);

	onMount(() => {
		mounted = true;
		window.parent.postMessage({ type: 'editorMounted' }, '*');
		placeCaretAtEnd(content[0]?.element);
		const observer = createObserver(contentEl.querySelectorAll('.graphic'));
		return () => {
			observer && observer.disconnect();
			window.removeEventListener('keydown', onKeydown);
		};
	});

	/** @type {import('svelte/action').Action}  */
	const focusIfMounted = (node) => {
		if (mounted) node.focus();
	};
</script>

<svelte:window on:message={onMessage} on:keydown={onKeydown} />

<div class="content" bind:this={contentEl}>
	{#each content as block, i (block.id)}
		{#if block.type === 'text'}
			<p
				contenteditable
				spellcheck="false"
				bind:textContent={block.text}
				bind:this={block.element}
				use:focusIfMounted
				on:blur={() => (lastTextFocused = i)}
				on:keypress={(e) => {
					if (e.code === 'Enter') {
						newTextBlock(i);
						e.preventDefault();
					}
				}}
				on:keydown={(e) => {
					if (e.code === 'Backspace' && block.text === '') {
						e.preventDefault();
						deleteTextBlock(i);
					}
				}}
			>
				{block.text}
			</p>
		{:else if block.type === 'graphic' && block.name}
			<div class="graphic" data-name={block.name}>
				<svelte:component this={components[block.name]} {data} />
			</div>
		{/if}
	{/each}
</div>

<style>
	.content {
		margin: 0 auto;
		padding: 60px 0;
	}

	p:empty:before {
		content: '...';
		pointer-events: none;
		display: block;
		color: #aaa;
	}

	p {
		-webkit-font-smoothing: antialiased;
		font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
		font-size: 1.1rem;
		line-height: 1.5;
		color: #121212;
		outline: none;
		max-width: 520px;
		width: calc(100% - 30px);
	}

	.content > * {
		margin: 1.5em auto;
	}
</style>

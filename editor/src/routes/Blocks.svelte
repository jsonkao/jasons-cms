<script>
	import { onMount } from 'svelte';
	import components from '$lib/index.js';

	/**
	 * @param {MessageEvent} event
	 */
	function onMessage(event) {
		console.log('child received data', event.data);
		if (event.data.type === 'setBlocks') {
			rawBlocks = event.data.blocks;
		}
		if (event.data.type === 'focusText') {
			content[lastTextFocused].element?.focus();
		}
	}

	/**
	 * Getting content and hydrating it with id's and such
	 */

	/** @type {Block[]} */
	let rawBlocks = [];

	$: console.log('rawBlocks', rawBlocks);

	let uid = 0;

	/** @type {RenderedBlock[]} */
	$: content = rawBlocks.map((d) => ({
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
		const el = content[index === 0 ? index : index - 1].element;

		if (el) {
			el.focus();
			let sel = window.getSelection();
			if (sel) {
				sel.selectAllChildren(el);
				sel.collapseToEnd();
			}
		}
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

	let lastTextFocused = 0;

	/** @type {import('svelte/action').Action}  */
	function focus(node) {
		node.focus();
	}

	/** @type {HTMLElement} */
	let contentEl;
	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && entry.intersectionRatio === 1) {
						window.parent.postMessage(
							{
								type: 'focusGraphic',
								name: entry.target.getAttribute('data-name')
							},
							'*'
						);
					}
				});
			},
			{ threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
		);
		contentEl.querySelectorAll('.graphic').forEach((e) => observer.observe(e));

		const testMsgFn = (event) => {
			console.log('Message received from the parent: ' + event);
		};
		window.addEventListener('message', testMsgFn);

		window.parent.postMessage({ type: 'iframeMounted' }, '*');

		return () => {
			observer && observer.disconnect();
			window.removeEventListener('message', testMsgFn);
		};
	});
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
				use:focus
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
				<svelte:component this={components[block.name]} />
			</div>
		{/if}
	{/each}
</div>

<style>
	.content {
		margin: 0 auto;
		padding: 60px 0;
		max-width: calc(100% - 40px);
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
	}

	.content > * {
		margin: 1.5em auto;
	}
</style>

<script>
	import Component1 from '$lib/1.svelte';
	import Component2 from '$lib/2.svelte';
	import { onMount } from 'svelte';

	const components = {
		'1': Component1,
		'2': Component2
	};

	/**
	 * Getting content and hydrating it with id's and such
	 */

	export let rawContent;

	let uid = 0;

	/** @type {{ type: 'text' | 'graphic', text?: string, component?: string, id: number, element: HTMLElement | null }[]} */
	let content = rawContent.map((d) => ({
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
			console.log("IM HERE")
			window.parent.postMessage({ type: 'toggleEditor' });
		} else if (e.metaKey && e.key === 's') {
			e.preventDefault();
			window.parent.postMessage({ type: 'saveFile' });
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
						console.log("Posting focus graphic");
						window.parent.postMessage({
							type: 'focusGraphic',
							name: entry.target.getAttribute('data-name')
						});
					}
				});
			},
			{ threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
		);
		contentEl.querySelectorAll('.graphic').forEach((e) => observer.observe(e));

		return () => observer && observer.disconnect();
	});
</script>

<svelte:window
	on:message={(event) => {
		if (event.data.type === 'focusText') {
			content[lastTextFocused].element?.focus();
		}
	}}
	on:keydown={onKeydown}
/>

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
		{:else if block.type === 'graphic' && block.component}
			<div class="graphic" data-name={block.component}>
				<svelte:component this={components[block.component]} />
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

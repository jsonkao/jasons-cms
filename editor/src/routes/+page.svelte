<script>
	import Graphic from '$lib/Graphic.svelte';

	const components = {
		Graphic
	};

	let uid = 0;

	let content = [
		{
			type: 'text',
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel, luctus ornare lacus.'
		},
		{
			type: 'text',
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel, luctus ornare lacus.'
		},
		{
			type: 'graphic',
			component: 'Graphic'
		},
		{
			type: 'text',
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel, luctus ornare lacus.'
		},
		{
			type: 'text',
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel, luctus ornare lacus.'
		}
	].map((c) => {
		c.id = uid++;
		return c;
	});

	/**
	 * @param {number} index
	 */
	async function deleteTextBlock(index) {
		content = content.filter((_, i) => i !== index);
		const el = content[index === 0 ? index : index - 1].element;

		if (el) {
			el.focus();
			let sel = window.getSelection();
			sel.selectAllChildren(el);
			sel.collapseToEnd();
		}
	}

	/**
	 * @param {number} index
	 */
	async function newTextBlock(index) {
		content = [
			...content.slice(0, index + 1),
			{ type: 'text', text: '', id: uid++ },
			...content.slice(index + 1)
		];
	}

	/** @type {import('svelte/action').Action}  */
	function focus(node) {
		node.focus();
	}

	function onKeydown(e) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			window.parent?.postMessage({ type: 'toggleEditor' }, '*');
		} else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			window.parent?.postMessage({ type: 'saveFile' }, '*');
		} else {
			return;
		}

		e.preventDefault();
	}
</script>

<div class="content" on:keydown={onKeydown} role="none">
	{#each content as block, i (block.id)}
		{#if block.type === 'text'}
			<p
				bind:textContent={block.text}
				bind:this={block.element}
				contenteditable
				placeholder="..."
				on:keypress={(e) => {
					if (e.code === 'Enter') {
						newTextBlock(i);
						e.preventDefault();
					}
				}}
				on:keyup={(e) => e.code === 'Backspace' && block.text === '' && deleteTextBlock(i)}
				use:focus
			>
				{block.text}
			</p>
		{:else if block.type === 'graphic' && block.component}
			<svelte:component this={components[block.component]} />
		{/if}
	{/each}
</div>

<style>
	.content {
		margin: 120px auto;
		max-width: calc(100% - 40px);
	}

	p:empty:before {
		content: attr(placeholder);
		pointer-events: none;
		display: block; /* For Firefox */
		color: #aaa;
	}

	p {
		font-family: Helvetica;
		font-size: 16px;
		line-height: 1.4;
		outline: none;
	}

	.content > * {
		max-width: 520px;
		margin: 1.7rem auto;
	}
</style>

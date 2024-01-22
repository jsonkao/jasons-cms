<script>
	import { codeContent } from '$lib/stores.js';
	import { createEventDispatcher } from 'svelte';

	/** @type {boolean} */
	export let showCodeEditor;

	const dispatch = createEventDispatcher();

	/** @type {import('svelte/action').Action<HTMLElement, boolean>}  */
	function focus(node, show) {
		node.focus();

		return {
			update(show) {
				if (show) node.focus();
			}
		};
	}
</script>

<div class="code-editor-container" class:show-editor={showCodeEditor}>
	<textarea
		bind:value={$codeContent}
		use:focus={showCodeEditor}
		on:keydown={(e) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault();
				dispatch('save');
			}
		}}
	/>
</div>

<style>
	.code-editor-container {
		grid-area: 1 / 1;
		z-index: 2;
		background: #121212;
		border-radius: 6px;
		max-width: 600px;
		max-height: 600px;
		height: 100%;
		width: 100%;
		justify-self: center;
		align-self: center;
		padding: 1em;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.15s ease-in-out;
	}

	.code-editor-container.show-editor {
		opacity: 1;
		pointer-events: all;
	}

	textarea {
		font-family: 'Courier New', Courier, monospace;
		color: white;
		outline: none;
		height: 100%;
		width: 100%;
		display: block;
		padding: 0;
		border: none;
		background: none;
	}
</style>

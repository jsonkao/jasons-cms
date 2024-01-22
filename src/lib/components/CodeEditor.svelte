<script>
	import { codeContent } from '$lib/stores.js';
	import { createEventDispatcher } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { svelte } from '@replit/codemirror-lang-svelte';
	import { coolGlow } from 'thememirror';

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

<div
	class="code-editor-container"
	class:show-editor={showCodeEditor}
	role="none"
	on:keydown={(e) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			dispatch('save');
		}
	}}
>
	<CodeMirror bind:value={$codeContent} lang={svelte()} theme={coolGlow} styles={{
		"&": {
				padding: "12px",
		borderRadius: "6px"
		},
}} />
</div>

<style>
	.code-editor-container {
		grid-area: 1 / 1;
		z-index: 2;
		max-width: 600px;
		max-height: 600px;
		height: 100%;
		width: 100%;
		justify-self: center;
		align-self: center;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.1s ease-in-out;
		overflow-y: scroll;
	}

	.code-editor-container.show-editor {
		opacity: 1;
		pointer-events: all;
	}
</style>

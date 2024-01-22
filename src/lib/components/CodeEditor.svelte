<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { svelte } from '@replit/codemirror-lang-svelte';
	import { coolGlow } from 'thememirror';
	import { codeContent } from '$lib/stores.js';

	export let showCodeEditor: boolean;

	let containerElement: HTMLElement;

	const dispatch = createEventDispatcher();

	$: if (showCodeEditor && containerElement)
		(containerElement.querySelector('[contenteditable=true]') as HTMLElement).focus();
</script>

<div
	class="code-editor-container"
	bind:this={containerElement}
	class:show-editor={showCodeEditor}
	role="none"
	on:keydown={(e) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			dispatch('save');
		}
	}}
>
	<CodeMirror
		bind:value={$codeContent}
		lang={svelte()}
		theme={coolGlow}
		styles={{
			'&': {
				padding: '12px',
				borderRadius: '6px'
			}
		}}
	/>
</div>

<style>
	.code-editor-container {
		grid-area: 1 / 1;
		z-index: 2;
		max-width: 600px;
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

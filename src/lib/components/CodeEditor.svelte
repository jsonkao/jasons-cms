<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { svelte } from '@replit/codemirror-lang-svelte';
	import { coolGlow } from 'thememirror';
	import { codeContent } from '$lib/stores';
	import Tabs from './Tabs.svelte';

	export let showCodeEditor: boolean;
	export let currentGraphic: string;

	let containerElement: HTMLElement;

	const dispatch = createEventDispatcher();

	// If the editor gets shown, focus the contenteditable element
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
	<div class="code-mirror-container">
		<CodeMirror
			bind:value={$codeContent[currentGraphic]}
			lang={svelte()}
			theme={coolGlow}
			tabSize={4}
			styles={{
				'&': {
					padding: '12px',
					borderRadius: '6px'
				}
			}}
		/>
	</div>

	<Tabs />
</div>

<style>
	.code-editor-container {
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.1s ease-in-out;
		position: relative;
		height: 100%;
	}

	.code-editor-container.show-editor {
		opacity: 1;
		pointer-events: all;
	}

	.code-mirror-container {
		height: 100%;
		max-height: 600px;
		overflow-y: scroll;
	}
</style>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { svelte } from '@replit/codemirror-lang-svelte';
	import { coolGlow } from 'thememirror';
	import { codeContent, codeEditorPosition } from '$lib/stores';
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
	class="code-editor"
	bind:this={containerElement}
	class:show-editor={showCodeEditor}
	class:full-bleed={$codeEditorPosition === 'bottom'}
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
	.code-editor {
		transition: opacity 0.1s;
		position: relative;
		height: 100%;
		opacity: 0;
		pointer-events: none;
		margin: 0 auto;
	}

	.code-editor.show-editor {
		opacity: 1;
		pointer-events: all;
	}

	.code-mirror-container {
		height: 100%;
		max-height: 720px;
		overflow-y: scroll;
	}

	.code-editor:not(.full-bleed) {
		max-width: calc(100% - 40px);
	}
</style>

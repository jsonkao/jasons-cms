<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { svelte } from '@replit/codemirror-lang-svelte';
	import { coolGlow } from 'thememirror';
	import { codeContent, codeEditorPosition, openComponent, openGlobalFile } from '$lib/stores';
	import PlacementButtons from './PlacementButtons.svelte';
	import Tabs from './Tabs.svelte';

	export let showCodeEditor: boolean;

	let containerElement: HTMLElement;

	const dispatch = createEventDispatcher();

	// If the editor gets shown, focus the contenteditable element
	$: if (showCodeEditor && containerElement)
		(containerElement.querySelector('[contenteditable=true]') as HTMLElement).focus();
</script>

<div
	class="code-editor position-{$codeEditorPosition}"
	bind:this={containerElement}
	class:show-editor={$codeEditorPosition !== 'center' || showCodeEditor}
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
			bind:value={$codeContent[$openGlobalFile || $openComponent]}
			lang={svelte()}
			nodebounce
			theme={coolGlow}
			tabSize={4}
			styles={{
				'&': {
					padding: '24px 12px 12px',
					borderRadius: '6px',
					height: '100%'
				}
			}}
		/>
		<Tabs />
		<PlacementButtons />
	</div>
</div>

<style>
	.code-editor {
		transition: opacity 0.1s;
		position: relative;
		height: 100%;
		margin: 0 auto;
		opacity: 0;
		pointer-events: none;
		display: grid;
	}

	:global(.codemirror-wrapper) {
		height: 100%;
	}

	.code-editor.show-editor {
		opacity: 1;
		pointer-events: all;
	}

	.code-mirror-container {
		max-height: calc(100vh - 30px);
		overflow-y: scroll;
		position: relative;
		align-self: center;
	}

	.code-editor:not(.position-center) .code-mirror-container {
		height: 100%;
	}

	.code-editor:not(.position-bottom) {
		max-width: calc(100% - 30px);
	}
</style>

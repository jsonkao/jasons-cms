<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { svelte } from '@replit/codemirror-lang-svelte';
	import { coolGlow } from 'thememirror';
	import { codeContent } from '$lib/stores.js';

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
	<div class="codemirror-container">
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

	<div class="tabs">
		{#each ['center', 'left', 'bottom'] as position}
			<button class="position-{position}" on:click={() => dispatch('changePosition', position)} />
		{/each}
	</div>
</div>

<style>
	.code-editor-container {
		height: 100%;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.1s ease-in-out;
		position: relative;
	}

	.code-editor-container.show-editor {
		opacity: 1;
		pointer-events: all;
	}

	.codemirror-container {
		height: 100%;
		max-height: 600px;
		overflow-y: scroll;
	}

	.tabs {
		position: absolute;
		bottom: 10px;
		right: 9px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	button {
		--size: 20px;
		width: var(--size);
		height: var(--size);
		display: block;
		cursor: pointer;
		border: 1px solid white;
		background: none;
		position: relative;
		padding: 0;
		opacity: 0.5;
		transition: opacity 0.3s;
		border-radius: none;
	}

	button:hover {
		opacity: 1;
	}

	button::after {
		content: ' ';
		position: absolute;
		top: 0;
		left: 0;
	}

	button.position-center::after {
		top: 50%;
		left: 50%;
		width: 50%;
		height: 50%;
		border: 1px solid white;
		transform: translate(-50%, -50%);
	}

	button.position-left::after {
		width: 30%;
		height: 100%;
		border-right: 1px solid white;
	}

	button.position-bottom::after {
		width: 100%;
		height: 60%;
		border-bottom: 1px solid white;
	}
</style>

<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	import CodeMirror from 'svelte-codemirror-editor';
	import { svelte } from '@replit/codemirror-lang-svelte';
	import type { Extension } from '@codemirror/state';
	import { coolGlow } from 'thememirror';

	import * as Y from 'yjs';
	// @ts-ignore
	import { yCollab } from 'y-codemirror.next';
	import { WebrtcProvider } from 'y-webrtc';

	import { codeEditorPosition, openComponent } from '$lib/stores';
	import PlacementButtons from './PlacementButtons.svelte';
	import { userName, userColor } from '$lib/constants';
	import { getYdocState } from '$lib/yjs';

	/**
	 * Create Y.Text
	 */

	let ydoc: Y.Doc;
	let ytext: Y.Text;
	let yExtension: Extension;
	let provider: WebrtcProvider;

	onMount(async () => {
		const ydocState = await getYdocState();

		ydoc = new Y.Doc();
		Y.applyUpdate(ydoc, ydocState);

		provider = new WebrtcProvider('codemirror6-demo-room', ydoc);
		ytext = ydoc.getText('a');

		provider.awareness.setLocalStateField('user', {
			name: userName,
			color: userColor,
			colorLight: '#000'
		});

		yExtension = yCollab(ytext, provider.awareness);
	});
	onDestroy(() => provider?.destroy());

	$: if (ydoc && yExtension && $openComponent) updateYdoc($openComponent);

	function updateYdoc(openComponent: string) {
		console.log({ openComponent, yExtension });
		ytext = ydoc.getText(openComponent);
		yExtension = yCollab(ytext, provider.awareness);
	}

	/**
	 * Set up elements and dispatchers
	 */

	export let showCodeEditor: boolean;

	let containerElement: HTMLElement;

	const dispatch = createEventDispatcher();

	// If the editor gets shown, focus the contenteditable element
	// TODO: This is null for some reason
	$: if (showCodeEditor && containerElement)
		(containerElement.querySelector('[contenteditable=true]') as HTMLElement)?.focus();

	function onKeyDown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			dispatch('save', ytext.toString());
		}
		if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
			e.preventDefault();
			openComponent.set('b');
		}
		if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
			e.preventDefault();
			openComponent.set('a');
		}
	}
</script>

<div
	class="code-editor position-{$codeEditorPosition}"
	bind:this={containerElement}
	class:show-editor={$codeEditorPosition !== 'center' || showCodeEditor}
	role="none"
	on:keydown={onKeyDown}
>
	<div class="code-mirror-container">
		{#if ytext && yExtension}
			<CodeMirror
				value={ytext.toString()}
				lang={svelte()}
				nodebounce
				theme={coolGlow}
				extensions={[yExtension]}
				tabSize={4}
				styles={{
					'&': {
						padding: '12px 12px 12px',
						borderRadius: '6px',
						height: '100%'
					}
				}}
			/>
			<PlacementButtons />
		{/if}
	</div>
</div>

<style>
	.code-editor {
		position: relative;
		height: 100%;
		margin: 0 auto;
		pointer-events: none;
		display: grid;
	}

	:global(.codemirror-wrapper) {
		height: 100%;
	}

	:global(.cm-ySelectionCaret .cm-ySelectionInfo) {
		-webkit-font-smoothing: antialiased;
		font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
	}

	.code-mirror-container {
		max-height: calc(100vh - 30px);
		overflow-y: scroll;
		position: relative;
		align-self: center;
		pointer-events: none;
		transition: opacity 0.1s;
		opacity: 0;
	}

	.code-editor.show-editor .code-mirror-container {
		opacity: 1;
		pointer-events: all;
	}

	.code-editor:not(.position-center) .code-mirror-container {
		height: 100%;
	}

	.code-editor:not(.position-bottom) {
		max-width: calc(100% - 30px);
	}
</style>

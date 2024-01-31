<script lang="ts">
	import type { Extension } from '@codemirror/state';
	import { svelte } from '@replit/codemirror-lang-svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { coolGlow } from 'thememirror';

	// @ts-ignore
	import { yCollab } from 'y-codemirror.next';
	import * as Y from 'yjs';
	import { createClient } from '@liveblocks/client';
	import LiveblocksProvider from '@liveblocks/yjs';

	import { browser } from '$app/environment';
	import { GENERATED_PATH, userColor, userName } from '$lib/constants.js';
	import { codeEditorPosition, openComponent } from '$lib/stores/code-editor.js';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import PlacementButtons from './PlacementButtons.svelte';

	const client = createClient({
		publicApiKey: 'pk_dev_1iisK8HmLpmVOreEDPQqeruOVvHWUPlchIagQpCKP-VIRyGkCF4DDymphQiiVJ6A'
	});

	/**
	 * Create Y.Text
	 */

	let ydoc: Y.Doc;
	let ytext: Y.Text;
	let yExtension: Extension;
	let yProvider: LiveblocksProvider<any, any, any, any>;

	let destroy = () => {};

	if (browser) {
		const { room, leave } = client.enterRoom('my-room', {
			initialPresence: {}
		});

		destroy = leave;

		ydoc = new Y.Doc();
		yProvider = new LiveblocksProvider(room, ydoc);
		yProvider.awareness.setLocalStateField('user', { color: userColor, name: userName });

		$openComponent && setExtension($openComponent);

		// TODO: Create a different ydoc under a normal WebRTC connection for the files we dont want
		// persistance for? (i.e. non-components like +page.server.js or Blocks.svelte)
	}

	onDestroy(() => destroy());

	$: if (ydoc && yExtension && $openComponent) setExtension($openComponent);

	function setExtension(openComponent: string) {
		ytext = ydoc.getText(openComponent);
		yExtension = yCollab(ytext, yProvider.awareness);
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
		if (e.metaKey && e.key === 's') {
			e.preventDefault();
			dispatch('save', ytext.toString());
		}
		if (e.metaKey && ['a', 'b'].includes(e.key)) {
			e.preventDefault();
			openComponent.set(`${GENERATED_PATH}/${e.key}.svelte`);
		}
		if (e.metaKey && e.key === 'x') {
			e.preventDefault();
			openComponent.set('/src/routes/Blocks.svelte');
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
		display: grid;
		max-height: calc(100vh - 30px);
		overflow-y: scroll;
		align-self: center;
		transition: opacity 0.1s;
		border-radius: 6px;
		opacity: 0;
		pointer-events: none;
	}

	.code-mirror-container > :global(*) {
		grid-area: 1 / 1;
	}

	.code-editor.show-editor .code-mirror-container {
		opacity: 1;
		pointer-events: all;
	}

	.code-editor:not(.position-center) .code-mirror-container {
		height: 100%;
	}

	.code-editor.position-bottom .code-mirror-container {
		border-radius: 0;
	}

	.code-editor.position-left {
		max-width: calc(100% - 30px);
	}
</style>

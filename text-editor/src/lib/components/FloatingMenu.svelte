<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { popupStore } from '$lib/stores';

	const dispatch = createEventDispatcher<{ insert: BlockInsertionParams }>();

	function handleClick() {
		dispatch('insert', {
			editorNodes: $popupStore.editorNodes!,
			cursorIndex: $popupStore.cursorIndex!,
			activeYXmlFragment: $popupStore.activeYXmlFragment!
		});
		popupStore.set({ visible: false });
	}
</script>

{#if $popupStore.visible && $popupStore.left && $popupStore.top}
	<div class="popup" style="top: {$popupStore.top}px; left: {$popupStore.left}px">
		<p>
			Write or
			<button on:click={handleClick}>code</button>...
		</p>
	</div>
{/if}

<style>
	.popup {
		position: absolute;
	}

	p,
	button {
		padding: 0;
		border: none;
		background: none;
		-webkit-font-smoothing: antialiased;
		font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
		font-size: 1.1rem;
		line-height: 1.5;
		color: #aaa;
		margin: 0;
	}

	button {
		text-decoration: underline;
		cursor: pointer;
	}
</style>

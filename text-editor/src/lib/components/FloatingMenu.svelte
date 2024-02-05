<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { floatingMenuStore } from '$lib/stores';

	const dispatch = createEventDispatcher<{ insert: BlockInsertionParams }>();

	function handleClick() {
		dispatch('insert', {
			docNode: $floatingMenuStore.docNode!,
			cursorPosition: $floatingMenuStore.cursorPosition!,
			activeYXmlFragment: $floatingMenuStore.activeYXmlFragment!
		});
		floatingMenuStore.set({ visible: false });
	}
</script>

{#if $floatingMenuStore.visible && $floatingMenuStore.left && $floatingMenuStore.top}
	<div class="popup" style="top: {$floatingMenuStore.top}px; left: {$floatingMenuStore.left}px">
		<p>
			Write or
			<button on:click={handleClick}>code here</button>...
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

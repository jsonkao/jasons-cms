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
			<button on:click={handleClick}>code a visual</button> here...
		</p>
	</div>
{/if}

<style>
	.popup {
		position: absolute;
		pointer-events: none;
	}

	p,
	button {
		color: #aaa;
		margin: 0;
		font-size: inherit;
	}

	button {
		text-decoration: underline;
		cursor: pointer;
		pointer-events: all;
	}
</style>

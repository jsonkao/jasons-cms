<script>
	import { codeEditorPosition } from '$lib/stores/code-editor';
	import Minimap from './Minimap.svelte';
	import PlacementButtons from './PlacementButtons.svelte';
	import Tabs from './Tabs.svelte';

	/** @type {Array<import('$shared/types').BlockMap>} */
	export let blocks;
	export let showCodeEditor = false;
	export let componentIsPresent = false;
</script>

<div class="overlay" class:showing={showCodeEditor}>
	{#if componentIsPresent}
		<Tabs />
	{/if}
	<PlacementButtons />
	<Minimap on:select-graphic on:delete-graphic {blocks} />
</div>

{#if !componentIsPresent}
	<div
		class="no-component-message"
		class:showing={showCodeEditor}
		class:centered={$codeEditorPosition === 'center'}
	>
		<p>no visuals yet :o</p>
	</div>
{/if}

<style>
	.overlay {
		pointer-events: none;
		grid-area: 1 / 1;
	}

	.overlay.showing > :global(*) {
		pointer-events: all;
	}

	.no-component-message {
		grid-area: 1 / 1;
		width: 100%;
		height: 100%;
		/* background: #f6f6f6; */
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.25);
	}

	.no-component-message.centered {
		box-shadow: 0 1px 3px #0003;
		border-radius: 6px;
	}

	.no-component-message p {
		color: white;
		margin: 0;
		opacity: 0;
		transition: opacity 0.2s;
		white-space: pre;
	}

	.no-component-message:not(.centered) p {
		width: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.no-component-message.showing p {
		width: auto;
		opacity: 1;
	}
</style>

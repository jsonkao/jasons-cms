<script lang="ts">
	import { heights } from '$lib/stores/heights.js';
	import { openComponentName } from '$lib/stores/code-editor.js';
	import { createEventDispatcher } from 'svelte';

	const TOTAL_HEIGHT = 300;

	$: renderingData = createRenderingData($heights);
	$: console.log(renderingData);

	function createRenderingData($heights: Array<BlockHeight>) {
		const totalHeight = $heights.reduce((acc, blockHeight) => acc + blockHeight.height, 0);
		const heightScale = (height: number) => (height / totalHeight) * TOTAL_HEIGHT;
		return $heights.map((blockHeight) => ({
			type: blockHeight.type,
			name: blockHeight.type === 'graphic' ? blockHeight.name : undefined,
			height: heightScale(blockHeight.height)
		}));
	}

	const dispatch = createEventDispatcher();
	function selectGraphic(name: string) {
		openComponentName.set(name);
		dispatch('select-graphic', name);
	}
</script>

{#if renderingData.length > 0}
	<div class="minimap">
		{#each renderingData as b}
			{#if b.type === 'text' && b.height > 0}
				<button class="mini-text" />
			{:else if b.type === 'graphic'}
				<button
					class="mini-graphic"
					style:height="{Math.max(8, Math.min(TOTAL_HEIGHT * 0.7, b.height))}px"
					class:focused={b.name === $openComponentName}
					on:click={() => selectGraphic(b.name)}
				/>
			{/if}
		{/each}
	</div>
{/if}

<style>
	.minimap {
		position: absolute;
		top: 0;
		right: 0;
		margin-right: 16px;
		margin-top: 16px;
		display: flex;
		align-items: center;
		gap: 8px;
		flex-direction: column;

		--width: 60px;
	}

	button {
		width: var(--width);
		padding: 0;
		border: none;
		background: none;
		display: block;
	}

	.mini-graphic {
		height: var(--height);
		border: 1px solid rgba(255, 255, 255, 0.4);
		box-sizing: border-box;
		transition: border 0.3s;
		border-radius: 1px;
		cursor: pointer;
	}

	.mini-graphic.focused,
	.mini-graphic:hover {
		border: 1px solid rgba(255, 255, 255, 0.8);
	}

	.mini-text {
		border: 4px solid rgba(255, 255, 255, 0.15);
		border-left: none;
		border-right: none;
		padding: 2px 0;
	}
</style>

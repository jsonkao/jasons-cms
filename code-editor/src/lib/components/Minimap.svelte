<script lang="ts">
	import { heights } from '$lib/stores/heights.js';
	import { openComponentName } from '$lib/stores/code-editor.js';
	import { createEventDispatcher } from 'svelte';

	const TOTAL_HEIGHT = 300;

	$: renderingData = createRenderingData($heights);

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

	function deleteGraphic(name: string) {
		// openComponentName.set(name);
		dispatch('delete-graphic', name);
	}
</script>

{#if renderingData.length > 0}
	<div class="minimap">
		{#each renderingData as b}
			{#if b.type === 'text' && b.height > 0}
				<div class="mini-text" />
			{:else if b.type === 'graphic'}
				<div class="mini-graphic" class:focused={b.name === $openComponentName}>
					<button
						style:height="{Math.max(10, Math.min(TOTAL_HEIGHT * 0.7, b.height))}px"
						on:click={() => selectGraphic(b.name)}
					/>

					<div class="mini-menu">
						<button on:click={() => deleteGraphic(b.name)} title="Delete">
							<i class="delete-icon" />
						</button>
					</div>
				</div>
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
		width: 60px;
	}

	button {
		padding: 0;
		border: none;
		background: none;
		display: block;
		transition: border 0.25s;
		box-sizing: border-box;
		cursor: pointer;
	}

	.mini-graphic > button {
		width: 100%;
		border: 1px solid rgba(255, 255, 255, 0.4);
		border-radius: 1px;
	}

	.mini-graphic.focused > button,
	.mini-graphic:hover > button {
		border: 1px solid rgba(255, 255, 255, 0.8);
	}

	.mini-text {
		border: 4px solid rgba(255, 255, 255, 0.15);
		border-left: none;
		border-right: none;
		padding: 2px 0;
	}

	.minimap > * {
		width: 100%;
		position: relative;
	}

	.delete-icon {
		--icon-size: 17px;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(255,255,255,1)'%3E%3Cpath d='M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z'%3E%3C/path%3E%3C/svg%3E");
		width: var(--icon-size);
		height: var(--icon-size);
		opacity: 0.7;
		display: block;
	}

	.mini-menu {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		transform: translateX(-100%);
		padding: 0 6px;
		display: flex;
		align-items: center;
		opacity: 0;
		visibility: hidden;
		transition-duration: 0.3s;
	}

	.mini-graphic:hover .mini-menu {
		opacity: 1;
		visibility: visible;
	}
</style>

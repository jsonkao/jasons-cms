<script>
	import { blockHeights } from '$lib/stores/block-heights.js';
	import { openComponentName } from '$lib/stores/code-editor.js';
	import { createEventDispatcher } from 'svelte';

	/** @type {Array<import('$shared/types').BlockMap>} */
	export let blocks;

	const SCALAR = 1 / 10;
	const DEFAULT_BLOCK_HEIGHT = 30;
	const dispatch = createEventDispatcher();

	/**
	 * Compute the height of a single graphic block
	 * @param {import('$shared/types').BlockMap} b
	 * @param {import('$shared/types').BlockHeights} $blockHeights
	 */
	function getHeight(b, $blockHeights) {
		if (Object.keys($blockHeights).length === 0) return DEFAULT_BLOCK_HEIGHT;

		const blockHeight = $blockHeights[/** @type {string} */ (b.get('name'))];

		if (blockHeight === undefined) {
			console.error(`It's concerning that the height for ${b.get('name')} is undefined`);
			return DEFAULT_BLOCK_HEIGHT;
		}

		// We don't want the height to be too small or too big
		return Math.max(10, Math.min(180, blockHeight * SCALAR));
	}

	/** @param {import('yjs').XmlFragment} fragment */
	function fragmentIsNotEmpty(fragment) {
		const string = fragment.toString();
		return string !== '<paragraph></paragraph>' && string !== '';
	}
</script>

<div class="minimap">
	{#each blocks as b}
		{#if b.get('type') === 'text' && fragmentIsNotEmpty(/** @type {import('yjs').XmlFragment} */ (b.get('text')))}
			<div>
				{#each Array.from({ length: Math.max(2, b.get('text')?.length || 0) }) as _}
					<div class="mini-text-line" />
				{/each}
			</div>
		{:else if b.get('type') === 'graphic'}
			<div class="mini-graphic" class:focused={b.get('name') === $openComponentName}>
				<button
					style:height="{getHeight(b, $blockHeights)}px"
					on:click={() => dispatch('select-graphic', b.get('name'))}
					draggable="true"
				/>

				<div class="mini-menu">
					<button on:click={() => dispatch('delete-graphic', b.get('name'))} title="Delete">
						<i class="delete-icon" />
					</button>
				</div>
			</div>
		{/if}
	{/each}
</div>

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

	.mini-text-line {
		width: 100%;
		height: 4px;
		background: rgba(255, 255, 255, 0.15);
	}

	.mini-text-line:not(:last-child) {
		margin-bottom: 4px;
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

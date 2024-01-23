<script>
	import { codeEditorPosition } from '$lib/stores';
</script>

<div class="tabs">
	{#each ['center', 'left', 'bottom'] as position}
		<button class="position-{position}" on:click={() => codeEditorPosition.set(position)} />
	{/each}
</div>

<style>
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

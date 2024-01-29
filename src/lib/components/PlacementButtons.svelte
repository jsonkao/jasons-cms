<script>
	import { codeEditorPosition } from '$lib/stores';
</script>

<div class="placement-buttons">
	{#each ['center', 'left', 'bottom'] as position}
		<button class="position-{position}" on:click={() => codeEditorPosition.set(position)} />
	{/each}
</div>

<style>
	.placement-buttons {
		margin-bottom: 10px;
		margin-right: 9px;
		display: flex;
		flex-direction: column;
		gap: 5px;
		z-index: 3;
		align-self: flex-end;
		justify-self: flex-end;
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
		border-radius: 1px;
	}

	button:hover {
		opacity: 0.9;
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
		box-shadow: 0 0 0 1px white;
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

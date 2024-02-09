<script>
	import { codeEditorPosition } from '$lib/stores/code-editor.js';
</script>

<div class="footer">
	<p title="Updates the page">cmd+s saves</p>
	<div class="placement-buttons">
		{#each ['center', 'left', 'bottom'] as position}
			<button class="position-{position}" on:click={() => codeEditorPosition.set(position)} />
		{/each}
	</div>
</div>

<style>
	.footer {
		margin-right: 15px;
		margin-bottom: 16px;
		position: absolute;
		bottom: 0;
		right: 0;
		z-index: 3;
		display: flex;
		align-items: flex-end;
		gap: 8px;
	}

	p {
		color: white;
		opacity: 0.6;
		margin: 0;
	}

	.placement-buttons {
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
		border-radius: 1px;
		overflow: hidden;
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

	button.position-center:hover::after {
		animation: fadeOutIn 2.5s infinite;
	}

	@keyframes fadeOutIn {
		25%,
		75% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	button.position-left::after {
		width: 30%;
		height: 100%;
		border-right: 1px solid white;
	}

	button.position-left:hover::after {
		animation: slideLeftRight 2.5s infinite;
	}

	@keyframes slideLeftRight {
		15%,
		80% {
			width: 30%;
		}
		50% {
			width: 0;
			transform: translateX(-1px);
		}
	}

	button.position-bottom::after {
		width: 100%;
		height: 60%;
		border-bottom: 1px solid white;
	}

	button.position-bottom:hover::after {
		animation: slideDownUp 2.5s infinite;
	}

	@keyframes slideDownUp {
		15%,
		80% {
			height: 60%;
		}
		50% {
			height: 100%;
		}
	}
</style>

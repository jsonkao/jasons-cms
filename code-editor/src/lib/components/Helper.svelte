<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<div class="helper-container">
	<button on:click={() => dispatch('toggle')}>
		<i class="code-icon" />
	</button>
	<span>code editor (cmd+e)</span>
</div>

<style>
	.helper-container {
		position: absolute;
		--spacing: 18px;
		bottom: var(--spacing);
		left: var(--spacing);
		display: flex;
		align-items: center;
	}

	.helper-container button {
		--icon-size: 20px;
		padding: 10px;
		background-color: #fff;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.3));
		opacity: 0.4;
		transition-duration: 0.2s;
		position: relative;
	}

	.helper-container button:hover,
	.helper-container:has(button:hover) span {
		opacity: 1;
	}

	span {
		white-space: pre;
		opacity: 0;
		transition-duration: 0.2s;
		margin-left: 7px;
		font-size: 1rem;
		line-height: 1;
		-webkit-font-smoothing: antialiased;
		font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
		color: rgba(0, 0, 0, 3);
	}

	.code-icon {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M24 12L18.3431 17.6569L16.9289 16.2426L21.1716 12L16.9289 7.75736L18.3431 6.34315L24 12ZM2.82843 12L7.07107 16.2426L5.65685 17.6569L0 12L5.65685 6.34315L7.07107 7.75736L2.82843 12ZM9.78845 21H7.66009L14.2116 3H16.3399L9.78845 21Z'%3E%3C/path%3E%3C/svg%3E");
		width: var(--icon-size);
		height: var(--icon-size);
		display: block;
		opacity: 0.7;
	}
</style>

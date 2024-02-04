<script>
	import { createEventDispatcher } from 'svelte';
	import { otherCoders } from '$lib/stores/code-editor.js';
	import { progress } from '$lib/stores/status.ts';
	import { steps } from '$lib/constants.js';
	import { fly } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	/** Wait for booting before showing helpers because booting blocks the event loop, freezing all UI */
	$: isVisible = $progress.number > steps.BOOTING.number;
</script>

{#if isVisible}
	<div
		class="helper-container"
		class:show-all={$progress.number < steps.EDITOR_READY.number}
		in:fly={{ x: -40 }}
	>
		<div class="helper-item">
			<button on:click={() => dispatch('toggle')}>
				<i class="code-icon" />

				{#if $otherCoders.length > 0}
					<span class="other-coders">
						{#each $otherCoders as { color }}
							<span class="coder" style="background-color: {color}" />
						{/each}
					</span>
				{/if}
			</button>
			<p>code editor (cmd+e)</p>
		</div>
		<div class="helper-item">
			<button>
				<i>?</i>
			</button>
			<p>help</p>
		</div>
	</div>
{/if}

<style>
	.helper-container {
		position: absolute;
		--spacing: 18px;
		padding-bottom: var(--spacing);
		padding-left: var(--spacing);
		bottom: 0;
		left: 0;
		display: flex;
		flex-direction: column-reverse;
		gap: 8px;
	}

	.helper-item {
		display: flex;
		align-items: center;
	}

	.helper-item:first-child button,
	.helper-container.show-all button,
	.helper-container.show-all i {
		pointer-events: all;
		opacity: 1;
	}

	button {
		--icon-size: 20px;
		padding: 10px;
		background-color: #fff;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.3));
		opacity: 0;
		position: relative;
		transition-duration: 0.3s;
	}

	button:hover {
		background-color: #f3f3f3;
	}

	.helper-container:hover .helper-item * {
		opacity: 1;
	}

	p,
	i {
		display: inline;
		font-size: 1rem;
		line-height: 1;
		-webkit-font-smoothing: antialiased;
		font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
		color: black;
	}

	button,
	p {
		transition-duration: 0.3s;
	}

	p {
		width: 0;
		white-space: pre;
		opacity: 0;
		margin-left: 7px;
		pointer-events: none;
	}

	i {
		width: var(--icon-size);
		height: var(--icon-size);
		display: flex;
		opacity: 0.7;
		align-items: center;
		justify-content: center;
		font-style: normal;
	}

	.code-icon {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M24 12L18.3431 17.6569L16.9289 16.2426L21.1716 12L16.9289 7.75736L18.3431 6.34315L24 12ZM2.82843 12L7.07107 16.2426L5.65685 17.6569L0 12L5.65685 6.34315L7.07107 7.75736L2.82843 12ZM9.78845 21H7.66009L14.2116 3H16.3399L9.78845 21Z'%3E%3C/path%3E%3C/svg%3E");
	}

	.other-coders {
		position: absolute;
		bottom: 3px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 3px;
		z-index: 3;
	}

	.coder {
		--size: 6px;
		border-radius: 50%;
		width: var(--size);
		height: var(--size);
	}
</style>

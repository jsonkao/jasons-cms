<script>
	import { createEventDispatcher } from 'svelte';
	import { otherCoders } from '$lib/stores/code-editor.js';
	import { currentStep } from '$lib/stores/status';
	import { STEPS } from '$lib/constants.js';
	import { fly } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	/** Wait for booting before showing helpers because booting blocks the event loop, freezing all UI */
	$: isVisible = $currentStep.number > STEPS.BOOTING.number;

	let showHelp = false;
</script>

{#if showHelp}
	<div class="manual-container" transition:fly={{ x: '-100%' }}>
		<p>In this experimental CMS, writing words is mixed with writing code.</p>
		<p>You can write words as you normally would, as if this were a Google Doc.</p>
		<p>
			You can also code as you normally would, as if this were your local dev server. If you open
			the code editor (cmd+e), you can write code in the editor. If you save the file (cmd+s), the
			result will update on the page.
		</p>
		<p>
			To select a different component, click on the component in the minimap on the top right of the
			code editor.
		</p>
		<p>The entire doc, including the code editor, is live and collaborative.</p>
		<p><button on:click={() => (showHelp = false)}>Close me.</button></p>
	</div>
{/if}

{#if isVisible}
	<div class="helper-container" in:fly={{ x: -40 }}>
		<div class="helper-item">
			<button on:click={() => dispatch('toggle-editor')}>
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
			<button on:click={() => (showHelp = !showHelp)}>
				<i>?</i>
			</button>
			<p>help</p>
		</div>
	</div>
{/if}

<style>
	.helper-container {
		position: absolute;
		grid-area: 1 / 1;
		--spacing: 18px;
		padding-bottom: var(--spacing);
		padding-left: var(--spacing);
		bottom: 0;
		left: 0;
		display: flex;
		flex-direction: column-reverse;
		gap: 8px;
	}

	.manual-container {
		/* The manual is on the sidebar with a box shadow on the right side */
		left: 0;
		top: 0;
		position: absolute;
		padding: 30px;
		width: 350px;
		height: 100vh;
		background-color: white;
		box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
		box-sizing: border-box;
		opacity: 0.95;
	}

	.manual-container p {
		-webkit-font-smoothing: antialiased;
		font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
		font-size: 1.1rem;
		line-height: 1.5;
		width: auto;
		margin-top: 0;
	}

	.manual-container button {
		font-size: inherit;
		color: inherit;
		border-bottom: 1px solid #bbb;
		padding: 0;
		padding-bottom: 2px;
	}

	.helper-item {
		display: flex;
		align-items: center;
	}

	button {
		background-color: #fff;
		border: none;
		cursor: pointer;
	}

	.helper-container button {
		--icon-size: 20px;
		padding: 10px;
		border-radius: 50%;
		filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.3));
		opacity: 0;
		position: relative;
		transition-duration: 0.3s;
	}

	.helper-item:first-child button,
	.helper-container button,
	.helper-container i {
		pointer-events: all;
		opacity: 1;
	}

	.helper-container button:hover {
		background-color: #f3f3f3;
	}

	.helper-container:hover .helper-item * {
		opacity: 1;
	}

	.helper-container p,
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

	.helper-container p {
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

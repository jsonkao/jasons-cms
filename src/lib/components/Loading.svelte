<script>
	import { fade, slide } from 'svelte/transition';
	import { currentStep } from '$lib/stores/status.js';
	import { STEPS } from '$lib/constants.js';
</script>

{#if $currentStep.number < STEPS.EDITOR_READY.number}
	<div class="loading-container" transition:fade>
		<div class="progress-container">
			<div
				class="progress-bar"
				style="width: {($currentStep.number / STEPS.EDITOR_READY.number) * 100}%"
			/>
		</div>
		<div class="label">
			{#key $currentStep.label}
				<p out:fade in:slide>
					{$currentStep.label}
				</p>
			{/key}
		</div>

		<div class="tips">
			<p>cmd+e opens the code editor</p>
			<p>cmd+s saves files</p>
		</div>
	</div>
{/if}

<style>
	.loading-container {
		grid-area: 1 / 1;
		width: 100%;
		height: 100vh;
		position: relative;
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.7);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		animation: fade 0.5s;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.label {
		display: grid;
	}

	p {
		margin: 0;
	}

	.label p {
		grid-area: 1 / 1;
		justify-self: center;
		margin-top: 0.6rem;
	}

	.progress-container {
		width: 10rem;
		height: 5px;
		background: #eee;
		border-radius: 2.5px;
	}

	.progress-bar {
		height: 100%;
		background: rgba(255, 0, 255, 0.3);
		border-radius: 2.5px;
		transition: width 0.2s ease-out;
	}

	.tips p {
		color: #bbb;
		text-align: center;
	}
</style>

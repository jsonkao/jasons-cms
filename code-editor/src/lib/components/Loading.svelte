<script>
	import { fade, slide } from 'svelte/transition';
	import { progress } from '$lib/stores/status.ts';
	import { steps } from '$lib/constants.js';

	const numberOfSteps = Object.keys(steps).length - 1;
</script>

{#if $progress && $progress.number !== steps.EDITOR_READY.number}
	<div class="loading-container" transition:fade>
		<div class="progress-container">
			<div class="progress-bar" style="width: {($progress.number / numberOfSteps) * 100}%" />
		</div>
		<div class="label">
			{#key $progress.label}
				<p out:fade in:slide>
					{$progress.label}
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
		height: 100%;
		position: relative;
		/* backdrop-filter: blur(10px); */
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
		-webkit-font-smoothing: antialiased;
		font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
		font-size: 1.1rem;
		line-height: 1.5;
		color: #121212;
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
		background: #ccc;
		border-radius: 2.5px;
		transition: width 0.2s ease-out;
	}

	.tips p {
		color: #bbb;
		text-align: center;
	}
</style>

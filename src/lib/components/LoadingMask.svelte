<script>
	import { fade, slide } from 'svelte/transition';
	import { progress } from '$lib/stores';
</script>

{#if $progress.length > 0}
	<div transition:fade>
		<p>
			{#each $progress as item}
				<span in:slide>{item}</span>
			{/each}
		</p>
	</div>
{/if}

<style>
	div {
		grid-area: 1 / 1;
		width: 100%;
		height: 100%;
		position: relative;
		backdrop-filter: blur(10px);
		background: #eee;
	}

	p {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		-webkit-font-smoothing: antialiased;
		font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
		font-size: 1.1rem;
		line-height: 1.5;
		color: #121212;
	}

	span {
		display: block;
	}
</style>

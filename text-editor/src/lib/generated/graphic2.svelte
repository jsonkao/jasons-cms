<script>
	import { easeCircleIn, easeQuadOut, easeSinIn } from 'https://cdn.jsdelivr.net/npm/d3-ease/+esm';

	const array = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
</script>

<div class="container">
	{#each array as i}
		<div style:--size={easeCircleIn(i)} />
	{/each}
</div>
<div class="container">
	{#each array as i}
		<div style:--size={easeQuadOut(i)} />
	{/each}
</div>
<div class="container">
	{#each array as i}
		<div style:--size={easeSinIn(i)} />
	{/each}
</div>

<style>
	.container {
		position: relative;
		display: flex;
		gap: 5px;
		align-items: center;
	}

	.container div {
		--base: 60px;
		width: calc(var(--base) * var(--size));
		height: calc(var(--base) * var(--size));
		border-radius: 50%;
		border: 1px solid black;
	}
</style>

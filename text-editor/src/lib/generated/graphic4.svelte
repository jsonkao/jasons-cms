<script>
	// SEED REMOVE START
	export let data; data;
	// SEED REMOVE END

	import { onMount } from 'svelte';

	let oilData = [];
	let maxCost = 1;

	async function getData() {
		const response = await fetch(
			'https://static.propublica.org/projects/graphics/2024-oil-cleanup/testing/states.json'
		);
		const oilData = await response.json();
		return oilData.sort((a, b) => b.cost - a.cost).slice(0, 12);
	}

	onMount(async () => {
		oilData = await getData();
		maxCost = Math.max(...oilData.map((d) => d.cost));
	});
</script>

<div class="container">
	{#each oilData as { cost, state, bonds }}
		{@const size = Math.pow(cost / maxCost, 0.5)}
		<div class="square" style:--size={size}>
			<p>{state}</p>
			<div class="square" style:--size={size * Math.pow(bonds / cost, 0.5)} />
		</div>
	{/each}
</div>

<style>
	.container {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		width: calc(100% - 40px);
		max-width: 1050px;
		margin: 0 auto;
		gap: 2px;
	}

	.square {
		--max-size: 280px;
		width: calc(var(--size) * var(--max-size));
		height: calc(var(--size) * var(--max-size));
		box-sizing: border-box;
		border: 1px solid black;
		overflow: hidden;
		position: relative;
	}

	.square .square {
		position: absolute;
		bottom: 0;
		border: none;
		background: black;
	}

	p {
		font-size: 12px;
		padding: 4px;
	}

	@media (max-width: 960px) {
		.square {
			--max-size: 200px;
		}
	}
</style>

<script>
	// SEED REMOVE START
	/** @type {import('yjs').Map<any>} */ export let prose;
	import Editable from '$lib/components/Editable.svelte';
	// SEED REMOVE END

	const copy = [
		'Years ago, the all-white judges of a Louisiana appellate court decided, in secret, to systematically ignore petitions filed by prisoners, most of them Black, who claimed they had been unjustly convicted.',
		'This is the story of a horrendous injustice and the three people who tried to expose it. It begins with a suicide note.'
	];

	const images = [
		'PPUB-001-louisiana_fifth-papers-1',
		'PPUB-001-louisiana_fifth-papers-2',
		'PPUB-001-louisiana_fifth-papers-3'
	];

	let scrollY = 0;
</script>

<svelte:window bind:scrollY />

<div class="paper-opener">
	<div class="images">
		<img
			src="https://static.propublica.org/projects/graphics/2023-la-5th-circuit/backgrounds/1200.webp"
		/>

		{#each images as name, i}
			<img
				src="https://static.propublica.org/projects/graphics/2023-la-5th-circuit/layers/{name}.webp"
				style="transform: translateY({(0.15 + i * 0.1) * scrollY}px);"
			/>
		{/each}
	</div>

	<div class="copy">
		{#each [0, 1] as index}
			<div style="top: {index === 0 ? 6 : 53}%">
				<p>{copy[index]}</p>
				<!-- <Editable {prose} key={index.toString()} /> -->
			</div>
		{/each}
	</div>
</div>

<style>
	.paper-opener,
	.images {
		display: grid;
	}

	.images > *,
	.paper-opener > * {
		grid-row: 1;
		grid-column: 1;
	}

	img {
		width: 100%;
		aspect-ratio: 1 / 2.335;
	}

	.copy {
		width: 100%;
		position: relative;
		text-align: center;
	}

	.copy div {
		position: absolute;
		max-width: 520px;
		left: 50%;
		transform: translateX(-50%);
	}

	.copy div:last-child {
		color: white;
	}
</style>

<script>
	const copy = [
		'Years ago, the all-white judges of a Louisiana appellate court decided, in secret, to systematically ignore petitions filed by prisoners, most of them Black, who claimed they had been unjustly convicted.',
		'This is the story of a horrendous injustice and the three people who tried to expose it. It begins with a suicide note.'
	];

	const backgroundImage =
		'https://static.propublica.org/projects/graphics/2023-la-5th-circuit/backgrounds/1200.webp';
	const foregroundImages = [
		'https://static.propublica.org/projects/graphics/2023-la-5th-circuit/layers/PPUB-001-louisiana_fifth-papers-1.webp',
		'https://static.propublica.org/projects/graphics/2023-la-5th-circuit/layers/PPUB-001-louisiana_fifth-papers-2.webp',
		'https://static.propublica.org/projects/graphics/2023-la-5th-circuit/layers/PPUB-001-louisiana_fifth-papers-3.webp'
	];

	let scrollY = 0;
</script>

<svelte:window bind:scrollY />

<div class="paper-opener">
	<div class="images">
		<img crossorigin="anonymous" src={backgroundImage} alt="" />

		{#each foregroundImages as src, i}
			<img crossorigin="anonymous" {src} style="transform: translateY({(0.15 + i * 0.1) * scrollY}px);" alt="" />
		{/each}
	</div>

	<div class="copy">
		{#each [0, 1] as index}
			<div>
				<p>{copy[index]}</p>
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
		top: 6%;
	}

	.copy div:last-child {
		color: white;
		top: 53%;
	}
</style>
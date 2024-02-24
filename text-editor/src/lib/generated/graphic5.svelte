<script>
	import { feature } from 'topojson-client';
	import { geoPath, geoAlbersUsa } from 'd3-geo';
	import { onMount } from 'svelte';

	export let data;

	const geojson = feature(data.topojson, data.topojson.objects.nation);

	const padding = 10;
	let width = 0;
	let height = 0;
	let paths = [];

	onMount(() => {
		draw();
		window.addEventListener('resize', draw);
		return () => window.removeEventListener('resize', draw);
	});

	function draw() {
		const projection = geoAlbersUsa().fitWidth(width - padding * 2, geojson);
		const pathFn = geoPath(projection);
		paths = [pathFn(geojson)];
		height = pathFn.bounds(geojson)[1][1] + padding * 2;
	}
</script>

<div bind:clientWidth={width} style="height: {height}px">
	<svg>
		<g style="transform: translate({padding}px, {padding}px)">
			{#each paths as path}
				<path d={path} />
			{/each}
		</g>
	</svg>
</div>

<style>
	div {
		width: 100%;
	}

	svg {
		width: 100%;
		height: 100%;
	}

	path {
		stroke: black;
		fill: none;
	}
</style>

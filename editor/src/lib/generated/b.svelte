<script>
	import { onMount } from 'svelte';

	let fontSize = 16;

	onMount(() => {
		const interval = setInterval(() => (fontSize = Math.random() * 100), 1000);
		return () => clearInterval(interval);
	});
</script>

<div>
	<p style:font-size="{fontSize}px">Hello world</p>
</div>

<style>
	div {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 150vh;
		background: rgba(0, 0, 255, 0.1);
		border: 1px solid blue;
	}

	p {
		transition-duration: 0.2s;
	}
</style>

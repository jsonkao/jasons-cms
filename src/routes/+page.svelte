<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<div class="container">
	<h1>Stories</h1>
	{#each data.slugs as slug}
		<p><a href="/edit/{slug}" data-sveltekit-reload>{slug}</a></p>
	{/each}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}

	p {
		margin: 0;
	}
</style>

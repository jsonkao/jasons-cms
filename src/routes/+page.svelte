<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<div class="container">
	<p class="title">Stories</p>
	{#each data.slugs as slug}
		<p><a href="/edit/{slug}" data-sveltekit-reload>{slug}</a></p>
	{/each}
</div>

<style>
	:global(body) {
		box-sizing: border-box;
		min-height: 100svh;
		border: 5px solid rgba(255, 0, 255, 0.15);
		border-bottom: none;
	}

	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 10rem;
	}

	p {
		margin: 0;
	}

	.title {
		margin-bottom: 2rem;
		font-weight: bold;
	}

	a {
		color: inherit;
		text-decoration: none;
		border-bottom: 1px solid #0002;
		transition: border-color 0.2s;
	}

	a:hover {
		border-bottom-color: #0009;
	}
</style>

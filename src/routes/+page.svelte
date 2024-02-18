<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<div class="container">
	{#each data.slugs as slug}
		<p><a href="/edit/{slug}" data-sveltekit-reload>{slug}</a></p>
	{/each}
	<p>Jason’s CMS</p>
</div>

<style>
	:global(body) {
		min-height: 100svh;
		border-top: 5px solid rgba(255, 0, 255, 0.15);
	}

	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 9rem;
	}

	p {
		margin: 0;
	}

	p:last-child {
		margin-top: 3rem;
	}

	a {
		color: inherit;
		text-decoration: none;
		border-bottom: 1px solid #0003;
		transition: border-color 0.2s;
	}

	a:hover {
		border-bottom-color: #000a;
	}
</style>

<script>
	import { browser } from '$app/environment';

	/** @type {import('./$types').PageData} */
	export let data;
	const { slug } = data;
	if (!slug) throw new Error('No slug provided');
</script>

{#if browser}
	{#await import(`./Preview.svelte`) then { default: Preview }}
		<Preview {slug} />
	{/await}
{/if}

<script>
	import Content from './Content.svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	const { rawContent } = data;
</script>

<Content {rawContent} />

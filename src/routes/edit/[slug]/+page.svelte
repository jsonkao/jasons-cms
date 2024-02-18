<script>
	import Editor from './Editor.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<Editor slug={data.slug} />

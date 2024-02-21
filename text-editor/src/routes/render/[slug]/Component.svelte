<script>
	import components from './generated/components.js';

	/** @type {string} */
	export let name;

	/** @type {{ slug: string }} */
	export let data;

	if (!(data.slug in components) || !(name in components[data.slug])) {
		throw new Error(`Component not found. Slug: ${data.slug}. Name: ${name}`);
	}
	const component = components[data.slug][name];
</script>

<div>
	<svelte:component this={component} {data} />
</div>

<script>
	import components from './generated/components.js';

	/** @type {string} */
	export let name;

	/** @type {import('../../../routes/$types').PageData} */
	export let data;

	const component = components[data.slug][name];
	if (!component) {
		throw new Error(`Component not found. Slug: ${data.slug}. Name: ${data.name}`);
	}
</script>

<div>
	<svelte:component this={component} {data} />
</div>

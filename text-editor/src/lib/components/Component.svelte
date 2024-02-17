<script>
	import components from '$lib/generated/index.js';

	/** @type {string} */
	export let name;

	/** @type {BlockMap} */
	export let blockMap;

	/** @type {import('../../routes/$types').PageData} */
	export let data;
</script>

<div data-name={name}>
	<svelte:component this={components[name]} prose={blockMap.get('prose')} {data} />
</div>

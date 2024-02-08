<script>
	import components from '$lib/generated/index.js';

	/** @type {string} */
	export let name;

	/** @type {BlockMap} */
	export let blockMap;
</script>

<div data-name={name}>
	<svelte:component this={components[name]} prose={blockMap.get('prose')} />
</div>

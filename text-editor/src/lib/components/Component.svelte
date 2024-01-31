<script>
	import components from '$lib/generated/index.js';

	/** @type {string} */
	export let name;
</script>

<div data-name={name}>
	<svelte:component this={components[name]} />
</div>

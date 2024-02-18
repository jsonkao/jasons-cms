<script>
	import components from './generated/index.js';

	/** @type {string} */
	export let name;

	/** @type {string} */
	export let slug;
</script>

<div>
	<svelte:component this={components[slug][name]} />
</div>

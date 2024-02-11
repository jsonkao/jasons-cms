<script>
	import components from './generated/index.js';

	/** @type {string} */
	export let name;
</script>

<div>
	<svelte:component this={components[name]} />
</div>

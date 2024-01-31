<script lang="ts">
	import components from '$lib/generated/index.js';

	export let block: GraphicBlock;
	const name = block.name as keyof typeof components; // A hasty assertion
</script>

<div data-name={name}>
	<svelte:component this={components[name]} />
</div>

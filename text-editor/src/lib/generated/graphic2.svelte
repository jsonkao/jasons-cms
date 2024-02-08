<script>
	/** @type {import('yjs').Map<any>} */ export let prose;

	import Editable from '$lib/components/Editable.svelte';

	console.log(prose);
</script>

<div class="container">
	<div class="background">
		<div />
	</div>
	<div class="foreground">
		{#each ['setup', 'detail', 'sweep'] as key}
			<section>
				<Editable {prose} {key} />
			</section>
		{/each}
	</div>
</div>

<style>
	.container {
		position: relative;
	}

	.background {
		position: sticky;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		top: 0;
		z-index: -1;
	}

	.background div {
		height: calc(100vh - 40px);
		width: min(840px, calc(100% - 40px));
		background: wheat;
	}

	.foreground {
		margin-top: -50vh;
		padding-bottom: 10vh;
	}

	section {
		font-family: Arial;
		font-size: 20px;
		line-height: 1.5;
		background: white;
		margin: 0 auto 60vh;
		max-width: 520px;
		padding: 10px 14px;
		box-shadow: 0px 2px 5px 0px #0003;
	}
</style>

<script>
	import { compile } from 'svelte/compiler';
	import { SharedDoc } from '$lib/shared/shared-doc';

	/** @type {string} */
	export let slug;

	/** @type {HTMLDivElement} */
	let container;

	const doc = new SharedDoc({ name: 'TEST', color: 'red' }, slug);
	const { yarrayStore } = doc;

	$: preview($yarrayStore);

	/** @param {Array<BlockMap>} blocks */
	function preview(blocks) {
		if (!container) return;
		if (blocks.length === 0) return;

		blocks.forEach((block) => {
			if (block.get('type') !== 'graphic') return;

			const source = block.get('code')?.toString();

			const { js, css } = compile(source, {
				name: block.get('name'),
				generate: 'ssr',
			});

			const style = document.createElement('style');
			style.innerHTML = css.code;
			const script = document.createElement('script');
			// script.textContent = `${js.code}; new ${block.get('name')}({ target: document.getElementById('${block.get('name')}') })`;
			script.textContent = `${js.code}; console.log(${block.get('name')})`;
			script.type = 'module';

			// eval(script.textContent)

			container.appendChild(style);
			container.appendChild(script);
		});
	}
</script>

<div bind:this={container} />

<div id="graphic1" />
<div id="graphic2" />

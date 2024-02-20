<script>
	import { browser } from '$app/environment';
	import './cursor.css';

	/** @type {import('./$types').PageData} */
	export let data;

	/**
	 * Listen for Cmd+E to toggle the editor or Cmd+S to save the file
	 * @param {KeyboardEvent} e
	 */
	function onKeydown(e) {
		if (e.metaKey && e.key === 'e') {
			e.preventDefault();
			window.parent.postMessage({ type: 'toggleEditor' }, '*');
		}
	}
</script>

<svelte:window on:keydown={onKeydown} />

{#if browser}
	{#await import(`$lib/components/Blocks.svelte`) then { default: Blocks }}
		<Blocks {data} />
	{/await}
{/if}

<script>
	import Blocks from '$lib/components/Blocks.svelte';
	import './styles.css';

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

<Blocks />

/**
 * On HMR update, notify the parent window of coding area dimensions. The parent
 * needs this data to make the minimap.
 */

/**
 * Begin listening
 * @param {HTMLElement} contentElement The element containing content (text and graphics)
 */
export function startHMRListening(contentElement) {
	import.meta.hot?.on('vite:afterUpdate', hmrCallback);

	/**
	 * Post new heights if anything graphics-related changed
	 * @param {import('vite').UpdatePayload} payload
	 */
	function hmrCallback({ updates }) {
		const graphicsChanged = updates.some(({ path }) => path.startsWith('/src/lib/generated/'));
		const indexChanged = updates
			.map((u) => u.path)
			.includes('/src/lib/components/Component.svelte');

		if (graphicsChanged || indexChanged) postHeights(contentElement);
	}
}

/**
 * Compute client heights of all content blocks on the page and post them to parent
 * @param {HTMLElement} contentElement
 */
export function postHeights(contentElement) {
	/** @type {import('shared').BlockHeights} */
	const blockHeights = {};

	Array.from(contentElement.children).forEach((div) => {
		const name = div.getAttribute('data-name');
		if (name) blockHeights[name] = div.clientHeight;
	});

	// Notify the parent window of the new dimensions
	window.parent.postMessage({ type: 'blockHeights', blockHeights }, '*');
}

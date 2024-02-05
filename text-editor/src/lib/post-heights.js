/**
 * I only need to import the HMR script, which notifies the parent window
 * of coding area dimensions on HMR reload for the parent's code editor minimap.
 */

/**
 * Begin listening
 * @param {HTMLElement} contentElement The element containing content (text and graphics)
 */
export function startHMRListening(contentElement) {
	if (import.meta.hot) {
		import.meta.hot.on(
			'vite:afterUpdate',
			/** @param {import('vite').UpdatePayload} payload */ ({ updates }) => {
				// Could make it more fine-grained by checking and getting dimensions only for the specific file that changed
				if (
					!updates.some(
						(update) =>
							update.path.startsWith('/src/lib/generated/') || // Changes in graphics
							update.path === '/src/lib/components/Component.svelte' // Changes in the graphics index, which Component.svelte imports
					)
				)
					return;

				postHeights(contentElement);
			}
		);
	}
}

/**
 * Compute client heights of all content blocks on the page and post them to parent
 * @param {HTMLElement} contentElement The element containing content (text and graphics)
 */
export function postHeights(contentElement) {
	/** @type {import('shared').BlockHeights} Get the heights of all graphics */
	const blockHeights = {};
	Array.from(contentElement.children).forEach((div) => {
		const name = div.getAttribute('data-name');
		if (name) blockHeights[name] = div.clientHeight;
	});

	// Notify the parent window of the new dimensions
	window.parent.postMessage({ type: 'blockHeights', blockHeights }, '*');
}

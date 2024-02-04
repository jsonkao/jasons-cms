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
		import.meta.hot.on('vite:afterUpdate', afterUpdateCallback);
	}

	/**
	 * @param {import('vite').UpdatePayload} payload
	 */
	function afterUpdateCallback({ updates }) {
		// Could make it more fine-grained by checking and getting dimensions only for the specific file that changed
		if (
			!updates.some(
				(update) =>
					update.path.startsWith('/src/lib/generated/') || // Changes in graphics
					update.path === '/src/lib/Component.svelte' // Changes in the graphics index, which Component.svelte imports
			)
		)
			return;

		/** @type {Array<BlockHeight>} Get the heights of all graphics */
		const heights = Array.from(contentElement.children).map(
			/** @returns {BlockHeight} */ (div) => {
				const name = div.getAttribute('data-name');
				if (name) {
					return {
						type: 'graphic',
						name,
						height: div.clientHeight
					};
				} else if (div.classList.contains('ui-editor')) {
					return { type: 'text', height: div.clientHeight };
				} else {
					throw new Error('Completely unexpected!');
				}
			}
		);

		// Notify the parent window of the new dimensions
		window.parent.postMessage({ type: 'heights', heights }, '*');
	}
}

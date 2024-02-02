import { otherCoders } from '$lib/stores/code-editor.js';

/**
 * Listens to number of coders on an awareness instance
 * @param {import('y-protocols').Awareness} awareness
 */
export function listenToNumberOfCoders(awareness) {
	awareness.on('change', ({ added, updated, removed }) => {
		otherCoders.set(
			[...awareness.getStates().values()].map((state) => state.user).filter((user) => user.coding)
		);
	});
}

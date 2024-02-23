import { otherCoders as otherCodersStore } from './stores/code-editor';

/**
 * @param {import('y-protocols/awareness').Awareness} awareness
 */
export function trackOtherCoders(awareness) {
	awareness.on('change', () => {
		const states = awareness.getStates();
		const otherClients = [...states.keys()].filter((clientID) => clientID !== awareness.clientID);
		otherCodersStore.set(
			otherClients
				.map((clientID) => states.get(clientID)?.user)
				.filter((user) => user && user.coding)
		);
	});
}

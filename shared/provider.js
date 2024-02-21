import { createClient } from '@liveblocks/client';
import LiveblocksProvider from '@liveblocks/yjs';

const client = createClient({
	publicApiKey: 'pk_dev_1iisK8HmLpmVOreEDPQqeruOVvHWUPlchIagQpCKP-VIRyGkCF4DDymphQiiVJ6A'
});

/**
 * @param {{ color: string, name: string }} user
 * @param {string} slug
 */
export function setupProvider(user, slug) {
	const { room, leave } = client.enterRoom(slug, { initialPresence: {} });

	return {
		/**
		 * Creates the provider
		 * @param {import('yjs').Doc} ydoc
		 */
		instantiate(ydoc) {
			const { awareness } = new LiveblocksProvider(room, ydoc);
			awareness.setLocalStateField('user', user);

			return awareness;
		},
		leave
	};
}

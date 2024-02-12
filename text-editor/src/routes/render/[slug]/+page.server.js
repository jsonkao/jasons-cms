import { Liveblocks as LiveblocksNode } from '@liveblocks/node';
import { LIVEBLOCKS_SECRET_KEY } from '$env/static/private';
import * as Y from 'yjs';

const liveblocks = new LiveblocksNode({
	secret: /** @type {string} */ (LIVEBLOCKS_SECRET_KEY)
});

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const ydoc = new Y.Doc();
	const update = await liveblocks.getYjsDocumentAsBinaryUpdate(params.slug);
	Y.applyUpdate(ydoc, new Uint8Array(update));

	const blocks = ydoc.getArray('blocks').toJSON();
	return {
		blocks,
		slug: params.slug
	};
}

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
	const rooms = await liveblocks.getRooms();
	return rooms.data.map((room) => ({ slug: room.id }));
}

export const prerender = true;

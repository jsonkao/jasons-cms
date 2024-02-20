import { Liveblocks as LiveblocksNode } from '@liveblocks/node';
import { LIVEBLOCKS_SECRET_KEY } from '$env/static/private';
import * as Y from 'yjs';
import * as pageServerLoadFunctions from './generated/page-server-functions.js';
import { BLOCKS_KEY } from '$shared/constants';

const liveblocks = new LiveblocksNode({
	secret: /** @type {string} */ (LIVEBLOCKS_SECRET_KEY)
});

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const ydoc = new Y.Doc();
	const update = await liveblocks.getYjsDocumentAsBinaryUpdate(params.slug);
	Y.applyUpdate(ydoc, new Uint8Array(update));
	const blocks = ydoc.getArray(BLOCKS_KEY).toJSON();

	return {
		blocks,
		slug: params.slug,
		...(await pageServerLoadFunctions[params.slug.replaceAll('-', '_')]())
	};
}

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
	const rooms = await liveblocks.getRooms();
	return rooms.data.map((room) => ({ slug: room.id }));
}

export const prerender = false;
export const ssr = false;

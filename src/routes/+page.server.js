import { Liveblocks as LiveblocksNode } from '@liveblocks/node';
import { LIVEBLOCKS_SECRET_KEY } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const liveblocks = new LiveblocksNode({
		secret: /** @type {string} */ (LIVEBLOCKS_SECRET_KEY)
	});
	const rooms = await liveblocks.getRooms();
	return { slugs: rooms.data.map((room) => room.id) };
}

export const prerender = true;

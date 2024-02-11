import { Liveblocks as LiveblocksNode } from '@liveblocks/node';
import { LIVEBLOCKS_SECRET_KEY } from '$env/static/private';
import * as Y from 'yjs';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const liveblocks = new LiveblocksNode({
		secret: /** @type {string} */ (LIVEBLOCKS_SECRET_KEY)
	});

	const ydoc = new Y.Doc();
	const update = await liveblocks.getYjsDocumentAsBinaryUpdate(params.slug);
	Y.applyUpdate(ydoc, new Uint8Array(update));

	const blocks = ydoc.getArray('blocks').toJSON();
	return {
		blocks
	};
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	const slug = process.env.SLUG;
	if (slug === undefined) throw new Error('SLUG environment variable is not set');
	return [{ slug }];
}

export const prerender = true;

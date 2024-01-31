import { error } from '@sveltejs/kit';
import { getBlocks } from '$lib/server/database';

/** @type {import('./$types').PageLoad} */
export async function load() {
	try {
		return {
			blocks: await getBlocks()
		};
	} catch (e) {
		error(505, { message: `Unable to fetch blocks: ${e}` });
	}
}

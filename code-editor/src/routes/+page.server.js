import { error } from '@sveltejs/kit';
import { getInitialGraphics } from '$lib/server/database';

/** @type {import('./$types').PageLoad} */
export async function load() {
	try {
		return {
			initialGraphics: await getInitialGraphics()
		};
	} catch (e) {
		error(505, { message: `Unable to fetch blocks: ${e}` });
	}
}

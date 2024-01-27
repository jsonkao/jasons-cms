import { error } from '@sveltejs/kit';
import { getBlocks } from '$lib/server/database';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		return {
			blocks: await getBlocks()
		};
	} catch (e) {
		error(505, { message: `Unable to fetch blocks: ${e}` });
	}
};

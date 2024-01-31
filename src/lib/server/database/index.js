import { Liveblocks } from '@liveblocks/node';
import { LIVEBLOCKS_SECRET_KEY } from '$env/static/private';

const liveblocks = new Liveblocks({ secret: LIVEBLOCKS_SECRET_KEY });
const yjsDoc = await liveblocks.getYjsDocument('my-room');

/**
 * Gets blocks data from the Yjs document. It takes the list of blocks from the Yjs document and
 * maps through them. If the block is a graphic block, it sets the code property to the code from
 * the Yjs document. Otherwise, it returns the block as is.
 * @returns {Block[]} - The blocks data
 */
export const getBlocks = () =>
	/** @type {Array<TextBlock | { type: 'graphic'; name: string }>} */ (yjsDoc['blocks']).map(
		(block) => {
			if (block.type === 'graphic') {
				return {
					...block,
					code: /** @type {string} */ (yjsDoc[`/src/lib/generated/${block.name}.svelte`])
				};
			}
			return block;
		}
	);

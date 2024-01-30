import { Liveblocks } from '@liveblocks/node';
import { LIVEBLOCKS_SECRET_KEY } from '$env/static/private';

const liveblocks = new Liveblocks({ secret: LIVEBLOCKS_SECRET_KEY });
const yjsDoc = await liveblocks.getYjsDocument('my-room');

export function getBlocks(): Block[] {
	// Map through the example data. If the block is a graphic block, set the code property to the code from the Yjs document. Otherwise, return the block as is.
	const blocks = (yjsDoc['blocks'] as Array<TextBlock | { type: 'graphic'; name: string }>).map(
		(block) => {
			if (block.type === 'graphic') {
				return {
					...block,
					code: yjsDoc[`/src/lib/generated/${block.name}.svelte`] as string
				};
			}
			return block;
		}
	);

	return blocks;
}

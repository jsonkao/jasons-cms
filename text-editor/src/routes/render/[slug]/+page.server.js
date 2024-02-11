import { Liveblocks as LiveblocksNode } from '@liveblocks/node';
import { LIVEBLOCKS_SECRET_KEY } from '$env/static/private';
import * as Y from 'yjs';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, join } from 'path';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const liveblocks = new LiveblocksNode({
		secret: /** @type {string} */ (LIVEBLOCKS_SECRET_KEY)
	});

	const ydoc = new Y.Doc();
	const update = await liveblocks.getYjsDocumentAsBinaryUpdate(params.slug);
	Y.applyUpdate(ydoc, new Uint8Array(update));

	const blocks = ydoc.getArray('blocks').toJSON();
	const graphicBlocks = blocks.filter(({ type }) => type === 'graphic');
	const path = resolve(__dirname, 'generated');
	if (!existsSync(path)) await fs.mkdir(path);

	console.log(path);
	console.log(graphicBlocks.map((block) => join(path, `${block.name}.svelte`)));

	// Save all Svelte components to disk
	await Promise.all([
		...graphicBlocks.map((block) => fs.writeFile(join(path, `${block.name}.svelte`), block.code)),
		fs.writeFile(
			join(path, 'index.js'),
			graphicBlocks.map(({ name }) => `import ${name} from './${name}.svelte';`).join('\n') +
				`\nexport default { ${graphicBlocks.map(({ name }) => name).join(', ')} };`
		)
	]);

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

import { Liveblocks as LiveblocksNode } from '@liveblocks/node';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import * as Y from 'yjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
	const { SLUG: slug, LIVEBLOCKS_SECRET_KEY } = process.env;

	if (slug === undefined) throw new Error('SLUG environment variable is not set');
	if (LIVEBLOCKS_SECRET_KEY === undefined)
		throw new Error('LIVEBLOCKS_SECRET_KEY environment variable is not set');

	const liveblocks = new LiveblocksNode({
		secret: LIVEBLOCKS_SECRET_KEY
	});

	const ydoc = new Y.Doc();
	const update = await liveblocks.getYjsDocumentAsBinaryUpdate(slug);
	Y.applyUpdate(ydoc, new Uint8Array(update));

	const blocks = ydoc.getArray('blocks').toJSON();
	const graphicBlocks = blocks.filter(({ type }) => type === 'graphic');
	const path = resolve(__dirname, '../src/routes/render/[slug]/generated');
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

main().catch(console.error);

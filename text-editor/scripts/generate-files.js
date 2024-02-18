import { Liveblocks as LiveblocksNode } from '@liveblocks/node';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import * as Y from 'yjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generates Svelte components from the Yjs document and saves them to disk
 */
async function main() {
	const { LIVEBLOCKS_SECRET_KEY } = process.env;
	if (LIVEBLOCKS_SECRET_KEY === undefined)
		throw new Error('LIVEBLOCKS_SECRET_KEY environment variable is not set');

	const liveblocks = new LiveblocksNode({
		secret: LIVEBLOCKS_SECRET_KEY
	});

	const generatedPath = resolve(__dirname, `../src/routes/render/[slug]/generated`);
	const rooms = (await liveblocks.getRooms()).data;
	const svelteFilenames = await Promise.all(
		rooms.map(({ id }) => generateFiles(liveblocks, generatedPath, id))
	);

	const importLines = svelteFilenames.map(({ imports }) => imports).join('\n');
	const exportLines = '{\n\t' + svelteFilenames.map(({ exports }) => exports).join(',\n\t') + '\n}';

	await fs.writeFile(
		join(generatedPath, 'index.js'),
		importLines + '\n\nexport default ' + exportLines + ';\n'
	);

	throw new Error(
		'something u gotta do: dynamically generate page-level files like +page.server.js'
	);
}

/**
 * Generate files for one document
 * @param {LiveblocksNode} liveblocks
 * @param {string} generatedPath
 * @param {string} slug
 */
async function generateFiles(liveblocks, generatedPath, slug) {
	const ydoc = new Y.Doc();
	const update = await liveblocks.getYjsDocumentAsBinaryUpdate(slug);
	Y.applyUpdate(ydoc, new Uint8Array(update));

	const blocks = /** @type {import('$shared').Block[]} */ (ydoc.getArray('blocks').toJSON());
	const graphicBlocks = /** @type {import('$shared').GraphicBlock[]} */ (
		blocks.filter(({ type }) => type === 'graphic')
	);

	const path = resolve(generatedPath, slug);
	if (!existsSync(path)) await fs.mkdir(path, { recursive: true });

	// Save all Svelte components to disk
	await Promise.all(
		graphicBlocks.map((block) =>
			fs.writeFile(join(path, `${block.name}.svelte`), hackyModifications(block.code))
		)
	);

	return {
		imports: graphicBlocks
			.map(({ name }) => `import ${slug}_${name} from './${slug}/${name}.svelte';`)
			.join('\n'),
		exports: `'${slug}': {${graphicBlocks.map(({ name }) => `${name}: ${slug}_${name}`).join(', ')}}`
	};
}

/**
 * Applies same hacky modifications to the code as in the WebContainer, except without Editable stuff.
 * Should probably be deduped
 * @param {string} code
 */
function hackyModifications(code) {
	// Add crossorigin="anonymous" to all img tags
	code = code.replace(/<img\W/g, '<img crossorigin="anonymous" ');
	return code;
}

main().catch(console.error);

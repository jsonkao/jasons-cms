import { Liveblocks as LiveblocksNode } from '@liveblocks/node';
import { existsSync } from 'fs';
import { BLOCKS_KEY, PAGE_FILES_KEY, PAGE_LEVEL_FILES } from '../../shared/constants.js';
import fs from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import * as Y from 'yjs';

/** The path to this script */
const __filename = fileURLToPath(import.meta.url);
/** The directory of this script */
const __dirname = dirname(__filename);

/**
 * Saves the Svelte components and page-level files from the Yjs document to local disk
 */
async function main() {
	const { LIVEBLOCKS_SECRET_KEY } = process.env;
	if (LIVEBLOCKS_SECRET_KEY === undefined) {
		console.error('LIVEBLOCKS_SECRET_KEY environment variable is not set');
		return;
	}

	const liveblocks = new LiveblocksNode({
		secret: LIVEBLOCKS_SECRET_KEY
	});

	const generatedFilesPath = resolve(__dirname, `../src/routes/render/[slug]/generated`);
	const rooms = (await liveblocks.getRooms()).data;

	/* Generate Svelte components and index.js file */

	const svelteFiles = await Promise.all(
		rooms.map(({ id }) => generateFiles(liveblocks, generatedFilesPath, id))
	);

	await fs.writeFile(
		join(generatedFilesPath, 'components.js'),
		generateComponentLookup(svelteFiles)
	);

	await fs.writeFile(
		join(generatedFilesPath, 'page-server-functions.js'),
		svelteFiles.map(({ pageServerFunctionExport }) => pageServerFunctionExport).join('\n')
	);
}

/**
 * Generates an index file for all Svelte components
 * @param {Array<Awaited<ReturnType<generateFiles>>>} svelteFiles
 */
export function generateComponentLookup(svelteFiles) {
	/**
	 * Generates name of component to be imported and exported
	 * @param {string} slug
	 * @param {string} name
	 */

	const exportName = (slug, name) => `${slug.replaceAll('-', '_')}_${name.replaceAll('-', '_')}`;
	const componentImports = svelteFiles
		.map(({ slug, graphicNames }) =>
			graphicNames
				.map((name) => `import ${exportName(slug, name)} from './${slug}/${name}.svelte';`)
				.join('\n')
		)
		.join('\n');
	const componentExports =
		'{\n\t' +
		svelteFiles
			.map(
				({ slug, graphicNames }) =>
					`'${slug}': {${graphicNames.map((name) => `'${name}': ${exportName(slug, name)}`).join(', ')}}`
			)
			.join(',\n\t') +
		'\n}';
	return componentImports + '\n\nexport default ' + componentExports + ';\n';
}

/**
 * Generate files for one document. Returns the import and export lines to be coalesced in the index.js file
 * @param {LiveblocksNode} liveblocks
 * @param {string} generatedPath
 * @param {string} slug
 */
async function generateFiles(liveblocks, generatedPath, slug) {
	const ydoc = new Y.Doc();
	const update = await liveblocks.getYjsDocumentAsBinaryUpdate(slug);
	Y.applyUpdate(ydoc, new Uint8Array(update));

	const path = resolve(generatedPath, slug);
	if (!existsSync(path)) await fs.mkdir(path, { recursive: true });

	/* Save all Svelte components to disk */

	const blocks = /** @type {import('$shared/types').Block[]} */ (
		ydoc.getArray(BLOCKS_KEY).toJSON()
	);
	const graphicBlocks = /** @type {import('$shared/types').GraphicBlock[]} */ (
		blocks.filter(({ type }) => type === 'graphic')
	);
	await Promise.all(
		graphicBlocks.map((block) =>
			fs.writeFile(join(path, `${block.name}.svelte`), hackyModifications(block.code))
		)
	);

	/* Save page server load function */

	const pageFiles = ydoc.getMap(PAGE_FILES_KEY);
	await Promise.all(
		Object.values(PAGE_LEVEL_FILES).map((file) =>
			fs.writeFile(join(path, file), pageFiles.get(file).toString())
		)
	);
	return {
		graphicNames: graphicBlocks.map(({ name }) => name),
		slug,
		pageServerFunctionExport: `export { load as ${slug.replaceAll('-', '_')} } from './${slug}/+page.server.js';`
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

import { existsSync } from 'fs';
import { BLOCKS_KEY, PAGE_FILES_KEY, PAGE_LEVEL_FILES } from '../../../shared/constants.js';
import fs from 'fs/promises';
import { resolve, join } from 'path';

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
	const getName = (slug, name) => `${slug.replaceAll('-', '_')}_${name.replaceAll('-', '_')}`;

	/** @type {string[]} */
	const componentImports = [];
	/** @type {string[]} */
	const componentExports = [];

	svelteFiles.forEach(({ slug, graphicNames }) => {
		componentImports.push(
			graphicNames
				.map((name) => `import ${getName(slug, name)} from './${slug}/${name}.svelte';`)
				.join('\n')
		);
		componentExports.push(
			`'${slug}': {${graphicNames.map((name) => `'${name}': ${getName(slug, name)}`).join(', ')}}`
		);
	});
	return (
		componentImports.join('\n') +
		'\n\nexport default {\n\t' +
		componentExports.join(',\n\t') +
		'\n};\n'
	);
}

/**
 * Generate files for one document. Returns the import and export lines to be coalesced in the index.js file
 * @param {import('yjs').Doc} ydoc
 * @param {string} generatedPath
 * @param {string} slug
 */
export async function generateFiles(ydoc, generatedPath, slug) {
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

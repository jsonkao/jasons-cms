import { GENERATED_PATH, userColor, userName } from '$lib/constants.js';
import zipped from './files.zip?url';
import unzip from './unzip.cjs?url';

/**
 * Fetch the template files for the WebContainer.
 * @returns {Promise<import('@webcontainer/api').FileSystemTree>} - The template files.
 */
export async function fetchTemplateFiles() {
	const result = await Promise.all([
		fetch(zipped).then((r) => r.arrayBuffer()),
		fetch(unzip).then((r) => r.text())
	]);

	return {
		'files.zip': {
			file: { contents: new Uint8Array(result[0]) }
		},
		'unzip.cjs': {
			file: { contents: result[1] }
		}
	};
}

/**
 * Modify template files and add new files (e.g. graphic components) the WebContainer.
 * This function should run after the WebContainer has been mounted.
 * @param {import('@webcontainer/api').WebContainer} webcontainerInstance - The WebContainer instance
 * @param {Block[]} blocks - The blocks data
 */
export async function amendTemplateFiles(webcontainerInstance, blocks) {
	/**
	 * A helper function to generate a file
	 * @param {string} filename - The name of the file
	 * @param {string} content - The content of the file
	 */
	function writeFile(filename, content) {
		webcontainerInstance.fs.writeFile(`${GENERATED_PATH}/${filename}`, content);
	}

	const graphicBlocks = /** @type {GraphicBlock[]} */ (
		blocks.filter((block) => block.type === 'graphic')
	);

	await Promise.all([
		// Initial write of graphics Svelte files so the dev server starts with a good preview/SSR
		...graphicBlocks.map(({ name, code }) => writeFile(`${name}.svelte`, code)),
		// A lib/index.js file to export all the graphic components
		writeFile(
			'index.js',
			graphicBlocks.map(({ name }) => `import ${name} from './${name}.svelte';`).join('\n') +
				`\nexport default { ${graphicBlocks.map(({ name }) => name).join(', ')} };`
		),
		// A data.json file with blocks data
		writeFile('data.json', JSON.stringify(blocks)),
		// A file for constants that should be shared between the Svelte app and the WebContainer, e.g. cursor name/color
		writeFile(
			'globals.js',
			`export const userName = "${userName}"; export const userColor = "${userColor}";`
		)
	]);
}

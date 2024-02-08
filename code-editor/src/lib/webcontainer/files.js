import { GENERATED_PATH, LIVEBLOCKS_ROOM, userColor, userName } from '$lib/constants.js';
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
 * Write a globals file with constants that should be shared between the Svelte app and the WebContainer, e.g. cursor name/color
 * @param {import('@webcontainer/api').WebContainer} webcontainerInstance - The WebContainer instance
 * @param {string} liveblocksRoom - The Liveblocks room ID
 */
export function writeGlobals(webcontainerInstance, liveblocksRoom) {
	const variables = { userName, userColor, LIVEBLOCKS_ROOM: liveblocksRoom };
	return webcontainerInstance.fs.writeFile(
		`${GENERATED_PATH}/globals.js`,
		Object.keys(variables)
			.map((key) => `export const ${key} = "${variables[/** @type {keyof variables} */ (key)]}";`)
			.join('\n')
	);
}

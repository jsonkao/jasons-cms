import { Liveblocks as LiveblocksNode } from '@liveblocks/node';
import fs from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { generateComponentLookup, generateFiles } from './generate-files.js';
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

	/** @param {string} slug */
	async function getYDoc(slug) {
		const ydoc = new Y.Doc();
		const update = await liveblocks.getYjsDocumentAsBinaryUpdate(slug);
		Y.applyUpdate(ydoc, new Uint8Array(update));
		return ydoc;
	}

	const svelteFiles = await Promise.all(
		rooms.map(async ({ id }) => await generateFiles(await getYDoc(id), generatedFilesPath, id))
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

main().catch(console.error);

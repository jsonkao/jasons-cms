import { browser } from '$app/environment';
import { GENERATED_PATH } from '$lib/constants.js';
import { openComponentName } from '$lib/stores/code-editor.js';
import { PAGE_LEVEL_FILES } from '$shared/constants.js';
import { get } from 'svelte/store';
import { createWebContainer as defaultCreateWebContainer } from './create.js';

/**
 * @param {import('./create.js').createWebContainer} [createWebContainer] - The WebContainer instance.
 */
export function createWebContainerManager(createWebContainer = defaultCreateWebContainer) {
	if (!browser) throw new Error('This module should only be imported in the browser');

	/** @type {import('@webcontainer/api').WebContainer} The WebContainer instance. */
	let webcontainer;

	/**
	 * This promise resolves when the WebContainer is ready to be used
	 */
	const ready = createWebContainer().then((wc) => (webcontainer = wc));

	let pageFilesInitialized = false;

	/**
	 * Initializes page-level files of a webcontainer. Should only be run once.
	 * @param {Map<string, string>} pageFiles
	 */
	async function initializeWebContainerPageFiles(pageFiles) {
		if (pageFilesInitialized) return;
		if (pageFiles.size === 0) return;

		await ready;

		await Promise.all(
			[...pageFiles.entries()].map(([filename, contents]) =>
				writeFile(`/src/routes/${filename}`, contents)
			)
		);

		pageFilesInitialized = true;
	}

	return {
		/**
		 * Given a Yjs array of blocks, make sure that the WebContainer's file system is synced (i.e. Svelte components exist
		 * for all components, and Svelte components are deleted for components that have been removed).
		 * Also generate an `index.js` file that imports and exports all the graphic components.
		 *
		 * Also, initializes page-level files if they haven't been initialized yet.
		 *
		 * @param {Array<import('$shared/types').BlockMap>} yarray - An array of code files (not Y.Array because of readableArray store)
		 * @param {Map<string, string>} pageFiles - A map of page-level files
		 */
		async syncWebContainerFileSystem(yarray, pageFiles) {
			await ready;

			initializeWebContainerPageFiles(pageFiles);

			const currentGraphics = await webcontainer.fs.readdir(GENERATED_PATH);

			/** @type {Array<{ filename: string, code: string, alreadyExists: boolean }>} */
			const allGraphics = [];

			yarray.forEach((blockMap) => {
				if (blockMap.get('type') !== 'graphic') return;

				const filename = /** @type {string} */ (blockMap.get('name')) + '.svelte';
				const code = /** @type {import('yjs').Text} */ (blockMap.get('code')).toString();

				allGraphics.push({ filename, code, alreadyExists: currentGraphics.includes(filename) });
			});

			/**
			 * Theoretically, we'd use this to delete unused components. However, that triggers some Vite
			 * dev server error tracing error; so for now, we just use it to know when to reset openComponentName.
			 */
			const graphicsToDelete = currentGraphics.filter(
				(filename) =>
					filename.endsWith('.svelte') && !allGraphics.some((b) => b.filename === filename)
			);

			// If there's no open component, set the first one as the open component
			if (allGraphics.length === 0) {
				openComponentName.set(null);
			} else if (
				get(openComponentName) === null ||
				graphicsToDelete.includes(get(openComponentName) + '.svelte')
			) {
				openComponentName.set(allGraphics[0].filename.replace(/\.svelte$/, ''));
			}

			await Promise.all([
				// Create components that don't exist yet
				...allGraphics
					.filter((b) => !b.alreadyExists)
					.map(({ filename, code }) => writeFile(`${GENERATED_PATH}/${filename}`, code)),

				// A lib/index.js file to export all the graphic components
				writeFile(
					`${GENERATED_PATH}/index.js`,
					allGraphics
						.map(
							({ filename }) =>
								`export { default as ${filename.replace(/\.svelte$/, '')} } from './${filename}';`
						)
						.join('\n')
				)
			]);

			/**
			 * Ideally, here, we remove component files that are no longer in the Yjs array. However,
			 * that results in a Vite dev server error (see https://github.com/jsonkao/jasons-cms/issues/14).
			 * So for now, we're going to avoid doing that, which should be fine because people will probably
			 * only delete components a few times in one session, so there won't be too much of a memory burden.
			 */
		},

		/**
		 * Handles saving a componennt
		 * @param {string | null} fileOrComponent - The name of the component to save or a page-level file
		 * @param {string} content - The content of the component to save
		 */
		async saveComponentOrGlobalFile(fileOrComponent, content) {
			if (fileOrComponent === null) {
				throw new Error('Attempted to save a component or global fille but filename is null');
			}

			if (Object.values(PAGE_LEVEL_FILES).includes(fileOrComponent)) {
				await writeFile(`/src/routes/${fileOrComponent}`, content);
			} else {
				await writeFile(`${GENERATED_PATH}/${fileOrComponent}.svelte`, content);
			}
		}
	};

	/**
	 * A helper to write a file to the WebContainer's file system.
	 * @param {string} path - The path of the file
	 * @param {string} contents - The content of the file
	 */
	async function writeFile(path, contents) {
		if (path.endsWith('.svelte')) {
			contents = unpleasantlyMagicalMagic(contents);
		}

		await webcontainer.fs.writeFile(path, contents);
	}

	/**
	 * A helper to do some really hacky stuff to the contents of a file.
	 * @param {string} contents - The content of the file
	 * @returns {string} - The content of the file with some really hacky stuff done to it
	 */
	function unpleasantlyMagicalMagic(contents) {
		/* Accept prose and data props (and "use" it) to remove warnings */

		if (!contents.includes('<script>')) {
			contents = '<script></script>' + contents;
		}
		contents = contents.replace(
			'<script>',
			`<script>/** @type {import('yjs').Map<any>} */ export let prose; prose;`
		);
		if (!contents.includes('export let data')) {
			contents = contents.replace('<script>', `<script>export let data; data;`);
		}

		/* Make all images crossorigin anonymous because of iframe things */

		contents = contents.replace(/<img\W/g, '<img crossorigin="anonymous" ');

		/* Shove in prose prop to Editable components for magic convenience */

		if (contents.includes('<Editable ')) {
			contents = contents.replace(/<Editable /g, `<Editable {prose} `);
		}

		return contents;
	}
}

import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { GENERATED_PATH, STEPS } from '$lib/constants.js';
import { iframeUrl, currentStep } from '$lib/stores/status.js';
import { openComponentName } from '$lib/stores/code-editor.js';
import { WebContainer } from '@webcontainer/api';
import { fetchTemplateFiles, writeGlobals } from './files.js';
import { page } from '$app/stores';

/** @type {WebContainer} The WebContainer instance. */
let webcontainer;

/** @type {Awaited<ReturnType<typeof fetchTemplateFiles>>} The template files. */
let templateFiles;

/** @type {import('@webcontainer/api').WebContainerProcess | undefined} The current process running in the WebContainer. */
let currentProcess;

/**
 * On HMR updates, kill the current process so we can safely start a new one.
 * Right now, this doesn't work because it disconnects the webcontainer from the project, whatever that means.
 * Not sure if any of this works tbh.
 */
if (import.meta.hot) {
	// On HMR, first clean up the current process
	import.meta.hot.dispose(() => {
		console.log('[HMR] Dispose');
		killCurrentProcess();
	});

	import.meta.hot.accept(() => {
		console.log('[HMR] Accept');
	});
}

/**
 * In the browser, this promise resolves when the WebContainer is ready to be used and template files have been fetched.
 */
let ready = browser ? initialize() : new Promise(() => {});

/**
 * Initialize the WebContainer and fetch the template files.
 */
export async function initialize() {
	currentStep.set(STEPS.BOOTING);

	const promises = [];

	// Reuse the same webcontainer in dev HMR
	if (import.meta.hot?.data.webcontainer) {
		webcontainer = import.meta.hot.data.webcontainer;
	} else {
		promises.push(boot());
	}

	// Reuse the same template files in dev HMR
	if (import.meta.hot?.data.templateFiles) {
		templateFiles = import.meta.hot.data.templateFiles;
	} else {
		promises.push(
			fetchTemplateFiles().then((files) => {
				templateFiles = files;
				if (import.meta.hot) import.meta.hot.data.templateFiles = templateFiles;
			})
		);
	}

	if (promises.length > 0) {
		await Promise.all(promises);
		await mount();
	}

	startWebContainer(); // Do not await this
}

/**
 * Boot a new webcontainer instance. Persist it in HMR.
 */
async function boot() {
	webcontainer = await WebContainer.boot();
	if (import.meta.hot) import.meta.hot.data.webcontainer = webcontainer;

	webcontainer.on('server-ready', (port, url) => {
		currentStep.set(STEPS.SERVER_READY);
		// Invalidate previous base URL because the URL might be the same, but we want to re-source the iframe.
		// I'm not exactly sure what's going on but this makes it work
		iframeUrl.set({ url, timeUpdated: Date.now() });
	});
	webcontainer.on('error', ({ message }) => {
		console.error('WebContainer error:', message);
	});
}

/**
 * Mount the WebContainer and unzip the template files.
 * TODO (maybe): on HMR, diff with previous files and only mount/unzip what's changed. See https://github.com/nuxt/learn.nuxt.com/blob/main/stores/playground.ts#L200
 */
async function mount() {
	currentStep.set(STEPS.MOUNTING);
	await webcontainer.mount(templateFiles);

	await spawn('node', ['unzip.cjs'], 'Failed to unzip files', true);

	// Clear the /src/lib/generated directory
	await webcontainer.fs.rm(GENERATED_PATH, { recursive: true });
	await webcontainer.fs.mkdir(GENERATED_PATH);

	/*
	 * Write the globals file with the slug of the page. Not great that there are two places where the slug is
	 * being retrieved (once in page server load, once with the page store), is there a better way to do this?
	 */
	const { params } = get(page);
	if (!params?.slug) throw new Error('I really thought a slug would be in page params');
	await writeGlobals(webcontainer, params.slug);
}

/**
 * Call this function to mount the WebContainer and start the dev server.
 */
export async function startWebContainer() {
	currentStep.set(STEPS.RUNNING);
	await spawn('./node_modules/vite/bin/vite.js', ['dev'], 'Failed to start dev server', true);
}

let pageFilesInitialized = false;

/**
 * Initializes page-level files of a webcontainer. Should only be run once.
 * @param {Map<string, string>} pageFiles
 */
export async function initializeWebContainerPageFiles(pageFiles) {
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

/**
 * Given a Yjs array of blocks, make sure that the WebContainer's file system is synced (i.e. Svelte components exist
 * for all components, and Svelte components are deleted for components that have been removed).
 * Also generate an `index.js` file that imports and exports all the graphic components.
 * @param {Array<import('$shared').BlockMap>} yarray - An array of code files (not Y.Array because of readableArray store)
 *
 */
export async function syncWebContainerFileSystem(yarray) {
	await ready;

	const currentGraphics = await webcontainer.fs.readdir(GENERATED_PATH);

	/** @type {Array<{ filename: string, code: string, alreadyExists: boolean }>} */
	const allGraphics = [];

	yarray.forEach((blockMap) => {
		if (blockMap.get('type') !== 'graphic') return;

		const filename = /** @type {string} */ (blockMap.get('name')) + '.svelte';
		const code = /** @type {import('yjs').Text} */ (blockMap.get('code')).toString();

		allGraphics.push({ filename, code, alreadyExists: currentGraphics.includes(filename) });
	});

	const graphicsToDelete = currentGraphics.filter(
		(filename) => filename.endsWith('.svelte') && !allGraphics.some((b) => b.filename === filename)
	);

	// If there's no open component, set the first one
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
				.map(({ filename }) => `import ${filename.replace(/\.svelte$/, '')} from './${filename}';`)
				.join('\n') +
				`\nexport default { ${allGraphics.map(({ filename }) => filename.replace(/\.svelte$/, '')).join(', ')} };`
		)
	]);

	/**
	 * Ideally, here, we remove component files that are no longer in the Yjs array. However,
	 * that results in a Vite dev server error (see https://github.com/jsonkao/jasons-cms/issues/14).
	 * So for now, we're going to avoid doing that, which should be fine because people will probably
	 * only delete components a few times in one session, so there won't be too much of a memory burden.
	 */
}

/**
 * Handles saving a componennt
 * @param {string | null} componentNameOrGlobalFile - The name of the component to save
 * @param {string} content - The content of the component to save
 */
export async function saveComponentOrGlobalFile(componentNameOrGlobalFile, content) {
	if (componentNameOrGlobalFile === null) {
		throw new Error('Attempted to save a component or global fille but filename is null');
	}

	if (componentNameOrGlobalFile === '+page.server.js') {
		// Global file
		await writeFile(`/src/routes/${componentNameOrGlobalFile}`, content);
	} else {
		// Normal component
		await writeFile(`${GENERATED_PATH}/${componentNameOrGlobalFile}.svelte`, content);
	}
}

/**
 * A helper to create a WritableStream that logs the data it receives.
 */
function log_stream() {
	return new WritableStream({
		write(data) {
			console.log(data);
		}
	});
}

/**
 * A helper to write a file to the WebContainer's file system.
 * @param {string} path - The path of the file
 * @param {string} contents - The content of the file
 */
export async function writeFile(path, contents) {
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

/**
 * A helper to kill the current process running in the WebContainer.
 */
function killCurrentProcess() {
	if (currentProcess) {
		currentProcess.kill();
		currentProcess = undefined;
	}
}

/**
 * A helper to spawn a process in the WebContainer.
 * @param {string} command - The command to run
 * @param {string[]} args - The arguments to pass to the command
 * @param {string} errorMessage - The error message to log if the process fails
 * @param {boolean} [logOutput] - Whether to log the output of the process
 */
async function spawn(command, args, errorMessage, logOutput = false) {
	if (currentProcess)
		throw new Error(`A process is already running. Had tried to spawn ${command} ${args}`);

	const process = await webcontainer.spawn(command, args);
	currentProcess = process;

	if (logOutput) process.output.pipeTo(log_stream());

	return process.exit.then((code) => {
		if (currentProcess === process) currentProcess = undefined;
		if (code !== 0) {
			console.error(`Non-zero exit code in ${command} ${args}: ${errorMessage}`);
		}
	});
}

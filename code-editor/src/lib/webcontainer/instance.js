import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { GENERATED_PATH, steps } from '$lib/constants.js';
import { base, progress } from '$lib/stores/status.ts';
import { openComponentName } from '$lib/stores/code-editor.js';
import { WebContainer } from '@webcontainer/api';
import { fetchTemplateFiles, writeGlobals } from './files.js';

/** @type {WebContainer} The WebContainer instance. */
let webcontainerInstance;

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
		console.log('[HMR] dispose');
		killCurrentProcess();
	});

	import.meta.hot.accept(() => {
		console.log('[HMR] accept');
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
	progress.set(steps.BOOTING);

	const promises = [];

	// Reuse the same webcontainer in dev HMR
	if (import.meta.hot?.data.webcontainerInstance) {
		webcontainerInstance = import.meta.hot.data.webcontainerInstance;
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
 * Boot a new webcontainer instance. Persist the instance in HMR.
 */
async function boot() {
	const instance = await WebContainer.boot();
	webcontainerInstance = instance;
	if (import.meta.hot) import.meta.hot.data.webcontainerInstance = instance;

	webcontainerInstance.on('server-ready', (port, url) => {
		progress.set(steps.SERVER_READY);
		// Invalidate previous base URL because the URL might be the same, but we want to re-source the iframe.
		// I'm not exactly sure what's going on but this makes it work
		base.set(null);
		base.set(url);
		console.log('Server ready at', url, port);
	});
	webcontainerInstance.on('error', ({ message }) => {
		console.error('WebContainer instance error:', message);
	});
}

/**
 * Mount the WebContainer and unzip the template files.
 * TODO (maybe): on HMR, diff with previous files and only mount/unzip what's changed. See https://github.com/nuxt/learn.nuxt.com/blob/main/stores/playground.ts#L200
 */
async function mount() {
	progress.set(steps.MOUNTING);
	await webcontainerInstance.mount(templateFiles);

	await spawn('node', ['unzip.cjs'], 'Failed to unzip files', true);

	// Clear the /src/lib/generated directory
	await webcontainerInstance.fs.rm(GENERATED_PATH, { recursive: true });
	await webcontainerInstance.fs.mkdir(GENERATED_PATH);
	await writeGlobals(webcontainerInstance);
}

/**
 * Call this function to mount the WebContainer and start the dev server.
 */
export async function startWebContainer() {
	progress.set(steps.RUNNING);
	await spawn('./node_modules/vite/bin/vite.js', ['dev'], 'Failed to start dev server', true);
}

/**
 * Given a Yjs array of blocks, make sure that the Svelte components exist in the WebContainer's file system.
 * Also generate an `index.js` file that exports all the graphic components.
 * in the WebContainer's file system with the given code files.
 * @param {Array<BlockMap>} yarray - An array of code files (not Y.Array because of readableArray store)
 */
export async function hydrateWebContainerFileSystem(yarray) {
	await ready;

	const currentGraphics = await webcontainerInstance.fs.readdir(GENERATED_PATH);

	/** @type {Array<{ name: string, code: string, alreadyExists: boolean }} */
	const allGraphics = [];
	yarray.forEach((blockMap) => {
		if (blockMap.get('type') !== 'graphic') return;

		const name = /** @type {string} */ (blockMap.get('name'));
		const code = /** @type {import('yjs').Text} */ (blockMap.get('code')).toString();

		allGraphics.push({ name, code, alreadyExists: currentGraphics.includes(`${name}.svelte`) });
	});

	// If there's no open component, set the first one
	if (get(openComponentName) === null && allGraphics.length > 0) {
		openComponentName.set(allGraphics[0].name);
	}

	await Promise.all([
		...allGraphics
			.filter((b) => !b.alreadyExists)
			.map(({ name, code }) => writeFile(`${GENERATED_PATH}/${name}.svelte`, code)),
		// A lib/index.js file to export all the graphic components
		writeFile(
			`${GENERATED_PATH}/index.js`,
			allGraphics.map(({ name }) => `import ${name} from './${name}.svelte';`).join('\n') +
				`\nexport default { ${allGraphics.map(({ name }) => name).join(', ')} };`
		)
	]);
}

/**
 * Handles saving the file
 * TODO: Incorporate $openGlobalFile
 * @param {string | null} componentName - The name of the component to save
 * @param {string} content - The content of the component to save
 */
export async function saveComponent(componentName, content) {
	if (componentName === null) {
		throw new Error('Attempted to save but openComponentName is null');
	}
	await writeFile(`${GENERATED_PATH}/${componentName}.svelte`, content);
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
	await webcontainerInstance.fs.writeFile(path, contents);
}

/**
 * A helper to kill the current process running in the WebContainer.
 */
function killCurrentProcess() {
	if (currentProcess) {
		console.log('Killing', currentProcess);
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

	const process = await webcontainerInstance.spawn(command, args);
	currentProcess = process;

	if (logOutput) process.output.pipeTo(log_stream());

	return process.exit.then((code) => {
		if (currentProcess === process) currentProcess = undefined;
		if (code !== 0) {
			console.error(`Non-zero exit code in ${command} ${args}: ${errorMessage}`);
		}
	});
}

import { WebContainer } from '@webcontainer/api';
import { browser } from '$app/environment';
import { steps } from '$lib/constants.ts';
import { base, progress } from '$lib/stores.ts';
import { amendTemplateFiles, fetchTemplateFiles } from './files.js';

/** @type {WebContainer} The WebContainer instance. */
let webcontainerInstance;

/** @type {Awaited<ReturnType<typeof fetchTemplateFiles>>} The template files. */
let templateFiles;

/** @type {import('@webcontainer/api').WebContainerProcess | undefined} The current process running in the WebContainer. */
let currentProcess;

/**
 * On HMR updates, kill the current process so we can safely start a new one.
 * Right now, this doesn't work because it disconnects the webcontainer from the project, whatever that means.
 */
if (import.meta.hot) {
	import.meta.hot.on('vite:beforeUpdate', ({ updates }) => {
		if (updates.some((u) => u.path === '/src/routes/+page.svelte' && u.type === 'js-update')) {
			console.log('vite:beforeUpdate', updates);
			killCurrentProcess();
		}
	});

	// On HMR, first clean up the current process
	import.meta.hot.dispose(() => {
		console.log('dispose');
		killCurrentProcess();
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
		promises.push(
			WebContainer.boot().then((instance) => {
				webcontainerInstance = instance;
				if (import.meta.hot) import.meta.hot.data.webcontainerInstance = instance;

				webcontainerInstance.on('server-ready', (port, url) => {
					progress.set(steps.SERVER_READY);
					base.set(url);
				});
				webcontainerInstance.on('error', ({ message }) => {
					console.error('WebContainer instance error:', message);
				});
			})
		);
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

	await Promise.all(promises);
}

/**
 * Call this function to mount the WebContainer and start the dev server.
 * @param {Block[]} blocks
 */
export async function startWebContainer(blocks) {
	// Wait for the WebContainer to be initialized and for files to be fetched
	await ready;

	// Mount and unzip files
	// TODO LATER: diff with previous files and only mount/unzip what's changed. See https://github.com/nuxt/learn.nuxt.com/blob/main/stores/playground.ts#L200
	progress.set(steps.MOUNTING);
	await webcontainerInstance.mount(templateFiles);

	progress.set(steps.UNZIPPING);
	await spawn('node', ['unzip.cjs'], 'Failed to unzip files', true);
	await amendTemplateFiles(webcontainerInstance, blocks);

	progress.set(steps.RUNNING);
	await spawn('./node_modules/vite/bin/vite.js', ['dev'], 'Failed to start dev server', true);
}

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

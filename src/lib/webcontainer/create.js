/**
 * This module boots and mounts a web container instance
 */

import { page } from '$app/stores';
import { GENERATED_PATH, STEPS, userColor, userName } from '$lib/constants.js';
import { currentStep, iframeUrl } from '$lib/stores/status';
import { WebContainer } from '@webcontainer/api';
import { get } from 'svelte/store';
import { fetchTemplateFiles } from './files.js';

export async function createWebContainer() {
	/** @type {WebContainer} The WebContainer instance. */
	let webcontainer;

	/** @type {Awaited<ReturnType<typeof fetchTemplateFiles>>} The template files. */
	let templateFiles;

	let promises = [];

	/** @type {import('@webcontainer/api').WebContainerProcess | undefined} The current process running in the WebContainer. */
	let currentProcess;

	if (import.meta.hot?.data?.webcontainer) {
		webcontainer = import.meta.hot.data.webcontainer;
	} else {
		promises.push(
			WebContainer.boot().then((instance) => {
				webcontainer = instance;
				if (import.meta.hot?.data) import.meta.hot.data.webcontainer = webcontainer;
			})
		);
	}
	if (import.meta.hot?.data?.templateFiles) {
		templateFiles = import.meta.hot.data.templateFiles;
	} else {
		promises.push(
			fetchTemplateFiles().then((files) => {
				templateFiles = files;
				if (import.meta.hot?.data) import.meta.hot.data.templateFiles = templateFiles;
			})
		);
	}

	if (promises.length > 0) {
		await Promise.all(promises);
		await mount();
	}

	webcontainer.on('server-ready', (port, url) => {
		currentStep.set(STEPS.SERVER_READY);
		// Invalidate previous base URL because the URL might be the same, but we want to re-source the iframe.
		// I'm not exactly sure what's going on but this makes it work
		iframeUrl.set({ url, timeUpdated: Date.now() });
	});
	webcontainer.on('error', ({ message }) => {
		console.error('WebContainer error:', message);
	});

	startWebContainer(); // Do not await this

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
		await writeGlobals(params.slug);
	}

	/**
	 * Write a globals file with constants that should be shared between the Svelte app and the WebContainer, e.g. cursor name/color
	 * @param {string} liveblocksRoom - The Liveblocks room ID
	 */
	function writeGlobals(liveblocksRoom) {
		const variables = { userName, userColor, liveblocksRoom };
		return webcontainer.fs.writeFile(
			`${GENERATED_PATH}/globals.js`,
			Object.keys(variables)
				.map((key) => `export const ${key} = "${variables[/** @type {keyof variables} */ (key)]}";`)
				.join('\n')
		);
	}

	/**
	 * Call this function to mount the WebContainer and start the dev server.
	 */
	async function startWebContainer() {
		currentStep.set(STEPS.RUNNING);
		await spawn('./node_modules/vite/bin/vite.js', ['dev'], 'Failed to start dev server', true);
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

	/**
	 * A helper to kill the current process running in the WebContainer.
	 */
	function killCurrentProcess() {
		if (currentProcess) {
			currentProcess.kill();
			currentProcess = undefined;
		}
	}

	return webcontainer;
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

/**
 * This module boots and mounts a web container instance
 */

import { page } from '$app/stores';
import { GENERATED_PATH, STEPS, user } from '$lib/constants.js';
import { currentStep, iframeUrl } from '$lib/stores/status';
import { WebContainer } from '@webcontainer/api';
import { get } from 'svelte/store';
import { fetchTemplateFiles } from './fetch.js';

/** Get a webcontainer instance */
async function bootWebContainer() {
	if (import.meta.hot?.data?.webcontainer) {
		return import.meta.hot.data.webcontainer;
	}

	const webcontainer = await WebContainer.boot();
	if (import.meta.hot?.data) import.meta.hot.data.webcontainer = webcontainer;

	webcontainer.on('server-ready', (port, url) => {
		currentStep.set(STEPS.SERVER_READY);
		// Invalidate previous base URL because the URL might be the same, but we want to re-source the iframe.
		// I'm not exactly sure what's going on but this makes it work
		iframeUrl.set(`${url}?updated=${Date.now()}`);
	});
	webcontainer.on('error', ({ message }) => {
		console.error('WebContainer error:', message);
	});

	return webcontainer;
}

async function getInitialFiles() {
	if (import.meta.hot?.data?.templateFiles) {
		return import.meta.hot.data.templateFiles;
	}

	const templateFiles = await fetchTemplateFiles();
	if (import.meta.hot?.data) import.meta.hot.data.templateFiles = templateFiles;
	return templateFiles;
}

export async function createWebContainer() {
	/** @type {WebContainer} The WebContainer instance. */
	let webcontainer;

	/** @type {Awaited<ReturnType<typeof fetchTemplateFiles>>} The template files. */
	let templateFiles;

	[webcontainer, templateFiles] = await Promise.all([bootWebContainer(), getInitialFiles()]);

	/** @type {import('@webcontainer/api').WebContainerProcess | undefined} The current process running in the WebContainer. */
	let currentProcess;

	await mount(); // Could repeat work if neither the WebContainer nor the template files have changed
	startWebContainer(); // Do not await

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

		await spawn('node', ['unzip.cjs']);

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
		const variables = { user, liveblocksRoom };
		return webcontainer.fs.writeFile(
			`${GENERATED_PATH}/globals.js`,
			Object.keys(variables)
				.map(
					(key) =>
						`export const ${key} = ${JSON.stringify(variables[/** @type {keyof variables} */ (key)])};`
				)
				.join('\n')
		);
	}

	/**
	 * Call this function to mount the WebContainer and start the dev server.
	 */
	async function startWebContainer() {
		currentStep.set(STEPS.RUNNING);
		await spawn('./node_modules/vite/bin/vite.js', ['dev'], { WEBCONTAINER: true });
	}

	/**
	 * A helper to spawn a process in the WebContainer.
	 * @param {string} command - The command to run
	 * @param {string[]} args - The arguments to pass to the command
	 * @param {import('@webcontainer/api').SpawnOptions['env']} [env] - Optional environment variables to set
	 */
	async function spawn(command, args, env) {
		if (currentProcess)
			throw new Error(`A process is already running. Had tried to spawn ${command} ${args}`);

		const process = await webcontainer.spawn(command, args, { env });
		currentProcess = process;

		process.output.pipeTo(log_stream());

		return process.exit.then((code) => {
			if (currentProcess === process) currentProcess = undefined;
			if (code !== 0) {
				console.error(`Webcontainer process error (code ${code}) in ${command} ${args}`);
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

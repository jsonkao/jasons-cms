import { WebContainer, type WebContainerProcess } from '@webcontainer/api';
import { browser } from '$app/environment';
import { base, progress } from '$lib/stores.ts';
import { steps, userName, userColor } from '$lib/constants.ts';
import { loadFiles } from './files.ts';

let webcontainerInstance: WebContainer;
let templateFiles: Awaited<ReturnType<typeof loadFiles>>;

let currentProcess: WebContainerProcess | undefined;

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
	// Second, the new module is executed
	// Third, this accept handler (from the old module) is called
	// import.meta.hot.accept(() => { console.log('accept'); startWebContainer(lastUsedBlocks); });
}

/**
 * In the browser, this promise resolves when the WebContainer is ready to be used and template files have been fetched.
 */
let ready = browser ? initialize() : new Promise(() => {});

export async function initialize() {
	progress.set(steps.BOOTING);

	const promises = [];

	// Reuse the same webcontainer in dev HMR
	if (import.meta.hot && import.meta.hot.data.webcontainerInstance) {
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
					// TODO: handle errors
				});
			})
		);
	}

	// Reuse the same template files in dev HMR
	if (import.meta.hot && import.meta.hot.data.templateFiles) {
		templateFiles = import.meta.hot.data.templateFiles;
	} else {
		promises.push(
			loadFiles().then((files) => {
				templateFiles = files;
				if (import.meta.hot) import.meta.hot.data.templateFiles = templateFiles;
			})
		);
	}

	await Promise.all(promises);
}

export async function startWebContainer(blocks: Block[]) {
	// Wait for the WebContainer to be initialized and for files to be fetched
	await ready;

	// Mount and unzip files
	// TODO LATER: diff with previous files and only mount/unzip what's changed. See https://github.com/nuxt/learn.nuxt.com/blob/main/stores/playground.ts#L200
	console.log('TEMPLATE FILES', templateFiles);

	progress.set(steps.MOUNTING);
	await webcontainerInstance.mount(templateFiles);

	progress.set(steps.UNZIPPING);
	await spawn('node', ['unzip.cjs'], 'Failed to unzip files', true);

	const graphicBlocks = blocks.filter((block) => block.type === 'graphic') as GraphicBlock[];

	await generateFiles();

	async function generateFiles() {
		await Promise.all([
			// Graphics Svelte files
			...graphicBlocks.map(({ name, code }) => generateFile(`${name}.svelte`, code)),
			// A lib/index.js file to export all the graphic components
			generateFile(
				'index.js',
				graphicBlocks.map(({ name }) => `import ${name} from './${name}.svelte';`).join('\n') +
					`\nexport default { ${graphicBlocks.map(({ name }) => name).join(', ')} };`
			),
			// A data.json file with blocks data
			generateFile('data.json', JSON.stringify(blocks)),
			// A file for constants that should be shared between the Svelte app and the WebContainer, e.g. cursor name/color
			generateFile(
				'globals.js',
				`export const userName = "${userName}"; export const userColor = "${userColor}";`
			)
		]);

		function generateFile(filename: string, content: string) {
			return webcontainerInstance.fs.writeFile(`src/lib/generated/${filename}`, content);
		}
	}

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

export async function writeFile(path: string, contents: string) {
	await webcontainerInstance.fs.writeFile(path, contents);
}

function killCurrentProcess() {
	if (currentProcess) {
		console.log('Killing', currentProcess);
		currentProcess.kill();
		currentProcess = undefined;
	}
}

async function spawn(command: string, args: string[], errorMessage: string, logOutput = false) {
	if (!webcontainerInstance) {
		console.warn(
			`Tried to spawn a process but webcontainerInstance isn't there. Not spawning: ${command} ${args}`
		);
		return;
	}

	if (currentProcess)
		throw new Error(`A process is already running. Had tried to spawn ${command} ${args}`);

	const process = await webcontainerInstance.spawn(command, args);
	currentProcess = process;

	if (logOutput) process.output.pipeTo(log_stream());

	return process.exit.then((code) => {
		if (currentProcess === process) currentProcess = undefined;
		if (code !== 0) {
			console.error(`Error in spawn for command ${command} ${args}: ${errorMessage}`);
		}
	});
}

import { WebContainer, type WebContainerProcess } from '@webcontainer/api';
import { browser } from '$app/environment';
import { base, progress } from '$lib/stores.ts';
import { steps } from '$lib/constants.ts';

let webcontainerInstance: WebContainer;
let lastUsedBlocks: Block[];
let lastUsedFiles: Awaited<BundleFiles>;
let currentProcess: WebContainerProcess | undefined;

let ready = new Promise(() => {});
if (browser) {
	// Only initialize on the client side
	ready = initialize();
}

if (import.meta.hot) {
	// In dev HMR, kill current process and do starting steps again
	import.meta.hot.accept(() => {
		startWebContainer(lastUsedBlocks, new Promise((fulfill) => fulfill(lastUsedFiles)));
	});

	import.meta.hot.on('vite:beforeUpdate', (updatePayload) => {
		if (updatePayload.updates.some((update) => update.path === '/src/lib/webcontainer/instance.ts'))
			killCurrentProcess(); // not rlly working
	});
}

export async function initialize() {
	progress.set(steps.BOOTING);

	// Reuse the same webcontainer in dev HMR
	if (import.meta.hot && import.meta.hot.data.webcontainerInstance) {
		webcontainerInstance = import.meta.hot.data.webcontainerInstance;
	} else {
		webcontainerInstance = await WebContainer.boot();
		if (import.meta.hot) import.meta.hot.data.webcontainerInstance = webcontainerInstance;
	}
}

export async function startWebContainer(blocks: Block[], filesPromise: BundleFiles) {
	// Wait for the WebContainer to be initialized and for files to be fetched
	const [_, files] = await Promise.all([ready, filesPromise]);

	// Store for HMR
	lastUsedFiles = files;
	lastUsedBlocks = blocks;

	// Mount and unzip files if needed

	const rootFiles = await webcontainerInstance.fs.readdir('/');

	progress.set(steps.MOUNTING);
	await webcontainerInstance.mount(files);

	progress.set(steps.UNZIPPING);
	await spawn('node', ['unzip.cjs'], 'Failed to unzip files', true);

	const graphicBlocks = blocks.filter((block) => block.type === 'graphic') as GraphicBlock[];

	await generateFiles();

	async function generateFiles() {
		await Promise.all([
			// Graphics Svelte files
			...graphicBlocks.map(({ name, code }) => writeFile(`${name}.svelte`, code)),
			// A lib/index.js file to export all the graphic components
			writeFile(
				'index.js',
				graphicBlocks.map(({ name }) => `import ${name} from './${name}.svelte';`).join('\n') +
					`\nexport default { ${graphicBlocks.map(({ name }) => name).join(', ')} };`
			),
			// A data.json file with blocks data
			writeFile('data.json', JSON.stringify(blocks))
		]);

		function writeFile(filename: string, content: string) {
			return webcontainerInstance.fs.writeFile(`src/lib/generated/${filename}`, content);
		}
	}

	// Start dev server

	webcontainerInstance.on('server-ready', (port, url) => {
		progress.set(steps.SERVER_READY);
		base.set(url);
	});

	webcontainerInstance.on('error', ({ message }) => {
		// TODO: handle errors
	});

	progress.set(steps.RUNNING);
	await spawn('./node_modules/vite/bin/vite.js', ['dev'], 'Failed to start dev server', true);
}

export async function stopWebContainer() {
	base.set(null);
	progress.set(null);
	try {
		console.log('Tearing down webcontainer...', webcontainerInstance);
		if (webcontainerInstance) await webcontainerInstance.teardown();
		else console.warn('webcontainerInstance is not there', webcontainerInstance);
	} catch (e) {
		console.error('Teardown failed', e);
	}
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
		console.log('Trying to kill', currentProcess);
		currentProcess.kill();
		currentProcess = undefined;
	}
	console.log('Did the kill work?');
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
	console.log(`Just spawned ${command} ${args} with currentProcess ${currentProcess}`);

	if (logOutput) process.output.pipeTo(log_stream());

	return process.exit.then((code) => {
		if (currentProcess === process) currentProcess = undefined;
		if (code !== 0) {
			console.error(`Error in spawn for command ${command} ${args}: ${errorMessage}`);
		}
	});
}

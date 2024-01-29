import { WebContainer } from '@webcontainer/api';
import { base, progress } from '$lib/stores';
import { steps, globalFiles } from '$lib/constants';
import type { WebContainer as WebContainerType, WebContainerProcess } from '@webcontainer/api';
import { browser } from '$app/environment';

let webcontainerInstance: WebContainerType;
let lastUsedBlocks: Block[];
let lastUsedFiles: Awaited<BundleFiles>;
let currentProcess: WebContainerProcess | undefined;

let ready = new Promise(() => {});
if (browser) {
	// Only initialize on the client side
	ready = initialize();
}

if (import.meta.hot) {
	// In dev, with HMR, reuse the same WebContainer
	import.meta.hot.accept(async () => {
		killCurrentProcess();
		await startWebContainer(lastUsedBlocks, new Promise((fulfill) => fulfill(lastUsedFiles)));
	});
}

async function initialize() {
	progress.set(steps.BOOTING);
	webcontainerInstance = await WebContainer.boot();
}

export async function startWebContainer(blocks: Block[], filesPromise: BundleFiles) {
	// Wait for the WebContainer to be initialized and for files to be fetched
	const [_, files] = await Promise.all([ready, filesPromise]);

	// Store for HMR
	lastUsedFiles = files;
	lastUsedBlocks = blocks;

	// Mount files

	progress.set(steps.MOUNTING);
	await webcontainerInstance.mount(files);

	async function spawn(command: string, args: string[], errorMessage: string, logOutput = false) {
		if (currentProcess) throw new Error('A process is already running');
		const process = await webcontainerInstance.spawn(command, args);
		currentProcess = process;

		if (logOutput) process.output.pipeTo(log_stream());

		return process.exit.then((code) => {
			if (currentProcess === process) currentProcess = undefined;
			if (code !== 0) {
				throw new Error(errorMessage);
			}
		});
	}

	// Unzip files

	progress.set(steps.UNZIPPING);
	await spawn('node', ['unzip.cjs'], 'Failed to unzip files');

	const graphicBlocks = blocks.filter((block) => block.type === 'graphic') as GraphicBlock[];

	await Promise.all([
		spawn('chmod', ['a+x', 'node_modules/vite/bin/vite.js'], 'Failed to chmod'),
		generateFiles()
	]);

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
		console.error('teardown failed', e);
	}
}

function log_stream() {
	return new WritableStream({
		write(data) {
			console.log(data);
		}
	});
}

export async function writeFile(filename: string, contents: string) {
	const path = Object.values(globalFiles).includes(filename)
		? `/src/routes/${filename}`
		: `/src/lib/generated/${filename}.svelte`;
	await webcontainerInstance.fs.writeFile(path, contents);
}

function killCurrentProcess() {
	if (currentProcess) {
		currentProcess.kill();
		currentProcess = undefined;
	}
}

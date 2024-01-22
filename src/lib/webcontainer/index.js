import { WebContainer } from '@webcontainer/api';
import { base, status, codeContent } from '$lib/stores.js';
import { loadCommon, files } from './files.js';

/**
 * Maybe I just need a REPL, not a webcontainer
 */

/** @type {import('@webcontainer/api').WebContainer} Web container singleton */
let webcontainerInstance;

export async function startWebContainer() {
	status.set('Booting webcontainer...');
	webcontainerInstance = await WebContainer.boot();

	status.set('Mounting files...');
	// await webcontainerInstance.mount(files);
	await webcontainerInstance.mount(await loadCommon());

	status.set('Unzipping files...');
	await unzipFiles();

	status.set('Installing dependencies...');
	await install();
	async function install() {
		// const process = await webcontainerInstance.spawn('npm', ['install']);
		const process = await webcontainerInstance.spawn('npm', [
			'i',
			'-D',
			'@rollup/rollup-linux-x64-musl'
		]);
		// process.output.pipeTo(log_stream());
		const code = await process.exit;
		if (code !== 0) {
			throw new Error('Failed to install dependencies');
		}
	}

	webcontainerInstance.on('server-ready', (port, url) => {
		console.log('Ready!!');
		status.set(null);
		base.set(url);
	});

	webcontainerInstance.on('error', ({ message }) => {
		console.error('ERROR', message);
		status.set(`Error: ${message}`);
	});

	status.set('Starting dev server...');
	await dev();
	async function dev() {
		const process = await webcontainerInstance.spawn('./node_modules/vite/bin/vite.js', ['dev']);
		// const process = await webcontainerInstance.spawn('npm', ['run', 'start']);
		process.output.pipeTo(log_stream());
		const code = await process.exit;
		if (code !== 0) {
			throw new Error('Failed to start dev server');
		}
	}
}

async function unzipFiles() {
	const unzip = await webcontainerInstance.spawn('node', ['unzip.cjs']);
	unzip.output.pipeTo(log_stream());
	if ((await unzip.exit) !== 0) {
		throw new Error('Failed to unzip in WebContainer');
	}
	await webcontainerInstance.spawn('chmod', ['a+x', 'node_modules/vite/bin/vite.js']);
	
	codeContent.set(await webcontainerInstance.fs.readFile(`src/lib/Graphic.svelte`, 'utf-8'));
}

function log_stream() {
	return new WritableStream({
		write(data) {
			console.log(data);
		}
	});
}

export async function stopWebContainer() {
	if (webcontainerInstance) {
		base.set(null);
		await webcontainerInstance.teardown();
	}
}

/**
 * @param {string} componentName 
 * @param {string} content
 */
export async function saveFile(componentName, content) {
	await webcontainerInstance.fs.writeFile(`/src/lib/${componentName}.svelte`, content);

	console.log(await webcontainerInstance.fs.readFile(`/src/lib/${componentName}.svelte`, 'utf-8'));
}

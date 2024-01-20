import { WebContainer } from '@webcontainer/api';
import { base, progress } from '$lib/stores.js';
import { loadCommon, files } from './files.js';

/**
 * Maybe I just need a REPL, not a webcontainer
 */

/** @type {import('@webcontainer/api').WebContainer} Web container singleton */
let webcontainerInstance;

export async function startWebContainer() {
	progress.set('Booting webcontainer...');
	webcontainerInstance = await WebContainer.boot();

	progress.set('Mounting files...');
	// await webcontainerInstance.mount(files);
	await webcontainerInstance.mount(await loadCommon());

	progress.set('Unzipping files...');
	await unzipFiles();

	// progress.set('Installing dependencies...');
	// await install();
	async function install() {
		const process = await webcontainerInstance.spawn('npm', ['install']);
		// process.output.pipeTo(log_stream());
		const code = await process.exit;
		if (code !== 0) {
			throw new Error('Failed to install dependencies');
		}
	}

	webcontainerInstance.on('server-ready', (port, url) => {
		console.log('Ready!!');
		progress.set(null);
		base.set(url);
	});

	webcontainerInstance.on('error', ({ message }) => {
		console.error('ERROR', message);
	});

	progress.set('Starting dev server...');
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
}

function log_stream() {
	return new WritableStream({
		write(data) {
			console.log(data);
		}
	});
}

export async function stopWebContainer() {
	if (webcontainerInstance) await webcontainerInstance.teardown();
}

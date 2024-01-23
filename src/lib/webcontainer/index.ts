import { WebContainer } from '@webcontainer/api';
import { base, status, codeContent } from '$lib/stores';
import { get } from 'svelte/store';
import { loadFiles } from './files.js';
import type { WebContainer as WebContainerType } from '@webcontainer/api';

let webcontainerInstance: WebContainerType;

export async function startWebContainer(blocks: Block[]) {
	// Boot webcontainer and load files concurrently

	status.set('Booting webcontainer...');
	let files;
	[webcontainerInstance, files] = await Promise.all([WebContainer.boot(), loadFiles()]);

	// Mount files

	status.set('Mounting files...');
	await webcontainerInstance.mount(files);

	// Unzip files

	status.set('Unzipping files...');
	await unzipFiles();
	async function unzipFiles() {
		const unzip = await webcontainerInstance.spawn('node', ['unzip.cjs']);
		unzip.output.pipeTo(log_stream());
		if ((await unzip.exit) !== 0) {
			throw new Error('Failed to unzip in WebContainer');
		}
		await webcontainerInstance.spawn('chmod', ['a+x', 'node_modules/vite/bin/vite.js']);
	}

	// THIS IS A HACK STEP to fix an incdecipherable error. Should be removed soon. (We already have node_modules installed in files.zip)

	status.set('Installing dependencies...');
	await install();
	async function install() {
		await webcontainerInstance.spawn('rm', ['-rf', 'node_modules']);
		await webcontainerInstance.spawn('chmod', ['a+x', 'node_modules/vite/bin/vite.js']);
		const process = await webcontainerInstance.spawn('npm', [
			'i',
			'-D',
			'@rollup/rollup-linux-x64-musl',
			'esbuild'
		]);
		// process.output.pipeTo(log_stream());
		const code = await process.exit;
		if (code !== 0) {
			throw new Error('Failed to install dependencies');
		}
	}

	// Populate webcontainer with files from blocks data

	status.set('Writing files...');

	const graphicBlocks = blocks.filter((block) => block.type === 'graphic') as GraphicBlock[];
	await Promise.all(
		graphicBlocks.map(({ name, code }) =>
			webcontainerInstance.fs.writeFile(`/src/lib/${name}.svelte`, code)
		)
	);

	// Write a lib/index.js file to export all the graphic components

	await webcontainerInstance.fs.writeFile(
		`src/lib/index.js`,
		graphicBlocks.map(({ name }) => `import ${name} from './${name}.svelte';`).join('\n') +
			`\nexport default { ${graphicBlocks.map(({ name }) => name).join(', ')} };`
	);

	// Populate codeContent store with code from blocks data

	codeContent.set(
		graphicBlocks.reduce(
			(acc, block) => {
				acc[block.name] = block.code;
				return acc;
			},
			{} as { [key: string]: string }
		)
	);

	// Start dev server

	webcontainerInstance.on('server-ready', (port, url) => {
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
		process.output.pipeTo(log_stream());
		const code = await process.exit;
		if (code !== 0) {
			throw new Error('Failed to start dev server');
		}
	}
}

export async function stopWebContainer() {
	base.set(null);
	try {
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

export async function saveFile(componentName: string) {
	await webcontainerInstance.fs.writeFile(
		`/src/lib/${componentName}.svelte`,
		get(codeContent)[componentName]
	);
}

import { WebContainer } from '@webcontainer/api';
import { base, progress } from '$lib/stores';
import { type loadFiles } from './files.js';
import { steps, globalFiles } from '$lib/constants';
import type { WebContainer as WebContainerType } from '@webcontainer/api';

let webcontainerInstance: WebContainerType;

if (import.meta.hot) {
	// In dev, with HMR, reuse the same WebContainer
	import.meta.hot.accept(() => {
		// Module reloaded: TODO: kill current process, redo the whole thing
	});
}

export async function create() {
	progress.set(steps.BOOTING);
	webcontainerInstance = await WebContainer.boot();
	return { startWebContainer, stopWebContainer };
}

async function startWebContainer(blocks: Block[], files: BundleFiles) {
	// Boot webcontainer and load files concurrently
	console.log({ blocks, files })

	// Mount files

	progress.set(steps.MOUNTING);
	await webcontainerInstance.mount(files);

	// Unzip files

	progress.set(steps.UNZIPPING);
	await unzipFiles();
	async function unzipFiles() {
		const unzip = await webcontainerInstance.spawn('node', ['unzip.cjs']);
		unzip.output.pipeTo(log_stream());
		if ((await unzip.exit) !== 0) {
			throw new Error('Failed to unzip in WebContainer');
		}
		await webcontainerInstance.spawn('chmod', ['a+x', 'node_modules/vite/bin/vite.js']);
	}

	// Since rollup and esbuild are written with native code, we need to reinstall them
	// (Jason uses a mac, so the binaries in the editor/package-lock.json created for him
	// are not compatible with the webcontainer platform, Linux)
	// In parallel, generate the Svelte code files we need.

	progress.set(steps.INSTALLING);

	const graphicBlocks = blocks.filter((block) => block.type === 'graphic') as GraphicBlock[];

	await Promise.all([chmod(), generateFiles()]);

	console.log(
		await webcontainerInstance.fs.readFile(
			`node_modules/@rollup/rollup-linux-x64-musl/package.json`,
			'utf-8'
		)
	);

	async function chmod() {
		await webcontainerInstance.spawn('chmod', ['a+x', 'node_modules/vite/bin/vite.js']);
	}

	async function install() {
		await webcontainerInstance.spawn('rm', ['-rf', 'node_modules']);
		await chmod();
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

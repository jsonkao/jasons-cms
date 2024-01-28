/**
 * Directly copied from learn.svelte.dev, except changed input and output location,
 * and also git clean path
 */

import fs from 'fs';
import esbuild from 'esbuild';
import AdmZip from 'adm-zip';
import glob from 'tiny-glob/sync.js';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

if (!!process.env.VERCEL) {
	execSync('git clean -d -f editor');
}

const cwd = 'editor';

console.time('install')
execSync('rm -rf node_modules package-lock.json', { cwd });
/* execSync('npm i --cpu x64 --os linux', { cwd });
execSync('ls node_modules/@rollup', { cwd });
execSync('npm i --no-save @rollup/rollup-linux-x64-musl', { cwd });
execSync('ls node_modules/@rollup', { cwd });*/
execSync('yarn install', { cwd })
console.timeEnd('install');

const zip = new AdmZip();

// we selectively exclude certain files to minimise the bundle size.
// this is a bit ropey, but it works
const ignored_basenames = ['.DS_Store', 'LICENSE'];
const ignored_extensions = ['.d.ts', '.map'];
const ignored_directories = ['.svelte-kit', 'node_modules/.bin', /* 'node_modules/rollup/dist/shared', */ 'node_modules/y-leveldb'];

const ignored_files = new Set(['node_modules/svelte/compiler.cjs']);

console.time('zip.addFile');
for (const file of glob('**', { cwd, filesOnly: true, dot: true }).map((file) =>
	file.replaceAll('\\', '/')
)) {
	if (ignored_extensions.find((ext) => file.endsWith(ext))) continue;
	if (ignored_basenames.find((basename) => file.endsWith('/' + basename))) continue;
	if (ignored_directories.find((dir) => file.startsWith(dir + '/'))) continue;

	if (ignored_files.has(file)) {
		ignored_files.delete(file);
		continue;
	}

	if (file.startsWith('node_modules/esbuild/') || file.startsWith('node_modules/@esbuild/') || file.startsWith('node_modules/yjs/dist/') && file.endsWith('.map')) {
		// continue;
	}

	zip.addFile(
		file.replace('node_modules/esbuild-wasm/', 'node_modules/esbuild/'),
		fs.readFileSync(`${cwd}/${file}`)
	);
}
console.timeEnd('zip.addFile');

if (ignored_files.size > 0) {
	throw new Error(`expected to find ${Array.from(ignored_files).join(', ')}`);
}

console.time('writing zip');
const out = zip.toBuffer();

fs.writeFileSync(`src/lib/webcontainer/files.zip`, out);
console.timeEnd('writing zip');

console.time('bundle unzip');
// bundle adm-zip so we can use it in the webcontainer
esbuild.buildSync({
	entryPoints: [fileURLToPath(new URL('./unzip.js', import.meta.url))],
	bundle: true,
	platform: 'node',
	minify: true,
	outfile: 'src/lib/webcontainer/unzip.cjs',
	format: 'cjs'
});
console.timeEnd('bundle unzip');

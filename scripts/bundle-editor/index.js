/**
 * Directly copied from learn.svelte.dev, except changed input and output location,
 * and also git clean path
 */

import AdmZip from 'adm-zip';
import { execSync } from 'child_process';
import esbuild from 'esbuild';
import fs from 'fs';
import glob from 'tiny-glob/sync.js';
import { fileURLToPath } from 'url';

const cwd = './text-editor';

console.time('install');
if (!!process.env.VERCEL) {
	// Omitting prettier dev dependencies reduces bundle size by 2MB lol (is now 7MB).
	execSync('rm -rf node_modules package-lock.json && npm i --omit=dev', { cwd });
} else if (!fs.existsSync(cwd + '/node_modules')) {
	execSync('npm ci', { cwd });
}
console.timeEnd('install');

// Copy the shared folder into the text-editor folder (remove it at the end)
execSync('cp -r ../shared .', { cwd });

const zip = new AdmZip();

// we selectively exclude certain files to minimise the bundle size.
// this is a bit ropey, but it works
const ignored_basenames = ['.DS_Store', 'LICENSE'];
const ignored_extensions = ['.d.ts', '.map'];
const ignored_directories = [
	'.svelte-kit',
	'node_modules/.bin',
	'node_modules/rollup/dist/shared',
	'lib0/coverage',

	// In local development, we do want dev dependencies installed; but we don't need them in the webcontainer
	'node_modules/typescript',
	'node_modules/prettier',
	'node_modules/svelte-check',
	'node_modules/prettier-plugin-svelte',

	// Vite requires esbuild, but we use the esbuild-wasm package instead
	'node_modules/esbuild',
	'node_modules/@esbuild',

	'node_modules/.vite'
];

const ignored_files = new Set([
	'node_modules/svelte/compiler.cjs',
	'node_modules/y-protocols/dist/test.js'
]);

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

	if (file.endsWith('.md') && !file.includes('/@sveltejs/kit/src/types/synthetic/')) {
		continue;
	}
	if (file.endsWith('.ts') && file.startsWith('node_modules/')) {
		continue;
	}

	let contents = fs.readFileSync(`${cwd}/${file}`);

	if (file === 'svelte.config.js') {
		contents = Buffer.from(
			contents.toString('utf-8').replace(`$shared: '../shared'`, `$shared: 'shared'`)
		);
	}

	zip.addFile(file.replace('node_modules/esbuild-wasm/', 'node_modules/esbuild/'), contents);
}
console.timeEnd('zip.addFile');

if (ignored_files.size > 0) {
	console.warn(`expected to find ${Array.from(ignored_files).join(', ')}`);
}

console.time('writing zip');
const out = zip.toBuffer();
const outfile = process.argv.includes('--test')
	? 'scripts/bundle-editor/test/files.zip'
	: `src/lib/webcontainer/files.zip`;
fs.writeFileSync(outfile, out);
console.timeEnd('writing zip');

// console log the file size of out in megabytes
console.log();
console.log(`Zip file is ${Math.round((fs.statSync(outfile).size / 1024 / 1024) * 100) / 100}MB`);

// Remove the copied shared folder
execSync('rm -r shared', { cwd });

// bundle unzip script so we can use it in the webcontainer
esbuild.buildSync({
	entryPoints: [fileURLToPath(new URL('./unzip.js', import.meta.url))],
	bundle: true,
	platform: 'node',
	minify: true,
	outfile: 'src/lib/webcontainer/unzip.cjs',
	format: 'cjs'
});

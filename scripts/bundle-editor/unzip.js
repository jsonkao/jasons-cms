/**
 * Directly copied from learn.svelte.dev, except commented out esbuild stuff
 * because we install that in the container (learn.svelte.dev prebundles esbuild-wasm)
 */

import fs from 'fs';
import AdmZip from 'adm-zip';

const zip = new AdmZip('files.zip');
zip.extractAllTo('.');

if (!fs.existsSync('node_modules/.bin')) {
	fs.mkdirSync('node_modules/.bin');
}

if (!fs.existsSync('node_modules/.bin/svelte-kit')) {
	fs.symlinkSync('../@sveltejs/kit/svelte-kit.js', 'node_modules/.bin/svelte-kit');
	fs.chmodSync('node_modules/.bin/svelte-kit', 0o777);
}

if (!fs.existsSync('node_modules/.bin/esbuild')) {
	fs.symlinkSync('../esbuild/bin/esbuild', 'node_modules/.bin/esbuild');
	fs.chmodSync('node_modules/.bin/esbuild', 0o777);
}

// chmod a+x node_modules/vite/bin/vite.js
fs.chmodSync('node_modules/vite/bin/vite.js', 0o755);

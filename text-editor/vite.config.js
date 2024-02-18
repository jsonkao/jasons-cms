import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), importResolve()],
	optimizeDeps: {
		include: [
			'prosemirror-state',
			'prosemirror-transform',
			'prosemirror-model',
			'prosemirror-view',
			'prosemirror-keymap',
			'prosemirror-inputrules',
			'y-prosemirror',
			'prosemirror-commands',
			'@liveblocks/client',
			'@liveblocks/yjs',
			'yjs'
		]
	},
	// Normally this would be unnecessary, but we
	// need it for learn.svelte.dev
	server: {
		fs: {
			strict: false
		}
	}
});

/**
 * A Vite plugin that resolves imports to JsDelivr CDN. This way, we won't have to `npm install` packages we need.
 * This is what Observable does.
 * @returns {import('vite').Plugin}
 */
function importResolve() {
	return {
		name: 'resolve-import',
		resolveId: (specifier, importer) => {
			if (!importer) return;

			if (importer.endsWith('.svelte') || importer.endsWith('.js')) {
				const { name, range, path = '+esm' } = parseNpmSpecifier(specifier);
				return { id: `https://cdn.jsdelivr.net/npm/${name}${range ? `@${range}` : ''}/${path}` };
			}
		}
	};
}

/**
 * Parses an npm specifier into its parts. Taken from https://github.com/observablehq/framework/blob/main/src/javascript/imports.ts#L299
 * @param {string} specifier
 * @returns {{ name: string; range?: string; path?: string }}
 */
function parseNpmSpecifier(specifier) {
	const parts = specifier.split('/');
	const namerange = /** @type {string} */ (
		specifier.startsWith('@') ? [parts.shift(), parts.shift()].join('/') : parts.shift()
	);
	const ranged = namerange.indexOf('@', 1);
	return {
		name: ranged > 0 ? namerange.slice(0, ranged) : namerange,
		range: ranged > 0 ? namerange.slice(ranged + 1) : undefined,
		path: parts.length > 0 ? parts.join('/') : undefined
	};
}

/**
 * A Vite plugin that adds CORS according to webcontainer troubleshooting docs
 * @returns {import('vite').Plugin}
 */
function addCors() {
	return {
		name: 'add-cors',

		configureServer(server) {
			server.middlewares.use((_req, res, next) => {
				res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
				res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
				res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
				next();
			});
		}
	};
}

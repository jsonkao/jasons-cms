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
	},
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

			if (specifier.startsWith('vite/preload-helper') || specifier.includes('vite/preload-helper'))
				return;

			if (importer.endsWith('.svelte') || importer.endsWith('.js')) {
				const { name, range, path = '+esm' } = parseNpmSpecifier(specifier);
				return {
					id: `https://cdn.jsdelivr.net/npm/${name}${range ? `@${range}` : ''}/${path}`.replaceAll(
						'\x00',
						''
					)
				};
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

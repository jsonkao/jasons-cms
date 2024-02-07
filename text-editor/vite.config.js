import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: [
			'prosemirror-state',
			'prosemirror-transform',
			'prosemirror-model',
			'prosemirror-view',
			'prosemirror-keymap',
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

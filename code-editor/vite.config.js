import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ['codemirror', '@replit/codemirror-lang-svelte']
	},
	server: {
		fs: {
			/* Extend the default Vite config to allow importing from the shared folder: https://vitejs.dev/config/server-options.html#server-fs-allow */
			allow: [searchForWorkspaceRoot(process.cwd()), '../shared']
		}
	}
});

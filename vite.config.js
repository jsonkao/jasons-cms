import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'add-cors',

			configureServer(server) {
				server.middlewares.use((_req, res, next) => {
					res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
					res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
					res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
					next();
				});
			}
		}
	],
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

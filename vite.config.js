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
				res.setHeader('Access-Control-Allow-Credentials', true);
				res.setHeader('Access-Control-Allow-Origin', '*');
				res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
				res.setHeader(
					'Access-Control-Allow-Headers',
					'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
				);
				next();
			});
		}
	};
}

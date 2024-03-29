import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Everywhere text-editor is deployed (Vercel and as a bundled zip in a webcontainer), we
		// manually copied the ./shared folder to ./text-editor/shared.
		alias: {
			$shared: process.env.VERCEL || process.env.WEBCONTAINER ? './shared' : '../shared'
		},

		// For the tutorial, we need to disable CSRF protection.
		// Don't do this in your own apps unless you know what you're doing!
		// See https://kit.svelte.dev/docs/configuration#csrf for more info.
		csrf: {
			checkOrigin: false
		},

		paths: {
			assets: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''
		},

		adapter: adapter({
			strict: false
		})
	},

	vitePlugin: {
		// This enables compile-time warnings to be
		// visible in the learn.svelte.dev editor
		onwarn: (warning, defaultHandler) => {
			console.log('svelte:warnings:%s', JSON.stringify(warning));
			defaultHandler(warning);
		}
	}
};

export default config;

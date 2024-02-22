import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	test: {
		environment: 'happy-dom'
	},
	resolve: {
		alias: {
			$shared: resolve('./shared'),
			$lib: resolve('./src/lib'),
			'$app/environment': resolve('./mocks/app-environment.js'),
			'$app/stores': resolve('./mocks/app-stores.js'),
      '@webcontainer/api': resolve('./mocks/webcontainer-api.js'),
      './files.js': resolve('./mocks/files.js'),
		}
	}
});

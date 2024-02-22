import { fs, vol } from 'memfs';

vol.mkdirSync('/src/lib/generated', { recursive: true });
export const WebContainer = {
	boot: () => ({
		on: () => {},
		mount: () => {},
		spawn: () => ({
			output: {
				pipeTo: () => {}
			},
			exit: Promise.resolve({ code: 0 })
		}),

		fs: fs.promises
	})
};

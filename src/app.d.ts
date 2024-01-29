import type { loadFiles } from '$lib/webcontainer/files.ts';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	type BundleFiles = ReturnType<typeof loadFiles>;

	interface WebcontainerModule {
		startWebContainer(blocks: Block[], files: BundleFiles): Promise<void>;
		stopWebContainer(): Promise<void>;
	}
}

export {};

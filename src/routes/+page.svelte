<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { loadFiles } from '$lib/webcontainer/files.ts';
	import Editor from './Editor.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	const { blocks } = data;

	let webcontainerModule: Promise<WebcontainerModule>;
	let files: ReturnType<typeof loadFiles>;

	if (browser) {
		webcontainerModule = new Promise(async (fulfill, reject) => {
			try {
				const module = await (await import('$lib/webcontainer/index.ts')).create();
				fulfill(module);
			} catch (e) {
				reject(e);
			}
		});
		files = loadFiles();
	}

	/**
	 * Starting and stopping webcontainer
	 */
	onMount(async () => (await webcontainerModule).startWebContainer(blocks, await files));
	onDestroy(async () => webcontainerModule && (await webcontainerModule).stopWebContainer());
</script>

<Editor {blocks} />

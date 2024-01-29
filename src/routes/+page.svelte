<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { loadFiles } from '$lib/webcontainer/files.ts';
	import { startWebContainer, stopWebContainer } from '$lib/webcontainer/index.ts';
	import Editor from './Editor.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	const { blocks } = data;

	let webcontainerModule: Promise<WebcontainerModule>;
	let files: ReturnType<typeof loadFiles>;

	if (browser) {
		// Start loading files while webcontainer is booting
		files = loadFiles();
	}

	/**
	 * Starting and stopping webcontainer
	 */
	onMount(() => startWebContainer(blocks, files));
	onDestroy(async () => browser && await stopWebContainer());
</script>

<Editor {blocks} />

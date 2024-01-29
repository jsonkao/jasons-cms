<script lang="ts">
	import { browser } from '$app/environment';
	import { openComponent } from '$lib/stores';
	import { startWebContainer, writeFile } from '$lib/webcontainer/instance.ts';
	import type { PageData } from './$types';
	import Editor from './Editor.svelte';

	export let data: PageData;
	const { blocks } = data;

	/**
	 * Starting and stopping webcontainer
	 */
	console.log('+page.svelte');
	if (browser) startWebContainer(blocks);

	/**
	 * Handles saving the file. Eventually, will probably communicate with a database.
	 * TODO: Incorporate $openGlobalFile
	 */
	function handleSave(event: CustomEvent) {
		if (!$openComponent) {
			console.error('Attempted to save but openComponent is null', event);
			return;
		}
		writeFile($openComponent, event.detail);
	}
</script>

<Editor {blocks} on:save={handleSave} />

<script lang="ts">
	import { browser } from '$app/environment';
	import { openComponent } from '$lib/stores';
	import { startWebContainer, writeFile } from '$lib/webcontainer/instance.ts';
	import type { PageData } from './$types';
	import Editor from './Editor.svelte';

	/**
	 * Retrieve page's blocks data
	 */
	export let data: PageData;
	const { blocks } = data;

	/**
	 * In browser, start webcontainer
	 */
	if (browser) {
		startWebContainer(blocks);
		openComponent.set(
			`/src/lib/generated/${(blocks.find((d) => d.type === 'graphic') as GraphicBlock).name}.svelte`
		);
	}

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

<Editor on:save={handleSave} />

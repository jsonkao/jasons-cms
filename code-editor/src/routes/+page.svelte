<script lang="ts">
	import { browser } from '$app/environment';
	import { GENERATED_PATH } from '$lib/constants.js';
	import { openComponent } from '$lib/stores/code-editor.js';
	import { startWebContainer, writeFile } from '$lib/webcontainer/instance.js';
	import type { PageData } from './$types';
	import Editor from './Editor.svelte';

	/**
	 * Retrieve page's blocks data
	 */
	export let data: PageData;
	const { initialGraphics } = data;

	/**
	 * In browser, start webcontainer
	 */
	if (browser) {
		startWebContainer(initialGraphics);
		openComponent.set(initialGraphics[0].name);
	}

	/**
	 * Handles saving the file. Eventually, will probably communicate with a database.
	 * TODO: Incorporate $openGlobalFile
	 */
	function handleSave(event: CustomEvent) {
		const name = $openComponent;
		if (!name) {
			console.error('Attempted to save but openComponent is null', event);
			return;
		}
		writeFile(`${GENERATED_PATH}/${name}.svelte`, event.detail);
	}
</script>

<Editor on:save={handleSave} />

<script lang="ts">
	import { browser } from '$app/environment';
	import { GENERATED_PATH } from '$lib/constants.js';
	import { openComponentName } from '$lib/stores/code-editor.js';
	import { startWebContainer, writeFile } from '$lib/webcontainer/instance.js';
	import Editor from './Editor.svelte';

	/**
	 * In browser, start webcontainer
	 */
	if (browser) {
		startWebContainer();
	}

	/**
	 * Handles saving the file. Eventually, will probably communicate with a database.
	 * TODO: Incorporate $openGlobalFile
	 */
	function handleSave(event: CustomEvent) {
		const name = $openComponentName;
		if (!name) {
			console.error('Attempted to save but openComponentName is null', event);
			return;
		}
		writeFile(`${GENERATED_PATH}/${name}.svelte`, event.detail);
	}
</script>

<Editor on:save={handleSave} />

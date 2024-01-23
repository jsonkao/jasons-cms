<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { startWebContainer, stopWebContainer } from '$lib/webcontainer/index';
	import Editor from './Editor.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	const { blocks } = data;

	/**
	 * Starting and stopping webcontainer
	 */
	onMount(() => startWebContainer(blocks));
	onDestroy(() => browser && stopWebContainer);
</script>

<Editor {blocks} />

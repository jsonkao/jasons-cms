<script>
	import Component from './Component.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<div class="content">
	{#each data.blocks as block}
		{#if block.type === 'graphic'}
			<Component name={block.name} {data} />
		{:else if block.type === 'text'}
			<!-- These class names are to duplicate Prosemirror logic for styling -->
			<div class="ui-editor" class:editor_empty={block.text === '<paragraph></paragraph>'}>
				{@html block.text
					.replace(/<headline>/g, '<h1>')
					.replace(/<\/headline>/g, '</h1>')
					.replace(/<paragraph>/g, '<p>')
					.replace(/<\/paragraph>/g, '</p>')}
			</div>
		{/if}
	{/each}
</div>

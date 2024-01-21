<script>
	import Graphic from '$lib/Graphic.svelte';

  const components = {
    Graphic
  }

	let content = [
		{
			type: 'text',
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel, luctus ornare lacus.'
		},
		{
			type: 'text',
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel, luctus ornare lacus.'
		},
		{
			type: 'graphic',
			component: 'Graphic'
		},
		{
			type: 'text',
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel, luctus ornare lacus.'
		},
		{
			type: 'text',
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel, luctus ornare lacus.'
		}
	];
</script>

<div class="content">
  {#each content as { type, text, component }}
    {#if type === 'text'}
      <p>{text}</p>
    {:else if type === 'graphic' && component}
      <svelte:component this={components[component]} />
    {/if}
  {/each}
</div>

<style>
	.content {
		margin: 120px 0;
	}

	p {
		font-family: Helvetica;
		font-size: 16px;
		line-height: 1.4;
	}

	.content > * {
		max-width: 520px;
		margin: 1.7rem auto;
	}
</style>

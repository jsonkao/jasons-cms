<script lang="ts">
	import { startWebContainer, stopWebContainer } from '$lib/webcontainer';
	import { base, progress } from '$lib/stores.js';
	import { fade } from 'svelte/transition';
	import { onDestroy, onMount } from 'svelte';

	onMount(() => {
		window.addEventListener('message', function (event) {
			console.log('Message received from the child: ' + JSON.stringify(event.data)); // Message received from child
		});
		startWebContainer();
	});

	onDestroy(async () => {
		await stopWebContainer();
	});

	let iframe: HTMLIFrameElement;

	$: if ($base) iframe.src = $base;
</script>

<div class="content">
	<p>
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra
		urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel,
		luctus ornare lacus.
	</p>
	<p>
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra
		urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel,
		luctus ornare lacus.
	</p>
	<div class="iframe-container">
		<iframe bind:this={iframe} title="Embed" class:loading={!$base} />
		{#if $progress}
			<p transition:fade>{$progress}</p>
		{/if}
	</div>
	<p>
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra
		urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel,
		luctus ornare lacus.
	</p>
	<p>
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra
		urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel,
		luctus ornare lacus.
	</p>
</div>

<style>
	.content {
		margin-top: 100px;
	}

	p {
		font-family: Helvetica;
		font-size: 16px;
		line-height: 1.4;
	}

	iframe {
		display: block;
		width: 100%;
		height: 540px;
		resize: none;
		box-sizing: border-box;
		border: none;
	}

	iframe.loading {
		background: #eee;
	}

	.content > * {
		max-width: 520px;
		margin: 1.7rem auto;
	}

	.iframe-container {
		display: grid;
	}

	.iframe-container > * {
		grid-area: 1 / 1;
	}

	.iframe-container p {
		z-index: 1;
		position: relative;
		justify-self: center;
		align-self: center;
		margin: 0;
	}
</style>

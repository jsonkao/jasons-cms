<script>
	/**
	 * This component is currently unused. Need to figure out how to integrate global files
	 * with YDoc.
	 */
	import { openComponentName, openGlobalFile } from '$lib/stores/code-editor.js';

	$: openFile = $openGlobalFile || $openComponentName;

	$: files = [
		{ label: 'Client', filename: $openComponentName },
		{ label: 'Data', filename: '/src/routes/+page.server.js' },
		{ label: 'Styles', filename: '/src/routes/styles.css' }
	];
</script>

<div class="tabs">
	{#each files as { label, filename }}
		<button
			class:current={filename === openFile}
			on:click={() => openGlobalFile.set(label === 'Client' ? null : filename)}
		>
			{label}
		</button>
	{/each}
</div>

<style>
	.tabs {
		position: absolute;
		top: 9px;
		left: 12px;
		display: flex;
	}

	button {
		background: none;
		padding: 0;
		cursor: pointer;
		border: none;
		display: block;
		margin-right: 7px;
		color: white;
		font-size: 0.7rem;
		opacity: 0.6;
		transition-duration: 0.3s;
	}

	button.current,
	button:hover {
		opacity: 0.9;
	}
</style>

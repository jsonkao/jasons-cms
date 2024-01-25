<script>
	/**
	 * This component is currently unused. Need to figure out how to integrate global files
	 * with YDoc.
	*/
	import { globalFiles } from '$lib/constants';
	import { openComponent, openGlobalFile } from '$lib/stores';

	$: openFile = $openGlobalFile || $openComponent;

	$: files = [
		{ label: 'Client', filename: $openComponent },
		{ label: 'Data', filename: globalFiles.DATA },
		{ label: 'Styles', filename: globalFiles.STYLES }
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
		-webkit-font-smoothing: antialiased;
		background: none;
		padding: 0;
		cursor: pointer;
		border: none;
		display: block;
		margin-right: 7px;
		color: white;
		font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
		font-size: 0.7rem;
		opacity: 0.6;
		transition-duration: 0.3s;
	}

	button.current,
	button:hover {
		opacity: 0.9;
	}
</style>

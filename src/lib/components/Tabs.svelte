<script>
	import { openComponentName, openGlobalFile } from '$lib/stores/code-editor.js';
	import { PAGE_LEVEL_FILES } from '$shared/constants.js';

	$: openFile = $openGlobalFile || $openComponentName;

	$: files = [
		{ label: 'visual', filename: $openComponentName },
		{ label: 'data', filename: PAGE_LEVEL_FILES.data }
	];
</script>

<div class="tabs">
	{#each files as { label, filename }}
		<button
			class:current={filename === openFile}
			disabled={filename === null}
			on:click={() => openGlobalFile.set(label === 'visual' ? null : filename)}
		>
			{label}
		</button>
	{/each}
</div>

<style>
	.tabs {
		position: absolute;
		top: 12px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		z-index: 10;
	}

	button {
		background: none;
		padding: 0;
		cursor: pointer;
		border: none;
		display: block;
		margin-right: 7px;
		color: white;
		font-size: 1em;
		opacity: 0.3;
		transition-duration: 0.2s;
	}

	button.current,
	button:hover {
		opacity: 0.6;
	}
</style>

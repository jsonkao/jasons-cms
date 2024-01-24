<script lang="ts">
	import { codeEditorPosition } from '$lib/stores';

	export let showCodeEditor: boolean;
</script>

<div class="container layout-{$codeEditorPosition}" class:showing-editor={showCodeEditor}>
	<div class="code-editor-container">
		<slot name="code-editor-container" />
	</div>

	<div class="iframe-container">
		<slot name="iframe-container" />
	</div>
</div>

<style>
	.container {
		display: grid;
		width: 100%;
		height: 100vh;
	}

  .code-editor-container > div, .iframe-container > div {
    display: contents;
  }

	.code-editor-container {
		min-width: 0;
		width: 100%;
		justify-self: center;
		align-self: center;
	}

	.iframe-container {
		display: grid;
	}

	.layout-center > :global(*) {
		grid-row: 1;
		grid-column: 1;
	}

	.layout-center .code-editor-container {
		max-width: 720px;
	}

	.layout-bottom .code-editor-container {
		height: 100%;
		max-height: auto;
	}

	.layout-left {
		grid-template-columns: 0fr 1fr;
	}
	.layout-left.showing-editor {
		grid-template-columns: 1fr 390px;
	}

	.layout-bottom {
		grid-template-rows: 1fr 0;
	}
	.layout-bottom.showing-editor {
		grid-template-rows: 50% 50%;
	}

	.layout-left .iframe-container {
		grid-row: 1;
		grid-column: 2;
	}

	.layout-bottom .iframe-container {
		grid-row: 1;
		grid-column: 1;
	}
</style>

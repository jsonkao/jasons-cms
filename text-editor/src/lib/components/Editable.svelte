<script>
	import { lastTextFocused } from '$lib/stores.js';
	import { doc, getId } from '$lib/prosemirror/index.js';
	import ProsemirrorEditor from './ProsemirrorEditor/index.svelte';

	/** @type {import('yjs').XmlFragment | undefined} */
	export let fragment = undefined;

	/** @type {Object<string, any>} */
	export let pmEditors = {};

	/** @type {import('yjs').Map<any> | undefined} */
	export let prose = undefined;

	/** @type {string | undefined} */
	export let key = undefined;

	if (!fragment) {
		if (prose && key) {
			fragment = prose.get(key);
		} else {
			throw new Error('fragment or prose and key must be provided');
		}
	}
</script>

<ProsemirrorEditor
	bind:this={pmEditors[getId(fragment)]}
	on:blur={() => lastTextFocused.set(getId(fragment))}
	editorStateCreator={() => doc.createEditorForBlock(fragment)}
/>

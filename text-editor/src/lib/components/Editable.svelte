<script>
	import { lastTextFocused } from '$lib/stores.js';
	import { doc, getId } from '$lib/prosemirror/index.js';
	import { makeFragment } from '$lib/shared/shared-doc.js';
	import ProsemirrorEditor from './ProsemirrorEditor.svelte';

	/** @type {boolean} */
	export let hasFloatingMenu = false;

	/** @type {import('yjs').XmlFragment | undefined} */
	export let fragment = undefined;

	/** @type {Object<string, any>} */
	export let pmEditors = {};

	/** @type {import('yjs').Map<any> | undefined} */
	export let prose = undefined;

	/** @type {string | undefined} */
	export let key = undefined;

	if (!fragment) {
		if (prose !== undefined && key !== undefined) {
			if (typeof key !== 'string') throw new Error('key must be a string');

			if (!prose.has(key)) prose.set(key, makeFragment('Write here...'));
			fragment = prose.get(key);
		} else {
			throw new Error('fragment or prose and key must be provided');
		}
	}
</script>

<ProsemirrorEditor
	bind:this={pmEditors[getId(fragment)]}
	on:blur={() => lastTextFocused.set(getId(fragment))}
	editorStateCreator={() => doc.createEditorForBlock(fragment, { hasFloatingMenu })}
/>

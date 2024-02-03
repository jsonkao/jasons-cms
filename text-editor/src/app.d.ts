import type { EditorState } from 'prosemirror-state';
import type { Fragment } from 'prosemirror-model';
import type ProsemirrorEditor from '$lib/components/ProsemirrorEditor.svelte';
import type { UndoManager } from 'yjs';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// Why don't these types work in ambient.d.ts?

	type BlockWithState =
		| (TextBlock & { state: EditorState; editor?: ProsemirrorEditor })
		| GraphicBlock;

	// TODO: put this in shared
	type BlockMap = Y.Map<Y.XmlFragment | string>;

	type BlockInsertionParams = {
		editorNodes: Fragment;
		cursorIndex: number;
		activeYXmlFragment: Y.XmlFragment;
	};
}

export {};
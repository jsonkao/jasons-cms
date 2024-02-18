import type { EditorState } from 'prosemirror-state';
import type { Node } from 'prosemirror-model';
import type { XmlFragment } from 'yjs';

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

	type BlockInsertionParams = {
		docNode: Node;
		cursorPosition: number;
		activeYXmlFragment: XmlFragment;
	};
}

export {};

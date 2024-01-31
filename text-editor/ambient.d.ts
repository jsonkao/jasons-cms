import type { EditorState } from 'prosemirror-state';
import type ProsemirrorEditor from '$lib/components/ProsemirrorEditor.svelte';

type BlockWithState =
	| (TextBlock & { state: EditorState; editor?: ProsemirrorEditor })
	| GraphicBlock;

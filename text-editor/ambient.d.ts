import type { EditorState } from 'prosemirror-state';
import type ProsemirrorEditor from '$lib/components/ProsemirrorEditor.svelte';

type BlockWithState =
	| (TextBlock & { state: EditorState; editor?: ProsemirrorEditor })
	| GraphicBlock;

// TODO: share this
type BlockMap = Y.Map<Y.XmlFragment | string>;

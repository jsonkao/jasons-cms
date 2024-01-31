import { Schema } from 'prosemirror-model';
import type { MarkSpec, DOMOutputSpec } from 'prosemirror-model';

const emDOM: DOMOutputSpec = ['em', 0];
const strongDOM: DOMOutputSpec = ['strong', 0];

/**
 * Schema to represent multiple lines of minimally rich text. Based on
 * prosemirror-schema-basic and prosemirror-svelte.
 * TODO: Add links, maybe images
 */

export const richTextSchema = new Schema({
	nodes: {
		doc: {
			content: 'block+'
		},
		paragraph: {
			content: 'text*',
			group: 'block',
			parseDOM: [{ tag: 'p' }],
			toDOM: () => ['p', 0]
		},
		text: {
			inline: true,
			group: 'inline'
		},
		headline: {
			content: 'text*',
			group: 'block',
			parseDOM: [{ tag: 'h1' }],
			toDOM: () => ['h1', 0]
		}
	},
	marks: {
		/// An emphasis mark. Rendered as an `<em>` element. Has parse rules
		/// that also match `<i>` and `font-style: italic`.
		em: {
			parseDOM: [
				{ tag: 'i' },
				{ tag: 'em' },
				{ style: 'font-style=italic' },
				{ style: 'font-style=normal', clearMark: (m) => m.type.name == 'em' }
			],
			toDOM() {
				return emDOM;
			}
		} as MarkSpec,

		/// A strong mark. Rendered as `<strong>`, parse rules also match
		/// `<b>` and `font-weight: bold`.
		strong: {
			parseDOM: [
				{ tag: 'strong' },
				// This works around a Google Docs misbehavior where
				// pasted content will be inexplicably wrapped in `<b>`
				// tags with a font-weight normal.
				{ tag: 'b', getAttrs: (node: HTMLElement) => node.style.fontWeight != 'normal' && null },
				{ style: 'font-weight=400', clearMark: (m) => m.type.name == 'strong' },
				{
					style: 'font-weight',
					getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
				}
			],
			toDOM() {
				return strongDOM;
			}
		} as MarkSpec
	}
});

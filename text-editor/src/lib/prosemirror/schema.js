import { Schema } from 'prosemirror-model';

/** @type {import('prosemirror-model').DOMOutputSpec} */
const emDOM = ['em', 0];

/** @type {import('prosemirror-model').DOMOutputSpec} */
const strongDOM = ['strong', 0];

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
		em: /** @type {import('prosemirror-model').MarkSpec} */ ({
			parseDOM: [
				{ tag: 'i' },
				{ tag: 'em' },
				{ style: 'font-style=italic' },
				{ style: 'font-style=normal', clearMark: (m) => m.type.name == 'em' }
			],
			toDOM() {
				return emDOM;
			}
		}),

		/// A strong mark. Rendered as `<strong>`, parse rules also match
		/// `<b>` and `font-weight: bold`.
		strong: /** @type {import('prosemirror-model').MarkSpec} */ ({
			parseDOM: [
				{ tag: 'strong' },
				// This works around a Google Docs misbehavior where
				// pasted content will be inexplicably wrapped in `<b>`
				// tags with a font-weight normal.
				{
					tag: 'b',
					getAttrs: /** @param {HTMLElement} node */ (node) =>
						node.style.fontWeight != 'normal' && null
				},
				{ style: 'font-weight=400', clearMark: (m) => m.type.name == 'strong' },
				{
					style: 'font-weight',
					getAttrs: /** @param {string} value */ (value) =>
						/^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
				}
			],
			toDOM() {
				return strongDOM;
			}
		})
	}
});

/**
 * This file contains helper functions for creating ProseMirror state and schema
 */

import { EditorState, TextSelection, type Plugin } from 'prosemirror-state';
import { Schema, type MarkSpec, type DOMOutputSpec, DOMParser } from 'prosemirror-model';
import { richTextPlugins, corePlugins } from 'prosemirror-svelte/helpers/plugins';

/**
 * Schema to represent multiple lines of minimally rich text. Based on
 * prosemirror-schema-basic and prosemirror-svelte.
 * TODO: Add links, maybe images
 * @type {Schema}
 */

const emDOM: DOMOutputSpec = ['em', 0];
const strongDOM: DOMOutputSpec = ['strong', 0];

const richTextSchema = new Schema({
	nodes: {
		doc: {
			content: 'paragraph+'
		},
		paragraph: {
			content: 'text*',
			parseDOM: [{ tag: 'p' }],
			toDOM: () => ['p', 0]
		},
		text: {
			inline: true
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

/**
 * A function that creates a minimal rich text editor.
 * Based on the createRichTextEditor function from prosemirror-svelte.
 */
export const createEditor = (html: string = '', plugins: Plugin[] = []): EditorState => {
	let doc, selection;

	if (html) {
		doc = createDocumentFromHtml(richTextSchema, html);
		selection = TextSelection.atEnd(doc);
	}

	return EditorState.create({
		schema: richTextSchema,
		doc,
		selection,
		plugins: [...corePlugins, ...richTextPlugins, ...plugins]
	});
};

/**
 * Parses an html string to create a document from it.
 * Taken from prosemirror-svelte.
 * @param schema {Schema}
 * @param html {string}
 * @returns {Document}
 */
const createDocumentFromHtml = (schema, html) => {
	const parser = DOMParser.fromSchema(schema);
	const node = document.createElement('div');
	node.innerHTML = html;
	return parser.parse(node);
};

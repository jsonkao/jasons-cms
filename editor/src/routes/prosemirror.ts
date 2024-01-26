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
		/// A link. Has `href` and `title` attributes. `title`
		/// defaults to the empty string. Rendered and parsed as an `<a>`
		/// element.
		link: {
			attrs: {
				href: {},
				title: { default: null }
			},
			inclusive: false,
			parseDOM: [
				{
					tag: 'a[href]',
					getAttrs(dom: HTMLElement) {
						return { href: dom.getAttribute('href'), title: dom.getAttribute('title') };
					}
				}
			],
			toDOM(node) {
				let { href, title } = node.attrs;
				return ['a', { href, title }, 0];
			}
		} as MarkSpec,

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
		selection = TextSelection.atStart(doc);
	}

	return EditorState.create({
		schema: richTextSchema,
		doc,
		selection,
		plugins: [...plugins, ...corePlugins, ...richTextPlugins]
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

/**
 * Generator for a cursor element. Based off y-prosemirror cursor-plugin.js, but really
 * is copying structure from y-codemirror.next/src/y-remote-selections.js
 */
export const cursorBuilder = (user: { name: string; color: string }): HTMLElement => {
	const cursor = document.createElement('span');
	cursor.classList.add('cm-ySelectionCaret');
	cursor.setAttribute('style', `border-color: ${user.color}; background-color: ${user.color}`);

	const divCaretDot = document.createElement('div');
	divCaretDot.classList.add('cm-ySelectionCaretDot');

	const divSelectionInfo = document.createElement('div');
	divSelectionInfo.classList.add('cm-ySelectionInfo');
	divSelectionInfo.insertBefore(document.createTextNode(user.name), null);

	cursor.insertBefore(document.createTextNode('\u2060'), null);
	cursor.insertBefore(divCaretDot, null);
	cursor.insertBefore(document.createTextNode('\u2060'), null);
	cursor.insertBefore(divSelectionInfo, null);
	cursor.insertBefore(document.createTextNode('\u2060'), null);
	return cursor;
};

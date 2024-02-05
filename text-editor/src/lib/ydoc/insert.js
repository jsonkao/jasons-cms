import { prosemirrorToYXmlFragment } from 'y-prosemirror';
import { Map, Text } from 'yjs';

/** @typedef {import('shared').BlockMap} BlockMap */

/**
 * Insert a graphic
 * @param {BlockInsertionParams} arguments
 * @param {string} newGraphicName
 * @returns {Array<BlockMap>}
 */
export function prepareInsertion({ docNode, cursorPosition }, newGraphicName) {
	const textBefore = makeTextBlock(docNode.cut(0, cursorPosition - 1));
	const textAfter = makeTextBlock(docNode.cut(cursorPosition + 1));

	return [
		textBefore,
		makeCodingBlock(
			newGraphicName,
			[
				'<div>',
				'\t<!-- Your code here -->',
				'</div>',
				'',
				'<style>',
				'\tdiv {',
				'\t\theight: 300px;',
				'\t\twidth: 100%;',
				'\t\tbackground: #6495ed66;',
				'\t}',
				'</style>'
			].join('\n')
		),
		textAfter
	];
}

/**
 * @param {import('prosemirror-model').Node} node
 * @returns {BlockMap}
 */
function makeTextBlock(node) {
	const ymap = new Map();
	const yxmlFragment = prosemirrorToYXmlFragment(node);
	ymap.set('type', 'text');
	ymap.set('text', yxmlFragment);

	return ymap;
}

/**
 * @param {string} name
 * @param {string} code
 * @returns {BlockMap}
 */
function makeCodingBlock(name, code) {
	const ymap = new Map();
	ymap.set('type', 'graphic');
	ymap.set('name', name);
	ymap.set('code', new Text(code));
	return ymap;
}

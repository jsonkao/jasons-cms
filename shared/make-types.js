import * as Y from 'yjs';

/** @typedef {import('./types').BlockMap} BlockMap */

/**
 * @param {Y.XmlFragment} yxmlFragment
 * @returns {BlockMap}
 */
export function makeTextBlock(yxmlFragment) {
	const ymap = new Y.Map();
	ymap.set('type', 'text');
	ymap.set('text', yxmlFragment);

	return ymap;
}

/**
 * @param {string} name
 * @param {string} code
 * @returns {BlockMap}
 */
export function makeCodingBlock(name, code) {
	const ymap = new Y.Map();
	ymap.set('type', 'graphic');
	ymap.set('name', name);
	ymap.set('code', new Y.Text(code));

	const proseMap = new Y.Map();
	ymap.set('prose', proseMap);

	return ymap;
}

/**
 * @param {string} initialContent
 * @param {string} [headline]
 * @returns {Y.XmlFragment}
 */
export function makeTextFragment(initialContent, headline) {
	const yxmlFragment = new Y.XmlFragment();
	yxmlFragment.insert(0, initialContent.split('\n').map(makeElement));

	if (headline) {
		const yxmlElement = new Y.XmlElement('headline');
		yxmlElement.insert(0, [new Y.XmlText(headline)]);
		yxmlFragment.insert(0, [yxmlElement]);
	}
	return yxmlFragment;
}

/** @param {string} str */
function makeElement(str) {
	const yxmlElement = new Y.XmlElement('paragraph');
	yxmlElement.insert(0, [new Y.XmlText(str)]);
	return yxmlElement;
}

import { expect, test, beforeAll } from 'vitest';
import { SharedDoc } from './shared-doc';
import { makeCodingBlock, makeTextBlock, makeTextFragment } from './make-types';

/** @type {SharedDoc} */
let doc;

beforeAll(() => {
	/** @type {ReturnType<import('./provider').setupProvider>} */
	let provider = { leave: () => {}, instantiate: () => {} };

	doc = new SharedDoc(provider);
	doc.yarray.insert(0, [
		makeTextBlock(makeTextFragment('foo')),
		makeCodingBlock('graphic1', '<p>hello</p>'),
		makeTextBlock(makeTextFragment('bar'))
	]);

	return () => doc.destroy();
});

test('delete', () => {
	doc.deleteComponent('graphic1');
	expect(doc.yarray.length).toBe(1);
	expect(doc.yarray.get(0).get('text').toString()).toBe(
		'<paragraph>foo</paragraph><paragraph>bar</paragraph>'
	);
});

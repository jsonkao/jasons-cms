import { expect, test, beforeAll } from 'vitest';
import { makeTextFragment, makeTextBlock } from './make-types.js';
import * as Y from 'yjs';
import { BLOCKS_KEY } from './constants.js';

/** @type {Y.Array<any>} */
let yarray;

beforeAll(() => {
	const ydoc = new Y.Doc();
	yarray = ydoc.getArray(BLOCKS_KEY);

	return () => ydoc.destroy();
});

test('makeTextFragment with headline', () => {
	const yxmlFragment = makeTextFragment('Text', 'Headline');
	yarray.insert(0, [yxmlFragment]);
	expect(yxmlFragment.get(0).toString()).toBe('<headline>Headline</headline>');
	expect(yxmlFragment.get(1).toString()).toBe('<paragraph>Text</paragraph>');
});

test('makeTextFragment without headline', () => {
	const yxmlFragment = makeTextFragment('Foo');
	yarray.insert(0, [yxmlFragment]);
	expect(yxmlFragment.get(0).toString()).toBe('<paragraph>Foo</paragraph>');
});

test('makeTextBlock', () => {
	yarray.insert(0, [makeTextBlock(makeTextFragment('Foo'))]);
	expect(yarray.get(0).get('text').toString()).toBe('<paragraph>Foo</paragraph>');
});

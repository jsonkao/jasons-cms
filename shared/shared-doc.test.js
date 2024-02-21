import { expect, test, describe, beforeAll, afterAll } from 'vitest';
import { makeTextFragment } from './shared-doc.js';
import * as Y from 'yjs';
import { BLOCKS_KEY } from './constants.js';

describe('yjs types', () => {
	/** @type {Y.Array<Y.XmlFragment>} */
	let yarray;

	beforeAll(() => {
		const ydoc = new Y.Doc();
		yarray = ydoc.getArray(BLOCKS_KEY);
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
});

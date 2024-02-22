import { test, beforeAll, vi } from 'vitest';
import { syncWebContainerFileSystem } from './instance.js';
import { SharedDoc } from '$shared/shared-doc';
import { makeTextBlock, makeCodingBlock, makeTextFragment } from '$shared/make-types.js';

/** @type {SharedDoc} */
let doc;

vi.stubGlobal('window', { innerWidth: 0 });

beforeAll(() => {
	/** @type {ReturnType<import('$shared/provider').setupProvider>} */
	let provider = { leave: () => {}, instantiate: () => {} };

	doc = new SharedDoc(provider);
	doc.yarray.insert(0, [
		makeTextBlock(makeTextFragment('foo')),
		makeCodingBlock('graphic1', '<p>hello</p>'),
		makeTextBlock(makeTextFragment('bar'))
	]);

	return () => doc.destroy();
});

test('syncWebContainerFileSystem', async () => {
	await syncWebContainerFileSystem(doc.yarray.toArray());
});


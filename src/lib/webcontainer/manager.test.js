import { makeCodingBlock, makeTextBlock, makeTextFragment } from '$shared/make-types.js';
import { SharedDoc } from '$shared/shared-doc';
import { fs, vol } from 'memfs';
import { beforeAll, expect, test } from 'vitest';
import { createWebContainerManager } from './manager.js';

/** @type {SharedDoc} */
let doc;

/** @type {ReturnType<createWebContainerManager>} */
let manager;

vol.mkdirSync('/src/lib/generated', { recursive: true });
vol.mkdirSync('/src/routes', { recursive: true });

/** @type {import('@webcontainer/api').WebContainer} */
let webcontainer;

/** @returns {Promise<import('@webcontainer/api').WebContainer>} */
// @ts-expect-error - we don't need to implement the entire WebContainer interface
const createTestWebContainer = async () => (webcontainer = { fs: fs.promises });

beforeAll(() => {
	/** @type {ReturnType<import('$shared/provider').setupProvider>} */
	// @ts-expect-error - Fake and empty instantiate method
	let provider = { leave: () => {}, instantiate: () => {} };

	doc = new SharedDoc(provider);
	doc.yarray.insert(0, [
		makeTextBlock(makeTextFragment('foo')),
		makeCodingBlock('graphic1', '<p>hello</p>'),
		makeTextBlock(makeTextFragment('bar')),
		makeCodingBlock('graphic2', '<p>world</p>'),
		makeTextBlock(makeTextFragment('baz'))
	]);

	manager = createWebContainerManager(createTestWebContainer);

	return () => {
		doc.destroy();
	};
});

test('file system is being synced', async () => {
	await manager.syncFileSystem(doc.yarray.toArray(), new Map([['+page.server.js', 'foo']]));

	expect(webcontainer.fs.readdir('/src/lib/generated')).resolves.toEqual([
		'graphic1.svelte',
		'graphic2.svelte',
		'index.js'
	]);
	expect(webcontainer.fs.readFile('/src/lib/generated/index.js', 'utf-8')).resolves.toBe(
		`export { default as graphic1 } from './graphic1.svelte';\nexport { default as graphic2 } from './graphic2.svelte';`
	);
	expect(webcontainer.fs.readFile('/src/routes/+page.server.js', 'utf-8')).resolves.toBe('foo');
});

test('files are saved in the correct places', async () => {
	await manager.saveFile('graphic10', null, '<p>ok</p>');
	expect(webcontainer.fs.readdir('/src/lib/generated')).resolves.toContain('graphic10.svelte');

	await manager.saveFile('graphic10', '+page.server.js', 'foo');
	expect(webcontainer.fs.readFile('/src/routes/+page.server.js', 'utf-8')).resolves.toBe('foo');
});

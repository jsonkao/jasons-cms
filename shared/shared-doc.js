import { createClient } from '@liveblocks/client';
import LiveblocksProvider from '@liveblocks/yjs';
import * as Y from 'yjs';
import { BLOCKS_KEY, PAGE_FILES_KEY } from './constants.js';
import { readableArray } from './readable-array.js';
import { readableMap } from './readable-map.js';

/** @typedef {import('./index.d.ts').BlockMap} BlockMap */

export class SharedDoc {
	/** @type {import('y-protocols/awareness').Awareness} */
	awareness;

	/** @type {import('./index').YReadableArray<BlockMap>} */
	yarrayStore;

	/** @type {Y.Array<BlockMap>} */
	yarray;

	/** @type {Y.Doc} */
	ydoc;

	/** @type {number} */
	transactionOrigin;

	/**
	 * @param {{ color: string, name: string }} user
	 * @param {string} slug
	 */
	constructor(user, slug) {
		const client = createClient({
			publicApiKey: 'pk_dev_1iisK8HmLpmVOreEDPQqeruOVvHWUPlchIagQpCKP-VIRyGkCF4DDymphQiiVJ6A'
		});
		const { room, leave } = client.enterRoom(slug, { initialPresence: {} });
		this.leave = leave;

		this.ydoc = new Y.Doc();
		// @ts-ignore
		this.awareness = new LiveblocksProvider(room, this.ydoc).awareness;
		this.awareness.setLocalStateField('user', user);

		this.yarray = this.ydoc.getArray(BLOCKS_KEY);
		this.yarrayStore = readableArray(this.yarray);
		this.yPageFilesStore = readableMap(this.ydoc.getMap(PAGE_FILES_KEY));

		this.transactionOrigin = this.ydoc.clientID;

		this.destroy = this.destroy.bind(this);

		// TODO: Create a different ydoc under a normal WebRTC connection for the files we dont want
		// persistence for? (e.g. Blocks.svelte, but not +page.server.js)
		// TODO: Create a ydoc top-level map for non-block files we do want persistance for (e.g. +page.server.js)
	}

	destroy() {
		this.leave();
		this.ydoc.destroy();
	}

	/**
	 * Finds the index of the element in the Yjs array with a graphic name.
	 * @param {string} name
	 * @returns {number}
	 */
	findGraphic(name) {
		let i = 0;
		for (const element of this.yarrayStore.y.toArray()) {
			if (element.get('name') === name) return i;
			i++;
		}
		return -1;
	}

	/**
	 * Delete a componet with the given name
	 * @param {string} name
	 */
	deleteComponent(name) {
		// First, find the index for the requested component name
		const componentIndex = this.findGraphic(name);
		if (componentIndex === -1)
			throw new Error(`Could not find index of component to delete, ${name}`);

		// This should all work because we enforce having blank text before and after all components
		const textBlockBefore = /** @type {BlockMap} */ (this.yarrayStore.y.get(componentIndex - 1));
		const textBlockAfter = /** @type {BlockMap} */ (this.yarrayStore.y.get(componentIndex + 1));
		if (textBlockBefore.get('type') !== 'text' || textBlockAfter.get('type') !== 'text')
			throw new Error('Expected text before and after component');

		// Clone textBlockBefore to create a new Y.XmlFragment
		const textBefore = /** @type {Y.XmlFragment} */ (textBlockBefore.get('text'));
		const textAfter = /** @type {Y.XmlFragment} */ (textBlockAfter.get('text'));

		const newXmlFragment = new Y.XmlFragment();
		for (let i = 0; i < textBefore.length; i++) newXmlFragment.push([textBefore.get(i).clone()]);
		for (let i = 0; i < textAfter.length; i++) newXmlFragment.push([textAfter.get(i).clone()]);

		const newMap = new Y.Map();
		newMap.set('type', 'text');
		newMap.set('text', newXmlFragment);

		// Then, delete the component from the array
		this.ydoc.transact(() => {
			this.yarrayStore.y.insert(componentIndex - 1, [newMap]);
			this.yarrayStore.y.delete(componentIndex, 3);
		});
	}

	/**
	 * Insert a new graphic
	 * @param {number} index
	 * @param {{ name: string, textBefore: Y.XmlFragment, textAfter: Y.XmlFragment }} configuration
	 */
	insertGraphicSandwich(index, { name, textBefore, textAfter }) {
		const newElements = [
			makeTextBlock(textBefore),
			makeCodingBlock(
				name,
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
					'</style>\n'
				].join('\n')
			),
			makeTextBlock(textAfter)
		];

		this.ydoc.transact(() => {
			this.yarrayStore.y.delete(index);
			this.yarrayStore.y.insert(index, newElements);
		}, this.transactionOrigin);
	}

	/**
	 * Get the index of a target element in an array
	 * @param {BlockMap} targetElement
	 * @returns {number}
	 */
	indexOf(targetElement) {
		let i = 0;
		for (const element of this.yarrayStore.y) {
			if (element === targetElement) return i;
			i++;
		}
		return -1;
	}
}

/**
 * y-prosemirror uses the `destroy` method to clean up each plugin, but that would destroy our global UndoManager.
 * Instead, we have an `actuallyDestroy` method that can be called when we actually want to destroy.
 * This is a bit of a hack, but it works. See https://github.com/yjs/y-prosemirror/issues/114.
 */
export class IndestructibleUndoManager extends Y.UndoManager {
	// @ts-ignore
	constructor(type, opts) {
		super(type, opts);
	}

	// Do nothing
	destroy() {}

	actuallyDestroy() {
		super.destroy();
	}
}

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
export function makeFragment(initialContent, headline) {
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

import * as Y from 'yjs';
import { BLOCKS_KEY, PAGE_FILES_KEY } from './constants.js';
import { readableArray, readableMap } from './stores/index.js';

/** @typedef {import('./types').BlockMap} BlockMap */

export class SharedDoc {
	/** @type {import('y-protocols/awareness').Awareness} */
	awareness;

	/** @type {import('./stores/Readable').YReadableArray<BlockMap>} */
	yarrayStore;

	/** @type {Y.Array<BlockMap>} */
	yarray;

	/** @type {Y.Doc} */
	ydoc;

	/** @type {number} */
	transactionOrigin;

	/**
	 * @param {ReturnType<import('./provider').setupProvider>} provider
	 */
	constructor(provider) {
		this.leave = provider.leave;

		this.ydoc = new Y.Doc();
		// @ts-expect-error
		this.awareness = provider.instantiate(this.ydoc);

		this.yarray = this.ydoc.getArray(BLOCKS_KEY);
		this.yarrayStore = readableArray(this.yarray);
		this.yPageFilesStore = readableMap(this.ydoc.getMap(PAGE_FILES_KEY));

		this.transactionOrigin = this.ydoc.clientID;

		this.destroy = this.destroy.bind(this);
	}

	destroy() {
		this.leave();
		this.ydoc.destroy();
	}

	/**
	 * Delete a component with the given name
	 * @param {string} name
	 */
	deleteComponent(name) {
		const indexOfComponent = this.indexOfName(name);
		if (indexOfComponent === -1)
			throw new Error(`Could not find index of component to delete, ${name}`);

		// This should all work because we enforce having blank text before and after all components
		const textBlockBefore = /** @type {BlockMap} */ (this.yarray.get(indexOfComponent - 1));
		const textBlockAfter = /** @type {BlockMap} */ (this.yarray.get(indexOfComponent + 1));
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
			this.yarray.insert(indexOfComponent - 1, [newMap]);
			this.yarray.delete(indexOfComponent, 3);
		});
	}

	/**
	 * Find the Y.Text element for the given component name or global file.
	 * The global file takes precedence.
	 * @param {string | null} componentName
	 * @param {string | null} globalFile
	 * @returns {import('yjs').Text | undefined}
	 */
	findYText(componentName, globalFile) {
		if (globalFile) {
			return this.yPageFilesStore.y.get(globalFile);
		} else if (componentName) {
			for (const ymap of this.yarray.toArray()) {
				if (ymap.get('name') === componentName)
					return /** @type {import('yjs').Text} */ (ymap.get('code'));
			}
		}
	}

	/**
	 * Get the index of a target element in an array
	 * @param {BlockMap} targetElement
	 * @returns {number}
	 */
	indexOf(targetElement) {
		let i = 0;
		for (const element of this.yarray) {
			if (element === targetElement) return i;
			i++;
		}
		return -1;
	}

	/**
	 * Finds the index of the graphic element in the Yjs blocks array with name
	 * @param {string} name
	 */
	indexOfName(name) {
		let i = 0;
		for (const element of this.yarray) {
			if (element.get('name') === name) return i;
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
	// @ts-expect-error
	constructor(type, opts) {
		super(type, opts);
	}

	// Do nothing
	destroy() {}

	actuallyDestroy() {
		super.destroy();
	}
}

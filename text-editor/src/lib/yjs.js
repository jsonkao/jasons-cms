import { LIVEBLOCKS_ROOM, userColor, userName } from '$lib/generated/globals.js';
import { createClient } from '@liveblocks/client';
import LiveblocksProvider from '@liveblocks/yjs';
import { prosemirrorToYXmlFragment } from 'y-prosemirror';
import {
	UndoManager,
	Map as YMap,
	Text as YText,
	XmlElement as YXmlElement,
	XmlFragment as YXmlFragment,
	XmlText as YXmlText
} from 'yjs';

/**
 * A helper function for creating a Liveblocks room and provider for Yjs.
 * @param {import('yjs').Doc} ydoc
 * @returns {{ awareness: import('y-protocols/awareness').Awareness, leave: () => void }}
 */
export function createLiveblocksProvider(ydoc) {
	const client = createClient({
		publicApiKey: 'pk_dev_1iisK8HmLpmVOreEDPQqeruOVvHWUPlchIagQpCKP-VIRyGkCF4DDymphQiiVJ6A'
	});
	const { room, leave } = client.enterRoom(LIVEBLOCKS_ROOM, {
		initialPresence: {}
	});

	const yProvider = new LiveblocksProvider(room, ydoc);
	yProvider.awareness.setLocalStateField('user', { color: userColor, name: userName });

	return {
		awareness: /** @type {import('y-protocols/awareness').Awareness} */ (yProvider.awareness),
		leave
	};
}

/**
 * Since y-prosemirror uses the `destroy` method to clean up all plugins, we need to
 * prevent that from happening to our shared/global UndoManager. Instead, we provide
 * an `actuallyDestroy` method that can be called when we actually want to destroy.
 * This is a bit of a hack, but it works.
 *
 * See https://github.com/yjs/y-prosemirror/issues/114
 */
export class IndestructibleUndoManager extends UndoManager {
	constructor(type, opts) {
		super(type, opts);
	}

	destroy() {
		// Do nothing
	}

	actuallyDestroy() {
		super.destroy();
	}
}

/**
 * Insert a graphic
 * @param {BlockInsertionParams} arguments
 * @param {string} newGraphicName
 */
export function prepareInsertion({ docNode, cursorPosition }, newGraphicName) {
	const textBefore = makeTextBlock(docNode.cut(0, cursorPosition));
	const textAfter = makeTextBlock(docNode.cut(cursorPosition));

	return [
		textBefore,
		makeCodingBlock(
			newGraphicName,
			'<div />\n<style>div { height: 300px; width: 100%; background: cornflowerblue }</style>'
		),
		textAfter
	];
}

/**
 * @param {import('prosemirror-model').Node} node
 * @returns {YMap<YXmlFragment>}
 */
function makeTextBlock(node) {
	const ymap = new YMap();
	const yxmlFragment = prosemirrorToYXmlFragment(node);
	ymap.set('type', 'text');
	ymap.set('text', yxmlFragment);

	return ymap;
}

/**
 * @param {string} name
 * @param {string} code
 * @returns {YMap<string>}
 */
function makeCodingBlock(name, code) {
	const ymap = new YMap();
	ymap.set('type', 'graphic');
	ymap.set('name', name);
	ymap.set('code', new YText(code));
	return ymap;
}

/**
 * An implementation of findIndex but for Yjs arrays
 * @param {import('yjs').Array<BlockMap>} array
 * @param {BlockMap} targetElement
 */
export function yFindIndex(array, targetElement) {
	let i = 0;
	for (const element of array) {
		if (element === targetElement) return i;
		i++;
	}
	return -1;
}

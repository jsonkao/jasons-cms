/**
 * Copied from prosemirror-svelte
 */

import { toggleMark, baseKeymap, setBlockType } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';

/** @typedef {Record<string, { combo: string; command: import('prosemirror-state').Command }[]>} Config */

/**
 * @param {Config} keyMap
 * @param {string} name
 * @param {string} combo
 * @param {import('prosemirror-state').Command} command
 */
const addKey = (keyMap, name, combo, command) => {
	if (!keyMap[name]) keyMap[name] = [];
	keyMap[name].push({ combo, command });
};

/** @param {import('prosemirror-model').Schema} schema */
const createKeyMapConfiguration = (schema) => {
	/** @type {Config} */
	let config = {};

	addKey(config, 'toggleMarkStrong', 'Mod-b', toggleMark(schema.marks.strong));
	addKey(config, 'toggleMarkStrong', 'Mod-B', toggleMark(schema.marks.strong));

	addKey(config, 'toggleMarkEm', 'Mod-i', toggleMark(schema.marks.em));
	addKey(config, 'toggleMarkEm', 'Mod-I', toggleMark(schema.marks.em));

	addKey(config, 'setBlockTypeParagraph', 'Mod-Alt-0', setBlockType(schema.nodes.paragraph));
	addKey(config, 'setBlockTypeHeadline', 'Mod-Alt-1', setBlockType(schema.nodes.headline));

	return config;
};

/**
 * @param {Config} config
 */
const getKeyMapFromConfig = (config) => {
	const keys = Object.keys(config);
	/** @type {typeof baseKeymap} */
	let bindings = {};
	keys.forEach((key) => {
		config[key].forEach((entry) => {
			bindings[entry.combo] = entry.command;
		});
	});
	return keymap({ ...bindings, ...baseKeymap });
};

/** @param {import('prosemirror-model').Schema} schema */
export const richTextKeyMap = (schema) => getKeyMapFromConfig(createKeyMapConfiguration(schema));

/**
 * Copied from prosemirror-svelte
 */

import { toggleMark, baseKeymap, setBlockType } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';

const addKey = (keyMap, name, combo, command) => {
	if (!keyMap[name]) keyMap[name] = [];
	keyMap[name].push({ combo, command });
};

const createKeyMapConfiguration = (schema) => {
	let config = {};

	addKey(config, 'toggleMarkStrong', 'Mod-b', toggleMark(schema.marks.strong));
	addKey(config, 'toggleMarkStrong', 'Mod-B', toggleMark(schema.marks.strong));

	addKey(config, 'toggleMarkEm', 'Mod-i', toggleMark(schema.marks.em));
	addKey(config, 'toggleMarkEm', 'Mod-I', toggleMark(schema.marks.em));

	addKey(config, 'setBlockTypeParagraph', 'Mod-Alt-0', setBlockType(schema.nodes.paragraph));
	addKey(config, 'setBlockTypeHeadline', 'Mod-Alt-1', setBlockType(schema.nodes.headline));

	return config;
};

const getKeyMapFromConfig = (config) => {
	const keys = Object.keys(config);
	let bindings = {};
	keys.forEach((key) => {
		config[key].forEach((entry) => {
			bindings[entry.combo] = entry.command;
		});
	});
	return keymap({ ...bindings, ...baseKeymap });
};

export const richTextKeyMap = (schema) => getKeyMapFromConfig(createKeyMapConfiguration(schema));

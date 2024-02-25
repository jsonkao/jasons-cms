import { ellipsis, inputRules, smartQuotes } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { redo, undo } from 'y-prosemirror';
import { FloatingMenuPlugin } from './floating-menu.js';
import { richTextKeyMap } from './keymap.js';
import { richTextSchema } from '../schema.js';

/**
 * @param {boolean} hasFloatingMenu
 */
export const corePlugins = (hasFloatingMenu) => {
	const plugins = [
		keymap({
			'Mod-z': undo,
			'Mod-y': redo,
			'Mod-Shift-z': redo
		}),
		richTextKeyMap(richTextSchema),
		inputRules({ rules: smartQuotes.concat(ellipsis) })
	];

	if (hasFloatingMenu) plugins.push(FloatingMenuPlugin());

	return plugins;
};

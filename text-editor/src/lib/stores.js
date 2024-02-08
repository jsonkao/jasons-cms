import { writable } from 'svelte/store';

/** @type {import('svelte/store').Writable<{ visible: boolean, left?: number, top?: number} & Partial<BlockInsertionParams>} */
export const floatingMenuStore = writable({ visible: false });

/** @type {import('svelte/store').Writable<string>} */
export const lastTextFocused = writable('');

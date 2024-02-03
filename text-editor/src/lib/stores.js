import { writable } from 'svelte/store';

/** @type {import('svelte/store').Writable<{ visible: boolean, left?: number, top?: number} & Partial<BlockInsertionParams>} */
export const popupStore = writable({ visible: false });

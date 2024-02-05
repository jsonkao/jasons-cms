import { writable } from 'svelte/store';

/**
 * @type {import('svelte/store').Writable<Array<BlockHeight>>}
 * An array of all elements and their client heights
 */
export const blockHeights = writable([]);

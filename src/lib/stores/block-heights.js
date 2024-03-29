import { writable } from 'svelte/store';

/**
 * @type {import('svelte/store').Writable<import('$shared/types').BlockHeights>}
 * An array of all elements and their client heights
 */
export const blockHeights = writable({});

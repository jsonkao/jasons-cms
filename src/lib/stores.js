import { writable } from 'svelte/store';

/** @type {import('svelte/store').Writable<string | null>} */
export const base = writable(null);

/** @type {import('svelte/store').Writable<string | null>} */
export const progress = writable(null);

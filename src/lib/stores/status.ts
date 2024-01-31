import { writable, type Writable } from 'svelte/store';
import { steps } from '$lib/constants.js';

export const base: Writable<string | null> = writable(null);

export const progress: Writable<(typeof steps)[keyof typeof steps] | null> = writable(
	steps.INITIALIZING
);

export const error: Writable<Error | null> = writable(null);

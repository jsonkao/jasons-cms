import { writable, type Writable } from 'svelte/store';
import { steps } from '$lib/constants.js';

/** We use a timeUpdated property to invalidate/reload iframe on HMR update */
export const base: Writable<null | { url: string; timeUpdated: number }> = writable(null);

export const progress: Writable<(typeof steps)[keyof typeof steps]> = writable(steps.INITIALIZING);

export const error: Writable<Error | null> = writable(null);

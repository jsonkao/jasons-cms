import { writable, type Writable } from 'svelte/store';
import { STEPS } from '$lib/constants.js';

/** A store for the iframe's src url. Uses a timeUpdated property in an attempt to invalidate/reload iframe on HMR update */
export const iframeUrl: Writable<null | { url: string; timeUpdated: number }> = writable(null);

export const progress: Writable<(typeof STEPS)[keyof typeof STEPS]> = writable(STEPS.INITIALIZING);

export const error: Writable<Error | null> = writable(null);

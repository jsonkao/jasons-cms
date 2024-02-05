import { writable } from 'svelte/store';
import { STEPS } from '$lib/constants.js';

/**
 * A store for the iframe's src url. Uses a timeUpdated property in an attempt to invalidate/reload iframe on HMR update
 * @type {import('svelte/store').Writable<null | { url: string; timeUpdated: number }>}
 */
export const iframeUrl = writable(null);

/**
 * The current step in booting and mounting the iframe
 * @type {import('svelte/store').Writable<(typeof STEPS)[keyof typeof STEPS]>}
 */
export const currentStep = writable(STEPS.INITIALIZING);

/**
 * The current error message, if any
 * @type {import('svelte/store').Writable<Error | null>}
 */
export const error = writable(null);

import { writable } from 'svelte/store';

/**
 * @type {import('svelte/store').Writable<string | null>}
 * The graphic in focus (and whose code is in the CodeEditor)
 */
export const openComponentName = writable(null);

/**
 * @type {import('svelte/store').Writable<string | null>}
 * The file in focus that isn't a component (e.g. +page.server.js)
 */
export const openGlobalFile = writable(null);

/**
 * @type {import('svelte/store').Writable<'center' | 'left' | 'bottom'>}
 * The graphic in focus (and whose code is in the CodeEditor)
 */
export const codeEditorPosition = writable('center');

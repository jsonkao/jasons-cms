import { browser } from '$app/environment';
import { writable } from 'svelte/store';

/**
 * @type {import('svelte/store').Writable<string | null>}
 * The graphic in focus (and whose code is in the CodeEditor)
 */
export const openComponentName = writable(null);

/**
 * @type {import('svelte/store').Writable<string | null>}
 * The page-level (non-component) file in focus
 */
export const openGlobalFile = writable(null);

const defaultPosition = browser && window.innerWidth < 800 ? 'bottom' : 'left';
/**
 * @type {import('svelte/store').Writable<'center' | 'left' | 'bottom'>}
 * The graphic in focus (and whose code is in the CodeEditor)
 */
export const codeEditorPosition = writable(defaultPosition);

/**
 * @type {import('svelte/store').Writable<Array<{ user: string, color: string }>>}
 * The other people coding
 */
export const otherCoders = writable([]);

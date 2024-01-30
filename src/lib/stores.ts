import { writable } from 'svelte/store';
import { steps } from './constants';
import type { Writable } from 'svelte/store';

export const base: Writable<string | null> = writable(null);

export const progress: Writable<(typeof steps)[keyof typeof steps] | null> = writable(
	steps.INITIALIZING
);

export const error: Writable<Error | null> = writable(null);

/**
 * The graphic in focus (and whose code is in the CodeEditor)
 */
export const openComponent: Writable<string | null> = writable(null);

export const openGlobalFile: Writable<string | null> = writable(null);

export const codeEditorPosition: Writable<string> = writable('center');

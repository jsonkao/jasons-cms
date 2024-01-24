import { writable } from 'svelte/store';
import { steps } from './constants';
import type { Writable } from 'svelte/store';
import type { steps as Steps } from './constants';

export const base: Writable<string | null> = writable(null);

export const progress: Writable<(typeof Steps)[keyof typeof Steps] | null> = writable(
	steps.INITIALIZING
);

export const error: Writable<Error | null> = writable(null);

export const codeContent: Writable<{ [key: string]: string }> = writable({});

export const codeEditorPosition: Writable<string> = writable('center');

import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export const base: Writable<string | null> = writable(null);

export const status: Writable<string | null> = writable(null);

export const codeContent: Writable<{ [key: string]: string }> = writable({});

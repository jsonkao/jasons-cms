import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export const base: Writable<string | null> = writable(null);

export const codeContent: Writable<{ [key: string]: string }> = writable({});

export const progress = createProgressStore();

export const codeEditorPosition: Writable<string> = writable('center');

function createProgressStore() {
	const { subscribe, set, update } = writable([]);

	return {
		subscribe,
		push: (d: string) => update((a) => [...a, d]),
		clear: () => set([])
	};
}

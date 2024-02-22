import { writable } from 'svelte/store';

export const page = writable({ params: { slug: 'tutorial ' } });

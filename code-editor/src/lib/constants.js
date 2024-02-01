/**
 * Steps for progress
 */
export const steps = {
	INITIALIZING: { number: 0, label: 'initializing' },
	BOOTING: { number: 1, label: 'booting web container' },
	MOUNTING: { number: 2, label: 'writing virtual files' },
	UNZIPPING: { number: 3, label: 'unzipping files' },
	INSTALLING: { number: 4, label: 'installing dependencies' },
	RUNNING: { number: 5, label: 'starting dev server' },
	SERVER_READY: { number: 6, label: 'mounting editor' },
	EDITOR_READY: { number: 7, label: 'editor ready' }
};

/**
 * The base path for dynamically created files in the webcontainer fs
 */
export const GENERATED_PATH = '/src/lib/generated';

/**
 * User attributes
 */

const names = ['Jason', 'Hurubie', 'Chudi Jr.', 'Ben', 'Heidi', 'Liz'];
/** The name for both CodeMirror and ProseMirror's collaborative cursors */
export const userName = names[Math.floor(Math.random() * names.length)];

const colors = ['#A32251', '#004F50', '#D91F25', '#0041FF', '#EBAB3D'];
/** The color for both CodeMirror and ProseMirror's collaborative cursors */
export const userColor = colors[Math.floor(Math.random() * colors.length)];

/**
 * Liveblocks and YJS constants
 */

/** @type {string} Liveblocks room name (later will be dynamic) */
export const LIVEBLOCKS_ROOM = 'my-room';

/** @type {string} The key on a yjs doc where blocks data is stored */
export const YJS_DATA_KEY = 'blocks';

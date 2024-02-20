/** Steps for progress */
export const STEPS = {
	INITIALIZING: { number: 0, label: 'welcome' },
	BOOTING: { number: 1, label: 'booting' },
	MOUNTING: { number: 2, label: 'creating files' },
	INSTALLING: { number: 3, label: 'installing dependencies' },
	RUNNING: { number: 4, label: 'starting server' },
	SERVER_READY: { number: 5, label: 'mounting editor' },
	EDITOR_READY: { number: 6, label: 'editor ready' }
};

/** The base path for dynamically created files in the webcontainer fs */
export const GENERATED_PATH = '/src/lib/generated';

/* User attributes */

const names = ['Jason', 'Hurubie', 'Chudi Jr.', 'Ben', 'Heidi', 'Liz'];
const colors = ['#A32251', '#004F50', '#D91F25', '#0041FF', '#EBAB3D'];
/** The name for both CodeMirror and ProseMirror's collaborative cursors */
export const userName = names[Math.floor(Math.random() * names.length)];
/** The color for both CodeMirror and ProseMirror's collaborative cursors */
export const userColor = colors[Math.floor(Math.random() * colors.length)];

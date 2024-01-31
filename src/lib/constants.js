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
 * User attributes
 */

const names = ['Urvashi', 'Martín', 'John-Michelle', 'Jason', 'Peanut'];
/** The name for both CodeMirror and ProseMirror's collaborative cursors */
export const userName = names[Math.floor(Math.random() * names.length)];

const colors = ['#A32251', '#004F50', '#D91F25', '#0041FF', '#EBAB3D'];
/** The color for both CodeMirror and ProseMirror's collaborative cursors */
export const userColor = colors[Math.floor(Math.random() * colors.length)];

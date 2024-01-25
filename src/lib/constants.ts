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
 * Global files
 */
export const globalFiles = {
	DATA: '+page.server.js',
	STYLES: 'styles.css'
}

/**
 * User attributes
 */

const names = ['Urvashi', 'Martín', 'John-Michelle', 'Jason', 'Peanut']
export const userName = names[Math.floor(Math.random() * names.length)];

const colors = ['#A32251', 'rgb(7, 7, 126)', '#004F50', '#D91F25', '#0041FF', '#EBAB3D'];
export const userColor = colors[Math.floor(Math.random() * colors.length)];

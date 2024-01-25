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

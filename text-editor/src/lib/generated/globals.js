// Defaults. Will be overwritten inside webcontainer

const names = ['Jason'];
const userName = names[Math.floor(Math.random() * names.length)];
const colors = ['#A32251', '#004F50', '#D91F25', '#0041FF', '#EBAB3D'];
const userColor = colors[Math.floor(Math.random() * colors.length)];
export const user = { name: userName, color: userColor };

export const liveblocksRoom = 'oil-wells';

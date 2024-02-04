/**
 * Finds the index of a specified element in a Yjs array.
 * @param {import('yjs').Array<BlockMap>} array
 * @param {BlockMap} targetElement
 * @returns {number}
 */
export function yFindIndex(array, targetElement) {
  let i = 0;
  for (const element of array) {
    if (element === targetElement) return i;
    i++;
  }
  return -1;
}

/**
 * Finds the index of the element in a Yjs array with a graphic name.
 * @param {import('yjs').Array<BlockMap>} array
 * @param {string} name
 * @returns {number}
 */
export function yFindGraphicIndex(array, name) {
  let i = 0;
  for (const element of array) {
    if (element.get("name") === name) return i;
    i++;
  }
  return -1;
}

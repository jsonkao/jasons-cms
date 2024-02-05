import type { Array } from "yjs";
import type { BlockMap } from "./types.d.ts";

/**
 * Finds the index of a specified element in a Yjs array.
 */
export function yFindIndex(array: Array<BlockMap>, targetElement: BlockMap): number {
  let i = 0;
  for (const element of array) {
    if (element === targetElement) return i;
    i++;
  }
  return -1;
}

/**
 * Finds the index of the element in a Yjs array with a graphic name.
 */
export function yFindGraphicIndex(array: Array<BlockMap>, name: string): number {
  let i = 0;
  for (const element of array) {
    if (element.get("name") === name) return i;
    i++;
  }
  return -1;
}

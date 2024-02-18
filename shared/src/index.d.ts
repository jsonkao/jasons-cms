import type * as Y from "yjs";

declare module "shared" {
  export type Subscriber<T> = (value: T) => void;
  export type Unsubscriber = () => void;
  export type Invalidator<T> = (value?: T) => void;
  export interface Readable<T> {
    /**
     * Subscribe on value changes.
     * @param run subscription callback
     * @param invalidate cleanup callback
     */
    subscribe(run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber;
  }

  export type YReadableArray<T> = Readable<Array<T>> & { y: Y.Array<T> };
  export type YReadableMap<T> = Readable<Map<string, T>> & { y: Y.Map<T> };

  export function readableMap<T> (map: Y.Map<T>): YReadableMap<T>;
  export function readableArray<T> (array: Y.Array<T>): YReadableArray<T>;
}

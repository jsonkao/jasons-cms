/**
 * Due to https://github.com/relm-us/svelt-yjs/tree/main having some package.json issues,
 * I had to copy the code from the package and paste it here.
 * I turned the TypeScript code into JSDocs.
 *
 * Copyright (c) 2020 Duane Johnson
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @template T
 * @typedef {(value: T) => void} Subscriber<T>
 */

/** @typedef {() => void} Unsubscriber */

/**
 * @template T
 * @typedef {(value?: T) => void} Invalidator<T>
 */

/**
 * @template T
 * @typedef {{ subscribe: (run: Subscriber<T>, invalidate?: Invalidator<T>) => Unsubscriber}} Readable<T>
 */

/**
 * @template T
 * @typedef {Readable<Array<T>> & { y: Y.Array<T> }} YReadableArray<T>
 */

/**
 * @template T
 * @param {Y.Array<T>} arr
 * @returns {YReadableArray<T>}
 */
export function readableArray(arr) {
	let value = arr.toArray();

	/** @type {Array<Subscriber<Array<T>>>} */
	let subs = [];

	const setValue = (newValue) => {
		if (value === newValue) return;
		// update stored value so new subscribers can get the initial value
		value = newValue;

		// call all handlers to notify of new value
		subs.forEach((sub) => sub(value));
	};

	/** @param {import('yjs').YArrayEvent<T>} event */
	const observer = (event, _transaction) => {
		const target = /** @type {import('yjs').Array<T>} */ (event.target);
		setValue(target.toArray());
	};

	/**
	 * @param {Subscriber<Array<T>>} handler
	 * @returns {Unsubscriber}
	 */
	const subscribe = (handler) => {
		subs = [...subs, handler];

		if (subs.length === 1) {
			// update current value to latest that yjs has since we haven't been observing
			value = arr.toArray();
			// set an observer to call all handlers whenever there is a change
			arr.observe(observer);
		}

		// call just this handler once when it first subscribes
		handler(value);

		// return unsubscribe function
		return () => {
			subs = subs.filter((sub) => sub !== handler);
			if (subs.length === 0) {
				arr.unobserve(observer);
			}
		};
	};

	return { subscribe, y: arr };
}

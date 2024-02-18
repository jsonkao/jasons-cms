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
 * @param {import('yjs').Map<T>} map
 * @returns {import('./index').YReadableMap<T>}
 */
export function readableMap(map) {
	/** @type {Map<string, T>} */
	let value = new Map(Object.entries(map.toJSON()));

	/** @type {Array<import('./index').Subscriber<Map<string, T>>>} */
	let subs = [];

	/** @param {Map<string, T>} newValue */
	const setValue = (newValue) => {
		if (value === newValue) return;

		// update stored value so new subscribers can get the initial value
		value = newValue;

		// call all handlers to notify of new value
		subs.forEach((sub) => sub(value));
	};

	/** @param {import('yjs').YMapEvent<T>} event */
	const observer = (event) => {
		const target = /** @type {import('yjs').Map<T>} */ (event.target);
		setValue(new Map(Object.entries(target.toJSON())));
	};

	/**
	 * @param {import('./index').Subscriber<Map<string, T>>} handler
	 * @returns {import('./index').Unsubscriber}
	 */
	const subscribe = (handler) => {
		subs = [...subs, handler];

		if (subs.length === 1) {
			// update current value to latest that yjs has since we haven't been observing
			value = new Map(Object.entries(map.toJSON()));
			// set an observer to call all handlers whenever there is a change
			map.observe(observer);
		}

		// call just this handler once when it first subscribes
		handler(value);

		// return unsubscribe function
		return () => {
			subs = subs.filter((sub) => sub !== handler);
			if (subs.length === 0) {
				map.unobserve(observer);
			}
		};
	};

	return { subscribe, y: map };
}

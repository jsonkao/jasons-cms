const DEBUG = false;

/**
 * @param {NodeListOf<HTMLElement>} elements - List of graphics to observe
 * @returns {IntersectionObserver}
 */
export function createObserver(elements) {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const {
					rootBounds,
					intersectionRect,
					target,
					intersectionRatio,
					isIntersecting,
					boundingClientRect
				} = entry;

				if (DEBUG) {
					console.log({
						intersectionRatio,
						ibRatio: intersectionRect.height / boundingClientRect.height,
						irRatio: intersectionRect.height / rootBounds.height,
						name: target.getAttribute('data-name'),
						entry
					});
				}

				// If graphic takes up a majority of the viewport, focus it
				if (
					isIntersecting &&
					(intersectionRect.height / boundingClientRect.height > 0.5 ||
						intersectionRect.height / rootBounds.height > 0.5)
				) {
					if (DEBUG) {
						console.log('choosing graphic', target.getAttribute('data-name'));
					}
					window.parent.postMessage(
						{
							type: 'focusGraphic',
							name: target.getAttribute('data-name')
						},
						'*'
					);
				}
			});
		},
		{ root: document, threshold: [0, 0.5, 1] }
	);
	elements.forEach((e) => observer.observe(e));
	return observer;
}

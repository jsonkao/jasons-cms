/**
 * @param {NodeListOf<HTMLElement>} elements - List of graphics to observe
 * @returns {IntersectionObserver}
 */
export function createObserver(elements) {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach(
				({ rootBounds, intersectionRect, target, intersectionRatio, isIntersecting }) => {
					const rootHeight = rootBounds.height;
					const intersectingHeight = intersectionRect.height;

					// If graphic takes up a majority of the viewport, focus it
					if (isIntersecting && (intersectionRatio === 1 || intersectingHeight >= rootHeight / 2)) {
						window.parent.postMessage(
							{
								type: 'focusGraphic',
								name: target.getAttribute('data-name')
							},
							'*'
						);
					}
				}
			);
		},
		{ threshold: [0, 0.2, 0.4, 0.6, 0.8, 1], root: document }
	);
	elements.forEach((e) => observer.observe(e));
	return observer;
}

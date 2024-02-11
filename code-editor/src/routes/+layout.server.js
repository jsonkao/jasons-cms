/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params }) {
	return {
		slug: params.slug
	};
}

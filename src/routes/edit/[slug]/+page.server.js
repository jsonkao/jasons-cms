/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	return {
		slug: params.slug
	};
}

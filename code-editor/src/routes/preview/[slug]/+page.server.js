/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  return {
    renderPath: `/render/${params.slug}`
  }
}

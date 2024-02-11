/** @type {import('./$types').RequestHandler} */
export async function GET({ params: { slug } }) {
	const vercelResponse = await fetch(`https://jasons-cms-text-editor.vercel.app/render/${slug}.html`);
	let html = await vercelResponse.text();

	return new Response(html, {
		status: 200,
		headers: {
			'Content-Type': 'text/html; charset=UTF-8',
			'Access-Control-Allow-Origin': '*',
			'Cross-Origin-Resource-Policy': 'cross-origin',
		}
	});
}

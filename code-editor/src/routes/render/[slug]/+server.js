/** @type {import('./$types').RequestHandler} */
export async function GET({ params: { slug } }) {
	const vercelResponse = await fetch(
		`https://jasons-cms-text-editor.vercel.app/render/${slug}.html`
	);
	let html = await vercelResponse.text();

	// Add crossorigin="anonymous" to all link tags. We don't add to img tags because generate-files should already do that.
	html = html.replace(/<link /g, '<link crossorigin="anonymous" ');

	return new Response(html, {
		status: 200,
		headers: {
			'Content-Type': 'text/html; charset=UTF-8'
		}
	});
}

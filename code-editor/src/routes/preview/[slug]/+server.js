/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const html = `<h1>Test</h1>`;
	return new Response(html, {
		status: 200,
		headers: {
			'Content-Type': 'text/html; charset=UTF-8'
		}
	});
}

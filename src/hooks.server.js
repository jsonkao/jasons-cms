/**
 * A hook to add headers necessary for the WebContainer to work.
 * @type {import('@sveltejs/kit').Handle}
 */
export async function handle({ event, resolve }) {
	const response = await resolve(event);

	response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

	return response;
}

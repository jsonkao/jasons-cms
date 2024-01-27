import fs from 'fs';

export function GET() {
	const response = fs.readFileSync('./example-ydoc.bin');
	return new Response(response, {
		headers: {
			'Content-Type': 'application/octet-stream'
		}
	});
}

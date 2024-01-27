import exampleYdoc from './example-ydoc.bin?url';

export async function getYdocState(): Promise<Uint8Array> {
	const response = await fetch(exampleYdoc);
	return new Uint8Array(await response.arrayBuffer());
}

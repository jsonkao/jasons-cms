export async function load({ fetch }) {
	const response = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json');
	const topojson = await response.json();
	return {
		topojson
	};
}

export const prerender = false;

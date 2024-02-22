export async function load({ fetch }) {
    const response = await fetch('https://static.propublica.org/projects/graphics/2024-oil-cleanup/testing/states.json');
    const data = await response.json();
	return {
		wells: data
	};
}

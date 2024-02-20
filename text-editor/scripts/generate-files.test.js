import { expect, test } from 'vitest';
import { generateComponentLookup } from './generate-files.js';

test('component lookup is correct', () => {
	const svelteFiles = [
		{
			slug: 'foo',
			graphicNames: ['graphic1', 'graphic-2'],
			pageServerFunctionExport: ''
		},
		{
			slug: 'bar-baz',
			graphicNames: ['graphic3', 'graphic-4'],
			pageServerFunctionExport: ''
		}
	];

	const result = generateComponentLookup(svelteFiles);

	const expectedResult = `import foo_graphic1 from './foo/graphic1.svelte';
import foo_graphic_2 from './foo/graphic-2.svelte';
import bar_baz_graphic3 from './bar-baz/graphic3.svelte';
import bar_baz_graphic_4 from './bar-baz/graphic-4.svelte';

export default {
\t'foo': {'graphic1': foo_graphic1, 'graphic-2': foo_graphic_2},
\t'bar-baz': {'graphic3': bar_baz_graphic3, 'graphic-4': bar_baz_graphic_4}
};
`;

	expect(result).toBe(expectedResult);
});

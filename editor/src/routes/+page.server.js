/** @type {import('./$types').PageLoad} */
export function load() {
	/**
	 * @type {{ type: 'text' | 'graphic', text?: string, component?: string}[]}
	 */
	const rawContent = [
		{
			type: 'text',
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel, luctus ornare lacus.'
		},
		{
			type: 'graphic',
			component: '1'
		},
		{
			type: 'text',
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel, luctus ornare lacus.'
		},
		{
			type: 'text',
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel, luctus ornare lacus.'
		},
		{
			type: 'graphic',
			component: '2'
		},
		{
			type: 'text',
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac varius lacus, eget pharetra urna. Praesent blandit felis eu nulla posuere tempus. Integer orci sapien, bibendum at dui vel, luctus ornare lacus.'
		}
	];

	return { rawContent };
}

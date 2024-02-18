/** The name of the top-level Y.Array instance that holds all blocks data */
export const BLOCKS_KEY = 'blocks';

/** The name of the top-level Y.Map instance that holds data on page-level files */
export const PAGE_FILES_KEY = 'page-files';

export const DEFAULT_CODE_BLOCK = [
  '<script>',
  '\t// Your code here',
  '</script>',
  '',
	'<div>',
	'\t<!-- Your code here -->',
	'</div>',
	'',
	'<style>',
	'\tdiv {',
	'\t\theight: 300px;',
	'\t\tbackground: rgba(255, 0, 255, 0.15);',
	'\t}',
	'</style>\n'
].join('\n');

import zipped from './common.zip?url';
import unzip from './unzip.cjs?url';

export async function loadCommon() {
	const result = await Promise.all([
		fetch(zipped).then((r) => r.arrayBuffer()),
		fetch(unzip).then((r) => r.text())
	]);

	return {
		'common.zip': {
			file: { contents: new Uint8Array(result[0]) }
		},
		'unzip.cjs': {
			file: { contents: result[1] }
		}
	};
}

/** @satisfies {import('@webcontainer/api').FileSystemTree} */

export const files = {
	'index.js': {
		file: {
			contents: `
import express from 'express';
const app = express();
const port = 3111;

app.get('/', (req, res) => {
  res.send('Welcome to a WebContainers app! 🥳');
});

app.listen(port, () => {
  console.log(\`App is live at http://localhost:\${port}\`);
});`
		}
	},
	'package.json': {
		file: {
			contents: `
{
  "name": "example-app",
  "type": "module",
  "dependencies": {
    "express": "latest",
    "nodemon": "latest"
  },
  "scripts": {
    "start": "nodemon --watch './' index.js"
  }
}`
		}
	}
};

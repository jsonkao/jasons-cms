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

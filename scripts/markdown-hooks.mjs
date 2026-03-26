/**
 * Node.js module resolution hooks for virtual:harbinger-markdown.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const VIRTUAL_ID = 'virtual:harbinger-markdown';

export async function resolve(specifier, context, nextResolve) {
	if (specifier === VIRTUAL_ID) {
		return {
			shortCircuit: true,
			url: `${VIRTUAL_ID}://`,
		};
	}
	return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
	if (url === `${VIRTUAL_ID}://`) {
		try {
			const markdownPath = join(process.cwd(), 'harbinger_house_complete.md');
			const markdown = readFileSync(markdownPath, 'utf-8');
			return {
				shortCircuit: true,
				format: 'module',
				source: `export default ${JSON.stringify(markdown)};`,
			};
		} catch {
			return {
				shortCircuit: true,
				format: 'module',
				source: 'export default "";',
			};
		}
	}
	return nextLoad(url, context);
}

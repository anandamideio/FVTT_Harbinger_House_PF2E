import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

/**
 * Node.js ESM loader hook that resolves the virtual:harbinger-markdown module.
 * Used when running build scripts via tsx that import from src/data/content/journals.ts.
 *
 * Usage: tsx --import ./scripts/markdown-loader.mjs scripts/build-packs.ts
 */
register('./markdown-hooks.mjs', pathToFileURL(import.meta.filename));

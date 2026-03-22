/**
 * Minimal Foundry global mocks for testing importer classes.
 * Only stubs out what's needed to instantiate importers and call toDocumentData().
 */

// @ts-nocheck
globalThis.Actor = class Actor {};
globalThis.Item = class Item {};
globalThis.Folder = class Folder {};
globalThis.JournalEntry = class JournalEntry {};
globalThis.game = {
	actors: { find: () => null },
	items: { find: () => null },
	folders: { find: () => null },
	settings: { get: () => null, set: () => null, register: () => null },
	system: { id: 'pf2e', version: '6.0.0' },
	user: { isGM: true },
} as any;

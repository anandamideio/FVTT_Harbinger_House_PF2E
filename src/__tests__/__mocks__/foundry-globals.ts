// @ts-expect-error - This exist
globalThis.Actor = class Actor {};
// @ts-expect-error - This exist
globalThis.Item = class Item {};
// @ts-expect-error - This exist
globalThis.Folder = class Folder {};
// @ts-expect-error - This exist
globalThis.JournalEntry = class JournalEntry {};
// @ts-expect-error - This exist
globalThis.Scene = class Scene {};
// @ts-expect-error - This exist
globalThis.game = {
	actors: { find: () => null },
	items: { find: () => null },
	folders: { find: () => null },
	settings: { get: () => null, set: () => null, register: () => null },
	system: { id: 'pf2e', version: '6.0.0' },
	user: { isGM: true },
};

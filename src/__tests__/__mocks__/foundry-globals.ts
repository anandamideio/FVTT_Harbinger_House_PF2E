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
globalThis.foundry = {
	applications: {
		sheets: {
			journal: {
				JournalEntrySheet: class JournalEntrySheet {
					options = { classes: [] };
					document: { id?: string; name?: string } = {};
					element: HTMLElement = document.createElement('div');
					constructor(_doc?: unknown, _options?: unknown) {
						// No-op test shim
					}
					async _onRender(_context?: unknown, _options?: unknown): Promise<void> {
						// No-op test shim
					}
				},
			},
		},
	},
};
// @ts-expect-error - This exist
globalThis.game = {
	actors: { find: () => null },
	items: { find: () => null },
	folders: { find: () => null },
	settings: { get: () => null, set: () => null, register: () => null },
	system: { id: 'pf2e', version: '6.0.0' },
	user: { isGM: true },
};

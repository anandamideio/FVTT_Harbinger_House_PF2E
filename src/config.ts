import consola from 'consola';

export const MODULE_ID = 'harbinger-house-pf2e';
export const MODULE_NAME = 'Harbinger House PF2e';

// Compendium pack names (must match module.json)
export const PACKS = {
	NPCS: `${MODULE_ID}.harbinger-house-npcs`,
	ITEMS: `${MODULE_ID}.harbinger-house-items`,
	SPELLS: `${MODULE_ID}.harbinger-house-spells`,
	HAZARDS: `${MODULE_ID}.harbinger-house-hazards`,
	JOURNALS: `${MODULE_ID}.harbinger-house-journals`,
	SCENES: `${MODULE_ID}.harbinger-house-scenes`,
	MACROS: `${MODULE_ID}.harbinger-house-macros`,
} as const;

// Settings keys
export const SETTINGS = {
	SHOW_IMPORT_DIALOG: 'showImportDialog',
	IMPORTED_NPCS: 'importedNpcs',
	IMPORTED_ITEMS: 'importedItems',
	IMPORTED_SPELLS: 'importedSpells',
	IMPORTED_HAZARDS: 'importedHazards',
	IMPORTED_JOURNALS: 'importedJournals',
	IMPORTED_MACROS: 'importedMacros',
	SCHEMA_VERSION: 'schemaVersion',
	INSTALLED_MODULE_VERSION: 'installedModuleVersion',
	DEBUG_MODE: 'debugMode',
} as const;

// Localization key prefix - using uppercase to match JSON structure
export const LANG_PREFIX = 'HARBINGER-HOUSE';

/**
 * Helper to get localized strings with optional interpolation
 *
 * @param key - The localization key (e.g., 'import.title')
 * @param data - Optional data for string interpolation
 * @returns The localized string
 */
export function localize(key: string, data?: Record<string, unknown>): string {
	const fullKey = `${LANG_PREFIX}.${key}`;
	if (data) {
		return game.i18n.format(fullKey, data);
	}
	return game.i18n.localize(fullKey);
}

export function log(...args: unknown[]): void {
	consola.info(`${MODULE_NAME} |`, ...args);
}

export function logError(...args: unknown[]): void {
	consola.error(`${MODULE_NAME} |`, ...args);
}

export function logWarn(...args: unknown[]): void {
	consola.warn(`${MODULE_NAME} |`, ...args);
}

export function registerSettings(): void {
	// Show import dialog on load
	game.settings.register(MODULE_ID, SETTINGS.SHOW_IMPORT_DIALOG, {
		name: localize('settings.showImportDialog.name'),
		hint: localize('settings.showImportDialog.hint'),
		scope: 'world',
		config: true,
		type: Boolean,
		default: true,
	});

	// Track imported NPCs
	game.settings.register(MODULE_ID, SETTINGS.IMPORTED_NPCS, {
		name: 'Imported NPCs',
		scope: 'world',
		config: false,
		type: Object,
		default: {},
	});

	// Track imported Items
	game.settings.register(MODULE_ID, SETTINGS.IMPORTED_ITEMS, {
		name: 'Imported Items',
		scope: 'world',
		config: false,
		type: Object,
		default: {},
	});

	// Track imported Spells
	game.settings.register(MODULE_ID, SETTINGS.IMPORTED_SPELLS, {
		name: 'Imported Spells',
		scope: 'world',
		config: false,
		type: Object,
		default: {},
	});

	// Track imported Hazards
	game.settings.register(MODULE_ID, SETTINGS.IMPORTED_HAZARDS, {
		name: 'Imported Hazards',
		scope: 'world',
		config: false,
		type: Object,
		default: {},
	});

	// Track imported journals (internal)
	game.settings.register(MODULE_ID, SETTINGS.IMPORTED_JOURNALS, {
		name: 'Imported Journals',
		hint: 'List of Journal IDs that have been imported',
		scope: 'world',
		config: false,
		type: Object,
		default: {},
	});

	// Track imported Macros
	game.settings.register(MODULE_ID, SETTINGS.IMPORTED_MACROS, {
		name: 'Imported Macros',
		scope: 'world',
		config: false,
		type: Object,
		default: {},
	});

	// Track which module version was last active when content was imported/refreshed
	game.settings.register(MODULE_ID, SETTINGS.INSTALLED_MODULE_VERSION, {
		name: 'Installed Module Version',
		hint: 'Tracks the module version to detect content updates',
		scope: 'world',
		config: false,
		type: String,
		default: '0.0.0',
	});

	// Debug mode
	game.settings.register(MODULE_ID, SETTINGS.DEBUG_MODE, {
		name: localize('settings.debugMode.name'),
		hint: localize('settings.debugMode.hint'),
		scope: 'client',
		config: true,
		type: Boolean,
		default: false,
	});

	log('Settings registered');
}

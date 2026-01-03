/**
 * Module Configuration
 * Central place for all module constants and settings
 */

export const MODULE_ID = 'harbinger-house-pf2e';
export const MODULE_NAME = 'Harbinger House PF2e';

// Compendium pack names (must match module.json)
export const PACKS = {
  NPCS: `${MODULE_ID}.harbinger-house-npcs`,
  ITEMS: `${MODULE_ID}.harbinger-house-items`,
  SPELLS: `${MODULE_ID}.harbinger-house-spells`,
  HAZARDS: `${MODULE_ID}.harbinger-house-hazards`,
  JOURNALS: `${MODULE_ID}.harbinger-house-journals`,
} as const;

// Settings keys
export const SETTINGS = {
  SHOW_IMPORT_DIALOG: 'showImportDialog',
  IMPORTED_NPCS: 'importedNpcs',
  IMPORTED_ITEMS: 'importedItems',
  IMPORTED_SPELLS: 'importedSpells',
  IMPORTED_HAZARDS: 'importedHazards',
  IMPORTED_JOURNALS: 'importedJournals',
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
 * 
 * Why this approach?
 * - Foundry's i18n.localize() doesn't handle interpolation
 * - i18n.format() does, but we want a unified API
 * - This function handles both cases seamlessly
 */
export function localize(key: string, data?: Record<string, unknown>): string {
  const fullKey = `${LANG_PREFIX}.${key}`;
  if (data) {
    return game.i18n.format(fullKey, data);
  }
  return game.i18n.localize(fullKey);
}

/**
 * Log a message to the console with module prefix
 */
export function log(...args: unknown[]): void {
  console.log(`${MODULE_NAME} |`, ...args);
}

/**
 * Log an error to the console with module prefix
 */
export function logError(...args: unknown[]): void {
  console.error(`${MODULE_NAME} |`, ...args);
}

/**
 * Log a warning to the console with module prefix
 */
export function logWarn(...args: unknown[]): void {
  console.warn(`${MODULE_NAME} |`, ...args);
}

/**
 * Register all module settings
 * 
 * Why use settings?
 * - Persists user preferences across sessions
 * - Allows GMs to control module behavior
 * - Enables tracking of what's been imported
 */
export function registerSettings(): void {
  // Show import dialog on load
  game.settings.register(MODULE_ID, SETTINGS.SHOW_IMPORT_DIALOG, {
    name: localize('settings.showImportDialog.name'),
    hint: localize('settings.showImportDialog.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  // Track imported NPCs
  game.settings.register(MODULE_ID, SETTINGS.IMPORTED_NPCS, {
    name: 'Imported NPCs',
    scope: 'world',
    config: false,
    type: Object,
    default: {}
  });

  // Track imported Items
  game.settings.register(MODULE_ID, SETTINGS.IMPORTED_ITEMS, {
    name: 'Imported Items',
    scope: 'world',
    config: false,
    type: Object,
    default: {}
  });

  // Track imported Spells
  game.settings.register(MODULE_ID, SETTINGS.IMPORTED_SPELLS, {
    name: 'Imported Spells',
    scope: 'world',
    config: false,
    type: Object,
    default: {}
  });

  // Track imported Hazards
  game.settings.register(MODULE_ID, SETTINGS.IMPORTED_HAZARDS, {
    name: 'Imported Hazards',
    scope: 'world',
    config: false,
    type: Object,
    default: {}
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

  // Debug mode
  game.settings.register(MODULE_ID, SETTINGS.DEBUG_MODE, {
    name: localize('settings.debugMode.name'),
    hint: localize('settings.debugMode.hint'),
    scope: 'client',
    config: true,
    type: Boolean,
    default: false
  });

  log('Settings registered');
}

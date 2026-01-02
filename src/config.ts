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
  HAZARDS: `${MODULE_ID}.harbinger-house-hazards`,
} as const;

// Settings keys
export const SETTINGS = {
  SHOW_IMPORT_DIALOG: 'showImportDialog',
  IMPORTED_NPCS: 'importedNpcs',
  IMPORTED_ITEMS: 'importedItems',
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

// Logging utilities
export function log(...args: unknown[]): void {
  console.log(`${MODULE_NAME} |`, ...args);
}

export function warn(...args: unknown[]): void {
  console.warn(`${MODULE_NAME} |`, ...args);
}

export function logError(...args: unknown[]): void {
  console.error(`${MODULE_NAME} |`, ...args);
}

export function debug(...args: unknown[]): void {
  try {
    if (game.settings.get(MODULE_ID, SETTINGS.DEBUG_MODE)) {
      console.debug(`${MODULE_NAME} |`, ...args);
    }
  } catch {
    // Settings not yet registered, skip debug logging
  }
}

// Register module settings
export function registerSettings(): void {
  // Show import dialog setting (user-configurable)
  game.settings.register(MODULE_ID, 'showImportDialog', {
    name: localize('settings.showImportDialog.name'),
    hint: localize('settings.showImportDialog.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  // Register menu button to launch importer
  game.settings.registerMenu(MODULE_ID, 'importMenu', {
    name: localize('settings.importMenu.name'),
    label: localize('settings.importMenu.label'),
    hint: localize('settings.importMenu.hint'),
    icon: 'fas fa-file-import',
    type: class ImportMenuButton extends FormApplication {
      constructor(object?: any, options?: any) {
        super(object, options);
        // Immediately trigger the import dialog and close this form
        this.triggerImport();
      }

      async triggerImport(): Promise<void> {
        // Import showImportDialog dynamically to avoid circular dependency
        const { showImportDialog } = await import('./ui');
        showImportDialog();
        // Close this empty form
        this.close();
      }

      static override get defaultOptions(): any {
        return foundry.utils.mergeObject(super.defaultOptions, {
          template: 'templates/generic/form.html',
          width: 0,
          height: 0,
        });
      }

      override async getData(): Promise<any> {
        return {};
      }

      override async _updateObject(): Promise<void> {
        // No-op since we trigger import in constructor
      }
    } as any,
    restricted: true,
  });

  // Track imported NPCs (internal)
  game.settings.register(MODULE_ID, SETTINGS.IMPORTED_NPCS, {
    name: 'Imported NPCs',
    hint: 'List of NPC IDs that have been imported',
    scope: 'world',
    config: false,
    type: Object,
    default: {},
  });

  // Track imported items (internal)
  game.settings.register(MODULE_ID, SETTINGS.IMPORTED_ITEMS, {
    name: 'Imported Items',
    hint: 'List of Item IDs that have been imported',
    scope: 'world',
    config: false,
    type: Object,
    default: {},
  });

  // Debug mode (user-configurable)
  game.settings.register(MODULE_ID, SETTINGS.DEBUG_MODE, {
    name: 'Debug Mode',
    hint: 'Enable debug logging to the console',
    scope: 'client',
    config: true,
    type: Boolean,
    default: false,
  });

  log('Settings registered');
}

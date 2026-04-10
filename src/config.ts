import consola from 'consola';

export const MODULE_ID = 'harbinger-house-pf2e';
export const MODULE_NAME = 'Harbinger House PF2e';
export const HARBINGER_JOURNAL_SHEET_CLASS = `${MODULE_ID}.HarbingerJournalSheet`;

// Adventure compendium pack reference
export const ADVENTURE_PACK = `${MODULE_ID}.harbinger-house`;

// Settings keys
export const SETTINGS = {
	SHOW_IMPORT_DIALOG: 'showImportDialog',
	DEBUG_MODE: 'debugMode',
	SIGIL_MAP_ENABLED: 'sigilMapEnabled',
	SIGIL_MAP_SOUNDS: 'sigilMapSounds',
	SIGIL_MAP_ANIMATIONS: 'sigilMapAnimations',
} as const;

// Localization key prefix
export const LANG_PREFIX = 'HARBINGER-HOUSE';

/**
 * Helper to get localized strings with optional interpolation
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

export function isDebugModeEnabled(): boolean {
	try {
		return Boolean(game.settings.get(MODULE_ID, SETTINGS.DEBUG_MODE));
	} catch {
		return false;
	}
}

export function logDebug(...args: unknown[]): void {
	if (!isDebugModeEnabled()) return;
	consola.info(`${MODULE_NAME} [debug] |`, ...args);
}

function isDevelopmentBuild(): boolean {
	try {
		// Local build artifacts are versioned as x.y.z-dev.TIMESTAMP in vite.config.ts.
		const moduleVersion = game.modules.get(MODULE_ID)?.version;
		return typeof moduleVersion === 'string' && moduleVersion.includes('-dev.');
	} catch {
		return false;
	}
}

export function registerSettings(): void {
	// Show welcome/import dialog on load
	game.settings.register(MODULE_ID, SETTINGS.SHOW_IMPORT_DIALOG, {
		name: localize('settings.showImportDialog.name'),
		hint: localize('settings.showImportDialog.hint'),
		scope: 'world',
		config: true,
		type: Boolean,
		default: true,
	});

	// Debug mode
	game.settings.register(MODULE_ID, SETTINGS.DEBUG_MODE, {
		name: localize('settings.debugMode.name'),
		hint: localize('settings.debugMode.hint'),
		scope: 'client',
		config: true,
		type: Boolean,
		default: isDevelopmentBuild(),
	});

	// Sigil Investigation Map - master toggle
	game.settings.register(MODULE_ID, SETTINGS.SIGIL_MAP_ENABLED, {
		name: localize('settings.sigilMapEnabled.name'),
		hint: localize('settings.sigilMapEnabled.hint'),
		scope: 'world',
		config: true,
		type: Boolean,
		default: true,
	});

	// Sigil Map - sound effects (per client)
	game.settings.register(MODULE_ID, SETTINGS.SIGIL_MAP_SOUNDS, {
		name: localize('settings.sigilMapSounds.name'),
		hint: localize('settings.sigilMapSounds.hint'),
		scope: 'client',
		config: true,
		type: Boolean,
		default: true,
	});

	// Sigil Map - animations (per client)
	game.settings.register(MODULE_ID, SETTINGS.SIGIL_MAP_ANIMATIONS, {
		name: localize('settings.sigilMapAnimations.name'),
		hint: localize('settings.sigilMapAnimations.hint'),
		scope: 'client',
		config: true,
		type: Boolean,
		default: true,
	});

	log('Settings registered');
}

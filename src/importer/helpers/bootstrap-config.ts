import { ADVENTURE_PACK, MODULE_ID } from '../../config';
import type { ImportBootstrapConfig, ImportDebug } from '../types';
import { asStringOrUndefined } from './document-summary';

/**
 * Pre-computed deterministic IDs matching build-packs.ts output.
 * Generated via: MD5(sourceId).substring(0, 16)
 */
export const ADVENTURE_ID = '42cb37a38191040e';
export const ADVENTURE_UUID = `Compendium.${ADVENTURE_PACK}.Adventure.${ADVENTURE_ID}`;

export const DEFAULT_IMPORT_BOOTSTRAP: ImportBootstrapConfig = {
	initialSceneId: '851e935c54e67e62', // scene-sigil
	initialSceneSourceId: 'scene-sigil',
	initialSceneName: 'Sigil',
	initialJournalEntryId: '373d8b09682157da', // journal-1 (Introduction)
	initialLoginScreenBackground: `modules/${MODULE_ID}/dist/assets/art/LadyOfPain.jpg`,
};

/**
 * Resolve the bootstrap config for a specific Adventure document.
 *
 * Module-manifest `flags.adventureImporter[<Compendium.UUID>]` overrides
 * individual fields; anything missing falls back to {@link DEFAULT_IMPORT_BOOTSTRAP}.
 */
export function resolveImportBootstrapConfig(
	adventureId: string | undefined,
	debug: ImportDebug,
): ImportBootstrapConfig {
	const manifestFlags = game.modules.get(MODULE_ID)?.flags as Record<string, unknown> | undefined;
	const moduleFlags = manifestFlags?.[MODULE_ID] as Record<string, unknown> | undefined;
	const importerMap = moduleFlags?.adventureImporter as Record<string, unknown> | undefined;
	const adventureKey = adventureId ? `Compendium.${ADVENTURE_PACK}.Adventure.${adventureId}` : ADVENTURE_UUID;
	const rawConfig = importerMap?.[adventureKey] as Record<string, unknown> | undefined;

	const config: ImportBootstrapConfig = {
		initialSceneId:
			asStringOrUndefined(rawConfig?.initialSceneId) ?? DEFAULT_IMPORT_BOOTSTRAP.initialSceneId,
		initialSceneSourceId:
			asStringOrUndefined(rawConfig?.initialSceneSourceId) ?? DEFAULT_IMPORT_BOOTSTRAP.initialSceneSourceId,
		initialSceneName:
			asStringOrUndefined(rawConfig?.initialSceneName) ?? DEFAULT_IMPORT_BOOTSTRAP.initialSceneName,
		initialJournalEntryId:
			asStringOrUndefined(rawConfig?.initialJournalEntryId) ??
			DEFAULT_IMPORT_BOOTSTRAP.initialJournalEntryId,
		initialLoginScreenBackground:
			asStringOrUndefined(rawConfig?.initialLoginScreenBackground) ??
			DEFAULT_IMPORT_BOOTSTRAP.initialLoginScreenBackground,
	};

	debug('Resolved importer bootstrap config', {
		adventureKey,
		source: rawConfig ? 'manifest-flags' : 'defaults',
		config,
	});

	return config;
}

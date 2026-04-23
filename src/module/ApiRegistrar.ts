import { ADVENTURE_PACK, localize, log, logDebug, logError, logWarn, MODULE_ID } from '../config';
import { getContentSummary } from '../data';
import { HarbingerHouseImporter, PF2E_BESTIARY_TOKENS_MODULE_ID } from '../importer';
import {
	AssignPlayerAlignments,
	CalibrateSigilLocation,
	ExportSceneData,
	MacroRegistry,
	OpenImportDialog,
	SetLandingPage,
	type HarbingerHouseMacroAPI,
	withLegacyMacroAliases,
} from '../macros';

/** Pre-computed Adventure document ID (MD5 of 'harbinger-house-adventure', first 16 hex chars) */
const ADVENTURE_ID = '42cb37a38191040e';

/** Full compendium UUID for the Adventure document */
const ADVENTURE_UUID = `Compendium.${ADVENTURE_PACK}.Adventure.${ADVENTURE_ID}`;

const MACROS = withLegacyMacroAliases(
	new MacroRegistry()
		.register(new SetLandingPage())
		.register(new OpenImportDialog())
		.register(new ExportSceneData())
		.register(new CalibrateSigilLocation())
		.register(new AssignPlayerAlignments())
		.toAPI(),
);

export interface HarbingerHouseAPI {
	openImporter: () => Promise<void>;
	getContentSummary: typeof getContentSummary;
	macros: HarbingerHouseMacroAPI;
	setLandingPage: HarbingerHouseMacroAPI['setLandingPage'];
	openImportDialog: HarbingerHouseMacroAPI['openImportDialog'];
	exportSceneData: HarbingerHouseMacroAPI['exportSceneData'];
	calibrateSigilLocation: HarbingerHouseMacroAPI['calibrateSigilLocation'];
	assignPlayerAlignments: HarbingerHouseMacroAPI['assignPlayerAlignments'];
}

declare global {
	interface Game {
		harbingerHouse?: HarbingerHouseAPI;
	}
}

export class ApiRegistrar {
	register(): void {
		const thisModule = game.modules.get(MODULE_ID) as (Module & { macros?: HarbingerHouseMacroAPI }) | undefined;
		if (thisModule) {
			thisModule.macros = MACROS;
			log('Harbinger House macros registered on game.modules entry');
		} else {
			logError('Unable to register module macros: module entry not found');
		}

		game.harbingerHouse = {
			openImporter: this.openImporter,
			getContentSummary,
			macros: MACROS,
			...MACROS,
		};

		log('Harbinger House API registered on game.harbingerHouse');
	}

	getAdventureImporterKeys(): string[] {
		const manifestFlags = game.modules.get(MODULE_ID)?.flags as Record<string, unknown> | undefined;
		const moduleFlags = manifestFlags?.[MODULE_ID] as Record<string, unknown> | undefined;
		const importerMap = moduleFlags?.adventureImporter as Record<string, unknown> | undefined;

		if (!importerMap || typeof importerMap !== 'object') {
			return [ADVENTURE_UUID];
		}

		const keys = Object.keys(importerMap).filter((key) => key.startsWith('Compendium.'));
		return keys.length > 0 ? keys : [ADVENTURE_UUID];
	}

	readonly openImporter = async (): Promise<void> => {
		try {
			logDebug('[Importer] openImporter invoked', { packId: ADVENTURE_PACK });
			this.warnIfBestiaryModuleInactive();

			const pack = game.packs.get(ADVENTURE_PACK);
			if (!pack) {
				logError('Adventure compendium pack not found');
				return;
			}
			const adventures = await pack.getDocuments();
			logDebug('[Importer] Adventure documents loaded', {
				count: adventures.length,
				ids: adventures.map((adventure) => adventure.id),
			});

			for (const adventureDoc of adventures) {
				// Construct our custom importer directly so we always get Harbinger House styling and our hooks.
				const adventure = adventureDoc as unknown as AdventureClass;
				const importer = new HarbingerHouseImporter({ document: adventure });
				logDebug('[Importer] Rendering HarbingerHouseImporter instance', {
					adventureId: adventure.id,
					adventureName: adventure.name,
					classes: importer.options.classes,
				});
				importer.render({ force: true });
			}
		} catch (err) {
			logError('Failed to open importer:', err);
		}
	};

	private warnIfBestiaryModuleInactive(): void {
		const bestiaryModule = game.modules.get(PF2E_BESTIARY_TOKENS_MODULE_ID);
		if (!bestiaryModule || bestiaryModule.active) return;

		ui.notifications?.warn(localize('warnings.activateBestiaryBeforeImport'));
		logWarn('PF2E Bestiary token module is installed but inactive', {
			moduleId: PF2E_BESTIARY_TOKENS_MODULE_ID,
		});
	}
}

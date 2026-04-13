import { HarbingerHouseImporter } from './adventure-importer';
import { registerAlignmentSockets } from './character-sheet/alignment-sockets';
import { registerCharacterSheetHooks } from './character-sheet/sigil-faction';
import { ADVENTURE_PACK, localize, log, logDebug, logError, logWarn, MODULE_ID, registerSettings } from './config';
import { getContentSummary } from './data';
import { HarbingerJournalSheet } from './harbinger-journal-sheet';
import { MACROS, type HarbingerHouseMacroAPI } from './macros';
import { SigilMapLayer, registerSigilMapHooks, registerSigilMapSockets } from './sigil-map';

/** Pre-computed Adventure document ID (MD5 of 'harbinger-house-adventure', first 16 hex chars) */
const ADVENTURE_ID = '42cb37a38191040e';

/** Full compendium UUID for the Adventure document */
const ADVENTURE_UUID = `Compendium.${ADVENTURE_PACK}.Adventure.${ADVENTURE_ID}`;
const PF2E_BESTIARY_MODULE_ID = 'pf2e-tokens-bestiaries';

function getAdventureImporterKeys(): string[] {
	const manifestFlags = game.modules.get(MODULE_ID)?.flags as Record<string, unknown> | undefined;
	const moduleFlags = manifestFlags?.[MODULE_ID] as Record<string, unknown> | undefined;
	const importerMap = moduleFlags?.adventureImporter as Record<string, unknown> | undefined;

	if (!importerMap || typeof importerMap !== 'object') {
		return [ADVENTURE_UUID];
	}

	const keys = Object.keys(importerMap).filter((key) => key.startsWith('Compendium.'));
	return keys.length > 0 ? keys : [ADVENTURE_UUID];
}

function warnIfBestiaryModuleInactive(): void {
	const bestiaryModule = game.modules.get(PF2E_BESTIARY_MODULE_ID);
	if (!bestiaryModule || bestiaryModule.active) return;

	ui.notifications?.warn(localize('warnings.activateBestiaryBeforeImport'));
	logWarn('PF2E Bestiary token module is installed but inactive', {
		moduleId: PF2E_BESTIARY_MODULE_ID,
	});
}

declare global {
	interface Game {
		harbingerHouse?: HarbingerHouseAPI;
	}
}

interface HarbingerHouseAPI {
	openImporter: () => Promise<void>;
	getContentSummary: typeof getContentSummary;
	macros: HarbingerHouseMacroAPI;
	setLandingPage: HarbingerHouseMacroAPI['setLandingPage'];
	openImportDialog: HarbingerHouseMacroAPI['openImportDialog'];
	exportSceneData: HarbingerHouseMacroAPI['exportSceneData'];
	calibrateSigilLocation: HarbingerHouseMacroAPI['calibrateSigilLocation'];
	assignPlayerAlignments: HarbingerHouseMacroAPI['assignPlayerAlignments'];
}

/**
 * Open the Adventure compendium importer.
 * Fetches the Adventure document and renders its sheet (my precious HarbingerHouseImporter)
 */
async function openImporter(): Promise<void> {
	try {
		logDebug('[Importer] openImporter invoked', { packId: ADVENTURE_PACK });
		warnIfBestiaryModuleInactive();

		const pack = game.packs.get(ADVENTURE_PACK);
		if (!pack) {
			logError('Adventure compendium pack not found');
			return;
		}
		const adventures = await pack.getDocuments();
		logDebug('[Importer] Adventure documents loaded', {
			count: adventures.length,
			ids: adventures.map((a) => a.id),
		});

		for (const adventureDoc of adventures) {
			// Construct our custom importer directly so we always get Harbinger House styling and our (captain) hooks
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
}

Hooks.once('init', async () => {
	log('Initializing Harbinger House module');

	registerSettings();

	// Register custom Adventure importer sheet
	DocumentSheetConfig.registerSheet(Adventure, MODULE_ID, HarbingerHouseImporter, {
		label: 'HARBINGER-HOUSE.adventure.importer',
		makeDefault: false,
		canConfigure: false,
		canBeDefault: false,
	});

	// Register custom Journal sheet so imported journals receive themed styling without relying on render hooks.
	DocumentSheetConfig.registerSheet(JournalEntry, MODULE_ID, HarbingerJournalSheet, {
		types: ['base'],
		label: 'Harbinger House',
		makeDefault: false,
		canConfigure: true,
		canBeDefault: false,
	});

	// Register custom canvas layer for the Sigil Investigation Map
	if (CONFIG.Canvas?.layers) {
		CONFIG.Canvas.layers.sigilMap = {
			layerClass: SigilMapLayer,
			group: 'interface',
		};
		log('Sigil Investigation Map canvas layer registered');
	}

	// Register Sigil map hooks (canvasReady, updateScene, scene controls, etc.)
	registerSigilMapHooks();

	// Inject Sigil Faction selector into PF2E character sheets
	registerCharacterSheetHooks();

	// Register runtime macro implementations on the module object.
	const thisModule = game.modules.get(MODULE_ID) as (Module & { macros?: HarbingerHouseMacroAPI }) | undefined;
	if (thisModule) {
		thisModule.macros = MACROS;
		log('Harbinger House macros registered on game.modules entry');
	} else {
		logError('Unable to register module macros: module entry not found');
	}

	// Register API on game object for external access
	game.harbingerHouse = {
		openImporter,
		getContentSummary,
		macros: MACROS,
		...MACROS,
	};

	log('Harbinger House API registered on game.harbingerHouse');
});

/**
 * Ready hook.
 * Called when the game is fully loaded and ready.
 * Opens the Adventure importer if the adventure hasn't been imported yet.
 */
Hooks.once('ready', async () => {
	log('Harbinger House module ready');

	// Log content summary
	const summary = getContentSummary();
	log(
		`Available content: ${summary.npcs} NPCs, ${summary.items} items, ${summary.spells} spells, ${summary.hazards} hazards, ${summary.journals} journals, ${summary.macros} macros`,
	);

	if (game.system.id !== 'pf2e') {
		logError('This module requires the Pathfinder 2e system');
		ui.notifications?.error(localize('errors.pf2eRequired'));
		return;
	}

	// Register Sigil map socket handlers for multiplayer sync
	registerSigilMapSockets();

	// Register alignment picker socket handlers (GM ↔ player dialog coordination).
	// Both GMs and players need this — players receive the pick request, GMs
	// receive the result notification.
	registerAlignmentSockets();

	// Only GMs get the import dialog
	if (!game.user?.isGM) {
		log('Not a GM, skipping import dialog');
		return;
	}

	// Check if the adventure has already been imported (core tracks this)
	const adventureImports = game.settings.get('core', 'adventureImports') as Record<string, boolean> | undefined;
	const importerKeys = getAdventureImporterKeys();
	const imported = importerKeys.some((key) => !!adventureImports?.[key]);

	logDebug('[Importer] Resolved adventure import status', {
		importerKeys,
		imported,
	});

	if (!imported) {
		const showDialog = game.settings.get(MODULE_ID, 'showImportDialog');
		if (showDialog) {
			setTimeout(() => {
				openImporter();
			}, 500);
		}
	}
});

/**
 * Apply themed styling to Harbinger House journals.
 * Automatically adds the harbinger-journal CSS class to journals
 * that were imported from this module.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Hooks.on('renderJournalSheet', (...args: any[]) => {
	const [app, html] = args;

	const journal = app.object as JournalEntryClass | undefined;
	const isHarbingerJournal = journal?.flags?.[MODULE_ID]?.managed || journal?.flags?.[MODULE_ID]?.imported;

	logDebug('[JournalFaction] renderJournalSheet hook fired', {
		journalId: journal?.id ?? 'unknown',
		journalName: journal?.name ?? 'unknown',
		isHarbingerJournal: Boolean(isHarbingerJournal),
		moduleFlags: journal?.flags?.[MODULE_ID] ?? null,
	});

	if (isHarbingerJournal) {
		html.closest('.journal-sheet').addClass('harbinger-journal');
		if (journal) {
			logDebug('[JournalFaction] Calling faction callout decorator from renderJournalSheet hook', {
				journalName: journal.name,
			});
			HarbingerJournalSheet.decorateFactionCallouts(journal, html as JQuery);
		}
		log(`Applied themed styling to journal: ${journal.name || 'Unknown'}`);
	} else {
		logDebug('[JournalFaction] Skipping decoration: journal is not marked as Harbinger managed/imported');
	}
});

export { MODULE_ID, openImporter };

import { HarbingerHouseImporter } from './adventure-importer';
import { ADVENTURE_PACK, localize, log, logDebug, logError, MODULE_ID, registerSettings } from './config';
import { getContentSummary } from './data';
import { MACROS, type HarbingerHouseMacroAPI } from './macros';
import { SigilMapLayer, registerSigilMapHooks, registerSigilMapSockets } from './sigil-map';

/** Pre-computed Adventure document ID (MD5 of 'harbinger-house-adventure', first 16 hex chars) */
const ADVENTURE_ID = '42cb37a38191040e';

/** Full compendium UUID for the Adventure document */
const ADVENTURE_UUID = `Compendium.${ADVENTURE_PACK}.Adventure.${ADVENTURE_ID}`;

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
	toggleSceneLighting: HarbingerHouseMacroAPI['toggleSceneLighting'];
	toggleAmbientSounds: HarbingerHouseMacroAPI['toggleAmbientSounds'];
	openImportDialog: HarbingerHouseMacroAPI['openImportDialog'];
	applyTokenRingStyling: HarbingerHouseMacroAPI['applyTokenRingStyling'];
	calibrateSigilLocation: HarbingerHouseMacroAPI['calibrateSigilLocation'];
}

/**
 * Open the Adventure compendium importer.
 * Fetches the Adventure document and renders its sheet (my precious HarbingerHouseImporter)
 */
async function openImporter(): Promise<void> {
	try {
		logDebug('[Importer] openImporter invoked', { packId: ADVENTURE_PACK });

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

	// Only GMs get the import dialog
	if (!game.user?.isGM) {
		log('Not a GM, skipping import dialog');
		return;
	}

	if (game.system.id !== 'pf2e') {
		logError('This module requires the Pathfinder 2e system');
		ui.notifications?.error(localize('errors.pf2eRequired'));
		return;
	}

	// Register Sigil map socket handlers for multiplayer sync
	registerSigilMapSockets();

	// Check if the adventure has already been imported (core tracks this)
	const adventureImports = game.settings.get('core', 'adventureImports') as Record<string, boolean> | undefined;
	const imported = !!adventureImports?.[ADVENTURE_UUID];

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

	const journal = app.object;
	const isHarbingerJournal = journal?.flags?.[MODULE_ID]?.managed || journal?.flags?.[MODULE_ID]?.imported;

	if (isHarbingerJournal) {
		html.closest('.journal-sheet').addClass('harbinger-journal');
		log(`Applied themed styling to journal: ${journal.name || 'Unknown'}`);
	}
});

export { MODULE_ID, openImporter };

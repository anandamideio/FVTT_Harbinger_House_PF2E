import { HarbingerHouseImporter } from './adventure-importer';
import { ADVENTURE_PACK, localize, log, logError, MODULE_ID, registerSettings } from './config';
import { getContentSummary } from './data';

/** Pre-computed Adventure document ID (MD5 of 'harbinger-house-adventure', first 16 hex chars) */
const ADVENTURE_ID = '42cb37a38191040e';

/** Full compendium UUID for the Adventure document */
const ADVENTURE_UUID = `Compendium.${ADVENTURE_PACK}.Adventure.${ADVENTURE_ID}`;

// Store the API on the module
declare global {
	interface Game {
		harbingerHouse?: HarbingerHouseAPI;
	}
}

interface HarbingerHouseAPI {
	openImporter: () => Promise<void>;
	getContentSummary: typeof getContentSummary;
}

/**
 * Open the Adventure compendium importer.
 * Fetches the Adventure document and renders its sheet (our HarbingerHouseImporter).
 */
async function openImporter(): Promise<void> {
	try {
		const pack = game.packs.get(ADVENTURE_PACK);
		if (!pack) {
			logError('Adventure compendium pack not found');
			return;
		}
		const adventures = await pack.getDocuments();
		for (const adventure of adventures) {
			(adventure as unknown as { sheet: { render: (options: { force: boolean }) => void } }).sheet.render({ force: true });
		}
	} catch (err) {
		logError('Failed to open importer:', err);
	}
}

/**
 * Initialize the module.
 * Called on the 'init' hook - before game data is loaded.
 */
Hooks.once('init', async () => {
	log('Initializing Harbinger House module');

	// Register module settings
	registerSettings();

	// Register custom Adventure importer sheet
	DocumentSheetConfig.registerSheet(Adventure, MODULE_ID, HarbingerHouseImporter, {
		label: 'HARBINGER-HOUSE.adventure.importer',
		makeDefault: false,
		canConfigure: false,
		canBeDefault: false,
	});

	// Register API on game object for external access
	game.harbingerHouse = {
		openImporter,
		getContentSummary,
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

import { localize, log, logDebug, logError } from '../config';
import { getContentSummary } from '../data';
import { ApiRegistrar } from './ApiRegistrar';
import { CanvasLayerRegistrar } from './CanvasLayerRegistrar';
import { HookRegistrar } from './HookRegistrar';
import { SettingsRegistrar } from './SettingsRegistrar';
import { SheetRegistrar } from './SheetRegistrar';

export class HarbingerHouseModule {
	constructor(
		private readonly settings: SettingsRegistrar,
		private readonly sheets: SheetRegistrar,
		private readonly canvas: CanvasLayerRegistrar,
		private readonly hooks: HookRegistrar,
		private readonly api: ApiRegistrar,
	) {}

	init(): void {
		log('Initializing Harbinger House module');
		this.settings.register();
		this.sheets.register();
		this.canvas.register();
		this.hooks.registerInit();
		this.api.register();
	}

	async ready(): Promise<void> {
		log('Harbinger House module ready');

		const summary = getContentSummary();
		log(
			`Available content: ${summary.npcs} NPCs, ${summary.items} items, ${summary.spells} spells, ${summary.hazards} hazards, ${summary.journals} journals, ${summary.macros} macros`,
		);

		if (game.system.id !== 'pf2e') {
			logError('This module requires the Pathfinder 2e system');
			ui.notifications?.error(localize('errors.pf2eRequired'));
			return;
		}

		this.hooks.registerReady();

		if (!game.user?.isGM) {
			log('Not a GM, skipping import dialog');
			return;
		}

		const adventureImports = game.settings.get('core', 'adventureImports') as Record<string, boolean> | undefined;
		const importerKeys = this.api.getAdventureImporterKeys();
		const imported = importerKeys.some((key) => !!adventureImports?.[key]);

		logDebug('[Importer] Resolved adventure import status', {
			importerKeys,
			imported,
		});

		if (!imported) {
			setTimeout(() => {
				void this.api.openImporter();
			}, 500);
		}
	}
}

const apiRegistrar = new ApiRegistrar();

export const harbingerHouseModule = new HarbingerHouseModule(
	new SettingsRegistrar(),
	new SheetRegistrar(),
	new CanvasLayerRegistrar(),
	new HookRegistrar(),
	apiRegistrar,
);

export const openImporter = apiRegistrar.openImporter;

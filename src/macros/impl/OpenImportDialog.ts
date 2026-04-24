import { HarbingerMacro } from '../Macro';

export class OpenImportDialog extends HarbingerMacro {
	readonly name = 'openImportDialog' as const;
	readonly label = 'Open Adventure Importer';

	async run(): Promise<void> {
		if (!game.user?.isGM) {
			ui.notifications.warn('Only a GM can import content.');
			return;
		}

		if (!game.harbingerHouse?.openImporter) {
			ui.notifications.error('Harbinger House module is not active.');
			return;
		}

		await game.harbingerHouse.openImporter();
	}
}

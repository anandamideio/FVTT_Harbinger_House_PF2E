import { MODULE_ID } from '../config';
import { HarbingerJournalSheet } from '../harbinger-journal-sheet';
import { HarbingerHouseImporter } from '../importer';

export class SheetRegistrar {
	register(): void {
		DocumentSheetConfig.registerSheet(Adventure, MODULE_ID, HarbingerHouseImporter, {
			label: 'HARBINGER-HOUSE.adventure.importer',
			makeDefault: false,
			canConfigure: false,
			canBeDefault: false,
		});

		DocumentSheetConfig.registerSheet(JournalEntry, MODULE_ID, HarbingerJournalSheet, {
			types: ['base'],
			label: 'Harbinger House',
			makeDefault: false,
			canConfigure: true,
			canBeDefault: false,
		});
	}
}

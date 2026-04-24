import { MODULE_ID } from '../../config';
import { HarbingerMacro } from '../Macro';

type JournalWithShareSheet = JournalEntryClass & {
	sheet: {
		render(force?: boolean, options?: { sharedWithPlayers?: boolean }): void;
	};
};

export class SetLandingPage extends HarbingerMacro {
	readonly name = 'setLandingPage' as const;
	readonly label = 'Set Landing Page';

	async run(): Promise<void> {
		const journal = game.journal?.find((entry: JournalEntryClass) => entry.flags?.[MODULE_ID]?.imported === true);
		if (!journal) {
			ui.notifications.warn('No Harbinger House journal found. Please import journals first.');
			return;
		}

		(journal as JournalWithShareSheet).sheet.render(true, { sharedWithPlayers: true });
		ui.notifications.info('Displaying Harbinger House journal to all players.');
	}
}

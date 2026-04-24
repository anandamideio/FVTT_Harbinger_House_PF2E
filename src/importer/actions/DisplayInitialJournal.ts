import { MODULE_ID, log, logError, logWarn } from '../../config';
import type { ImportContext, ImportOptionKey } from '../types';
import { ImportAction } from './ImportAction';

/** Display the Getting Started journal after import. */
export class DisplayInitialJournal extends ImportAction {
	readonly key: ImportOptionKey = 'displayJournal';

	async apply({ bootstrap, debug }: ImportContext): Promise<void> {
		try {
			let lookupStrategy: 'deterministic-id' | 'module-flag' | 'any-module-flag' | 'none' = 'none';

			let journal = game.journal?.find(
				(j: FoundryDocument) => j.id === bootstrap.initialJournalEntryId,
			);
			if (journal) lookupStrategy = 'deterministic-id';

			if (!journal) {
				journal = game.journal?.find(
					(j: FoundryDocument) => j.flags?.[MODULE_ID]?.isHarbingerHouse === true,
				);
				if (journal) lookupStrategy = 'module-flag';
			}

			if (!journal) {
				journal = game.journal?.find(
					(j: FoundryDocument) => j.flags?.[MODULE_ID] !== undefined,
				);
				if (journal) lookupStrategy = 'any-module-flag';
			}

			if (journal) {
				(journal as unknown as { sheet: { render: (force: boolean) => void } }).sheet.render(true);
				debug('displayGettingStartedJournal found journal', {
					lookupStrategy,
					journalId: journal.id,
					journalName: journal.name,
				});
				log(`Displaying journal: ${journal.name}`);
			} else {
				logWarn('No Harbinger House journal found to display after import');
			}
		} catch (err) {
			logError('Failed to display Getting Started journal:', err);
		}
	}
}

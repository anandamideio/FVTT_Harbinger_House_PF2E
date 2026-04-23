import { registerAlignmentSockets } from '../character-sheet/alignment-sockets';
import { registerCharacterSheetHooks } from '../character-sheet/sigil-faction';
import { log, logDebug, MODULE_ID } from '../config';
import { HarbingerJournalSheet } from '../harbinger-journal-sheet';
import { registerSigilMapHooks, registerSigilMapSockets } from '../sigil-map';

export class HookRegistrar {
	private journalHookRegistered = false;

	registerInit(): void {
		registerSigilMapHooks();
		registerCharacterSheetHooks();
	}

	registerReady(): void {
		registerSigilMapSockets();
		registerAlignmentSockets();
		this.registerJournalSheetHook();
	}

	private registerJournalSheetHook(): void {
		if (this.journalHookRegistered) return;
		this.journalHookRegistered = true;

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
				log(`Applied themed styling to journal: ${journal?.name || 'Unknown'}`);
			} else {
				logDebug('[JournalFaction] Skipping decoration: journal is not marked as Harbinger managed/imported');
			}
		});
	}
}

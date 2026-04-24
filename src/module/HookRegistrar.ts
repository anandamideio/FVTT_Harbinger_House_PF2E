import { registerAlignmentSockets } from '../character-sheet/alignment-sockets';
import { registerCharacterSheetHooks } from '../character-sheet/sigil-faction';
import { log, logDebug, MODULE_ID, NARCOVI_NOTEBOOK_SHEET_CLASS } from '../config';
import { NARCOVI_NOTEBOOK_FLAG } from '../data/content/narcovi-notebook';
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
		void this.repairNarcoviNotebookSheetClass();
	}

	/**
	 * Previously-imported Narcovi notebooks still have their sheetClass flag
	 * pointing at HarbingerJournalSheet. On ready (GM only) correct them so
	 * future opens resolve directly to NarcoviNotebookSheet.
	 */
	private async repairNarcoviNotebookSheetClass(): Promise<void> {
		if (!game.user?.isGM) return;
		if (!game.journal) return;

		const mismatched = game.journal.filter((entry: JournalEntryClass) => {
			const moduleFlags = entry.flags?.[MODULE_ID] as Record<string, unknown> | undefined;
			if (moduleFlags?.[NARCOVI_NOTEBOOK_FLAG] !== true) return false;

			const coreFlags = entry.flags?.core as Record<string, unknown> | undefined;
			return coreFlags?.sheetClass !== NARCOVI_NOTEBOOK_SHEET_CLASS;
		});

		if (mismatched.length === 0) return;

		for (const entry of mismatched) {
			try {
				await entry.setFlag('core', 'sheetClass', NARCOVI_NOTEBOOK_SHEET_CLASS);
				log(`Repaired Narcovi notebook sheet class on "${entry.name}"`);
			} catch (err) {
				logDebug('[NarcoviNotebook] Failed to repair sheet class flag', {
					journalId: entry.id,
					error: String(err),
				});
			}
		}
	}

	private registerJournalSheetHook(): void {
		if (this.journalHookRegistered) return;
		this.journalHookRegistered = true;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		Hooks.on('renderJournalSheet', (...args: any[]) => {
			const [app, html] = args;

			const journal = app.object as JournalEntryClass | undefined;
			const moduleFlags = journal?.flags?.[MODULE_ID] as Record<string, unknown> | undefined;
			const isHarbingerJournal = Boolean(moduleFlags?.managed || moduleFlags?.imported);
			const isNarcoviNotebook = moduleFlags?.narcovisNotebook === true;

			logDebug('[JournalFaction] renderJournalSheet hook fired', {
				journalId: journal?.id ?? 'unknown',
				journalName: journal?.name ?? 'unknown',
				isHarbingerJournal,
				isNarcoviNotebook,
				moduleFlags: moduleFlags ?? null,
			});

			if (isNarcoviNotebook) {
				// Narcovi's Notebook uses its own dedicated sheet styling; skip
				// applying the generic .harbinger-journal theme so we don't
				// double-style the parchment handout.
				html.closest('.journal-sheet').removeClass('harbinger-journal').addClass('narcovi-notebook');
				logDebug('[JournalFaction] Narcovi notebook detected; skipping harbinger-journal decoration');
				return;
			}

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

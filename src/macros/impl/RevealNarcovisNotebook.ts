import { MODULE_ID } from '../../config';
import { NARCOVI_NOTEBOOK_FLAG, NARCOVI_NOTEBOOK_SOURCE_ID } from '../../data/content/narcovi-notebook';
import { HarbingerMacro } from '../Macro';

type JournalWithShareSheet = JournalEntryClass & {
	sheet: {
		render(force?: boolean, options?: { sharedWithPlayers?: boolean }): void;
	};
};

/** Foundry document ownership constants. */
const OWNERSHIP_NONE = 0;
const OWNERSHIP_OWNER = 3;

export class RevealNarcovisNotebook extends HarbingerMacro {
	readonly name = 'revealNarcovisNotebook' as const;
	readonly label = "Reveal Narcovi's Notebook";

	async run(): Promise<void> {
		const journal = findNarcoviNotebook();
		if (!journal) {
			ui.notifications?.warn(
				"Narcovi's Notebook journal was not found. Please import the Harbinger House adventure first.",
			);
			return;
		}

		const updatedOwnership = buildPlayerOwnership(journal);
		try {
			await journal.update({ ownership: updatedOwnership });
		} catch (err) {
			console.error("Harbinger House | Failed to update Narcovi's Notebook ownership", err);
			ui.notifications?.error("Could not grant players access to Narcovi's Notebook. See console for details.");
			return;
		}

		(journal as JournalWithShareSheet).sheet.render(true, { sharedWithPlayers: true });
		ui.notifications?.info("Narcovi's Notebook revealed to the players.");
	}
}

function findNarcoviNotebook(): JournalEntryClass | undefined {
	return game.journal?.find((entry: JournalEntryClass) => {
		const flags = entry.flags?.[MODULE_ID] as Record<string, unknown> | undefined;
		if (!flags) return false;
		return flags[NARCOVI_NOTEBOOK_FLAG] === true || flags.sourceId === NARCOVI_NOTEBOOK_SOURCE_ID;
	});
}

function buildPlayerOwnership(journal: JournalEntryClass): Record<string, number> {
	const existing = (journal.ownership ?? {}) as Record<string, number>;
	const ownership: Record<string, number> = { ...existing };

	if (ownership.default === undefined) {
		ownership.default = OWNERSHIP_NONE;
	}

	for (const user of game.users?.contents ?? []) {
		if (user.isGM) continue;
		ownership[user.id] = OWNERSHIP_OWNER;
	}

	return ownership;
}

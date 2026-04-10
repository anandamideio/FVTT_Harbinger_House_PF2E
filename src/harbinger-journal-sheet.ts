/**
 * Custom journal sheet used by Harbinger House journal entries.
 * Adds the themed root CSS class so module styles apply consistently.
 */
export class HarbingerJournalSheet extends foundry.applications.sheets.journal.JournalEntrySheet {
	constructor(doc: JournalEntryClass, options?: Record<string, unknown>) {
		super(doc, options);

		if (!this.options.classes.includes('harbinger-journal')) {
			this.options.classes.push('harbinger-journal');
		}
	}
}

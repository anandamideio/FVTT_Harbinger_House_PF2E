import { describe, expect, it } from 'vitest';
import { HARBINGER_JOURNAL_SHEET_CLASS, MODULE_ID } from '../../config';
import type { HarbingerJournal } from '../../data/content/journals';
import { journalToDocumentData } from '../../data/transform/to-foundry-data';

describe('journalToDocumentData', () => {
	it('assigns the Harbinger custom sheet class to imported journals', () => {
		const journal: HarbingerJournal = {
			id: 'journal-test',
			name: 'Test Journal',
			folder: 'Reference',
			pages: [
				{
					name: 'Page 1',
					type: 'text',
					text: {
						content: '<p>Hello</p>',
						format: 1,
					},
				},
			],
		};

		const doc = journalToDocumentData(journal);
		const coreFlags = (doc.flags?.core ?? {}) as { sheetClass?: unknown };
		const moduleFlags = (doc.flags?.[MODULE_ID] ?? {}) as {
			imported?: boolean;
			sourceId?: string;
			folder?: string;
		};

		expect(coreFlags.sheetClass).toBe(HARBINGER_JOURNAL_SHEET_CLASS);
		expect(moduleFlags.imported).toBe(true);
		expect(moduleFlags.sourceId).toBe('journal-test');
		expect(moduleFlags.folder).toBe('Reference');
	});
});

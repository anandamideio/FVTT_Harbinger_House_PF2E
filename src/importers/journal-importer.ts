import { MODULE_ID } from '../config';
import {
	ALL_JOURNALS,
	getFolderLabel,
	type HarbingerJournal,
	JOURNALS_BY_FOLDER,
	type JournalFolder,
} from '../data/journals';
import type { JournalEntryData } from '../types/foundry';
import { BaseImporter, type ImportOptions, type ImportResult } from './base-importer';

export interface JournalImportOptions extends ImportOptions {
	/** Import only specific folders */
	folders?: JournalFolder[];
	/** Import only specific journal IDs */
	journalIds?: string[];
	/** Share journals with players (default: false, GM-only) */
	shareWithPlayers?: boolean;
}

export class JournalImporter extends BaseImporter<HarbingerJournal, typeof JournalEntryClass> {
	protected documentType = 'JournalEntry' as const;
	protected documentClass = JournalEntry;

	getImportableItems(): HarbingerJournal[] {
		return ALL_JOURNALS;
	}

	getItemId(journal: HarbingerJournal): string {
		return journal.id;
	}

	getItemName(journal: HarbingerJournal): string {
		return journal.name;
	}

	/**
	 * Convert a HarbingerJournal to FoundryVTT Journal Entry data
	 */
	toDocumentData(journal: HarbingerJournal): JournalEntryData {
		return {
			name: journal.name,
			pages: journal.pages.map((page, index) => ({
				name: page.name,
				type: page.type,
				title: page.title || { show: true, level: 1 },
				text: page.text,
				src: page.src,
				video: page.video,
				sort: (index + 1) * 100,
				ownership: {
					default: 0, // GM only by default
				},
			})),
			ownership: {
				default: 0, // GM only by default
			},
			sort: journal.sort || 0,
			flags: {
				[MODULE_ID]: {
					imported: true,
					sourceId: journal.id,
					importedAt: Date.now(),
				},
			},
		};
	}

	/**
	 * Import journals with folder organization
	 */
	async importAll(options: JournalImportOptions = {}): Promise<ImportResult> {
		// Filter journals based on options
		let journalsToImport = ALL_JOURNALS;

		if (options.folders && options.folders.length > 0) {
			journalsToImport = journalsToImport.filter(
				(j) => j.folder && options.folders!.includes(j.folder as JournalFolder),
			);
		}

		if (options.journalIds && options.journalIds.length > 0) {
			journalsToImport = journalsToImport.filter((j) => options.journalIds!.includes(j.id));
		}

		// Group by folder for organized import
		const byFolder = journalsToImport.reduce(
			(acc, journal) => {
				const folder = journal.folder || 'Reference';
				if (!acc[folder]) {
					acc[folder] = [];
				}
				acc[folder].push(journal);
				return acc;
			},
			{} as Record<string, HarbingerJournal[]>,
		);

		// Import each folder's journals
		const results: ImportResult[] = [];

		for (const [folderName, journals] of Object.entries(byFolder)) {
			const folderOptions = {
				...options,
				folderName: `Harbinger House - ${folderName}`,
			};

			const result = await this.importItems(journals, folderOptions);
			results.push(result);
		}

		// Combine results
		return results.reduce(
			(combined, result) => ({
				success: combined.success && result.success,
				imported: combined.imported + result.imported,
				failed: combined.failed + result.failed,
				errors: [...combined.errors, ...result.errors],
				documents: [...combined.documents, ...result.documents],
			}),
			{
				success: true,
				imported: 0,
				failed: 0,
				errors: [],
				documents: [],
			},
		);
	}

	/**
	 * Import journals by folder
	 */
	async importFolder(folder: JournalFolder, options: ImportOptions = {}): Promise<ImportResult> {
		const journals = JOURNALS_BY_FOLDER[folder] || [];
		return this.importItems(journals, {
			...options,
			folderName: `Harbinger House - ${getFolderLabel(folder)}`,
		});
	}

	/**
	 * Get count of journals by folder
	 */
	getJournalCount(): Record<JournalFolder, number> {
		return Object.entries(JOURNALS_BY_FOLDER).reduce(
			(acc, [folder, journals]) => {
				acc[folder as JournalFolder] = journals.length;
				return acc;
			},
			{} as Record<JournalFolder, number>,
		);
	}
}

export const journalImporter = new JournalImporter();

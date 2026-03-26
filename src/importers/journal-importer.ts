import { MODULE_ID } from '../config';
import {
	ALL_JOURNALS,
	getFolderLabel,
	type HarbingerJournal,
	JOURNALS_BY_FOLDER,
	type JournalFolder,
} from '../data/journals';
import { journalToDocumentData } from '../data/to-foundry-data';
import type { JournalEntryData } from '../types/foundry';
import { BaseImporter, type ImportOptions, type ImportResult } from './base-importer';

function deriveFolderFromName(name: string): string {
	if (name?.startsWith('Chapter')) return 'Chapters';
	if (name === 'Introduction') return 'Introduction';
	return 'Reference';
}

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
		return journalToDocumentData(journal);
	}

	/**
	 * Import journals from compendium, organized by folder into separate folders
	 */
	async importFromCompendium(
		packId: string,
		options: ImportOptions = {},
		filter?: (doc: FoundryDocument) => boolean,
	): Promise<ImportResult> {
		const result: ImportResult = {
			success: true,
			imported: 0,
			failed: 0,
			errors: [],
			documents: [],
		};

		const pack = game.packs.get(packId);
		if (!pack) {
			result.errors.push(`Compendium pack not found: ${packId}`);
			result.success = false;
			return result;
		}

		const documents = await pack.getDocuments();
		const toImport = filter ? documents.filter(filter) : documents;
		if (toImport.length === 0) return result;

		// Group documents by folder flag, falling back to name-based detection
		const byFolder = new Map<string, FoundryDocument[]>();
		for (const doc of toImport) {
			const flagFolder = doc.flags?.[MODULE_ID]?.folder as string | undefined;
			const folder = flagFolder || deriveFolderFromName(doc.name as string);
			if (!byFolder.has(folder)) byFolder.set(folder, []);
			byFolder.get(folder)!.push(doc);
		}

		for (const [folderName, docs] of byFolder) {
			const folder = await this.getOrCreateFolder(`Harbinger House - ${folderName}`, 'JournalEntry');

			for (const doc of docs) {
				const sourceId = doc.flags?.[MODULE_ID]?.sourceId as string | undefined;

				try {
					if (sourceId) {
						const existing = await this.findExistingDocument(sourceId);
						if (existing && !options.updateExisting) {
							result.documents.push(existing);
							result.imported++;
							continue;
						}
					}

					const docData = doc.toObject() as Record<string, unknown>;
					delete docData._id;
					if (folder) docData.folder = folder.id;

					const created = await (
						JournalEntry as unknown as { create(data: JournalEntryData): Promise<FoundryDocument> }
					).create(docData as unknown as JournalEntryData);
					const newDoc = Array.isArray(created) ? created[0] : created;
					result.documents.push(newDoc);
					result.imported++;

					if (options.onProgress) {
						options.onProgress(result.imported, toImport.length, doc.name || 'Unknown');
					}
				} catch (error) {
					result.errors.push(`Failed to import ${doc.name}: ${error}`);
					result.failed++;
				}
			}
		}

		result.success = result.failed === 0;
		return result;
	}

	/**
	 * Import journals with folder organization
	 */
	async importAll(options: JournalImportOptions = {}): Promise<ImportResult> {
		// Filter journals based on options
		let journalsToImport = ALL_JOURNALS;

		if (options.folders && options.folders.length > 0) {
			journalsToImport = journalsToImport.filter(
				(j) => j.folder && options.folders!.includes(j.folder),
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
				acc[folder] = journals.length;
				return acc;
			},
			{} as Record<JournalFolder, number>,
		);
	}
}

export const journalImporter = new JournalImporter();

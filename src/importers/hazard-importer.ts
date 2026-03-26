import { log, logError, MODULE_ID } from '../config';
import {
	ALL_HAZARDS,
	getHazardCategoryLabel,
	HAZARDS_BY_CATEGORY,
	type HarbingerHazard,
	type HazardCategory,
} from '../data/hazards';
import { hazardToDocumentData } from '../data/to-foundry-data';
import type { ActorData } from '../types/foundry';
import { BaseImporter, type ImportOptions, type ImportResult } from './base-importer';

export interface HazardImportOptions extends ImportOptions {
	/** Import only specific categories */
	categories?: HazardCategory[];
	/** Import only specific hazard IDs */
	hazardIds?: string[];
}

export class HazardImporter extends BaseImporter<HarbingerHazard, typeof ActorClass> {
	// In PF2e, hazards are actually Actors with type 'hazard'
	protected documentType = 'Actor' as const;
	protected documentClass = Actor;

	/**
	 * Get all hazards available for import
	 */
	getImportableItems(): HarbingerHazard[] {
		return ALL_HAZARDS;
	}

	/**
	 * Get hazards filtered by options
	 */
	getFilteredItems(options: HazardImportOptions): HarbingerHazard[] {
		let hazards = this.getImportableItems();

		// Filter by category
		if (options.categories && options.categories.length > 0) {
			hazards = hazards.filter((h) => options.categories!.includes(h.category));
		}

		// Filter by specific IDs
		if (options.hazardIds && options.hazardIds.length > 0) {
			hazards = hazards.filter((h) => options.hazardIds!.includes(h.id));
		}

		return hazards;
	}

	/**
	 * Convert HarbingerHazard to Foundry Actor (hazard) data
	 */
	toDocumentData(hazard: HarbingerHazard): ActorData {
		return hazardToDocumentData(hazard);
	}

	getItemId(hazard: HarbingerHazard): string {
		return hazard.id;
	}

	getItemName(hazard: HarbingerHazard): string {
		return hazard.data.name;
	}

	/**
	 * Import hazards with category organization
	 */
	async importAll(options: HazardImportOptions = {}): Promise<ImportResult> {
		const hazards = this.getFilteredItems(options);
		return this.importItems(hazards, {
			...options,
			folderName: options.folderName || 'Harbinger House Hazards',
		});
	}

	/**
	 * Import hazards from compendium, organized by category into subfolders
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

		const parentFolder = await this.getOrCreateFolder('Harbinger House Hazards', 'Actor');

		// Group documents by category flag
		const byCategory = new Map<string, FoundryDocument[]>();
		for (const doc of toImport) {
			const category = (doc.flags?.[MODULE_ID]?.category as string) || 'trap';
			if (!byCategory.has(category)) byCategory.set(category, []);
			byCategory.get(category)!.push(doc);
		}

		for (const [category, docs] of byCategory) {
			const subfolder = await this.getOrCreateFolder(
				getHazardCategoryLabel(category as HazardCategory),
				'Actor',
				parentFolder?.id,
			);

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
					if (subfolder) docData.folder = subfolder.id;

					const created = await (Actor as unknown as { create(data: ActorData): Promise<FoundryDocument> }).create(
						docData as unknown as ActorData,
					);
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
	 * Import hazards organized by category into subfolders
	 */
	async importByCategory(options: HazardImportOptions = {}): Promise<ImportResult> {
		const result: ImportResult = {
			success: true,
			imported: 0,
			failed: 0,
			errors: [],
			documents: [],
		};

		// Get categories to import (filter out empty categories)
		const categoriesToImport = (options.categories || (Object.keys(HAZARDS_BY_CATEGORY) as HazardCategory[])).filter(
			(cat) => HAZARDS_BY_CATEGORY[cat]?.length > 0,
		);

		// Only create parent folder if we have hazards to import
		if (categoriesToImport.length === 0) {
			log('No hazards to import');
			return result;
		}

		// Create parent folder
		const parentFolder = await this.getOrCreateFolder('Harbinger House Hazards', 'Actor');

		// Import each category
		for (const category of categoriesToImport) {
			const hazards = HAZARDS_BY_CATEGORY[category];
			if (!hazards || hazards.length === 0) continue;

			const categoryLabel = getHazardCategoryLabel(category);
			log(`Importing ${hazards.length} hazards from category: ${categoryLabel}`);

			try {
				// Create subfolder for category
				const subfolder = await this.getOrCreateFolder(categoryLabel, 'Actor', parentFolder?.id);

				// Import hazards in this category
				const categoryResult = await this.importItems(hazards, {
					...options,
					folderName: undefined,
					folder: subfolder,
					onProgress: (current, _total, name) => {
						options.onProgress?.(result.imported + current, this.getFilteredItems(options).length, name);
					},
				});

				result.imported += categoryResult.imported;
				result.failed += categoryResult.failed;
				result.errors.push(...categoryResult.errors);
				result.documents.push(...categoryResult.documents);
			} catch (error) {
				const errorMsg = `Failed to import category ${categoryLabel}: ${error}`;
				logError(errorMsg);
				result.errors.push(errorMsg);
			}
		}

		result.success = result.failed === 0;
		return result;
	}

	/**
	 * Delete all imported hazards
	 */
	async deleteAllImported(): Promise<number> {
		let deleted = 0;

		try {
			// Find all actors with type 'hazard' and our module flag
			const importedHazards =
				game.actors?.filter(
					(actor: ActorClass) => actor.type === 'hazard' && actor.flags?.[MODULE_ID]?.imported === true,
				) || [];

			for (const hazard of importedHazards) {
				try {
					await hazard.delete();
					deleted++;
				} catch (error) {
					logError(`Failed to delete hazard ${hazard.name}: ${error}`);
				}
			}

			// Also delete the Harbinger House Hazards folder if empty
			await this.cleanupEmptyFolders('Actor');

			log(`Deleted ${deleted} imported hazards`);
		} catch (error) {
			logError(`Error during hazard deletion: ${error}`);
		}

		return deleted;
	}
}

export const hazardImporter = new HazardImporter();

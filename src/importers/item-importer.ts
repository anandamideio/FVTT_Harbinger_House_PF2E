import { log, logError, MODULE_ID } from '../config';
import {
	ALL_ITEMS,
	getItemCategoryLabel,
	type HarbingerItem,
	ITEMS_BY_CATEGORY,
	type ItemCategory,
} from '../data/items';
import { itemToDocumentData } from '../data/to-foundry-data';
import type { ItemData } from '../types/foundry';
import { BaseImporter, type ImportOptions, type ImportResult } from './base-importer';

export interface ItemImportOptions extends ImportOptions {
	/** Import only specific categories */
	categories?: ItemCategory[];
	/** Import only specific item IDs */
	itemIds?: string[];
}

export class ItemImporter extends BaseImporter<HarbingerItem, typeof ItemClass> {
	protected documentType = 'Item' as const;
	protected documentClass = Item;

	/**
	 * Get all items available for import
	 */
	getImportableItems(): HarbingerItem[] {
		return ALL_ITEMS;
	}

	/**
	 * Get items filtered by options
	 */
	getFilteredItems(options: ItemImportOptions): HarbingerItem[] {
		let items = this.getImportableItems();

		// Filter by category
		if (options.categories && options.categories.length > 0) {
			items = items.filter((item) => options.categories!.includes(item.category));
		}

		// Filter by specific IDs
		if (options.itemIds && options.itemIds.length > 0) {
			items = items.filter((item) => options.itemIds!.includes(item.id));
		}

		return items;
	}

	/**
	 * Convert HarbingerItem to Foundry Item data
	 */
	toDocumentData(item: HarbingerItem): ItemData {
		return itemToDocumentData(item);
	}

	getItemId(item: HarbingerItem): string {
		return item.id;
	}

	getItemName(item: HarbingerItem): string {
		return item.data.name;
	}

	/**
	 * Import items with category organization
	 */
	async importAll(options: ItemImportOptions = {}): Promise<ImportResult> {
		const items = this.getFilteredItems(options);
		return this.importItems(items, {
			...options,
			folderName: options.folderName || 'Harbinger House Items',
		});
	}

	/**
	 * Import items from compendium, organized by category into subfolders
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

		const parentFolder = await this.getOrCreateFolder('Harbinger House Items', 'Item');

		// Group documents by category flag
		const byCategory = new Map<string, FoundryDocument[]>();
		for (const doc of toImport) {
			const category = (doc.flags?.[MODULE_ID]?.category as string) || 'equipment';
			if (!byCategory.has(category)) byCategory.set(category, []);
			byCategory.get(category)!.push(doc);
		}

		for (const [category, docs] of byCategory) {
			const subfolder = await this.getOrCreateFolder(
				getItemCategoryLabel(category as ItemCategory),
				'Item',
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

					const created = await (Item as unknown as { create(data: ItemData): Promise<FoundryDocument> }).create(
						docData as unknown as ItemData,
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
	 * Import items organized by category into subfolders
	 */
	async importByCategory(options: ItemImportOptions = {}): Promise<ImportResult> {
		const result: ImportResult = {
			success: true,
			imported: 0,
			failed: 0,
			errors: [],
			documents: [],
		};

		// Get categories to import (filter out empty categories)
		const categoriesToImport = (options.categories || (Object.keys(ITEMS_BY_CATEGORY) as ItemCategory[])).filter(
			(cat) => ITEMS_BY_CATEGORY[cat]?.length > 0,
		);

		// Only create parent folder if we have items to import
		if (categoriesToImport.length === 0) {
			log('No items to import');
			return result;
		}

		// Create parent folder
		const parentFolder = await this.getOrCreateFolder('Harbinger House Items', 'Item');

		// Import each category
		for (const category of categoriesToImport) {
			const items = ITEMS_BY_CATEGORY[category];
			if (!items || items.length === 0) continue;

			const categoryLabel = getItemCategoryLabel(category);
			log(`Importing ${items.length} items from category: ${categoryLabel}`);

			try {
				// Create subfolder for category
				const subfolder = await this.getOrCreateFolder(categoryLabel, 'Item', parentFolder?.id);

				// Import items in this category
				const categoryResult = await this.importItems(items, {
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
	 * Delete all imported items
	 */
	async deleteAllImported(): Promise<number> {
		let deleted = 0;

		try {
			// Find all items with our module flag
			const importedItems = game.items?.filter((item: ItemClass) => item.flags?.[MODULE_ID]?.imported === true) || [];

			for (const item of importedItems) {
				try {
					await item.delete();
					deleted++;
				} catch (error) {
					logError(`Failed to delete item ${item.name}: ${error}`);
				}
			}

			// Also delete the Harbinger House Items folder if empty
			await this.cleanupEmptyFolders('Item');

			log(`Deleted ${deleted} imported items`);
		} catch (error) {
			logError(`Error during item deletion: ${error}`);
		}

		return deleted;
	}
}

export const itemImporter = new ItemImporter();

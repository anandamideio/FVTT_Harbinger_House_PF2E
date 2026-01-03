/**
 * Item Importer
 * Handles importing Harbinger House Items into FoundryVTT
 * 
 * This importer:
 * - Converts our HarbingerItem data structure to PF2e Item format
 * - Organizes items into folders by category (artifacts, weapons, etc.)
 * - Handles the varying item types (equipment, weapon, armor, consumable)
 */

import { BaseImporter, ImportOptions, ImportResult } from './base-importer';
import { MODULE_ID, log, logError } from '../config';
import { 
  ALL_ITEMS, 
  ITEMS_BY_CATEGORY, 
  getItemCategoryLabel,
  type HarbingerItem, 
  type ItemCategory 
} from '../data/items';

export interface ItemImportOptions extends ImportOptions {
  /** Import only specific categories */
  categories?: ItemCategory[];
  /** Import only specific item IDs */
  itemIds?: string[];
}

export class ItemImporter extends BaseImporter<HarbingerItem> {
  protected documentType = 'Item';
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
      items = items.filter(item => options.categories!.includes(item.category));
    }

    // Filter by specific IDs
    if (options.itemIds && options.itemIds.length > 0) {
      items = items.filter(item => options.itemIds!.includes(item.id));
    }

    return items;
  }

  /**
   * Convert HarbingerItem to Foundry Item data
   */
  toDocumentData(item: HarbingerItem): any {
    const itemData: any = {
      name: item.data.name,
      type: item.data.type,
      img: item.data.img || this.getDefaultImage(item),
      system: { ...item.data.system },
      flags: {
        [MODULE_ID]: {
          sourceId: item.id,
          category: item.category,
          imported: true
        },
        ...item.data.flags
      }
    };

    return itemData;
  }

  /**
   * Get a default image based on item category/type
   */
  private getDefaultImage(item: HarbingerItem): string {
    // First check by item type
    const typeDefaults: Record<string, string> = {
      'weapon': 'icons/svg/sword.svg',
      'armor': 'icons/svg/shield.svg',
      'equipment': 'icons/svg/chest.svg',
      'consumable': 'icons/svg/pill.svg',
    };

    if (typeDefaults[item.data.type]) {
      return typeDefaults[item.data.type];
    }

    // Then check by category
    const categoryDefaults: Record<ItemCategory, string> = {
      'artifact': 'icons/commodities/gems/gem-faceted-radiant-purple.webp',
      'weapon': 'icons/svg/sword.svg',
      'armor': 'icons/svg/shield.svg',
      'equipment': 'icons/svg/chest.svg',
      'consumable': 'icons/svg/pill.svg',
    };

    return categoryDefaults[item.category] || 'icons/svg/item-bag.svg';
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
      folderName: options.folderName || 'Harbinger House Items'
    });
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
      documents: []
    };

    // Get categories to import
    const categoriesToImport = options.categories || 
      (Object.keys(ITEMS_BY_CATEGORY) as ItemCategory[]);

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
        const subfolder = await this.getOrCreateFolder(
          categoryLabel,
          'Item',
          parentFolder?.id
        );

        // Import items in this category
        const categoryResult = await this.importItems(items, {
          ...options,
          folderName: categoryLabel,
          onProgress: (current, total, name) => {
            options.onProgress?.(
              result.imported + current,
              this.getFilteredItems(options).length,
              name
            );
          }
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
      const importedItems = game.items?.filter(
        (item: any) => item.flags?.[MODULE_ID]?.imported === true
      ) || [];

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

// Export singleton instance
export const itemImporter = new ItemImporter();

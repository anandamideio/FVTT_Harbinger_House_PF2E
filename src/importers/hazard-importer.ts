/**
 * Hazard Importer
 * Handles importing Harbinger House Hazards into FoundryVTT
 * 
 * This importer:
 * - Converts our HarbingerHazard data structure to PF2e Actor (hazard type) format
 * - In PF2e, hazards are a type of Actor, not Item
 * - Organizes hazards into folders by category (traps, environmental, etc.)
 */

import { BaseImporter, ImportOptions, ImportResult } from './base-importer';
import { MODULE_ID, log, logError } from '../config';
import { 
  ALL_HAZARDS, 
  HAZARDS_BY_CATEGORY, 
  getHazardCategoryLabel,
  type HarbingerHazard, 
  type HazardCategory 
} from '../data/hazards';

export interface HazardImportOptions extends ImportOptions {
  /** Import only specific categories */
  categories?: HazardCategory[];
  /** Import only specific hazard IDs */
  hazardIds?: string[];
}

export class HazardImporter extends BaseImporter<HarbingerHazard> {
  // In PF2e, hazards are actually Actors with type 'hazard'
  protected documentType = 'Actor';
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
      hazards = hazards.filter(h => options.categories!.includes(h.category));
    }

    // Filter by specific IDs
    if (options.hazardIds && options.hazardIds.length > 0) {
      hazards = hazards.filter(h => options.hazardIds!.includes(h.id));
    }

    return hazards;
  }

  /**
   * Convert HarbingerHazard to Foundry Actor (hazard) data
   * 
   * Why Actor instead of Item?
   * In PF2e, hazards are implemented as Actors with type 'hazard'.
   * This allows them to have AC, HP, saves, and other actor-like properties.
   */
  toDocumentData(hazard: HarbingerHazard): any {
    const data = hazard.data;
    
    const actorData: any = {
      name: data.name,
      type: 'hazard',
      img: data.img || this.getDefaultImage(hazard),
      system: {
        description: data.system.description,
        traits: {
          value: data.system.traits.value,
          rarity: data.system.traits.rarity || 'common'
        },
        details: {
          level: data.system.details.level,
          disable: data.system.details.disable || '',
          reset: data.system.details.reset || '',
          routine: data.system.details.routine || '',
          isComplex: data.system.details.isComplex
        },
        attributes: {
          ac: data.system.attributes?.ac || { value: 0 },
          hp: data.system.attributes?.hp || { value: 0, max: 0 },
          hardness: data.system.attributes?.hardness?.value ?? 0,
          stealth: {
            value: data.system.attributes?.stealth?.value || 0,
            dc: data.system.attributes?.stealth?.dc || 0,
            details: data.system.attributes?.stealth?.details || ''
          }
        },
        saves: {
          fortitude: { value: data.system.saves?.fortitude?.value || 0 },
          reflex: { value: data.system.saves?.reflex?.value || 0 },
          will: { value: data.system.saves?.will?.value || 0 }
        },
        immunities: data.system.immunities || { value: [] },
        weaknesses: data.system.weaknesses || [],
        resistances: data.system.resistances || []
      },
      prototypeToken: this.getTokenData(hazard),
      flags: {
        [MODULE_ID]: {
          sourceId: hazard.id,
          category: hazard.category,
          location: hazard.location,
          imported: true
        }
      }
    };

    return actorData;
  }

  /**
   * Get default token configuration for a hazard
   */
  private getTokenData(hazard: HarbingerHazard): any {
    // Most hazards are medium-sized or fill their area
    const isComplex = hazard.data.system.details.isComplex;
    
    return {
      name: hazard.data.name,
      displayName: 20, // OWNER_HOVER
      displayBars: isComplex ? 20 : 0, // Show HP bar for complex hazards
      bar1: isComplex ? { attribute: 'attributes.hp' } : null,
      disposition: -1, // HOSTILE
      width: 1,
      height: 1,
      texture: {
        src: hazard.data.img || this.getDefaultImage(hazard)
      },
      sight: {
        enabled: false
      },
      actorLink: false // Hazards typically aren't linked
    };
  }

  /**
   * Get a default image based on hazard category
   */
  private getDefaultImage(hazard: HarbingerHazard): string {
    const categoryDefaults: Record<HazardCategory, string> = {
      'trap': 'icons/svg/trap.svg',
      'environmental': 'icons/svg/hazard.svg',
      'haunt': 'icons/svg/skull.svg',
      'aura': 'icons/svg/aura.svg',
    };

    return categoryDefaults[hazard.category] || 'icons/svg/hazard.svg';
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
      folderName: options.folderName || 'Harbinger House Hazards'
    });
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
      documents: []
    };

    // Get categories to import (filter out empty categories)
    const categoriesToImport = (options.categories || 
      (Object.keys(HAZARDS_BY_CATEGORY) as HazardCategory[]))
      .filter(cat => HAZARDS_BY_CATEGORY[cat]?.length > 0);

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
        const subfolder = await this.getOrCreateFolder(
          categoryLabel,
          'Actor',
          parentFolder?.id
        );

        // Import hazards in this category
        const categoryResult = await this.importItems(hazards, {
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
   * Delete all imported hazards
   */
  async deleteAllImported(): Promise<number> {
    let deleted = 0;

    try {
      // Find all actors with type 'hazard' and our module flag
      const importedHazards = game.actors?.filter(
        (actor: any) => 
          actor.type === 'hazard' && 
          actor.flags?.[MODULE_ID]?.imported === true
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

// Export singleton instance
export const hazardImporter = new HazardImporter();

/**
 * Spell Importer
 * Handles importing Harbinger House custom spells into FoundryVTT
 * 
 * This importer:
 * - Converts our HarbingerSpell data structure to PF2e Item (spell type) format
 * - Spells in PF2e are Items, not Actors
 */

import { BaseImporter, ImportOptions, ImportResult } from './base-importer';
import { MODULE_ID, log, logError } from '../config';
import { ALL_SPELLS, type HarbingerSpell } from '../data/spells';

export interface SpellImportOptions extends ImportOptions {
  /** Import only specific spell IDs */
  spellIds?: string[];
}

export class SpellImporter extends BaseImporter<HarbingerSpell> {
  protected documentType = 'Item';
  protected documentClass = Item;

  /**
   * Get all spells available for import
   */
  getImportableItems(): HarbingerSpell[] {
    return ALL_SPELLS;
  }

  /**
   * Get spells filtered by options
   */
  getFilteredItems(options: SpellImportOptions): HarbingerSpell[] {
    let spells = this.getImportableItems();

    // Filter by specific IDs
    if (options.spellIds && options.spellIds.length > 0) {
      spells = spells.filter(spell => options.spellIds!.includes(spell.id));
    }

    return spells;
  }

  /**
   * Convert HarbingerSpell to Foundry Item (spell) data
   */
  toDocumentData(spell: HarbingerSpell): any {
    const itemData: any = {
      name: spell.data.name,
      type: 'spell',
      img: spell.data.img || this.getDefaultImage(spell),
      system: { ...spell.data.system },
      flags: {
        [MODULE_ID]: {
          sourceId: spell.id,
          imported: true
        },
        ...spell.data.flags
      }
    };

    return itemData;
  }

  /**
   * Get a default image for spells
   */
  private getDefaultImage(spell: HarbingerSpell): string {
    // Try to match based on spell traits
    const traits = spell.data.system?.traits?.value || [];
    
    if (traits.includes('fire')) return 'icons/magic/fire/flame-burning-hand-brightness.webp';
    if (traits.includes('cold')) return 'icons/magic/water/snowflake-ice-snow-white.webp';
    if (traits.includes('mental')) return 'icons/magic/perception/eye-ringed-glow-blue-purple.webp';
    if (traits.includes('enchantment')) return 'icons/magic/control/buff-flight-wings-runes-purple.webp';
    if (traits.includes('necromancy')) return 'icons/magic/death/skull-humanoid-runes-red.webp';
    if (traits.includes('divination')) return 'icons/magic/perception/eye-ringed-glow-yellow.webp';
    
    return 'icons/svg/explosion.svg';
  }

  getItemId(spell: HarbingerSpell): string {
    return spell.id;
  }

  getItemName(spell: HarbingerSpell): string {
    return spell.data.name;
  }

  /**
   * Import spells
   */
  async importAll(options: SpellImportOptions = {}): Promise<ImportResult> {
    const spells = this.getFilteredItems(options);
    return this.importItems(spells, {
      ...options,
      folderName: options.folderName || 'Harbinger House Spells'
    });
  }

  /**
   * Delete all imported spells
   */
  async deleteAllImported(): Promise<number> {
    let deleted = 0;

    try {
      // Find all spell items with our module flag
      const importedSpells = game.items?.filter(
        (item: any) => 
          item.type === 'spell' && 
          item.flags?.[MODULE_ID]?.imported === true
      ) || [];

      for (const spell of importedSpells) {
        try {
          await spell.delete();
          deleted++;
        } catch (error) {
          logError(`Failed to delete spell ${spell.name}: ${error}`);
        }
      }

      // Also delete the Harbinger House Spells folder if empty
      await this.cleanupEmptyFolders('Item');

      log(`Deleted ${deleted} imported spells`);
    } catch (error) {
      logError(`Error during spell deletion: ${error}`);
    }

    return deleted;
  }
}

// Export singleton instance
export const spellImporter = new SpellImporter();

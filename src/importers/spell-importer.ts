import { log, logError, MODULE_ID } from '../config';
import { ALL_SPELLS, type HarbingerSpell } from '../data/spells';
import { spellToDocumentData } from '../data/to-foundry-data';
import type { ItemData } from '../types/foundry';
import { BaseImporter, type ImportOptions, type ImportResult } from './base-importer';

export interface SpellImportOptions extends ImportOptions {
	/** Import only specific spell IDs */
	spellIds?: string[];
}

export class SpellImporter extends BaseImporter<HarbingerSpell, typeof ItemClass> {
	protected documentType = 'Item' as const;
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
			spells = spells.filter((spell) => options.spellIds!.includes(spell.id));
		}

		return spells;
	}

	/**
	 * Convert HarbingerSpell to Foundry Item (spell) data
	 */
	toDocumentData(spell: HarbingerSpell): ItemData {
		return spellToDocumentData(spell);
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
			folderName: options.folderName || 'Harbinger House Spells',
		});
	}

	/**
	 * Delete all imported spells
	 */
	async deleteAllImported(): Promise<number> {
		let deleted = 0;

		try {
			// Find all spell items with our module flag
			const importedSpells =
				game.items?.filter((item: ItemClass) => item.type === 'spell' && item.flags?.[MODULE_ID]?.imported === true) ||
				[];

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

export const spellImporter = new SpellImporter();

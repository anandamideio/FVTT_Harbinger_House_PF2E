import { log, logError, MODULE_ID } from '../config';
import { ALL_MACROS, type HarbingerMacro } from '../data/macros';
import { macroToDocumentData } from '../data/to-foundry-data';
import type { MacroData } from '../types/foundry';
import { BaseImporter, type ImportOptions, type ImportResult } from './base-importer';

export type MacroImportOptions = ImportOptions;

export class MacroImporter extends BaseImporter<HarbingerMacro, typeof MacroClass> {
	protected documentType = 'Macro' as const;
	protected documentClass = Macro;

	getImportableItems(): HarbingerMacro[] {
		return ALL_MACROS;
	}

	toDocumentData(macro: HarbingerMacro): MacroData {
		return macroToDocumentData(macro);
	}

	getItemId(macro: HarbingerMacro): string {
		return macro.id;
	}

	getItemName(macro: HarbingerMacro): string {
		return macro.name;
	}

	async importAll(options: MacroImportOptions = {}): Promise<ImportResult> {
		return this.importItems(ALL_MACROS, {
			...options,
			folderName: options.folderName || 'Harbinger House Macros',
		});
	}

	async deleteAllImported(): Promise<number> {
		let deleted = 0;

		try {
			const importedMacros =
				game.macros?.filter(
					(macro: MacroClass) => macro.flags?.[MODULE_ID]?.imported === true,
				) || [];

			for (const macro of importedMacros) {
				try {
					await macro.delete();
					deleted++;
				} catch (error) {
					logError(`Failed to delete macro ${macro.name}: ${error}`);
				}
			}

			await this.cleanupEmptyFolders('Macro');
			log(`Deleted ${deleted} imported macros`);
		} catch (error) {
			logError(`Error during macro deletion: ${error}`);
		}

		return deleted;
	}
}

export const macroImporter = new MacroImporter();

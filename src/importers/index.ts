import { hazardImporter } from './hazard-importer';
import { itemImporter } from './item-importer';
import { journalImporter } from './journal-importer';
import { npcImporter } from './npc-importer';
import { sceneImporter } from './scene-importer';
import { spellImporter } from './spell-importer';

export { BaseImporter, type ImportOptions, type ImportResult, type RefreshResult } from './base-importer';
export { HazardImporter, type HazardImportOptions, hazardImporter } from './hazard-importer';
export { ItemImporter, type ItemImportOptions, itemImporter } from './item-importer';
export { JournalImporter, type JournalImportOptions, journalImporter } from './journal-importer';
export { NPCImporter, type NPCImportOptions, npcImporter } from './npc-importer';
export { SceneImporter, type SceneImportOptions, sceneImporter } from './scene-importer';
export { SpellImporter, type SpellImportOptions, spellImporter } from './spell-importer';

export async function importAllContent(options?: {
	npcs?: boolean;
	items?: boolean;
	spells?: boolean;
	hazards?: boolean;
	journals?: boolean;
	scenes?: boolean;
	onProgress?: (current: number, total: number, name: string) => void;
}) {
	const {
		npcs = true,
		items = true,
		spells = true,
		hazards = true,
		journals = true,
		scenes = true,
		onProgress,
	} = options || {};

	const results = {
		npcs: { imported: 0, failed: 0 },
		items: { imported: 0, failed: 0 },
		spells: { imported: 0, failed: 0 },
		hazards: { imported: 0, failed: 0 },
		journals: { imported: 0, failed: 0 },
		scenes: { imported: 0, failed: 0 },
	};

	// Import NPCs
	if (npcs) {
		const npcResult = await npcImporter.importByCategory({ onProgress });
		results.npcs.imported = npcResult.imported;
		results.npcs.failed = npcResult.failed;
	}

	// Import Items
	if (items) {
		const itemResult = await itemImporter.importByCategory({ onProgress });
		results.items.imported = itemResult.imported;
		results.items.failed = itemResult.failed;
	}

	// Import Spells
	if (spells) {
		const spellResult = await spellImporter.importAll({ onProgress });
		results.spells.imported = spellResult.imported;
		results.spells.failed = spellResult.failed;
	}

	// Import Hazards
	if (hazards) {
		const hazardResult = await hazardImporter.importByCategory({ onProgress });
		results.hazards.imported = hazardResult.imported;
		results.hazards.failed = hazardResult.failed;
	}

	// Import Journals
	if (journals) {
		const journalResult = await journalImporter.importAll({ onProgress });
		results.journals.imported = journalResult.imported;
		results.journals.failed = journalResult.failed;
	}

	// Import Scenes
	if (scenes) {
		const sceneResult = await sceneImporter.importAll({ onProgress });
		results.scenes.imported = sceneResult.imported;
		results.scenes.failed = sceneResult.failed;
	}

	return results;
}

/**
 * For when you just need to test everything importing again
 */
export async function deleteAllImportedContent() {
	const results = {
		npcs: 0,
		items: 0,
		spells: 0,
		hazards: 0,
		journals: 0,
		scenes: 0,
	};

	results.npcs = await npcImporter.deleteAllImported();
	results.items = await itemImporter.deleteAllImported();
	results.spells = await spellImporter.deleteAllImported();
	results.hazards = await hazardImporter.deleteAllImported();
	results.journals = await journalImporter.deleteAllImported();
	results.scenes = await sceneImporter.deleteAllImported();

	return results;
}

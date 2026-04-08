<script lang="ts">
import { logError, MODULE_ID, PACKS, SETTINGS } from '../../config';
import {
	ALL_SCENES,
	ALL_SPELLS,
	getCategoryLabel,
	getFolderLabel,
	getHazardCategoryLabel,
	getItemCategoryLabel,
	HAZARDS_BY_CATEGORY,
	ITEMS_BY_CATEGORY,
	JOURNALS_BY_FOLDER,
	NPCS_BY_CATEGORY,
	type HazardCategory,
	type ItemCategory,
	type NPCCategory,
} from '../../data';
import {
	hazardImporter,
	itemImporter,
	journalImporter,
	npcImporter,
	sceneImporter,
	spellImporter,
} from '../../importers';
import type { ImportResult } from '../../importers';
import CategorySection from './CategorySection.svelte';
import ProgressBar from './ProgressBar.svelte';

let {
	onClose,
	onDelete,
}: {
	onClose: () => void;
	onDelete: () => void;
} = $props();

// Build category data
const npcCategories = Object.entries(NPCS_BY_CATEGORY)
	.filter(([, npcs]) => npcs.length > 0)
	.map(([category, npcs]) => ({ id: category, label: getCategoryLabel(category), count: npcs.length }));

const itemCategories = Object.entries(ITEMS_BY_CATEGORY)
	.filter(([, items]) => items.length > 0)
	.map(([category, items]) => ({ id: category, label: getItemCategoryLabel(category as ItemCategory), count: items.length }));

const hazardCategories = Object.entries(HAZARDS_BY_CATEGORY)
	.filter(([, hazards]) => hazards.length > 0)
	.map(([category, hazards]) => ({
		id: category,
		label: getHazardCategoryLabel(category as HazardCategory),
		count: hazards.length,
	}));

const journalFolders = Object.entries(JOURNALS_BY_FOLDER)
	.filter(([, journals]) => journals.length > 0)
	.map(([folder, journals]) => ({ id: folder, label: getFolderLabel(folder), count: journals.length }));

// Section enabled states
let importNpcs = $state(true);
let importItems = $state(true);
let importSpells = $state(true);
let importHazards = $state(true);
let importJournals = $state(true);
let importScenes = $state(true);

// Selected categories (all selected by default)
let selectedNpcCategories = $state(npcCategories.map((c) => c.id));
let selectedItemCategories = $state(itemCategories.map((c) => c.id));
let selectedHazardCategories = $state(hazardCategories.map((c) => c.id));
let selectedJournalFolders = $state(journalFolders.map((c) => c.id));

// Progress state
let progressActive = $state(false);
let progressPercent = $state(0);
let progressText = $state('Preparing...');
let buttonsDisabled = $state(false);

/**
 * Check if a compendium pack has content.
 * Falls back to in-memory import if the pack is empty (e.g., pre-built packs not available).
 */
function isPackAvailable(packId: string): boolean {
	// eslint-disable-next-line no-undef
	const pack = game.packs.get(packId);
	return !!pack && pack.index.size > 0;
}

/**
 * Create a category filter function for compendium imports.
 * Filters documents by their module flags category/folder.
 */
function categoryFilter(selectedCategories: string[], flagKey: string = 'category') {
	// eslint-disable-next-line no-undef
	return (doc: FoundryDocument) => {
		const category = doc.flags?.[MODULE_ID]?.[flagKey];
		return !category || selectedCategories.includes(category as string);
	};
}

async function handleImport() {
	progressActive = true;
	buttonsDisabled = true;

	try {
		let totalImported = 0;
		let totalFailed = 0;

		if (importNpcs) {
			progressText = 'Importing NPCs...';
			let result: ImportResult;
			if (isPackAvailable(PACKS.NPCS)) {
				result = await npcImporter.importFromCompendium(
					PACKS.NPCS,
					{
						onProgress: (current: number, total: number, name: string) => {
							progressPercent = Math.round((current / total) * 100);
							progressText = `Importing NPC: ${name}`;
						},
					},
					categoryFilter(selectedNpcCategories),
				);
			} else {
				result = await npcImporter.importByCategory({
					categories: selectedNpcCategories as NPCCategory[],
					onProgress: (current: number, total: number, name: string) => {
						progressPercent = Math.round((current / total) * 100);
						progressText = `Importing NPC: ${name}`;
					},
				});
			}
			totalImported += result.imported;
			totalFailed += result.failed;
		}

		if (importItems) {
			progressText = 'Importing Items...';
			let result: ImportResult;
			if (isPackAvailable(PACKS.ITEMS)) {
				result = await itemImporter.importFromCompendium(
					PACKS.ITEMS,
					{
						onProgress: (current: number, total: number, name: string) => {
							progressPercent = Math.round((current / total) * 100);
							progressText = `Importing Item: ${name}`;
						},
					},
					categoryFilter(selectedItemCategories),
				);
			} else {
				result = await itemImporter.importByCategory({
					categories: selectedItemCategories as ItemCategory[],
					onProgress: (current: number, total: number, name: string) => {
						progressPercent = Math.round((current / total) * 100);
						progressText = `Importing Item: ${name}`;
					},
				});
			}
			totalImported += result.imported;
			totalFailed += result.failed;
		}

		if (importSpells) {
			progressText = 'Importing Spells...';
			let result: ImportResult;
			if (isPackAvailable(PACKS.SPELLS)) {
				result = await spellImporter.importFromCompendium(PACKS.SPELLS, {
					folderName: 'Harbinger House Spells',  // Spells use flat folder (no categories)
					onProgress: (_current: number, _total: number, name: string) => {
						progressText = `Importing Spell: ${name}`;
					},
				});
			} else {
				result = await spellImporter.importAll({
					onProgress: (_current: number, _total: number, name: string) => {
						progressText = `Importing Spell: ${name}`;
					},
				});
			}
			totalImported += result.imported;
			totalFailed += result.failed;
		}

		if (importHazards) {
			progressText = 'Importing Hazards...';
			let result: ImportResult;
			if (isPackAvailable(PACKS.HAZARDS)) {
				result = await hazardImporter.importFromCompendium(
					PACKS.HAZARDS,
					{
						onProgress: (current: number, total: number, name: string) => {
							progressPercent = Math.round((current / total) * 100);
							progressText = `Importing Hazard: ${name}`;
						},
					},
					categoryFilter(selectedHazardCategories),
				);
			} else {
				result = await hazardImporter.importByCategory({
					categories: selectedHazardCategories as HazardCategory[],
					onProgress: (current: number, total: number, name: string) => {
						progressPercent = Math.round((current / total) * 100);
						progressText = `Importing Hazard: ${name}`;
					},
				});
			}
			totalImported += result.imported;
			totalFailed += result.failed;
		}

		if (importJournals) {
			progressText = 'Importing Journals...';
			let result;
			if (isPackAvailable(PACKS.JOURNALS)) {
				result = await journalImporter.importFromCompendium(PACKS.JOURNALS, {
					onProgress: (current: number, total: number, name: string) => {
						progressPercent = Math.round((current / total) * 100);
						progressText = `Importing Journal: ${name}`;
					},
				});
			} else {
				result = await journalImporter.importAll({
					folders: selectedJournalFolders,
					onProgress: (current: number, total: number, name: string) => {
						progressPercent = Math.round((current / total) * 100);
						progressText = `Importing Journal: ${name}`;
					},
				});
			}
			totalImported += result.imported;
			totalFailed += result.failed;
		}

		if (importScenes) {
			progressText = 'Importing Scenes...';
			let result;
			if (isPackAvailable(PACKS.SCENES)) {
				result = await sceneImporter.importFromCompendium(PACKS.SCENES, {
					onProgress: (current: number, total: number, name: string) => {
						progressPercent = Math.round((current / total) * 100);
						progressText = `Importing Scene: ${name}`;
					},
				});
			} else {
				result = await sceneImporter.importAll({
					onProgress: (current: number, total: number, name: string) => {
						progressPercent = Math.round((current / total) * 100);
						progressText = `Importing Scene: ${name}`;
					},
				});
			}
			totalImported += result.imported;
			totalFailed += result.failed;
		}

		progressPercent = 100;
		progressText = `Complete! Imported ${totalImported} items.`;

		// Store the current module version so we can detect future updates
		const currentVersion = game.modules.get(MODULE_ID)?.version ?? '0.0.0';
		await game.settings.set(MODULE_ID, SETTINGS.INSTALLED_MODULE_VERSION, currentVersion);

		// eslint-disable-next-line no-undef
		ui.notifications?.info(
			`Harbinger House: Imported ${totalImported} items${totalFailed > 0 ? ` (${totalFailed} failed)` : ''}`,
		);

		setTimeout(() => onClose(), 1500);
	} catch (error) {
		logError('Import failed:', error);
		progressText = `Error: ${error}`;
		// eslint-disable-next-line no-undef
		ui.notifications?.error(`Import failed: ${error}`);
		buttonsDisabled = false;
	}
}
</script>

<div class="harbinger-house-dialog">
  <div class="dialog-content">
    <h2><i class="fas fa-file-import"></i> Import Content</h2>

    <CategorySection
      title="NPCs"
      icon="fa-users"
      bind:enabled={importNpcs}
      categories={npcCategories}
      bind:selectedIds={selectedNpcCategories}
    />

    <CategorySection
      title="Items"
      icon="fa-treasure-chest"
      bind:enabled={importItems}
      categories={itemCategories}
      bind:selectedIds={selectedItemCategories}
    />

    <CategorySection
      title="Spells"
      icon="fa-magic"
      bind:enabled={importSpells}
      description={`${ALL_SPELLS.length} custom spells (Word of Chaos, Dream Storm)`}
    />

    <CategorySection
      title="Hazards"
      icon="fa-exclamation-triangle"
      bind:enabled={importHazards}
      categories={hazardCategories}
      bind:selectedIds={selectedHazardCategories}
    />

    <CategorySection
      title="Journals"
      icon="fa-book"
      bind:enabled={importJournals}
      categories={journalFolders}
      bind:selectedIds={selectedJournalFolders}
    />

    <CategorySection
      title="Scenes & Maps"
      icon="fa-map"
      bind:enabled={importScenes}
      description={`${ALL_SCENES.length} battlemaps: First Floor, Common Area, Doors & Kaydi's Room, Final Chamber (2 versions), Hall of Mirrors, Mind Trap, Statues & Gardens, Vorina & Teela's Area`}
    />

    <ProgressBar active={progressActive} percent={progressPercent} text={progressText} />

    <div class="button-group">
      <button class="primary" onclick={handleImport} disabled={buttonsDisabled}>
        <i class="fas fa-download"></i> Import Selected
      </button>
      <button class="danger" onclick={onDelete} disabled={buttonsDisabled}>
        <i class="fas fa-trash"></i> Delete All Imported
      </button>
      <button onclick={onClose} disabled={buttonsDisabled}>
        <i class="fas fa-times"></i> Cancel
      </button>
    </div>
  </div>
</div>

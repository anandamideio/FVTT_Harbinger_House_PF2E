<script lang="ts">
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
  } from '../../data';
  import {
    hazardImporter,
    itemImporter,
    journalImporter,
    npcImporter,
    sceneImporter,
    spellImporter,
  } from '../../importers';
  import { logError } from '../../config';
  import CategorySection from './CategorySection.svelte';
  import ProgressBar from './ProgressBar.svelte';

  let { onClose, onDelete }: {
    onClose: () => void;
    onDelete: () => void;
  } = $props();

  // Build category data
  const npcCategories = Object.entries(NPCS_BY_CATEGORY)
    .filter(([_, npcs]) => npcs.length > 0)
    .map(([category, npcs]) => ({ id: category, label: getCategoryLabel(category), count: npcs.length }));

  const itemCategories = Object.entries(ITEMS_BY_CATEGORY)
    .filter(([_, items]) => items.length > 0)
    .map(([category, items]) => ({ id: category, label: getItemCategoryLabel(category as any), count: items.length }));

  const hazardCategories = Object.entries(HAZARDS_BY_CATEGORY)
    .filter(([_, hazards]) => hazards.length > 0)
    .map(([category, hazards]) => ({ id: category, label: getHazardCategoryLabel(category as any), count: hazards.length }));

  const journalFolders = Object.entries(JOURNALS_BY_FOLDER)
    .filter(([_, journals]) => journals.length > 0)
    .map(([folder, journals]) => ({ id: folder, label: getFolderLabel(folder as any), count: journals.length }));

  // Section enabled states
  let importNpcs = $state(true);
  let importItems = $state(true);
  let importSpells = $state(true);
  let importHazards = $state(true);
  let importJournals = $state(true);
  let importScenes = $state(true);

  // Selected categories (all selected by default)
  let selectedNpcCategories = $state(npcCategories.map(c => c.id));
  let selectedItemCategories = $state(itemCategories.map(c => c.id));
  let selectedHazardCategories = $state(hazardCategories.map(c => c.id));
  let selectedJournalFolders = $state(journalFolders.map(c => c.id));

  // Progress state
  let progressActive = $state(false);
  let progressPercent = $state(0);
  let progressText = $state('Preparing...');
  let buttonsDisabled = $state(false);

  async function handleImport() {
    progressActive = true;
    buttonsDisabled = true;

    try {
      let totalImported = 0;
      let totalFailed = 0;

      if (importNpcs) {
        progressText = 'Importing NPCs...';
        const result = await npcImporter.importByCategory({
          categories: selectedNpcCategories as any[],
          onProgress: (current: number, total: number, name: string) => {
            progressPercent = Math.round((current / total) * 100);
            progressText = `Importing NPC: ${name}`;
          },
        });
        totalImported += result.imported;
        totalFailed += result.failed;
      }

      if (importItems) {
        progressText = 'Importing Items...';
        const result = await itemImporter.importByCategory({
          categories: selectedItemCategories as any[],
          onProgress: (current: number, total: number, name: string) => {
            progressPercent = Math.round((current / total) * 100);
            progressText = `Importing Item: ${name}`;
          },
        });
        totalImported += result.imported;
        totalFailed += result.failed;
      }

      if (importSpells) {
        progressText = 'Importing Spells...';
        const result = await spellImporter.importAll({
          onProgress: (_current: number, _total: number, name: string) => {
            progressText = `Importing Spell: ${name}`;
          },
        });
        totalImported += result.imported;
        totalFailed += result.failed;
      }

      if (importHazards) {
        progressText = 'Importing Hazards...';
        const result = await hazardImporter.importByCategory({
          categories: selectedHazardCategories as any[],
          onProgress: (current: number, total: number, name: string) => {
            progressPercent = Math.round((current / total) * 100);
            progressText = `Importing Hazard: ${name}`;
          },
        });
        totalImported += result.imported;
        totalFailed += result.failed;
      }

      if (importJournals) {
        progressText = 'Importing Journals...';
        const result = await journalImporter.importAll({
          folders: selectedJournalFolders as any[],
          onProgress: (current: number, total: number, name: string) => {
            progressPercent = Math.round((current / total) * 100);
            progressText = `Importing Journal: ${name}`;
          },
        });
        totalImported += result.imported;
        totalFailed += result.failed;
      }

      if (importScenes) {
        progressText = 'Importing Scenes...';
        const result = await sceneImporter.importAll({
          onProgress: (current: number, total: number, name: string) => {
            progressPercent = Math.round((current / total) * 100);
            progressText = `Importing Scene: ${name}`;
          },
        });
        totalImported += result.imported;
        totalFailed += result.failed;
      }

      progressPercent = 100;
      progressText = `Complete! Imported ${totalImported} items.`;

      ui.notifications?.info(
        `Harbinger House: Imported ${totalImported} items${totalFailed > 0 ? ` (${totalFailed} failed)` : ''}`,
      );

      setTimeout(() => onClose(), 1500);
    } catch (error) {
      logError('Import failed:', error);
      progressText = `Error: ${error}`;
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

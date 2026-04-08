<script lang="ts">
import { logError, MODULE_ID, PACKS, SETTINGS } from '../../config';
import {
	hazardImporter,
	itemImporter,
	journalImporter,
	macroImporter,
	npcImporter,
	sceneImporter,
	spellImporter,
} from '../../importers';
import type { ImportResult, RefreshResult } from '../../importers';
import ProgressBar from './ProgressBar.svelte';

let {
	oldVersion,
	newVersion,
	onClose,
}: {
	oldVersion: string;
	newVersion: string;
	onClose: () => void;
} = $props();

let progressActive = $state(false);
let progressPercent = $state(0);
let progressText = $state('Preparing...');
let buttonsDisabled = $state(false);

function storeCurrentVersion() {
	game.settings.set(MODULE_ID, SETTINGS.INSTALLED_MODULE_VERSION, newVersion);
}

async function handleApplyUpdates() {
	progressActive = true;
	buttonsDisabled = true;

	try {
		let totalUpdated = 0;
		let totalFailed = 0;

		const packs = [
			{ id: PACKS.NPCS, importer: npcImporter, label: 'NPCs' },
			{ id: PACKS.ITEMS, importer: itemImporter, label: 'Items' },
			{ id: PACKS.SPELLS, importer: spellImporter, label: 'Spells' },
			{ id: PACKS.HAZARDS, importer: hazardImporter, label: 'Hazards' },
			{ id: PACKS.JOURNALS, importer: journalImporter, label: 'Journals' },
			{ id: PACKS.SCENES, importer: sceneImporter, label: 'Scenes' },
			{ id: PACKS.MACROS, importer: macroImporter, label: 'Macros' },
		];

		for (let i = 0; i < packs.length; i++) {
			const pack = packs[i];
			progressText = `Refreshing ${pack.label}...`;
			progressPercent = Math.round((i / packs.length) * 100);

			const result: RefreshResult = await pack.importer.refreshFromCompendium(pack.id, {
				onProgress: (_current: number, _total: number, name: string) => {
					progressText = `Refreshing ${pack.label}: ${name}`;
				},
			});

			totalUpdated += result.updated;
			totalFailed += result.failed;

			// If no world documents existed for this content type, the refresh
			// had nothing to update. Import from compendium so new content types
			// added in later module versions are picked up automatically.
			if (result.updated === 0 && result.skipped === 0 && result.failed === 0) {
				const compendiumPack = game.packs.get(pack.id);
				if (compendiumPack && compendiumPack.index.size > 0) {
					progressText = `Importing new ${pack.label}...`;
					const importResult: ImportResult = await pack.importer.importFromCompendium(pack.id, {
						folderName: `Harbinger House ${pack.label}`,
						onProgress: (_current: number, _total: number, name: string) => {
							progressText = `Importing ${pack.label}: ${name}`;
						},
					});
					totalUpdated += importResult.imported;
					totalFailed += importResult.failed;
				}
			}
		}

		progressPercent = 100;
		progressText = `Complete! Updated ${totalUpdated} documents.`;

		storeCurrentVersion();

		ui.notifications?.info(
			`Harbinger House: Updated ${totalUpdated} documents${totalFailed > 0 ? ` (${totalFailed} failed)` : ''}`,
		);

		setTimeout(() => onClose(), 1500);
	} catch (error) {
		logError('Content refresh failed:', error);
		progressText = `Error: ${error}`;
		ui.notifications?.error(`Content refresh failed: ${error}`);
		buttonsDisabled = false;
	}
}

function handleSkip() {
	storeCurrentVersion();
	onClose();
}
</script>

<div class="harbinger-house-dialog">
  <div class="dialog-content">
    <h2><i class="fas fa-sync-alt"></i> Module Updated</h2>
    <p class="intro-text">
      Harbinger House has been updated from <strong>v{oldVersion}</strong> to <strong>v{newVersion}</strong>.
    </p>

    <div class="content-section">
      <div class="section-title">
        <i class="fas fa-info-circle"></i>
        Content Refresh Available
      </div>
      <p style="font-size: 13px; margin-bottom: 8px;">
        The module's compendium data has been updated. You can refresh your imported
        world content to match the latest version. This will update existing documents
        while preserving their folder organization.
      </p>
    </div>

    <ProgressBar active={progressActive} percent={progressPercent} text={progressText} />

    <div class="button-group">
      <button class="primary" onclick={handleApplyUpdates} disabled={buttonsDisabled}>
        <i class="fas fa-sync-alt"></i> Apply Updates
      </button>
      <button onclick={handleSkip} disabled={buttonsDisabled}>
        <i class="fas fa-forward"></i> Skip This Update
      </button>
    </div>
  </div>
</div>

<script lang="ts">
import { logError } from '../../config';
import { deleteAllImportedContent } from '../../importers';
import ProgressBar from './ProgressBar.svelte';

let {
	onClose,
}: {
	onClose: () => void;
} = $props();

let progressActive = $state(false);
let progressPercent = $state(0);
let progressText = $state('Ready to delete...');
let buttonsDisabled = $state(false);

async function handleDelete() {
	progressActive = true;
	buttonsDisabled = true;

	try {
		progressText = 'Deleting content...';
		const results = await deleteAllImportedContent();

		const total = results.npcs + results.items + results.spells + results.hazards + results.journals + results.scenes;
		progressPercent = 100;
		progressText = `Deleted ${total} items.`;

		ui.notifications?.info(`Harbinger House: Deleted ${total} imported items`);

		setTimeout(() => onClose(), 1000);
	} catch (error) {
		logError('Delete failed:', error);
		progressText = `Error: ${error}`;
		ui.notifications?.error(`Delete failed: ${error}`);
		buttonsDisabled = false;
	}
}
</script>

<div class="harbinger-house-dialog">
  <div class="dialog-content">
    <h2><i class="fas fa-exclamation-triangle"></i> Confirm Deletion</h2>
    <p style="text-align: center; color: #c94a4a; margin-bottom: 16px;">
      This will delete ALL content imported by the Harbinger House module.
    </p>
    <p style="text-align: center; font-size: 13px;">
      This includes all NPCs, Items, Spells, Hazards, Journals, and Scenes that were imported.<br>
      <strong>This action cannot be undone.</strong>
    </p>

    <ProgressBar active={progressActive} percent={progressPercent} text={progressText} />

    <div class="button-group">
      <button class="danger" onclick={handleDelete} disabled={buttonsDisabled}>
        <i class="fas fa-trash"></i> Delete All
      </button>
      <button onclick={onClose} disabled={buttonsDisabled}>
        <i class="fas fa-times"></i> Cancel
      </button>
    </div>
  </div>
</div>

<script lang="ts">
import { getContentSummary } from '../../data';

let {
	onImport,
	onClose,
}: {
	onImport: () => void;
	onClose: () => void;
} = $props();

const summary = getContentSummary();
</script>

<div class="harbinger-house-dialog">
  <div class="dialog-content">
    <h2><i class="fas fa-door-open"></i> Welcome to Harbinger House</h2>
    <p class="intro-text">
      "In the Cage, berks whisper of a house where the mad become gods..."
    </p>

    <div class="content-section">
      <div class="section-title">
        <i class="fas fa-info-circle"></i>
        Available Content
      </div>
      <p style="font-size: 13px; margin-bottom: 8px;">
        This module contains <strong>{summary.total}</strong> pieces of converted content:
      </p>
      <ul style="font-size: 12px; margin: 0; padding-left: 20px;">
        <li><strong>{summary.npcs}</strong> NPCs (major characters, residents, fiends)</li>
        <li><strong>{summary.items}</strong> Items (artifacts, weapons, consumables)</li>
        <li><strong>{summary.spells}</strong> Custom Spells</li>
        <li><strong>{summary.hazards}</strong> Hazards (traps, environmental dangers)</li>
        <li><strong>{summary.journals}</strong> Journal Entries (adventure content)</li>
        <li><strong>{summary.scenes}</strong> Scenes & Maps (ready-to-use battlemaps)</li>
      </ul>
    </div>

    <div class="button-group">
      <button class="primary" onclick={onImport}>
        <i class="fas fa-download"></i> Import Content
      </button>
      <button onclick={onClose}>
        <i class="fas fa-clock"></i> Maybe Later
      </button>
    </div>
  </div>
</div>

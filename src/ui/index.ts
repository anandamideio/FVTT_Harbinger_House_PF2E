/**
 * UI Components
 * Dialog and notification helpers for the Harbinger House module
 * 
 * This file provides:
 * - Welcome dialog on first load
 * - Import dialog with category selection
 * - Progress indicators
 * - Confirmation dialogs
 */

import { MODULE_ID, MODULE_NAME, localize, log, logError } from './config';
import { 
  npcImporter, 
  itemImporter, 
  spellImporter, 
  hazardImporter,
  importAllContent,
  deleteAllImportedContent
} from './importers';
import { 
  NPCS_BY_CATEGORY, 
  getCategoryLabel,
  ITEMS_BY_CATEGORY,
  getItemCategoryLabel,
  HAZARDS_BY_CATEGORY,
  getHazardCategoryLabel,
  ALL_SPELLS,
  getContentSummary
} from './data';

/**
 * CSS styles for the Planescape-themed UI
 * Injected into the document head on first use
 */
const PLANESCAPE_STYLES = `
<style id="harbinger-house-styles">
  .harbinger-house-dialog {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 2px solid #4a3f5c;
    border-radius: 8px;
    color: #e8e6e3;
  }
  
  .harbinger-house-dialog .dialog-content {
    padding: 16px;
  }
  
  .harbinger-house-dialog h2 {
    color: #c9a227;
    text-align: center;
    font-family: 'Modesto Condensed', serif;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 16px;
    text-shadow: 0 0 10px rgba(201, 162, 39, 0.3);
  }
  
  .harbinger-house-dialog .intro-text {
    font-style: italic;
    color: #b0a8b9;
    margin-bottom: 16px;
    text-align: center;
    border-bottom: 1px solid #4a3f5c;
    padding-bottom: 16px;
  }
  
  .harbinger-house-dialog .content-section {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid #4a3f5c;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .harbinger-house-dialog .section-title {
    color: #c9a227;
    font-weight: bold;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .harbinger-house-dialog .section-title i {
    color: #8b7355;
  }
  
  .harbinger-house-dialog .category-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 8px;
  }
  
  .harbinger-house-dialog .category-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: rgba(74, 63, 92, 0.3);
    border-radius: 4px;
    font-size: 12px;
  }
  
  .harbinger-house-dialog .category-item input[type="checkbox"] {
    margin: 0;
  }
  
  .harbinger-house-dialog .category-count {
    color: #8b7355;
    margin-left: auto;
    font-size: 11px;
  }
  
  .harbinger-house-dialog .progress-container {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    padding: 8px;
    margin-top: 12px;
    display: none;
  }
  
  .harbinger-house-dialog .progress-container.active {
    display: block;
  }
  
  .harbinger-house-dialog .progress-bar {
    height: 20px;
    background: #2a2a4a;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  
  .harbinger-house-dialog .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4a3f5c, #c9a227);
    width: 0%;
    transition: width 0.3s ease;
  }
  
  .harbinger-house-dialog .progress-text {
    text-align: center;
    font-size: 12px;
    color: #b0a8b9;
  }
  
  .harbinger-house-dialog button {
    background: linear-gradient(135deg, #4a3f5c 0%, #2a2a4a 100%);
    border: 1px solid #c9a227;
    color: #e8e6e3;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .harbinger-house-dialog button:hover {
    background: linear-gradient(135deg, #5a4f6c 0%, #3a3a5a 100%);
    box-shadow: 0 0 10px rgba(201, 162, 39, 0.3);
  }
  
  .harbinger-house-dialog button.primary {
    background: linear-gradient(135deg, #c9a227 0%, #8b7355 100%);
    color: #1a1a2e;
    font-weight: bold;
  }
  
  .harbinger-house-dialog button.danger {
    background: linear-gradient(135deg, #8b3a3a 0%, #5a2a2a 100%);
    border-color: #c94a4a;
  }
  
  .harbinger-house-dialog .button-group {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 16px;
  }

  .harbinger-house-dialog .select-all-row {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 4px;
  }

  .harbinger-house-dialog .select-all-btn {
    font-size: 11px;
    padding: 2px 8px;
    background: transparent;
    border: 1px solid #4a3f5c;
  }
</style>
`;

/**
 * Inject Planescape styles into the document
 */
function injectStyles(): void {
  if (!document.getElementById('harbinger-house-styles')) {
    document.head.insertAdjacentHTML('beforeend', PLANESCAPE_STYLES);
  }
}

/**
 * Show the welcome dialog with import options
 */
export function showWelcomeDialog(): void {
  injectStyles();
  
  const summary = getContentSummary();
  
  const content = `
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
            This module contains <strong>${summary.total}</strong> pieces of converted content:
          </p>
          <ul style="font-size: 12px; margin: 0; padding-left: 20px;">
            <li><strong>${summary.npcs}</strong> NPCs (major characters, residents, fiends)</li>
            <li><strong>${summary.items}</strong> Items (artifacts, weapons, consumables)</li>
            <li><strong>${summary.spells}</strong> Custom Spells</li>
            <li><strong>${summary.hazards}</strong> Hazards (traps, environmental dangers)</li>
          </ul>
        </div>
        
        <div class="button-group">
          <button class="primary" id="hh-import-btn">
            <i class="fas fa-download"></i> Import Content
          </button>
          <button id="hh-later-btn">
            <i class="fas fa-clock"></i> Maybe Later
          </button>
        </div>
      </div>
    </div>
  `;

  const dialog = new Dialog({
    title: MODULE_NAME,
    content,
    buttons: {},
    render: (html: JQuery) => {
      html.find('#hh-import-btn').on('click', () => {
        dialog.close();
        showImportDialog();
      });
      
      html.find('#hh-later-btn').on('click', () => {
        dialog.close();
      });
    }
  }, {
    width: 450,
    classes: ['harbinger-house-welcome']
  });

  dialog.render(true);
}

/**
 * Show the main import dialog with category selection
 */
export function showImportDialog(): void {
  injectStyles();
  
  // Build NPC categories HTML
  const npcCategoriesHtml = Object.entries(NPCS_BY_CATEGORY)
    .filter(([_, npcs]) => npcs.length > 0)
    .map(([category, npcs]) => `
      <label class="category-item">
        <input type="checkbox" name="npc-${category}" checked>
        ${getCategoryLabel(category)}
        <span class="category-count">(${npcs.length})</span>
      </label>
    `).join('');

  // Build Item categories HTML
  const itemCategoriesHtml = Object.entries(ITEMS_BY_CATEGORY)
    .filter(([_, items]) => items.length > 0)
    .map(([category, items]) => `
      <label class="category-item">
        <input type="checkbox" name="item-${category}" checked>
        ${getItemCategoryLabel(category as any)}
        <span class="category-count">(${items.length})</span>
      </label>
    `).join('');

  // Build Hazard categories HTML
  const hazardCategoriesHtml = Object.entries(HAZARDS_BY_CATEGORY)
    .filter(([_, hazards]) => hazards.length > 0)
    .map(([category, hazards]) => `
      <label class="category-item">
        <input type="checkbox" name="hazard-${category}" checked>
        ${getHazardCategoryLabel(category as any)}
        <span class="category-count">(${hazards.length})</span>
      </label>
    `).join('');

  const content = `
    <div class="harbinger-house-dialog">
      <div class="dialog-content">
        <h2><i class="fas fa-file-import"></i> Import Content</h2>
        
        <!-- NPCs Section -->
        <div class="content-section">
          <div class="section-title">
            <i class="fas fa-users"></i>
            NPCs
            <label style="margin-left: auto; font-weight: normal; font-size: 12px;">
              <input type="checkbox" id="import-npcs" checked> Import
            </label>
          </div>
          <div class="category-grid" id="npc-categories">
            ${npcCategoriesHtml}
          </div>
        </div>
        
        <!-- Items Section -->
        <div class="content-section">
          <div class="section-title">
            <i class="fas fa-treasure-chest"></i>
            Items
            <label style="margin-left: auto; font-weight: normal; font-size: 12px;">
              <input type="checkbox" id="import-items" checked> Import
            </label>
          </div>
          <div class="category-grid" id="item-categories">
            ${itemCategoriesHtml}
          </div>
        </div>
        
        <!-- Spells Section -->
        <div class="content-section">
          <div class="section-title">
            <i class="fas fa-magic"></i>
            Spells
            <label style="margin-left: auto; font-weight: normal; font-size: 12px;">
              <input type="checkbox" id="import-spells" checked> Import
            </label>
          </div>
          <p style="font-size: 12px; color: #b0a8b9; margin: 4px 0;">
            ${ALL_SPELLS.length} custom spells (Word of Chaos, Dream Storm)
          </p>
        </div>
        
        <!-- Hazards Section -->
        <div class="content-section">
          <div class="section-title">
            <i class="fas fa-exclamation-triangle"></i>
            Hazards
            <label style="margin-left: auto; font-weight: normal; font-size: 12px;">
              <input type="checkbox" id="import-hazards" checked> Import
            </label>
          </div>
          <div class="category-grid" id="hazard-categories">
            ${hazardCategoriesHtml}
          </div>
        </div>
        
        <!-- Progress -->
        <div class="progress-container" id="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
          </div>
          <div class="progress-text" id="progress-text">Preparing...</div>
        </div>
        
        <div class="button-group">
          <button class="primary" id="hh-do-import">
            <i class="fas fa-download"></i> Import Selected
          </button>
          <button class="danger" id="hh-delete-all">
            <i class="fas fa-trash"></i> Delete All Imported
          </button>
          <button id="hh-cancel">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </div>
    </div>
  `;

  const dialog = new Dialog({
    title: `${MODULE_NAME} - Import`,
    content,
    buttons: {},
    render: (html: JQuery) => {
      // Toggle category visibility based on main checkbox
      html.find('#import-npcs').on('change', function() {
        html.find('#npc-categories').toggle($(this).is(':checked'));
      });
      html.find('#import-items').on('change', function() {
        html.find('#item-categories').toggle($(this).is(':checked'));
      });
      html.find('#import-hazards').on('change', function() {
        html.find('#hazard-categories').toggle($(this).is(':checked'));
      });

      // Import button
      html.find('#hh-do-import').on('click', async () => {
        const progressContainer = html.find('#progress-container');
        const progressFill = html.find('#progress-fill');
        const progressText = html.find('#progress-text');
        
        progressContainer.addClass('active');
        html.find('button').prop('disabled', true);

        try {
          // Get selected options
          const importNpcs = html.find('#import-npcs').is(':checked');
          const importItems = html.find('#import-items').is(':checked');
          const importSpells = html.find('#import-spells').is(':checked');
          const importHazards = html.find('#import-hazards').is(':checked');

          let totalImported = 0;
          let totalFailed = 0;

          // Import NPCs
          if (importNpcs) {
            progressText.text('Importing NPCs...');
            const selectedCategories = html.find('#npc-categories input:checked')
              .map(function() { return $(this).attr('name')?.replace('npc-', ''); })
              .get();
            
            const result = await npcImporter.importByCategory({
              categories: selectedCategories as any[],
              onProgress: (current, total, name) => {
                const percent = Math.round((current / total) * 100);
                progressFill.css('width', `${percent}%`);
                progressText.text(`Importing NPC: ${name}`);
              }
            });
            totalImported += result.imported;
            totalFailed += result.failed;
          }

          // Import Items
          if (importItems) {
            progressText.text('Importing Items...');
            const selectedCategories = html.find('#item-categories input:checked')
              .map(function() { return $(this).attr('name')?.replace('item-', ''); })
              .get();
            
            const result = await itemImporter.importByCategory({
              categories: selectedCategories as any[],
              onProgress: (current, total, name) => {
                const percent = Math.round((current / total) * 100);
                progressFill.css('width', `${percent}%`);
                progressText.text(`Importing Item: ${name}`);
              }
            });
            totalImported += result.imported;
            totalFailed += result.failed;
          }

          // Import Spells
          if (importSpells) {
            progressText.text('Importing Spells...');
            const result = await spellImporter.importAll({
              onProgress: (current, total, name) => {
                progressText.text(`Importing Spell: ${name}`);
              }
            });
            totalImported += result.imported;
            totalFailed += result.failed;
          }

          // Import Hazards
          if (importHazards) {
            progressText.text('Importing Hazards...');
            const selectedCategories = html.find('#hazard-categories input:checked')
              .map(function() { return $(this).attr('name')?.replace('hazard-', ''); })
              .get();
            
            const result = await hazardImporter.importByCategory({
              categories: selectedCategories as any[],
              onProgress: (current, total, name) => {
                const percent = Math.round((current / total) * 100);
                progressFill.css('width', `${percent}%`);
                progressText.text(`Importing Hazard: ${name}`);
              }
            });
            totalImported += result.imported;
            totalFailed += result.failed;
          }

          // Complete
          progressFill.css('width', '100%');
          progressText.text(`Complete! Imported ${totalImported} items.`);
          
          ui.notifications?.info(`Harbinger House: Imported ${totalImported} items${totalFailed > 0 ? ` (${totalFailed} failed)` : ''}`);
          
          setTimeout(() => dialog.close(), 1500);
        } catch (error) {
          logError('Import failed:', error);
          progressText.text(`Error: ${error}`);
          ui.notifications?.error(`Import failed: ${error}`);
          html.find('button').prop('disabled', false);
        }
      });

      // Delete button
      html.find('#hh-delete-all').on('click', async () => {
        dialog.close();
        showDeleteConfirmDialog();
      });

      // Cancel button
      html.find('#hh-cancel').on('click', () => {
        dialog.close();
      });
    }
  }, {
    width: 500,
    height: 'auto',
    classes: ['harbinger-house-import']
  });

  dialog.render(true);
}

/**
 * Show confirmation dialog before deleting all imported content
 */
export function showDeleteConfirmDialog(): void {
  injectStyles();

  const content = `
    <div class="harbinger-house-dialog">
      <div class="dialog-content">
        <h2><i class="fas fa-exclamation-triangle"></i> Confirm Deletion</h2>
        <p style="text-align: center; color: #c94a4a; margin-bottom: 16px;">
          This will delete ALL content imported by the Harbinger House module.
        </p>
        <p style="text-align: center; font-size: 13px;">
          This includes all NPCs, Items, Spells, and Hazards that were imported.<br>
          <strong>This action cannot be undone.</strong>
        </p>
        
        <div class="progress-container" id="delete-progress">
          <div class="progress-bar">
            <div class="progress-fill" id="delete-fill"></div>
          </div>
          <div class="progress-text" id="delete-text">Ready to delete...</div>
        </div>
      </div>
    </div>
  `;

  const dialog = new Dialog({
    title: `${MODULE_NAME} - Delete Content`,
    content,
    buttons: {
      delete: {
        icon: '<i class="fas fa-trash"></i>',
        label: 'Delete All',
        callback: async (html: JQuery) => {
          const progressContainer = html.find('#delete-progress');
          const progressFill = html.find('#delete-fill');
          const progressText = html.find('#delete-text');
          
          progressContainer.addClass('active');

          try {
            progressText.text('Deleting content...');
            const results = await deleteAllImportedContent();
            
            const total = results.npcs + results.items + results.spells + results.hazards;
            progressFill.css('width', '100%');
            progressText.text(`Deleted ${total} items.`);
            
            ui.notifications?.info(`Harbinger House: Deleted ${total} imported items`);
            
            setTimeout(() => dialog.close(), 1000);
          } catch (error) {
            logError('Delete failed:', error);
            progressText.text(`Error: ${error}`);
            ui.notifications?.error(`Delete failed: ${error}`);
          }
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: 'Cancel'
      }
    },
    default: 'cancel'
  }, {
    width: 400,
    classes: ['harbinger-house-delete']
  });

  dialog.render(true);
}

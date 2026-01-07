/**
 * Import Dialog
 * A dialog that appears when the module loads, allowing users to import content
 * 
 * Why a custom dialog?
 * - Provides clear information about what will be imported
 * - Lets users choose specific categories to import
 * - Shows progress during import
 * - Gives feedback on success/failure
 */

import { MODULE_ID, localize, log, logError } from '../config';
import { 
  npcImporter, 
  itemImporter, 
  spellImporter, 
  hazardImporter, 
  journalImporter, 
  sceneImporter,
  importAllContent,
  type ImportResult 
} from '../importers';
import { getContentSummary } from '../data';

interface ImportDialogOptions {
    /** Called after successful import */
    onComplete?: (results: any) => void;
    /** Called if user cancels */
    onCancel?: () => void;
}

/**
 * Show the main import dialog
 */
export async function showImportDialog(options: ImportDialogOptions = {}): Promise<void> {
    const summary = getContentSummary();

    const content = `
        <div class="harbinger-import-dialog">
            <div class="import-header">
                <h2>Import Harbinger House Content</h2>
                <p class="import-description">Select which content types to import into your world.</p>
            </div>

            <div class="import-summary">
                <h3>Available Content</h3>
                <p class="total-count">${summary.total} items available</p>
                
                <div class="content-type-list">
                    <label class="content-type-item">
                        <input type="checkbox" name="content-type" value="npcs" checked>
                        <span class="content-icon"><i class="fas fa-users"></i></span>
                        <span class="content-name">NPCs & Creatures</span>
                        <span class="content-count">(${summary.npcs})</span>
                    </label>
                    <label class="content-type-item">
                        <input type="checkbox" name="content-type" value="items" checked>
                        <span class="content-icon"><i class="fas fa-sword"></i></span>
                        <span class="content-name">Items & Equipment</span>
                        <span class="content-count">(${summary.items})</span>
                    </label>
                    <label class="content-type-item">
                        <input type="checkbox" name="content-type" value="spells" checked>
                        <span class="content-icon"><i class="fas fa-sparkles"></i></span>
                        <span class="content-name">Spells</span>
                        <span class="content-count">(${summary.spells})</span>
                    </label>
                    <label class="content-type-item">
                        <input type="checkbox" name="content-type" value="hazards" checked>
                        <span class="content-icon"><i class="fas fa-skull-crossbones"></i></span>
                        <span class="content-name">Hazards</span>
                        <span class="content-count">(${summary.hazards})</span>
                    </label>
                    <label class="content-type-item">
                        <input type="checkbox" name="content-type" value="journals" checked>
                        <span class="content-icon"><i class="fas fa-book"></i></span>
                        <span class="content-name">Journals & Handouts</span>
                        <span class="content-count">(${summary.journals})</span>
                    </label>
                    <label class="content-type-item">
                        <input type="checkbox" name="content-type" value="scenes" checked>
                        <span class="content-icon"><i class="fas fa-map"></i></span>
                        <span class="content-name">Scenes & Maps</span>
                        <span class="content-count">(${summary.scenes})</span>
                    </label>
                </div>
            </div>

            <div class="import-options">
                <h3>Import Options</h3>
                <label class="option-item">
                    <input type="checkbox" name="updateExisting">
                    <span>Update existing content if already imported</span>
                </label>
            </div>

            <div class="import-progress" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <p class="progress-text">Preparing import...</p>
            </div>
        </div>
    `;

    const dialog = new Dialog({
        title: 'Import Harbinger House',
        content: content,
        buttons: {
            import: {
                icon: '<i class="fas fa-download"></i>',
                label: 'Import Selected',
                callback: async (html: JQuery) => {
                    await handleImport(html, options);
                }
            },
            later: {
                icon: '<i class="fas fa-clock"></i>',
                label: 'Import Later',
                callback: () => {
                    log('Import postponed by user');
                    options.onCancel?.();
                }
            },
            never: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Don\'t Show Again',
                callback: () => {
                    // Set a flag to not show this dialog again
                    game.settings.set(MODULE_ID, 'showImportDialog', false);
                    log('Import dialog disabled by user');
                    options.onCancel?.();
                }
            }
        },
        default: 'import',
        render: (html: JQuery) => {
            // Add custom styling class to the dialog
            html.closest('.dialog').addClass('harbinger-dialog');
        },
        close: () => {
            options.onCancel?.();
        }
    }, {
        width: 550,
        height: 'auto',
        classes: ['harbinger-import-dialog-window']
    });

    dialog.render(true);
}

/**
 * Handle the import process
 */
async function handleImport(html: JQuery, options: ImportDialogOptions): Promise<void> {
    // Get selected content types
    const selectedTypes: string[] = [];
    html.find('input[name="content-type"]:checked').each((_, el) => {
        selectedTypes.push((el as HTMLInputElement).value);
    });

    if (selectedTypes.length === 0) {
        ui.notifications?.warn('No content types selected for import');
        return;
    }

    // Get options
    const updateExisting = html.find('input[name="updateExisting"]').is(':checked');

    // Show progress
    const progressContainer = html.find('.import-progress');
    const progressFill = html.find('.progress-fill');
    const progressText = html.find('.progress-text');
    
    progressContainer.show();

    // Disable buttons during import
    html.closest('.dialog').find('button').prop('disabled', true);

    try {
        const results: any = {
            npcs: { imported: 0, failed: 0 },
            items: { imported: 0, failed: 0 },
            spells: { imported: 0, failed: 0 },
            hazards: { imported: 0, failed: 0 },
            journals: { imported: 0, failed: 0 },
            scenes: { imported: 0, failed: 0 }
        };

        let totalSteps = selectedTypes.length;
        let currentStep = 0;

        // Import NPCs
        if (selectedTypes.includes('npcs')) {
            currentStep++;
            progressText.text(`Importing NPCs... (${currentStep}/${totalSteps})`);
            const result = await npcImporter.importByCategory({
                updateExisting,
                onProgress: (current, total, name) => {
                    const percent = ((currentStep - 1) / totalSteps + (current / total) / totalSteps) * 100;
                    progressFill.css('width', `${percent}%`);
                    progressText.text(`Importing ${name}... (${currentStep}/${totalSteps})`);
                }
            });
            results.npcs = { imported: result.imported, failed: result.failed };
        }

        // Import Items
        if (selectedTypes.includes('items')) {
            currentStep++;
            progressText.text(`Importing Items... (${currentStep}/${totalSteps})`);
            const result = await itemImporter.importByCategory({
                updateExisting,
                onProgress: (current, total, name) => {
                    const percent = ((currentStep - 1) / totalSteps + (current / total) / totalSteps) * 100;
                    progressFill.css('width', `${percent}%`);
                    progressText.text(`Importing ${name}... (${currentStep}/${totalSteps})`);
                }
            });
            results.items = { imported: result.imported, failed: result.failed };
        }

        // Import Spells
        if (selectedTypes.includes('spells')) {
            currentStep++;
            progressText.text(`Importing Spells... (${currentStep}/${totalSteps})`);
            const result = await spellImporter.importAll({
                updateExisting,
                onProgress: (current, total, name) => {
                    const percent = ((currentStep - 1) / totalSteps + (current / total) / totalSteps) * 100;
                    progressFill.css('width', `${percent}%`);
                    progressText.text(`Importing ${name}... (${currentStep}/${totalSteps})`);
                }
            });
            results.spells = { imported: result.imported, failed: result.failed };
        }

        // Import Hazards
        if (selectedTypes.includes('hazards')) {
            currentStep++;
            progressText.text(`Importing Hazards... (${currentStep}/${totalSteps})`);
            const result = await hazardImporter.importByCategory({
                updateExisting,
                onProgress: (current, total, name) => {
                    const percent = ((currentStep - 1) / totalSteps + (current / total) / totalSteps) * 100;
                    progressFill.css('width', `${percent}%`);
                    progressText.text(`Importing ${name}... (${currentStep}/${totalSteps})`);
                }
            });
            results.hazards = { imported: result.imported, failed: result.failed };
        }

        // Import Journals
        if (selectedTypes.includes('journals')) {
            currentStep++;
            progressText.text(`Importing Journals... (${currentStep}/${totalSteps})`);
            const result = await journalImporter.importAll({
                updateExisting,
                onProgress: (current, total, name) => {
                    const percent = ((currentStep - 1) / totalSteps + (current / total) / totalSteps) * 100;
                    progressFill.css('width', `${percent}%`);
                    progressText.text(`Importing ${name}... (${currentStep}/${totalSteps})`);
                }
            });
            results.journals = { imported: result.imported, failed: result.failed };
        }

        // Import Scenes
        if (selectedTypes.includes('scenes')) {
            currentStep++;
            progressText.text(`Importing Scenes... (${currentStep}/${totalSteps})`);
            const result = await sceneImporter.importAll({
                updateExisting,
                onProgress: (current, total, name) => {
                    const percent = ((currentStep - 1) / totalSteps + (current / total) / totalSteps) * 100;
                    progressFill.css('width', `${percent}%`);
                    progressText.text(`Importing ${name}... (${currentStep}/${totalSteps})`);
                }
            });
            results.scenes = { imported: result.imported, failed: result.failed };
        }

        // Complete
        progressFill.css('width', '100%');
        progressText.text('Import complete!');

        // Show results
        showMultiImportResults(results);
        options.onComplete?.(results);

    } catch (error) {
        logError('Import failed:', error);
        ui.notifications?.error('Import failed. Check console for details.');
    }
}

/**
 * Show import results notification
 */
function showMultiImportResults(results: any): void {
    const totalImported = Object.values(results).reduce((sum: number, r: any) => sum + r.imported, 0);
    const totalFailed = Object.values(results).reduce((sum: number, r: any) => sum + r.failed, 0);

    if (totalFailed === 0 && totalImported > 0) {
        ui.notifications?.info(
            `Successfully imported ${totalImported} items into your world!`
        );
    } else if (totalImported > 0) {
        ui.notifications?.warn(
            `Imported ${totalImported} items with ${totalFailed} failures. Check console for details.`
        );
    } else {
        ui.notifications?.error('Import failed. Check console for details.');
    }

    // Log summary
    console.group('Harbinger House Import Summary');
    console.log(`NPCs: ${results.npcs.imported} imported, ${results.npcs.failed} failed`);
    console.log(`Items: ${results.items.imported} imported, ${results.items.failed} failed`);
    console.log(`Spells: ${results.spells.imported} imported, ${results.spells.failed} failed`);
    console.log(`Hazards: ${results.hazards.imported} imported, ${results.hazards.failed} failed`);
    console.log(`Journals: ${results.journals.imported} imported, ${results.journals.failed} failed`);
    console.log(`Scenes: ${results.scenes.imported} imported, ${results.scenes.failed} failed`);
    console.log(`Total: ${totalImported} imported, ${totalFailed} failed`);
    console.groupEnd();
}

/**
 * Show a simple welcome dialog for returning users
 */
export async function showWelcomeDialog(): Promise<void> {
    const content = `
        <div class="harbinger-welcome-dialog">
            <p>${localize('welcome.message')}</p>
            <p>${localize('welcome.instructions')}</p>
        </div>
    `;

    new Dialog({
        title: localize('welcome.title'),
        content: content,
        buttons: {
            import: {
                icon: '<i class="fas fa-download"></i>',
                label: localize('welcome.importNow'),
                callback: () => showImportDialog()
            },
            close: {
                icon: '<i class="fas fa-check"></i>',
                label: localize('welcome.gotIt')
            }
        },
        default: 'close'
    }, {
        width: 400
    }).render(true);
}

/**
 * Show a confirmation dialog for deleting imported content
 */
export async function showDeleteConfirmDialog(): Promise<boolean> {
    return new Promise((resolve) => {
        new Dialog({
            title: localize('delete.title'),
            content: `<p>${localize('delete.confirm')}</p>`,
            buttons: {
                delete: {
                    icon: '<i class="fas fa-trash"></i>',
                    label: localize('delete.deleteButton'),
                    callback: () => resolve(true)
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: localize('delete.cancelButton'),
                    callback: () => resolve(false)
                }
            },
            default: 'cancel'
        }).render(true);
    });
}

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
import { npcImporter, type ImportResult } from '../importers';
import { NPCS_BY_CATEGORY, getCategoryLabel, type NPCCategory } from '../data';

interface ImportDialogOptions {
    /** Called after successful import */
    onComplete?: (result: ImportResult) => void;
    /** Called if user cancels */
    onCancel?: () => void;
}

/**
 * Show the main import dialog
 */
export async function showImportDialog(options: ImportDialogOptions = {}): Promise<void> {
    const summary = npcImporter.getSummary();
    const totalNPCs = npcImporter.getTotalCount();

    const content = `
        <div class="harbinger-import-dialog">
            <div class="import-header">
                <h2>${localize('import.title')}</h2>
                <p class="import-description">${localize('import.description')}</p>
            </div>

            <div class="import-summary">
                <h3>${localize('import.npcsAvailable')}</h3>
                <p class="total-count">${localize('import.totalNpcs', { count: totalNPCs })}</p>
                
                <div class="category-list">
                    ${Object.entries(summary).map(([category, data]) => `
                        <label class="category-item">
                            <input type="checkbox" 
                                   name="category" 
                                   value="${category}" 
                                   checked>
                            <span class="category-name">${getCategoryLabel(category as NPCCategory)}</span>
                            <span class="category-count">(${data.count})</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="import-options">
                <h3>${localize('import.options')}</h3>
                <label class="option-item">
                    <input type="checkbox" name="organizeByCategory" checked>
                    <span>${localize('import.organizeByCategory')}</span>
                </label>
                <label class="option-item">
                    <input type="checkbox" name="updateExisting">
                    <span>${localize('import.updateExisting')}</span>
                </label>
            </div>

            <div class="import-progress" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <p class="progress-text">${localize('import.preparing')}</p>
            </div>
        </div>
    `;

    const dialog = new Dialog({
        title: localize('import.dialogTitle'),
        content: content,
        buttons: {
            import: {
                icon: '<i class="fas fa-download"></i>',
                label: localize('import.importButton'),
                callback: async (html: JQuery) => {
                    await handleImport(html, options);
                }
            },
            later: {
                icon: '<i class="fas fa-clock"></i>',
                label: localize('import.laterButton'),
                callback: () => {
                    log('Import postponed by user');
                    options.onCancel?.();
                }
            },
            never: {
                icon: '<i class="fas fa-times"></i>',
                label: localize('import.neverButton'),
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
        width: 500,
        height: 'auto',
        classes: ['harbinger-import-dialog-window']
    });

    dialog.render(true);
}

/**
 * Handle the import process
 */
async function handleImport(html: JQuery, options: ImportDialogOptions): Promise<void> {
    // Get selected categories
    const selectedCategories: NPCCategory[] = [];
    html.find('input[name="category"]:checked').each((_, el) => {
        selectedCategories.push((el as HTMLInputElement).value as NPCCategory);
    });

    if (selectedCategories.length === 0) {
        ui.notifications?.warn(localize('import.noCategoriesSelected'));
        return;
    }

    // Get options
    const organizeByCategory = html.find('input[name="organizeByCategory"]').is(':checked');
    const updateExisting = html.find('input[name="updateExisting"]').is(':checked');

    // Show progress
    const progressContainer = html.find('.import-progress');
    const progressFill = html.find('.progress-fill');
    const progressText = html.find('.progress-text');
    
    progressContainer.show();

    // Disable buttons during import
    html.closest('.dialog').find('button').prop('disabled', true);

    try {
        const result = organizeByCategory 
            ? await npcImporter.importByCategory({
                categories: selectedCategories,
                updateExisting,
                onProgress: (current, total, name) => {
                    const percent = (current / total) * 100;
                    progressFill.css('width', `${percent}%`);
                    progressText.text(localize('import.importing', { name, current, total }));
                }
            })
            : await npcImporter.importAll({
                categories: selectedCategories,
                updateExisting,
                folderName: 'Harbinger House NPCs',
                onProgress: (current, total, name) => {
                    const percent = (current / total) * 100;
                    progressFill.css('width', `${percent}%`);
                    progressText.text(localize('import.importing', { name, current, total }));
                }
            });

        // Show results
        showImportResults(result);
        options.onComplete?.(result);

    } catch (error) {
        logError('Import failed:', error);
        ui.notifications?.error(localize('import.failed'));
    }
}

/**
 * Show import results notification
 */
function showImportResults(result: ImportResult): void {
    if (result.success && result.failed === 0) {
        ui.notifications?.info(
            localize('import.success', { count: result.imported })
        );
    } else if (result.imported > 0) {
        ui.notifications?.warn(
            localize('import.partial', { 
                imported: result.imported, 
                failed: result.failed 
            })
        );
    } else {
        ui.notifications?.error(localize('import.allFailed'));
    }

    // Log detailed errors
    if (result.errors.length > 0) {
        console.group('Harbinger House Import Errors');
        result.errors.forEach(err => console.error(err));
        console.groupEnd();
    }
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

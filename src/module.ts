/**
 * Harbinger House PF2e Module
 * Main entry point
 * 
 * This module provides converted PF2e content for the Harbinger House adventure.
 * It hooks into Foundry's lifecycle to:
 * 1. Register module settings
 * 2. Show import dialog when first loaded
 * 3. Provide API for programmatic access
 */

import { MODULE_ID, registerSettings, log, logError, localize } from './config';
import { showImportDialog, showWelcomeDialog, showDeleteConfirmDialog } from './ui';
import { npcImporter, type ImportResult } from './importers';
import { ALL_NPCS, NPCS_BY_CATEGORY, getNPCById, getCategoryLabel, type NPCCategory } from './data';
import type { HarbingerHouseFlags } from './types/module-flags';

/**
 * Module API
 * Exposed on the module for external access
 */
interface HarbingerHouseAPI {
    /** Import NPCs with options */
    importNPCs: typeof npcImporter.importAll;
    /** Import NPCs organized by category */
    importNPCsByCategory: typeof npcImporter.importByCategory;
    /** Show the import dialog */
    showImportDialog: typeof showImportDialog;
    /** Delete all imported content */
    deleteImported: () => Promise<number>;
    /** Get all available NPCs */
    getAllNPCs: () => typeof ALL_NPCS;
    /** Get NPCs by category */
    getNPCsByCategory: () => typeof NPCS_BY_CATEGORY;
    /** Get a specific NPC by ID */
    getNPCById: typeof getNPCById;
    /** Get the NPC importer instance */
    npcImporter: typeof npcImporter;
}

// Store the API on the module
declare global {
    interface Game {
        harbingerHouse?: HarbingerHouseAPI;
    }
}

/**
 * Initialize the module
 * Called on the 'init' hook - before game data is loaded
 */
Hooks.once('init', async () => {
    log('Initializing Harbinger House module');

    // Register module settings
    registerSettings();

    // Register API on game object for external access
    game.harbingerHouse = {
        importNPCs: npcImporter.importAll.bind(npcImporter),
        importNPCsByCategory: npcImporter.importByCategory.bind(npcImporter),
        showImportDialog,
        deleteImported: async () => {
            const count = await npcImporter.deleteAllImported();
            log(`Deleted ${count} imported NPCs`);
            return count;
        },
        getAllNPCs: () => ALL_NPCS,
        getNPCsByCategory: () => NPCS_BY_CATEGORY,
        getNPCById,
        npcImporter
    };

    log('Harbinger House API registered on game.harbingerHouse');
});

/**
 * Setup hook
 * Called after init, when localization is available
 */
Hooks.once('setup', async () => {
    log('Setting up Harbinger House module');
});

/**
 * Ready hook  
 * Called when the game is fully loaded and ready
 * This is where we show the import dialog
 */
Hooks.once('ready', async () => {
    log('Harbinger House module ready');

    // Only show dialog if:
    // 1. User is a GM
    // 2. Setting allows it
    // 3. No NPCs have been imported yet
    if (!game.user?.isGM) {
        log('Not GM, skipping import dialog');
        return;
    }

    const showDialog = game.settings.get(MODULE_ID, 'showImportDialog') as boolean;
    if (!showDialog) {
        log('Import dialog disabled by user setting');
        return;
    }

    // Check if we've already imported NPCs
    const existingImports = game.actors?.filter(
        (a: any) => a.getFlag(MODULE_ID, 'imported') === true
    );

    if (existingImports && existingImports.length > 0) {
        log(`Found ${existingImports.length} previously imported NPCs`);
        // Show a simpler welcome dialog instead
        // showWelcomeDialog();
        return;
    }

    // Show the main import dialog
    showImportDialog({
        onComplete: (result) => {
            log('Import completed', result);
        },
        onCancel: () => {
            log('Import cancelled by user');
        }
    });
});

/**
 * Add context menu options for actors sidebar
 */
Hooks.on('getActorDirectoryEntryContext', (...args: unknown[]) => {
    const [html, options] = args as [JQuery, any[]];
    
    // Add option to re-import/update an NPC
    options.push({
        name: localize('contextMenu.updateFromModule'),
        icon: '<i class="fas fa-sync"></i>',
        condition: (li: JQuery) => {
            const actorId = li.data('documentId');
            const actor = game.actors?.get(actorId);
            return actor?.getFlag(MODULE_ID, 'imported') === true;
        },
        callback: async (li: JQuery) => {
            const actorId = li.data('documentId');
            const actor = game.actors?.get(actorId);
            const sourceId = actor?.getFlag(MODULE_ID, 'sourceId') as string | undefined;

            if (sourceId) {
                const npc = getNPCById(sourceId);
                if (npc) {
                    const result = await npcImporter.importItems([npc], {
                        updateExisting: true
                    });
                    if (result.success) {
                        ui.notifications?.info(localize('import.updated', { name: npc.data.name }));
                    }
                }
            }
        }
    });
});

/**
 * Add module controls to the sidebar
 */
Hooks.on('renderSidebarTab', (...args: unknown[]) => {
    const [app, html] = args as [any, JQuery];
    
    // Only add to actors tab
    if (app.tabName !== 'actors') return;
    if (!game.user?.isGM) return;

    // Check if button already exists
    if (html.find('.harbinger-import-btn').length > 0) return;

    // Add import button to the header
    const headerActions = html.find('.directory-header .header-actions');
    const importButton = $(`
        <button class="harbinger-import-btn" title="${localize('sidebar.importTooltip')}">
            <i class="fas fa-dungeon"></i>
            ${localize('sidebar.importButton')}
        </button>
    `);

    importButton.on('click', () => {
        showImportDialog();
    });

    headerActions.append(importButton);
});

/**
 * Log module version on startup
 */
Hooks.once('ready', () => {
    const module = game.modules.get(MODULE_ID);
    if (module) {
        console.log(
            `%c Harbinger House PF2e v${module.version} ` +
            `%c Loaded successfully!`,
            'background: #6e0000; color: #fff; padding: 2px 4px; border-radius: 2px;',
            'color: #6e0000;'
        );
    }
});

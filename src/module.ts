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

import { MODULE_ID, registerSettings, log, logError, localize, SETTINGS } from './config';
import { showImportDialog, showWelcomeDialog, showDeleteConfirmDialog } from './ui';
import { 
  npcImporter, 
  itemImporter, 
  spellImporter, 
  hazardImporter,
  importAllContent,
  deleteAllImportedContent,
  type ImportResult 
} from './importers';
import { 
  // NPC data
  ALL_NPCS, 
  NPCS_BY_CATEGORY, 
  getNPCById, 
  getCategoryLabel, 
  type NPCCategory,
  // Item data
  ALL_ITEMS,
  ITEMS_BY_CATEGORY,
  getItemById,
  getItemCategoryLabel,
  type ItemCategory,
  // Spell data
  ALL_SPELLS,
  getSpellById,
  // Hazard data
  ALL_HAZARDS,
  HAZARDS_BY_CATEGORY,
  getHazardById,
  getHazardCategoryLabel,
  type HazardCategory,
  // Summary
  getContentSummary
} from './data';

/**
 * Module API
 * Exposed on the module for external access
 * 
 * This comprehensive API allows other modules or macros to:
 * - Import specific content types
 * - Query available content
 * - Delete imported content
 * - Access raw data for custom use
 */
interface HarbingerHouseAPI {
  // Import functions
  importNPCs: typeof npcImporter.importAll;
  importNPCsByCategory: typeof npcImporter.importByCategory;
  importItems: typeof itemImporter.importAll;
  importItemsByCategory: typeof itemImporter.importByCategory;
  importSpells: typeof spellImporter.importAll;
  importHazards: typeof hazardImporter.importAll;
  importHazardsByCategory: typeof hazardImporter.importByCategory;
  importAll: typeof importAllContent;
  
  // UI functions
  showImportDialog: typeof showImportDialog;
  
  // Delete functions
  deleteAllNPCs: () => Promise<number>;
  deleteAllItems: () => Promise<number>;
  deleteAllSpells: () => Promise<number>;
  deleteAllHazards: () => Promise<number>;
  deleteAll: typeof deleteAllImportedContent;
  
  // Data access
  getAllNPCs: () => typeof ALL_NPCS;
  getNPCsByCategory: () => typeof NPCS_BY_CATEGORY;
  getNPCById: typeof getNPCById;
  getAllItems: () => typeof ALL_ITEMS;
  getItemsByCategory: () => typeof ITEMS_BY_CATEGORY;
  getItemById: typeof getItemById;
  getAllSpells: () => typeof ALL_SPELLS;
  getSpellById: typeof getSpellById;
  getAllHazards: () => typeof ALL_HAZARDS;
  getHazardsByCategory: () => typeof HAZARDS_BY_CATEGORY;
  getHazardById: typeof getHazardById;
  
  // Summary
  getContentSummary: typeof getContentSummary;
  
  // Importer instances (for advanced use)
  npcImporter: typeof npcImporter;
  itemImporter: typeof itemImporter;
  spellImporter: typeof spellImporter;
  hazardImporter: typeof hazardImporter;
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
    // Import functions
    importNPCs: npcImporter.importAll.bind(npcImporter),
    importNPCsByCategory: npcImporter.importByCategory.bind(npcImporter),
    importItems: itemImporter.importAll.bind(itemImporter),
    importItemsByCategory: itemImporter.importByCategory.bind(itemImporter),
    importSpells: spellImporter.importAll.bind(spellImporter),
    importHazards: hazardImporter.importAll.bind(hazardImporter),
    importHazardsByCategory: hazardImporter.importByCategory.bind(hazardImporter),
    importAll: importAllContent,
    
    // UI functions
    showImportDialog,
    
    // Delete functions
    deleteAllNPCs: async () => {
      const count = await npcImporter.deleteAllImported();
      log(`Deleted ${count} imported NPCs`);
      return count;
    },
    deleteAllItems: async () => {
      const count = await itemImporter.deleteAllImported();
      log(`Deleted ${count} imported items`);
      return count;
    },
    deleteAllSpells: async () => {
      const count = await spellImporter.deleteAllImported();
      log(`Deleted ${count} imported spells`);
      return count;
    },
    deleteAllHazards: async () => {
      const count = await hazardImporter.deleteAllImported();
      log(`Deleted ${count} imported hazards`);
      return count;
    },
    deleteAll: deleteAllImportedContent,
    
    // Data access
    getAllNPCs: () => ALL_NPCS,
    getNPCsByCategory: () => NPCS_BY_CATEGORY,
    getNPCById,
    getAllItems: () => ALL_ITEMS,
    getItemsByCategory: () => ITEMS_BY_CATEGORY,
    getItemById,
    getAllSpells: () => ALL_SPELLS,
    getSpellById,
    getAllHazards: () => ALL_HAZARDS,
    getHazardsByCategory: () => HAZARDS_BY_CATEGORY,
    getHazardById,
    
    // Summary
    getContentSummary,
    
    // Importer instances
    npcImporter,
    itemImporter,
    spellImporter,
    hazardImporter
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

  // Log content summary
  const summary = getContentSummary();
  log(`Available content: ${summary.npcs} NPCs, ${summary.items} items, ${summary.spells} spells, ${summary.hazards} hazards`);

  // Only show dialog if:
  // 1. User is a GM
  // 2. Setting allows it
  // 3. PF2e system is active
  if (!game.user?.isGM) {
    log('Not a GM, skipping import dialog');
    return;
  }

  if (game.system.id !== 'pf2e') {
    logError('This module requires the Pathfinder 2e system');
    ui.notifications?.error(localize('errors.wrongSystem'));
    return;
  }

  const showDialog = game.settings.get(MODULE_ID, SETTINGS.SHOW_IMPORT_DIALOG);
  if (showDialog) {
    // Small delay to ensure UI is ready
    setTimeout(() => {
      showWelcomeDialog();
    }, 500);
  }
});

/**
 * Export for direct access if needed
 */
export {
  MODULE_ID,
  npcImporter,
  itemImporter,
  spellImporter,
  hazardImporter,
  importAllContent,
  deleteAllImportedContent
};

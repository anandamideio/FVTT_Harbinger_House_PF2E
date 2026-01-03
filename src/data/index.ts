/**
 * Data Index
 * Exports all data from the module for easy importing
 */

// ============================================================================
// NPC Data
// ============================================================================

// Re-export types
export type { HarbingerNPC, NPCCategory } from './npcs';

// Import all NPC groups (assuming these files exist in your project)
// If they don't exist, you'll need to create them or import from a single file
import { HARBINGER_RESIDENTS } from './harbinger-residents';
import { FIENDS, GENERIC_NPCS } from './generic-npcs';
import { ALL_ITEMS } from './items';
import { ALL_SPELLS } from './spells';
import { ALL_HAZARDS } from './hazards';

// Re-export individual NPCs for direct access
export * from './harbinger-residents';
export * from './generic-npcs';

// Combined NPC exports
export { HARBINGER_RESIDENTS, FIENDS, GENERIC_NPCS };

// All NPCs combined
export const ALL_NPCS = [
  ...HARBINGER_RESIDENTS,
  ...FIENDS,
  ...GENERIC_NPCS,
];

// NPCs grouped by category for UI display
export const NPCS_BY_CATEGORY = {
  'harbinger-resident': HARBINGER_RESIDENTS,
  'fiend': FIENDS,
  'generic-npc': GENERIC_NPCS,
  'cultist': GENERIC_NPCS.filter(npc => npc.category === 'cultist'),
};

// Get human-readable NPC category names
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'harbinger-resident': 'Harbinger House Residents',
    'fiend': 'Fiends & Monsters',
    'generic-npc': 'Generic NPCs',
    'cultist': 'Cultists & Common NPCs',
  };
  return labels[category] || category;
}

// Quick NPC lookup by ID
export function getNPCById(id: string) {
  return ALL_NPCS.find(npc => npc.id === id);
}

// ============================================================================
// Item Data
// ============================================================================

export type { HarbingerItem, ItemCategory } from './items';

export {
  ALL_ITEMS,
  ITEMS_BY_CATEGORY,
  ARTIFACT_ITEMS,
  WEAPON_ITEMS,
  ARMOR_ITEMS,
  EQUIPMENT_ITEMS,
  CONSUMABLE_ITEMS,
  getItemCategoryLabel,
  getItemById
} from './items';

// ============================================================================
// Spell Data
// ============================================================================

export type { HarbingerSpell } from './spells';

export {
  ALL_SPELLS,
  getSpellById,
  getSpellNames
} from './spells';

// ============================================================================
// Hazard Data
// ============================================================================

export type { HarbingerHazard, HazardCategory, HazardData } from './hazards';

export {
  ALL_HAZARDS,
  HAZARDS_BY_CATEGORY,
  TRAP_HAZARDS,
  ENVIRONMENTAL_HAZARDS,
  AURA_HAZARDS,
  getHazardCategoryLabel,
  getHazardById,
  getHazardsByLocation
} from './hazards';

// ============================================================================
// Summary Statistics
// ============================================================================

export function getContentSummary() {
  return {
    npcs: ALL_NPCS.length,
    items: ALL_ITEMS.length,
    spells: ALL_SPELLS.length,
    hazards: ALL_HAZARDS.length,
    total: ALL_NPCS.length + ALL_ITEMS.length + ALL_SPELLS.length + ALL_HAZARDS.length
  };
}

// ============================================================================
// Re-export utility functions and types from utils.ts
// ============================================================================

export {
  isSystemItemReference,
  isSystemWeaponReference,
  isSystemSpellReference,
  isSystemActionReference,
  generateRuneWeaponName,
} from './utils';

export type { NPCItemEntry } from './harbinger-residents';

// ============================================================================
// Re-export system item types and constants from system-items.ts
// ============================================================================

export {
  PROPERTY_RUNES,
} from './system-items';

export type {
  SystemWeaponReference,
  SystemSpellReference,
  SystemActionReference,
  WeaponRuneConfig,
} from './system-items';

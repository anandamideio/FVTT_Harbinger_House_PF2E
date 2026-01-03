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
import { MAJOR_NPCS } from './npcs';
import { HARBINGER_RESIDENTS } from './harbinger-residents';
import { FIENDS, GENERIC_NPCS } from './generic-npcs';

// Re-export individual NPCs for direct access
export * from './npcs';
export * from './harbinger-residents';
export * from './generic-npcs';

// Combined NPC exports
export { MAJOR_NPCS, HARBINGER_RESIDENTS, FIENDS, GENERIC_NPCS };

// All NPCs combined
export const ALL_NPCS = [
  ...MAJOR_NPCS,
  ...HARBINGER_RESIDENTS,
  ...FIENDS,
  ...GENERIC_NPCS,
];

// NPCs grouped by category for UI display
export const NPCS_BY_CATEGORY = {
  'major-npc': MAJOR_NPCS,
  'harbinger-resident': HARBINGER_RESIDENTS,
  'fiend': FIENDS,
  'generic-npc': GENERIC_NPCS,
  'cultist': GENERIC_NPCS.filter(npc => npc.category === 'cultist'),
};

// Get human-readable NPC category names
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'major-npc': 'Major NPCs',
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

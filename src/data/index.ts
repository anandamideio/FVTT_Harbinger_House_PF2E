/**
 * NPC Data Index
 * Exports all NPCs from the module for easy importing
 */

// Re-export types
export type { HarbingerNPC, NPCCategory } from './harbinger-residents';

// Import all NPC groups
import { HARBINGER_RESIDENTS } from './harbinger-residents';
import { FIENDS, GENERIC_NPCS } from './generic-npcs';

// Combined exports
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

// Get human-readable category names
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

// Quick lookup by ID
export function getNPCById(id: string) {
  return ALL_NPCS.find(npc => npc.id === id);
}

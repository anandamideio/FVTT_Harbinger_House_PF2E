// Re-export types
export type { HarbingerNPC, NPCCategory, NPCEntry } from '../../schema/harbinger-npc';
export { isSystemActorReference } from '../../schema/harbinger-npc';

import { FIENDS, FIGMENTS, GENERIC_NPCS, LOOT_NPCS } from './generic-npcs';
import { HARBINGER_RESIDENTS } from './harbinger-residents';
import type { NPCEntry } from '../../schema/harbinger-npc';

export * from './generic-npcs';
export * from './harbinger-residents';

// All NPCs combined
export const ALL_NPCS: NPCEntry[] = [
	...HARBINGER_RESIDENTS,
	...FIENDS,
	...GENERIC_NPCS,
	...FIGMENTS,
	...LOOT_NPCS,
];

// NPCs grouped by category for UI display
export const NPCS_BY_CATEGORY = {
	'major-npc': HARBINGER_RESIDENTS.filter((npc) => npc.category === 'major-npc'),
	'harbinger-resident': HARBINGER_RESIDENTS.filter((npc) => npc.category === 'harbinger-resident'),
	fiend: FIENDS,
	'generic-npc': GENERIC_NPCS.filter((npc) => npc.category === 'generic-npc'),
	cultist: GENERIC_NPCS.filter((npc) => npc.category === 'cultist'),
	figment: FIGMENTS,
	loot: LOOT_NPCS,
};

// Get human-readable NPC category names
export function getCategoryLabel(category: string): string {
	const labels: Record<string, string> = {
		'major-npc': 'Harbinger House Residents',
		'harbinger-resident': 'Harbinger House Residents',
		fiend: 'Fiends & Monsters',
		'generic-npc': 'Generic NPCs',
		cultist: 'Cultist & Common NPCs',
		figment: "Tomin's Figments",
		loot: 'Loot Caches',
	};
	return labels[category] || category;
}

// Quick NPC lookup by ID
export function getNPCById(id: string) {
	return ALL_NPCS.find((npc) => npc.id === id);
}

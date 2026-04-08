// ============================================================================
// NPC Data
// ============================================================================

// Re-export types
export type { HarbingerNPC, NPCCategory, NPCEntry } from './harbinger-residents';
export { isSystemActorReference } from './harbinger-residents';

import { FIENDS, GENERIC_NPCS } from './generic-npcs';
import type { NPCEntry } from './harbinger-residents';
// Import all NPC groups (assuming these files exist in your project)
// If they don't exist, you'll need to create them or import from a single file
import { HARBINGER_RESIDENTS } from './harbinger-residents';
import { ALL_HAZARDS } from './hazards';
import { ALL_ITEMS } from './items';
import { ALL_JOURNALS } from './journals';
import { ALL_MACROS } from './macros';
import { ALL_SCENES } from './scenes';
import { ALL_SPELLS } from './spells';

export * from './generic-npcs';
// Re-export individual NPCs for direct access
export * from './harbinger-residents';

// Re-export scenes
export * from './scenes';
// Combined NPC exports
export { ALL_SCENES, FIENDS, GENERIC_NPCS, HARBINGER_RESIDENTS };

// All NPCs combined
export const ALL_NPCS: NPCEntry[] = [...HARBINGER_RESIDENTS, ...FIENDS, ...GENERIC_NPCS];

// NPCs grouped by category for UI display
export const NPCS_BY_CATEGORY = {
	'major-npc': HARBINGER_RESIDENTS,
	fiend: FIENDS,
	'generic-npc': GENERIC_NPCS.filter((npc) => npc.category === 'generic-npc'),
	cultist: GENERIC_NPCS.filter((npc) => npc.category === 'cultist'),
};

// Get human-readable NPC category names
export function getCategoryLabel(category: string): string {
	const labels: Record<string, string> = {
		'major-npc': 'Harbinger House Residents',
		'harbinger-resident': 'Harbinger House Residents',
		fiend: 'Fiends & Monsters',
		'generic-npc': 'Generic NPCs',
		cultist: 'Cultist & Common NPCs',
	};
	return labels[category] || category;
}

// Quick NPC lookup by ID
export function getNPCById(id: string) {
	return ALL_NPCS.find((npc) => npc.id === id);
}

// ============================================================================
// Item Data
// ============================================================================

export type { HarbingerItem, ItemCategory } from './items';

export {
	ALL_ITEMS,
	ARMOR_ITEMS,
	ARTIFACT_ITEMS,
	CONSUMABLE_ITEMS,
	EQUIPMENT_ITEMS,
	getItemById,
	getItemCategoryLabel,
	ITEMS_BY_CATEGORY,
	WEAPON_ITEMS,
} from './items';

// ============================================================================
// Spell Data
// ============================================================================

export type { HarbingerSpell } from './spells';

export {
	ALL_SPELLS,
	getSpellById,
	getSpellNames,
} from './spells';

// ============================================================================
// Hazard Data
// ============================================================================

export type { HarbingerHazard, HazardCategory, HazardData } from './hazards';

export {
	ALL_HAZARDS,
	AURA_HAZARDS,
	ENVIRONMENTAL_HAZARDS,
	getHazardById,
	getHazardCategoryLabel,
	getHazardsByLocation,
	HAZARDS_BY_CATEGORY,
	TRAP_HAZARDS,
} from './hazards';

// ============================================================================
// Journal Data
// ============================================================================

export type { HarbingerJournal, JournalFolder, JournalPage } from './journals';

export {
	ALL_JOURNALS,
	getFolderLabel,
	JOURNALS_BY_FOLDER,
} from './journals';

// ============================================================================
// Macro Data
// ============================================================================

export type { HarbingerMacro } from './macros';

export {
	ALL_MACROS,
	getMacroById,
} from './macros';

// ============================================================================
// Summary Statistics
// ============================================================================

export function getContentSummary() {
	return {
		npcs: ALL_NPCS.length,
		items: ALL_ITEMS.length,
		spells: ALL_SPELLS.length,
		hazards: ALL_HAZARDS.length,
		journals: ALL_JOURNALS.length,
		scenes: ALL_SCENES.length,
		macros: ALL_MACROS.length,
		total:
			ALL_NPCS.length +
			ALL_ITEMS.length +
			ALL_SPELLS.length +
			ALL_HAZARDS.length +
			ALL_JOURNALS.length +
			ALL_SCENES.length +
			ALL_MACROS.length,
	};
}

// ============================================================================
// Re-export utility functions and types from utils.ts
// ============================================================================

export type { NPCItemEntry } from './harbinger-residents';
export {
	createSpellcastingEntry,
	createSpellcastingEntryWithSpells,
	generateRuneWeaponName,
	isSystemActionReference,
	isSystemItemReference,
	isSystemSpellReference,
	isSystemWeaponReference,
} from './utils';

// ============================================================================
// Re-export system item types and constants from system-items.ts
// ============================================================================

export type {
	SystemActionReference,
	SystemEquipmentReference,
	SystemSpellReference,
	SystemWeaponReference,
	WeaponRuneConfig,
} from './system-items';
export { PROPERTY_RUNES } from './system-items';

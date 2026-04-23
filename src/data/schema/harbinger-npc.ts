import type { ActorData, ItemData } from '../../types/foundry.d.ts';
import type {
	SystemActionReference,
	SystemActorReference,
	SystemEquipmentReference,
	SystemSpellReference,
	SystemWeaponReference,
} from './system-items';

// NPC Categories for organization
export type NPCCategory =
	| 'major-npc'
	| 'harbinger-resident'
	| 'generic-npc'
	| 'fiend'
	| 'cultist'
	| 'figment'
	| 'loot';

/** Union type for any item that can be on an NPC */
export type NPCItemEntry = ItemData | SystemWeaponReference | SystemSpellReference | SystemActionReference | SystemEquipmentReference;

export interface HarbingerNPC {
	id: string;
	category: NPCCategory;
	data: ActorData;
	/** Items can be inline ItemData or references to system compendium items */
	items: NPCItemEntry[];
}

/** Union type for any entry in the NPC arrays - either a custom stat block or a system compendium reference */
export type NPCEntry = HarbingerNPC | SystemActorReference;

/** Type guard to check if an NPCEntry is a system actor reference */
export function isSystemActorReference(entry: NPCEntry): entry is SystemActorReference {
	return 'type' in entry && (entry).type === 'system-actor';
}

// Re-export SystemActorReference for consumers
export type { SystemActorReference } from './system-items';

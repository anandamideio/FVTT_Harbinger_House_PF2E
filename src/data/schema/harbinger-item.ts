import type { ItemData } from '../../types/foundry';

// Item categories for organization
export type ItemCategory = 'artifact' | 'weapon' | 'armor' | 'equipment' | 'consumable';

export interface HarbingerItem {
	id: string;
	category: ItemCategory;
	data: ItemData;
}

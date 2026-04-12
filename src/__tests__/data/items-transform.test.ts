import { describe, expect, it } from 'vitest';
import { GORG_STATUE_CACHE } from '../../data/generic-npcs';
import { getItemById } from '../../data/items';
import { itemToDocumentData, npcToDocumentData } from '../../data/to-foundry-data';

function getPhysicalFields(system: unknown): { bulkValue: unknown; quantity: unknown } {
	const typed = (system ?? {}) as Record<string, unknown>;
	const bulk = (typed.bulk ?? {}) as Record<string, unknown>;
	return {
		bulkValue: bulk.value,
		quantity: typed.quantity,
	};
}

describe('physical item normalization', () => {
	it('normalizes legacy light bulk and adds quantity for module items', () => {
		const potion = getItemById('potion-of-healing-minor');
		expect(potion).toBeDefined();

		const doc = itemToDocumentData(potion!);
		const fields = getPhysicalFields(doc.system);

		expect(fields.bulkValue).toBe(0.1);
		expect(fields.quantity).toBe(1);
	});

	it('normalizes legacy dash bulk to zero for module items', () => {
		const focrux = getItemById('the-focrux');
		expect(focrux).toBeDefined();

		const doc = itemToDocumentData(focrux!);
		const fields = getPhysicalFields(doc.system);

		expect(fields.bulkValue).toBe(0);
		expect(fields.quantity).toBe(1);
	});

	it('normalizes inline loot actor items before document creation', () => {
		const actorDoc = npcToDocumentData(GORG_STATUE_CACHE);
		expect(actorDoc.type).toBe('loot');

		for (const item of actorDoc.items ?? []) {
			const fields = getPhysicalFields(item.system);
			expect(fields.bulkValue).toBe(0.1);
			expect(fields.quantity).toBe(1);
		}
	});
});

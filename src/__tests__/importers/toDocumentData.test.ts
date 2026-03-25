import type { HarbingerItem, HarbingerSpell } from 'src/data';
import { describe, expect, it } from 'vitest';
import { HazardImporter } from '../../importers/hazard-importer';
import { ItemImporter } from '../../importers/item-importer';
import { JournalImporter } from '../../importers/journal-importer';
import { NPCImporter } from '../../importers/npc-importer';
import { SpellImporter } from '../../importers/spell-importer';

/**
 * Type-widening helper for test assertions. Allows deep property access
 * on typed return values where we know the structure from the test setup.
 */
// biome-ignore lint/suspicious/noExplicitAny: test helper needs flexible deep access
function d(val: unknown): any {
	return val;
}

// ============================================================================
// ItemImporter.toDocumentData
// ============================================================================

describe('ItemImporter.toDocumentData', () => {
	const importer = new ItemImporter();

	it('converts a basic item', () => {
		const item = {
			id: 'test-item',
			category: 'equipment' as const,
			data: {
				name: 'Ring of Protection',
				type: 'equipment',
				img: 'icons/ring.webp',
				system: {
					description: { value: '<p>A protective ring</p>' },
					level: { value: 5 },
					traits: { value: ['magical', 'abjuration'], rarity: 'uncommon' as const },
				},
			},
		} as HarbingerItem;

		const result = importer.toDocumentData(item);

		expect(result.name).toBe('Ring of Protection');
		expect(result.type).toBe('equipment');
		expect(result.img).toBe('icons/ring.webp');
		expect(d(result.system).description.value).toBe('<p>A protective ring</p>');
		expect(d(result.system).level.value).toBe(5);
		expect(d(result.flags)['harbinger-house-pf2e'].sourceId).toBe('test-item');
		expect(d(result.flags)['harbinger-house-pf2e'].category).toBe('equipment');
		expect(d(result.flags)['harbinger-house-pf2e'].imported).toBe(true);
	});

	it('uses default image when none provided', () => {
		const item = {
			id: 'no-img',
			category: 'weapon' as const,
			data: {
				name: 'Test Weapon',
				type: 'weapon',
				system: {},
			},
		};

		const result = importer.toDocumentData(item);
		expect(result.img).toBe('icons/svg/sword.svg');
	});

	it('preserves existing flags from data', () => {
		const item = {
			id: 'flagged',
			category: 'equipment' as const,
			data: {
				name: 'Flagged Item',
				type: 'equipment',
				system: {},
				flags: { 'some-module': { key: 'value' } },
			},
		};

		const result = importer.toDocumentData(item);
		expect(d(result.flags)['some-module']).toEqual({ key: 'value' });
		expect(d(result.flags)['harbinger-house-pf2e'].imported).toBe(true);
	});
});

// ============================================================================
// SpellImporter.toDocumentData
// ============================================================================

describe('SpellImporter.toDocumentData', () => {
	const importer = new SpellImporter();

	it('converts a spell to document data', () => {
		const spell = {
			id: 'test-spell',
			data: {
				name: 'Word of Chaos',
				type: 'spell',
				img: 'icons/magic/chaos.webp',
				system: {
					description: { value: '<p>Chaos!</p>' },
					level: { value: 5 },
					traditions: { value: ['divine'] },
					traits: { value: ['manipulate', 'oracle'] },
				},
			},
		} as HarbingerSpell;

		const result = importer.toDocumentData(spell);

		expect(result.name).toBe('Word of Chaos');
		expect(result.type).toBe('spell');
		expect(result.img).toBe('icons/magic/chaos.webp');
		expect(d(result.system).level.value).toBe(5);
		expect(d(result.flags)['harbinger-house-pf2e'].sourceId).toBe('test-spell');
		expect(d(result.flags)['harbinger-house-pf2e'].imported).toBe(true);
	});

	it('uses trait-based default image for fire spells', () => {
		const spell = {
			id: 'fire-spell',
			data: {
				name: 'Fireball',
				type: 'spell',
				system: {
					traits: { value: ['fire'] },
				},
			},
		} as HarbingerSpell;

		const result = importer.toDocumentData(spell);
		expect(result.img).toContain('fire');
	});

	it('uses trait-based default image for mental spells', () => {
		const spell = {
			id: 'mental-spell',
			data: {
				name: 'Mind Blast',
				type: 'spell',
				system: {
					traits: { value: ['mental'] },
				},
			},
		} as HarbingerSpell;

		const result = importer.toDocumentData(spell);
		expect(result.img).toContain('perception');
	});

	it('uses generic default image when no traits match', () => {
		const spell = {
			id: 'generic-spell',
			data: {
				name: 'Generic',
				type: 'spell',
				system: {},
			},
		};

		const result = importer.toDocumentData(spell);
		expect(result.img).toBe('icons/svg/explosion.svg');
	});
});

// ============================================================================
// NPCImporter.toDocumentData
// ============================================================================

describe('NPCImporter.toDocumentData', () => {
	const importer = new NPCImporter();

	it('converts basic NPC data', () => {
		const npc = {
			id: 'test-npc',
			category: 'major-npc' as const,
			data: {
				name: 'Trolan the Mad',
				type: 'npc',
				img: 'tokens/trolan.webp',
				system: {
					abilities: { str: { mod: 1 } },
					attributes: {
						hp: { value: 100, max: 100, temp: 0, details: '' },
						ac: { value: 20, details: '' },
						speed: { value: 25, otherSpeeds: [] },
					},
					details: { level: { value: 10 } },
					traits: {
						value: ['unique', 'humanoid'],
						rarity: 'unique' as const,
						size: { value: 'med' },
					},
				},
			},
			items: [],
		};

		const result = importer.toDocumentData(npc);

		expect(result.name).toBe('Trolan the Mad');
		expect(result.type).toBe('npc');
		expect(result.img).toBe('tokens/trolan.webp');
		expect(d(result.system).details.level.value).toBe(10);
		expect(result.items).toEqual([]); // items resolved separately
	});

	it('uses default image when none provided', () => {
		const npc = {
			id: 'no-img-npc',
			category: 'fiend' as const,
			data: {
				name: 'Test Fiend',
				type: 'npc',
				system: {},
			},
			items: [],
		};

		const result = importer.toDocumentData(npc);
		expect(result.img).toBe('icons/svg/skull.svg');
	});

	it('generates prototype token data', () => {
		const npc = {
			id: 'token-npc',
			category: 'generic-npc' as const,
			data: {
				name: 'Guard',
				type: 'npc',
				system: {
					traits: { value: [] as string[], rarity: 'common' as const, size: { value: 'lg' } },
				},
			},
			items: [],
		};

		const result = importer.toDocumentData(npc);
		expect(result.prototypeToken).toBeDefined();
		expect(d(result.prototypeToken).name).toBe('Guard');
		expect(d(result.prototypeToken).width).toBe(2); // large = 2
		expect(d(result.prototypeToken).height).toBe(2);
	});
});

// ============================================================================
// JournalImporter.toDocumentData
// ============================================================================

describe('JournalImporter.toDocumentData', () => {
	const importer = new JournalImporter();

	it('converts journal with text pages', () => {
		const journal = {
			id: 'j1',
			name: 'Chapter 1',
			sort: 100,
			pages: [
				{
					name: 'Introduction',
					type: 'text' as const,
					text: {
						content: '<p>Hello</p>',
						format: 1,
						markdown: 'Hello',
					},
					title: { show: true, level: 1 },
				},
			],
		};

		const result = importer.toDocumentData(journal);

		expect(result.name).toBe('Chapter 1');
		expect(d(result.pages)).toHaveLength(1);
		expect(d(result.pages)[0].name).toBe('Introduction');
		expect(d(result.pages)[0].type).toBe('text');
		expect(d(result.pages)[0].text.content).toBe('<p>Hello</p>');
		expect(d(result.pages)[0].sort).toBe(100);
		expect(d(result.pages)[0].ownership.default).toBe(0);
		expect(d(result.ownership).default).toBe(0);
		expect(d(result.flags)['harbinger-house-pf2e'].imported).toBe(true);
	});

	it('converts journal with image pages', () => {
		const journal = {
			id: 'j2',
			name: 'Handouts',
			pages: [
				{
					name: 'Map',
					type: 'image' as const,
					src: 'assets/map.jpg',
					title: { show: true, level: 1 },
				},
			],
		};

		const result = importer.toDocumentData(journal);
		expect(d(result.pages)[0].type).toBe('image');
		expect(d(result.pages)[0].src).toBe('assets/map.jpg');
	});

	it('uses default sort of 0 when not specified', () => {
		const journal = {
			id: 'j3',
			name: 'Test',
			pages: [{ name: 'Page', type: 'text' as const }],
		};

		const result = importer.toDocumentData(journal);
		expect(result.sort).toBe(0);
	});

	it('assigns sequential sort to pages', () => {
		const journal = {
			id: 'j4',
			name: 'Multi',
			pages: [
				{ name: 'First', type: 'text' as const },
				{ name: 'Second', type: 'text' as const },
				{ name: 'Third', type: 'text' as const },
			],
		};

		const result = importer.toDocumentData(journal);
		expect(d(result.pages)[0].sort).toBe(100);
		expect(d(result.pages)[1].sort).toBe(200);
		expect(d(result.pages)[2].sort).toBe(300);
	});
});

// ============================================================================
// HazardImporter.toDocumentData
// ============================================================================

describe('HazardImporter.toDocumentData', () => {
	const importer = new HazardImporter();

	it('converts a hazard to actor data', () => {
		const hazard = {
			id: 'test-trap',
			category: 'trap' as const,
			location: 'Area 23',
			data: {
				name: 'Mind Trap',
				type: 'hazard' as const,
				img: 'icons/trap.webp',
				system: {
					description: { value: '<p>A mental trap</p>' },
					slug: 'mind-trap',
					traits: { value: ['magical', 'mental'] as string[], rarity: 'uncommon' as const },
					details: {
						level: { value: 8 },
						disable: 'DC 26 Occultism',
						reset: '1 hour',
						routine: '',
						isComplex: false,
					},
					attributes: {
						ac: { value: 25 },
						hp: { value: 50, max: 50 },
						hardness: 10,
						stealth: { value: 20, dc: 30, details: 'trained' },
					},
					saves: {
						fortitude: { value: 15 },
						reflex: { value: 12 },
						will: { value: 18 },
					},
				},
			},
		};

		const result = importer.toDocumentData(hazard);

		expect(result.name).toBe('Mind Trap');
		expect(result.type).toBe('hazard');
		expect(result.img).toBe('icons/trap.webp');
		expect(d(result.system).details.level.value).toBe(8);
		expect(d(result.system).details.disable).toBe('DC 26 Occultism');
		expect(d(result.system).details.isComplex).toBe(false);
		expect(d(result.system).attributes.ac.value).toBe(25);
		expect(d(result.system).attributes.hp.value).toBe(50);
		expect(d(result.system).attributes.hardness).toBe(10);
		expect(d(result.system).attributes.stealth.value).toBe(20);
		expect(d(result.system).saves.fortitude.value).toBe(15);
		expect(d(result.flags)['harbinger-house-pf2e'].sourceId).toBe('test-trap');
		expect(d(result.flags)['harbinger-house-pf2e'].category).toBe('trap');
		expect(d(result.flags)['harbinger-house-pf2e'].location).toBe('Area 23');
		expect(d(result.flags)['harbinger-house-pf2e'].imported).toBe(true);
	});

	it('uses default image for trap category', () => {
		const hazard = {
			id: 'no-img-trap',
			category: 'trap' as const,
			location: 'Area 1',
			data: {
				name: 'Simple Trap',
				type: 'hazard' as const,
				system: {
					description: { value: '' },
					slug: 'simple-trap',
					traits: { value: [] as string[] },
					details: { level: { value: 1 }, isComplex: false },
					attributes: {},
					saves: {},
				},
			},
		};

		const result = importer.toDocumentData(hazard);
		expect(result.img).toBe('icons/svg/trap.svg');
	});

	it('uses default image for haunt category', () => {
		const hazard = {
			id: 'haunt',
			category: 'haunt' as const,
			location: 'Area 5',
			data: {
				name: 'Wailing Spirit',
				type: 'hazard' as const,
				system: {
					description: { value: '' },
					slug: 'wailing-spirit',
					traits: { value: [] as string[] },
					details: { level: { value: 3 }, isComplex: false },
					attributes: {},
					saves: {},
				},
			},
		};

		const result = importer.toDocumentData(hazard);
		expect(result.img).toBe('icons/svg/skull.svg');
	});

	it('generates token data with hostile disposition', () => {
		const hazard = {
			id: 'token-hazard',
			category: 'environmental' as const,
			location: 'Area 10',
			data: {
				name: 'Lava Pool',
				type: 'hazard' as const,
				system: {
					description: { value: '' },
					slug: 'lava-pool',
					traits: { value: [] as string[] },
					details: { level: { value: 5 }, isComplex: true },
					attributes: {},
					saves: {},
				},
			},
		};

		const result = importer.toDocumentData(hazard);
		expect(d(result.prototypeToken).disposition).toBe(-1);
		// Complex hazards show HP bar
		expect(d(result.prototypeToken).displayBars).toBe(20);
	});
});

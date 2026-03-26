import type { ActorData, ItemData } from '../types/foundry.d.ts';
import type {
	SystemActionReference,
	SystemActorReference,
	SystemSpellReference,
	SystemWeaponReference,
} from './system-items';
import { createAction, createSpellcastingEntryWithSpells, createStrike, systemAction, systemWeapon } from './utils';

// NPC Categories for organization
export type NPCCategory = 'major-npc' | 'harbinger-resident' | 'generic-npc' | 'fiend' | 'cultist';

/** Union type for any item that can be on an NPC */
export type NPCItemEntry = ItemData | SystemWeaponReference | SystemSpellReference | SystemActionReference;

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
	return 'type' in entry && (entry as SystemActorReference).type === 'system-actor';
}

// Re-export SystemActorReference for consumers
export type { SystemActorReference } from './system-items';

// =============================================================================
// MAJOR NPCs
// =============================================================================

export const TROLAN_THE_MAD: HarbingerNPC = {
	id: 'trolan-the-mad',
	category: 'major-npc',
	data: {
		name: 'Trolan the Mad',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/assets/tokens/trolan.webp',
		system: {
			abilities: {
				str: { mod: 1 },
				dex: { mod: 4 },
				con: { mod: -1 },
				int: { mod: 1 },
				wis: { mod: 1 },
				cha: { mod: 5 },
			},
			attributes: {
				hp: { value: 145, max: 145, temp: 0, details: '' },
				ac: { value: 29, details: '' },
				speed: { value: 25, otherSpeeds: [] },
				resistances: [{ type: 'fire', value: 5 }],
			},
			perception: { mod: 17, details: '' },
			details: {
				level: { value: 10 },
				alignment: { value: 'CG' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Tiefling bard who believes himself beloved by the Lady of Pain',
				publicNotes: `<p>Once Trolan of Ecstasy, now <strong>Trolan the Mad</strong> (and later Trolan the Beloved), the bard has one great love in his life: the Lady of Pain. His natural charisma and innate abilities have attracted many followers to his cause.</p>
<p><strong>Field of Fellowship:</strong> Creatures within 10 feet must succeed at a DC 29 Will save or be unable to harm Trolan (as sanctuary). Critical failure makes the creature helpful toward him.</p>
<p><strong>Regeneration 10:</strong> Trolan regains all lost hit points within 24 hours unless slain. This regeneration is deactivated by death effects.</p>`,
			},
			saves: {
				fortitude: { value: 15, saveDetail: '' },
				reflex: { value: 20, saveDetail: '' },
				will: { value: 19, saveDetail: '+2 status to all saves vs. magic' },
			},
			traits: {
				value: ['unique', 'tiefling', 'humanoid'],
				rarity: 'unique',
				size: { value: 'med' },
				languages: {
					value: ['common', 'infernal'],
					details: 'Planar Trade',
				},
				senses: [{ type: 'darkvision' }],
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'trolan-the-mad',
				category: 'major-npc',
			},
		},
		prototypeToken: {
			name: 'Trolan the Mad',
			displayName: 20,
			actorLink: true,
			disposition: 1,
			texture: { src: 'modules/harbinger-house-pf2e/assets/tokens/trolan.webp' },
		},
	},
	items: [
		systemWeapon('shortsword', { potency: 1, striking: 'striking' }),
		createAction(
			'Field of Fellowship',
			'passive',
			['aura', 'emotion', 'mental'],
			`<p><strong>Aura</strong> 10 feet</p>
<p>Creatures that enter the aura or start their turn there must succeed at a DC 29 Will save or be unable to harm Trolan (as sanctuary). On a critical failure, the creature becomes helpful toward Trolan for 1 minute.</p>`,
			[
				{
					key: 'Aura',
					slug: 'field-of-fellowship',
					radius: 10,
					traits: ['emotion', 'mental'],
				},
			],
		),
		createAction(
			'Inspire Courage',
			1,
			['auditory', 'concentrate', 'emotion', 'mental'],
			`<p>Trolan provides a +1 status bonus to attack rolls, damage rolls, and saves against fear to allies within 60 feet until the start of his next turn.</p>`,
		),
		createAction(
			"Lady's Beloved",
			'passive',
			[],
			`<p>Trolan believes himself beloved by the Lady of Pain. He gains a +2 circumstance bonus to saves against effects that would make him doubt this belief.</p>`,
		),
		createAction(
			'Magic Resistance',
			'passive',
			[],
			`<p>+2 status bonus to all saving throws against magic.</p>`,
			[
				{
					key: 'FlatModifier',
					selector: 'saving-throw',
					value: 2,
					type: 'status',
					predicate: ['item:trait:magical'],
					label: 'Magic Resistance',
				},
			],
		),
		...createSpellcastingEntryWithSpells('Occult Innate Spells', 'occult', 19, 29, [
			['charm', 4],
			['suggestion', 4],
			['waveOfDespair', 5],
			['synesthesia', 5],
		]),
	],
};

export const CRIMJAK: HarbingerNPC = {
	id: 'crimjak-marquis-cambion',
	category: 'major-npc',
	data: {
		name: 'Crimjak the Marquis Cambion',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/assets/tokens/crimjak.webp',
		system: {
			abilities: {
				str: { mod: 6 },
				dex: { mod: 4 },
				con: { mod: 4 },
				int: { mod: 4 },
				wis: { mod: 2 },
				cha: { mod: 4 },
			},
			attributes: {
				hp: { value: 160, max: 160, temp: 0, details: '' },
				ac: { value: 28, details: '' },
				speed: { value: 30, otherSpeeds: [{ type: 'fly', value: 40 }] },
				immunities: [{ type: 'electricity' }, { type: 'poison' }],
				resistances: [
					{ type: 'cold', value: 10 },
					{ type: 'fire', value: 10 },
				],
			},
			perception: { mod: 18, details: 'see invisibility' },
			details: {
				level: { value: 9 },
				alignment: { value: 'CE' },
				creatureType: 'Fiend',
				source: { value: 'Harbinger House' },
				blurb: 'A cambion in service to Nari the succubus',
				publicNotes: `<p><strong>Crimjak</strong> is a marquis cambion who owes debts to Nari. She has called him to Sigil to help with her scheme to gain control of Harbinger House.</p>
<p><strong>Never Surprised:</strong> Crimjak is never flat-footed to creatures that are hidden from him.</p>`,
			},
			saves: {
				fortitude: { value: 19, saveDetail: '' },
				reflex: { value: 19, saveDetail: '' },
				will: { value: 15, saveDetail: '' },
			},
			traits: {
				value: ['unique', 'demon', 'fiend'],
				rarity: 'unique',
				size: { value: 'med' },
				languages: {
					value: ['abyssal', 'common', 'infernal'],
					details: 'telepathy 100 feet',
				},
				senses: [{ type: 'darkvision' }],
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'crimjak-marquis-cambion',
				category: 'major-npc',
			},
		},
	},
	items: [
		systemWeapon('longsword', { potency: 1, striking: 'striking' }, undefined, 'Deals an additional 1d6 evil damage.'),
		createAction(
			'Never Surprised',
			'passive',
			[],
			`<p>Crimjak is never flat-footed to creatures that are hidden from him.</p>`,
		),
		createAction(
			'Change Shape',
			1,
			['concentrate', 'divine', 'polymorph'],
			`<p>Crimjak can take on the appearance of any Medium humanoid. This doesn't change his Speed or attack and damage modifiers.</p>`,
		),
		createAction(
			'Abyssal Wrath',
			2,
			['divine', 'fire'],
			`<p>Crimjak unleashes a burst of Abyssal flame in a 20-foot emanation. Creatures in the area take 8d6 fire damage (DC 27 basic Reflex save). Crimjak can't use Abyssal Wrath again for 1d4 rounds.</p>`,
		),
		...createSpellcastingEntryWithSpells('Arcane Innate Spells', 'arcane', 17, 27, [
			['translocate', 5],
			['darkness', 4],
			['fly', 4],
			['fireball', 3],
		]),
	],
};

export const NARCOVI: HarbingerNPC = {
	id: 'narcovi',
	category: 'major-npc',
	data: {
		name: 'Narcovi',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/assets/tokens/narcovi.webp',
		system: {
			abilities: {
				str: { mod: 4 },
				dex: { mod: 1 },
				con: { mod: 2 },
				int: { mod: 4 },
				wis: { mod: 3 },
				cha: { mod: 1 },
			},
			attributes: {
				hp: { value: 155, max: 155, temp: 0, details: '' },
				ac: { value: 29, details: '' },
				speed: { value: 20, otherSpeeds: [] },
			},
			perception: { mod: 19, details: '' },
			details: {
				level: { value: 9 },
				alignment: { value: 'LG' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Harmonium investigator assigned to the murder cases',
				publicNotes: `<p><strong>Narcovi</strong> is the chief investigator assigned by the Harmonium to look into the recent string of murders in the Cage. A tough, no-nonsense Hardhead, she loves to get the really difficult cases.</p>
<p>She has eight Hardhead agents backing her up, and a dozen more searching the wards for clues.</p>`,
			},
			saves: {
				fortitude: { value: 19, saveDetail: '' },
				reflex: { value: 16, saveDetail: '' },
				will: { value: 18, saveDetail: '' },
			},
			skills: {
				athletics: { base: 19, value: 19, label: 'Athletics', visible: true },
				diplomacy: { base: 15, value: 15, label: 'Diplomacy', visible: true },
				intimidation: { base: 17, value: 17, label: 'Intimidation', visible: true },
				legalLore: { base: 21, value: 21, label: 'Legal Lore', visible: true, lore: true },
				society: { base: 19, value: 19, label: 'Society', visible: true },
				survival: { base: 17, value: 17, label: 'Survival', visible: true },
			},
			traits: {
				value: ['unique', 'dwarf', 'humanoid'],
				rarity: 'unique',
				size: { value: 'med' },
				languages: {
					value: ['common', 'dwarven', 'infernal'],
					details: '',
				},
				senses: [{ type: 'darkvision' }],
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'narcovi',
				category: 'major-npc',
			},
		},
	},
	items: [
		systemWeapon('longsword', { potency: 1, striking: 'striking' }),
		systemAction('attackOfOpportunity'),
		createAction(
			"Investigator's Eye",
			1,
			['concentrate'],
			`<p>Narcovi studies a creature she can see. She gains a +1 circumstance bonus to Perception checks and attack rolls against that creature until the end of her turn.</p>`,
		),
		createAction(
			'Power Attack',
			2,
			[],
			`<p>Narcovi makes a melee Strike. If it hits, she deals an extra die of weapon damage.</p>`,
		),
		createAction(
			'Hardhead Interrogation',
			'passive',
			[],
			`<p>When Narcovi Coerces or Requests information from a creature, she gains a +2 circumstance bonus to the check.</p>`,
			[
				{
					key: 'FlatModifier',
					selector: 'intimidation',
					value: 2,
					type: 'circumstance',
					predicate: ['action:coerce'],
					label: 'Hardhead Interrogation',
				},
				{
					key: 'FlatModifier',
					selector: 'diplomacy',
					value: 2,
					type: 'circumstance',
					predicate: ['action:request'],
					label: 'Hardhead Interrogation',
				},
			],
		),
	],
};

export const SOUGAD_LAWSHREDDER: HarbingerNPC = {
	id: 'sougad-lawshredder',
	category: 'major-npc',
	data: {
		name: 'Sougad Lawshredder',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/assets/tokens/sougad.webp',
		system: {
			abilities: {
				str: { mod: 5 },
				dex: { mod: 5 },
				con: { mod: 4 },
				int: { mod: 1 },
				wis: { mod: 2 },
				cha: { mod: 2 },
			},
			attributes: {
				hp: { value: 210, max: 210, temp: 0, details: '' },
				ac: { value: 33, details: '' },
				speed: { value: 30, otherSpeeds: [] },
			},
			perception: { mod: 20, details: '' },
			details: {
				level: { value: 12 },
				alignment: { value: 'CE' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'The law-killer who seeks to become a power of chaos and murder',
				publicNotes: `<p><strong>Sougad Lawshredder</strong> is the main antagonist of Harbinger House. He believes completing his murderous ritual will elevate him to godhood as a power of chaos and murder.</p>
<p>His <strong>Law Slayer</strong> blade becomes more powerful with each lawful victim slain as part of his ritual.</p>
<p><strong>Ritual Murder:</strong> When Sougad kills a lawful creature with his law slayer, he absorbs planar energy. After killing 13 lawful creatures in the proper ritual, he ascends to godhood.</p>`,
			},
			saves: {
				fortitude: { value: 23, saveDetail: '' },
				reflex: { value: 24, saveDetail: '' },
				will: { value: 19, saveDetail: '+2 status to saves vs. magic' },
			},
			skills: {
				acrobatics: { base: 23, value: 23, label: 'Acrobatics', visible: true },
				athletics: { base: 24, value: 24, label: 'Athletics', visible: true },
				deception: { base: 18, value: 18, label: 'Deception', visible: true },
				intimidation: { base: 22, value: 22, label: 'Intimidation', visible: true },
				religion: { base: 18, value: 18, label: 'Religion', visible: true },
				stealth: { base: 23, value: 23, label: 'Stealth', visible: true },
				survival: { base: 20, value: 20, label: 'Survival', visible: true },
			},
			traits: {
				value: ['unique', 'human', 'humanoid'],
				rarity: 'unique',
				size: { value: 'med' },
				languages: {
					value: ['common', 'abyssal'],
					details: '',
				},
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'sougad-lawshredder',
				category: 'major-npc',
			},
		},
	},
	items: [
		createStrike(
			'Law Slayer',
			26,
			{ dice: 3, die: '8', type: 'slashing', modifier: 11 },
			['magical', 'versatile-p', 'unholy'],
			`+2 greater striking anarchic longsword. Deals 2d6 spirit damage (4d6 vs. lawful creatures).`,
			[
				{
					key: 'DamageDice',
					selector: '{item|_id}-damage',
					diceNumber: 2,
					dieSize: 'd6',
					damageType: 'spirit',
					label: 'Spirit Damage',
				},
				{
					key: 'DamageDice',
					selector: '{item|_id}-damage',
					diceNumber: 2,
					dieSize: 'd6',
					damageType: 'spirit',
					predicate: ['target:trait:lawful'],
					label: 'Extra Spirit Damage vs Lawful',
				},
			],
		),
		createAction(
			'Know Alignment',
			1,
			['divine', 'detection'],
			`<p>Sougad learns the alignment of a creature within 30 feet (Will DC 30 negates).</p>`,
		),
		createAction(
			'Cause Fear',
			2,
			['divine', 'emotion', 'fear', 'mental'],
			`<p>A creature within 30 feet must succeed at a DC 30 Will save or become frightened 2 (frightened 3 on critical failure).</p>`,
		),
		createAction(
			'Shocking Grasp',
			2,
			['electricity'],
			`<p>Sougad makes a melee Strike. On a hit, the target takes an additional 4d12 electricity damage and is stunned 1.</p>`,
		),
		createAction('Dimension Door', 2, ['teleportation'], `<p>As the spell. Usable once per day.</p>`),
		createAction(
			'Magic Resistance',
			'passive',
			[],
			`<p>+2 status bonus to saving throws against magic.</p>`,
			[
				{
					key: 'FlatModifier',
					selector: 'saving-throw',
					value: 2,
					type: 'status',
					predicate: ['item:trait:magical'],
					label: 'Magic Resistance',
				},
			],
		),
		createAction(
			'Ritual Murder',
			'passive',
			['divine'],
			`<p>When Sougad kills a lawful creature with his law slayer, he absorbs planar energy. After killing 13 lawful creatures in the proper ritual, he ascends to godhood.</p>`,
		),
	],
};

export const PASTOR_BROWEN: HarbingerNPC = {
	id: 'pastor-browen',
	category: 'major-npc',
	data: {
		name: 'Pastor Browen',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/assets/tokens/browen.webp',
		system: {
			abilities: {
				str: { mod: 3 },
				dex: { mod: -1 },
				con: { mod: 2 },
				int: { mod: 1 },
				wis: { mod: 6 },
				cha: { mod: 1 },
			},
			attributes: {
				hp: { value: 195, max: 195, temp: 0, details: '' },
				ac: { value: 31, details: '' },
				speed: { value: 20, otherSpeeds: [] },
			},
			perception: { mod: 24, details: '' },
			details: {
				level: { value: 12 },
				alignment: { value: 'CE' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Mad priest of an unnamed god of evil',
				publicNotes: `<p><strong>Pastor Browen</strong> worships an unnamed god of evil he refers to as "the Mad One." He believes the best way to convert a sod is to bash his head in.</p>
<p>He has innate abilities to control local weather, marking him as a power-in-the-making by the Godsmen.</p>
<p><strong>Sermon of Madness:</strong> Browen can deliver maddening sermons that confuse those who hear him.</p>`,
			},
			saves: {
				fortitude: { value: 21, saveDetail: '' },
				reflex: { value: 17, saveDetail: '' },
				will: { value: 24, saveDetail: '' },
			},
			skills: {
				athletics: { base: 21, value: 21, label: 'Athletics', visible: true },
				deception: { base: 18, value: 18, label: 'Deception', visible: true },
				intimidation: { base: 22, value: 22, label: 'Intimidation', visible: true },
				nature: { base: 24, value: 24, label: 'Nature', visible: true },
				religion: { base: 24, value: 24, label: 'Religion', visible: true },
				survival: { base: 22, value: 22, label: 'Survival', visible: true },
			},
			traits: {
				value: ['unique', 'human', 'humanoid'],
				rarity: 'unique',
				size: { value: 'med' },
				languages: {
					value: ['common', 'abyssal'],
					details: '',
				},
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'pastor-browen',
				category: 'major-npc',
			},
		},
	},
	items: [
		systemWeapon('morningstar', { potency: 1, striking: 'striking' }),
		createAction(
			'Sermon of Madness',
			2,
			['auditory', 'divine', 'mental'],
			`<p>Browen delivers a maddening sermon. Each creature within 30 feet that can hear him must attempt a DC 30 Will save.</p>
<p><strong>Critical Success</strong> The creature is unaffected.</p>
<p><strong>Success</strong> The creature is stupefied 1 for 1 round.</p>
<p><strong>Failure</strong> The creature is confused for 1 round.</p>
<p><strong>Critical Failure</strong> The creature is confused for 1 minute.</p>`,
		),
		...createSpellcastingEntryWithSpells('Primal Innate Spells', 'primal', 20, 30, [
			['gustOfWind', 3],
			['iceStorm', 4],
			['wallOfWind', 3],
		]),
		...createSpellcastingEntryWithSpells('Divine Innate Spells', 'divine', 20, 30, [
			['bladeBarrier', 6],
			['harm', 6],
			['flameStrike', 5],
		]),
	],
};

export const NARI_THE_SCHEMER: HarbingerNPC = {
	id: 'nari-the-schemer',
	category: 'major-npc',
	data: {
		name: 'Nari the Schemer',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/assets/tokens/nari.webp',
		system: {
			abilities: {
				str: { mod: 2 },
				dex: { mod: 4 },
				con: { mod: 3 },
				int: { mod: 4 },
				wis: { mod: 3 },
				cha: { mod: 6 },
			},
			attributes: {
				hp: { value: 185, max: 185, temp: 0, details: '' },
				ac: { value: 30, details: '' },
				speed: { value: 25, otherSpeeds: [{ type: 'fly', value: 35 }] },
				weaknesses: [
					{ type: 'cold-iron', value: 10 },
					{ type: 'good', value: 10 },
				],
			},
			perception: { mod: 20, details: '' },
			details: {
				level: { value: 11 },
				alignment: { value: 'CE' },
				creatureType: 'Fiend',
				source: { value: 'Harbinger House' },
				blurb: 'Cunning succubus seeking to become a power',
				publicNotes: `<p><strong>Nari</strong> is a cunning succubus from the Abyss who has long sought to rise above her station. She believes Harbinger House holds the key to her ascension to powerhood.</p>
<p>She possesses <strong>the planarity</strong>, an artifact that opens any portal in Harbinger House and records images of surrounding events.</p>
<p><strong>Ambitious Schemer:</strong> Nari believes she can become a power through a corrupted version of Sougad's ritual. She is wrong—only true "powers-to-be" can ascend through the ritual.</p>`,
			},
			saves: {
				fortitude: { value: 18, saveDetail: '' },
				reflex: { value: 21, saveDetail: '' },
				will: { value: 22, saveDetail: '+1 status to all saves vs. magic' },
			},
			skills: {
				acrobatics: { base: 20, value: 20, label: 'Acrobatics', visible: true },
				deception: { base: 24, value: 24, label: 'Deception', visible: true },
				diplomacy: { base: 24, value: 24, label: 'Diplomacy', visible: true },
				intimidation: { base: 22, value: 22, label: 'Intimidation', visible: true },
				occultism: { base: 18, value: 18, label: 'Occultism', visible: true },
				religion: { base: 18, value: 18, label: 'Religion', visible: true },
				society: { base: 18, value: 18, label: 'Society', visible: true },
				stealth: { base: 20, value: 20, label: 'Stealth', visible: true },
			},
			traits: {
				value: ['unique', 'demon', 'fiend', 'succubus'],
				rarity: 'unique',
				size: { value: 'med' },
				languages: {
					value: ['abyssal', 'celestial', 'common', 'draconic', 'infernal'],
					details: 'telepathy 100 feet, tongues',
				},
				senses: [{ type: 'darkvision' }],
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'nari-the-schemer',
				category: 'major-npc',
			},
		},
	},
	items: [
		createStrike(
			'Claw',
			21,
			{ dice: 2, die: '8', type: 'slashing', modifier: 8 },
			['agile', 'finesse', 'magical'],
			'Deals an additional 1d6 evil damage.',
			[
				{
					key: 'DamageDice',
					selector: '{item|_id}-damage',
					diceNumber: 1,
					dieSize: 'd6',
					damageType: 'spirit',
					label: 'Evil Damage',
				},
			],
		),
		systemWeapon('longsword', { potency: 1, striking: 'striking' }),
		createAction(
			'Embrace',
			1,
			['divine', 'emotion', 'incapacitation', 'mental'],
			`<p>The succubus attempts to embrace a creature within reach. If the creature allows the embrace or is grabbed, it must attempt a DC 30 Will save.</p>
<p><strong>Critical Success</strong> The creature is unaffected.</p>
<p><strong>Success</strong> The creature is stupefied 1 for 1 round.</p>
<p><strong>Failure</strong> The creature is stupefied 2 and fascinated with the succubus for 1 minute.</p>
<p><strong>Critical Failure</strong> As failure, but the duration is 1 hour.</p>`,
		),
		createAction(
			'Change Shape',
			1,
			['concentrate', 'divine', 'polymorph'],
			`<p>Nari can take on the appearance of any Small or Medium humanoid. She has practiced appearing as the Lady of Pain, gaining a +4 circumstance bonus to Deception checks to maintain this specific disguise.</p>`,
		),
		createAction(
			'Magic Resistance',
			'passive',
			[],
			`<p>+1 status bonus to all saving throws against magic.</p>`,
			[
				{
					key: 'FlatModifier',
					selector: 'saving-throw',
					value: 1,
					type: 'status',
					predicate: ['item:trait:magical'],
					label: 'Magic Resistance',
				},
			],
		),
		...createSpellcastingEntryWithSpells('Divine Innate Spells', 'divine', 21, 30, [
			['dominate', 6],
			['translocate', 5],
			['charm', 4],
			['suggestion', 4],
			['mindReading', 3],
		]),
	],
};

// Export all major NPCs as a group
export const HARBINGER_RESIDENTS: HarbingerNPC[] = [
	TROLAN_THE_MAD,
	CRIMJAK,
	NARCOVI,
	SOUGAD_LAWSHREDDER,
	PASTOR_BROWEN,
	NARI_THE_SCHEMER,
];

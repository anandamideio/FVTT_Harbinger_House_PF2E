import type { HarbingerNPC } from '../../schema/harbinger-npc';
import { createAction, createSpellcastingEntryWithSpells, createStrike, systemAction, systemEquipment, systemWeapon } from '../../utils';

export type {
	HarbingerNPC,
	NPCCategory,
	NPCEntry,
	NPCItemEntry,
	SystemActorReference,
} from '../../schema/harbinger-npc';
export { isSystemActorReference } from '../../schema/harbinger-npc';

// =============================================================================
// MAJOR NPCs
// =============================================================================

export const TROLAN_THE_MAD: HarbingerNPC = {
	id: 'trolan-the-mad',
	category: 'major-npc',
	data: {
		name: 'Trolan the Mad',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/Trolan_The_Mad.png',
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
				publicNotes: `<p>Once Trolan of Ecstasy, now <strong>Trolan the Mad</strong> (and later Trolan the Beloved), the bard has one great love in his life: the Lady of Pain. His natural charisma and innate abilities have attracted many followers to his cause.</p>`,
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
					value: ['common', 'diabolic'],
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
			texture: { src: 'modules/harbinger-house-pf2e/dist/assets/tokens/Trolan.png' },
		},
	},
	items: [
		createStrike(
			'Shortsword +1',
			22,
			{ dice: 2, die: '6', type: 'piercing', modifier: 7 },
			['agile', 'finesse', 'magical', 'versatile-s'],
			`<p>+1 striking shortsword wielded with theatrical precision.</p>`,
		),
		createAction(
			'Field of Fellowship',
			'passive',
			['aura', 'emotion', 'mental'],
			`<p><strong>Aura</strong> 10 feet</p>
<p>Creatures that enter the aura or start their turn there must succeed at a @Check[type:will|dc:29] or be unable to harm Trolan (as sanctuary). On a critical failure, the creature becomes helpful toward Trolan for 1 minute.</p>`,
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
		createAction('Magic Resistance', 'passive', [], `<p>+2 status bonus to all saving throws against magic.</p>`, [
			{
				key: 'FlatModifier',
				selector: 'saving-throw',
				value: 2,
				type: 'status',
				predicate: ['item:trait:magical'],
				label: 'Magic Resistance',
			},
		]),
		...createSpellcastingEntryWithSpells('Occult Innate Spells', 'occult', 19, 29, [
			['heal', 5],
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
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/Crimjack.jpg',
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
					value: ['chthonian', 'common', 'diabolic'],
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
		prototypeToken: {
			name: 'Crimjak the Marquis Cambion',
			displayName: 20,
			actorLink: true,
			disposition: -1,
			texture: { src: 'modules/harbinger-house-pf2e/dist/assets/tokens/Crimjack.png' },
		},
	},
	items: [
		createStrike(
			'Longsword +1',
			20,
			{ dice: 2, die: '8', type: 'slashing', modifier: 9 },
			['magical', 'versatile-p'],
			`<p>+1 striking longsword. Deals an additional @Damage[1d6[spirit]] damage.</p>`,
			[
				{
					key: 'DamageDice',
					selector: '{item|_id}-damage',
					diceNumber: 1,
					dieSize: 'd6',
					damageType: 'spirit',
					label: 'Fiendish Edge',
				},
			],
		),
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
			`<p>Crimjak unleashes a burst of Abyssal flame in a 20-foot emanation. Creatures in the area take @Damage[8d6[fire]] damage (@Check[type:reflex|dc:27] basic save). Crimjak can't use Abyssal Wrath again for 1d4 rounds.</p>`,
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
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/Narcovi.webp',
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
					value: ['common', 'diabolic', 'dwarven'],
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
		prototypeToken: {
			name: 'Narcovi',
			displayName: 20,
			actorLink: true,
			disposition: 1,
			texture: { src: 'modules/harbinger-house-pf2e/dist/assets/tokens/Narcovi.png' },
		},
	},
	items: [
		createStrike(
			'Longsword +1',
			20,
			{ dice: 2, die: '8', type: 'slashing', modifier: 6 },
			['magical', 'versatile-p'],
			`<p>+1 striking longsword used by a seasoned Hardhead investigator.</p>`,
		),
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
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/Sougad Lawshredder.png',
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
					value: ['chthonian', 'common'],
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
		prototypeToken: {
			name: 'Sougad Lawshredder',
			displayName: 20,
			actorLink: true,
			disposition: -1,
			texture: { src: 'modules/harbinger-house-pf2e/dist/assets/tokens/Sougad.png' },
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
					predicate: [{ or: ['target:trait:lawful', 'target:harbinger:lawful'] }],
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
			`<p>A creature within 30 feet must succeed at a @Check[type:will|dc:30] or become frightened 2 (frightened 3 on critical failure).</p>`,
		),
		createAction(
			'Shocking Grasp',
			2,
			['electricity'],
			`<p>Sougad makes a melee Strike. On a hit, the target takes an additional @Damage[4d12[electricity]] damage and is stunned 1.</p>`,
		),
		createAction('Dimension Door', 2, ['teleportation'], `<p>As the spell. Usable once per day.</p>`),
		createAction('Magic Resistance', 'passive', [], `<p>+2 status bonus to saving throws against magic.</p>`, [
			{
				key: 'FlatModifier',
				selector: 'saving-throw',
				value: 2,
				type: 'status',
				predicate: ['item:trait:magical'],
				label: 'Magic Resistance',
			},
		]),
		createAction(
			'Ritual Murder',
			'passive',
			['divine'],
			`<p>When Sougad kills a lawful creature with his law slayer, he absorbs planar energy. After killing 13 lawful creatures in the proper ritual, he ascends to godhood.</p>`,
		),
		systemEquipment('bootsOfPropulsion'),
	],
};

export const PASTOR_BROWEN: HarbingerNPC = {
	id: 'pastor-browen',
	category: 'major-npc',
	data: {
		name: 'Pastor Browen',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/paster_bowen.png',
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
					value: ['chthonian', 'common'],
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
		prototypeToken: {
			name: 'Pastor Browen',
			displayName: 20,
			actorLink: true,
			disposition: -1,
			texture: { src: 'modules/harbinger-house-pf2e/dist/assets/tokens/Paster Bowen.png' },
		},
	},
	items: [
		createStrike(
			'Morningstar +1',
			23,
			{ dice: 2, die: '8', type: 'piercing', modifier: 8 },
			['magical'],
			`<p>+1 striking morningstar. Browen treats this as an instrument of conversion as much as a weapon.</p>`,
		),
		createAction(
			'Sermon of Madness',
			2,
			['auditory', 'divine', 'mental'],
			`<p>Browen delivers a maddening sermon. Each creature within 30 feet that can hear him must attempt a @Check[type:will|dc:30].</p>
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
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/nari_succubus_abyss.png',
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
					value: ['chthonian', 'common', 'diabolic', 'draconic', 'empyrean'],
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
		prototypeToken: {
			name: 'Nari the Schemer',
			displayName: 20,
			actorLink: true,
			disposition: -1,
			texture: { src: 'modules/harbinger-house-pf2e/dist/assets/tokens/Nari.png' },
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
			`<p>The succubus attempts to embrace a creature within reach. If the creature allows the embrace or is grabbed, it must attempt a @Check[type:will|dc:30].</p>
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
		createAction('Magic Resistance', 'passive', [], `<p>+1 status bonus to all saving throws against magic.</p>`, [
			{
				key: 'FlatModifier',
				selector: 'saving-throw',
				value: 1,
				type: 'status',
				predicate: ['item:trait:magical'],
				label: 'Magic Resistance',
			},
		]),
		...createSpellcastingEntryWithSpells('Divine Innate Spells', 'divine', 21, 30, [
			['dominate', 6],
			['translocate', 5],
			['charm', 4],
			['suggestion', 4],
			['mindReading', 3],
		]),
	],
};

export const CHANCE_THE_BARMY: HarbingerNPC = {
	id: 'chance-the-barmy',
	category: 'major-npc',
	data: {
		name: 'Chance',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/Chance.png',
		system: {
			abilities: {
				str: { mod: 2 },
				dex: { mod: 5 },
				con: { mod: 0 },
				int: { mod: 2 },
				wis: { mod: -1 },
				cha: { mod: 2 },
			},
			attributes: {
				hp: { value: 120, max: 120, temp: 0, details: '' },
				ac: { value: 26, details: '' },
				speed: { value: 25, otherSpeeds: [] },
			},
			perception: { mod: 15, details: '' },
			details: {
				level: { value: 8 },
				alignment: { value: 'CE' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Paranoid barmy rogue who lives and dies by the roll of his d4s',
				publicNotes: `<p><strong>Chance</strong> is a chaotic fellow by nature — paranoid, neurotic, and plagued by indecision and fear. He cannot make any decisions without consulting the pair of four-sided dice he always carries.</p>
<p>For decisions that affect only himself, he tosses his dice privately: an odd roll makes him act to his own benefit, an even roll makes him act against his better interests. For decisions that affect others, he asks the target to call "odds or evens" before he rolls.</p>
<p><strong>Field of Bad Luck:</strong> Chance projects an aura of misfortune that warps probability itself around him. Allies and enemies alike stumble, fumble, and misstep in his presence — though he himself rides a wave of impossible luck.</p>
<p><strong>Tactics:</strong> If a fight goes badly for him, Chance dives through the mirror in his chamber to hide in his secret room. If the PCs follow, they find him rolling his dice over and over, trying to decide what to do next.</p>`,
			},
			saves: {
				fortitude: { value: 13, saveDetail: "+4 item bonus vs. effects targeting only Chance (Extreme Luck)" },
				reflex: { value: 19, saveDetail: "+4 item bonus vs. effects targeting only Chance (Extreme Luck)" },
				will: { value: 14, saveDetail: "+4 item bonus vs. effects targeting only Chance (Extreme Luck)" },
			},
			skills: {
				acrobatics: { base: 19, value: 19, label: 'Acrobatics', visible: true },
				deception: { base: 16, value: 16, label: 'Deception', visible: true },
				stealth: { base: 19, value: 19, label: 'Stealth', visible: true },
				thievery: { base: 19, value: 19, label: 'Thievery', visible: true },
				gamblingLore: { base: 18, value: 18, label: 'Gambling Lore', visible: true, lore: true },
			},
			traits: {
				value: ['unique', 'human', 'humanoid'],
				rarity: 'unique',
				size: { value: 'med' },
				languages: {
					value: ['common'],
					details: 'Planar Trade',
				},
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'chance-the-barmy',
				category: 'major-npc',
			},
		},
		prototypeToken: {
			name: 'Chance',
			displayName: 20,
			actorLink: true,
			disposition: -1,
			texture: { src: 'modules/harbinger-house-pf2e/dist/assets/tokens/chance.png' },
		},
	},
	items: [
		createStrike(
			'Shortsword +1',
			19,
			{ dice: 2, die: '6', type: 'piercing', modifier: 6 },
			['agile', 'finesse', 'magical', 'versatile-s'],
			`<p>+1 striking shortsword used for quick opportunistic cuts.</p>`,
		),
		createAction(
			'Field of Bad Luck',
			'passive',
			['aura', 'mental', 'misfortune'],
			`<p><strong>Aura</strong> 15 feet</p>
<p>Chance's warped relationship with probability drags others down into misfortune. Any creature other than Chance that starts its turn within the aura, or that enters the aura, must attempt a @Check[type:will|dc:26] before taking any actions that round.</p>
<p><strong>Critical Success</strong> The creature is unaffected this round and gains a +1 status bonus to saves against the aura for 1 minute.</p>
<p><strong>Success</strong> The creature takes a -1 status penalty to all checks and DCs this round.</p>
<p><strong>Failure</strong> Something goes wrong with the creature's first action of the round. If it is a Strike, the weapon slips or the blow goes wide. If it is a spell, the wrong components are grabbed and the spell is lost. If it is movement, the creature trips and falls prone at the end of its movement. The triggering action is wasted.</p>
<p><strong>Critical Failure</strong> As failure, and the creature additionally drops one held item of the GM's choice and is <strong>clumsy 1</strong> until the end of its next turn.</p>
<hr/>
<p><em>This aura moves with Chance and cannot be separated from him. It is suppressed while Chance is unconscious, dead, or otherwise incapacitated.</em></p>`,
			[
				{
					key: 'Aura',
					slug: 'field-of-bad-luck',
					radius: 15,
					traits: ['mental', 'misfortune'],
				},
			],
		),
		createAction(
			'Extreme Luck',
			'passive',
			['fortune'],
			`<p>Probability bends around Chance to his benefit. He gains a <strong>+4 item bonus</strong> to all checks and DCs (including his AC and saves), and any effect that targets only Chance takes a <strong>-4 circumstance penalty</strong> to its check or DC against him.</p>
<p>This bonus is already included in Chance's statistics.</p>`,
			[
				{
					key: 'FlatModifier',
					selector: 'all',
					value: 4,
					type: 'item',
					label: 'Extreme Luck',
					predicate: ['chance:extreme-luck'],
				},
			],
		),
		createAction(
			'Odds or Evens',
			'free',
			['concentrate', 'mental'],
			`<p><strong>Frequency</strong> once per round</p>
<p><strong>Trigger</strong> Chance is about to attempt a Strike or action that targets a single creature he can see.</p>
<hr/>
<p>Chance draws his pair of four-sided dice and asks the target to call "odds or evens." He then rolls the dice. If the result is in the <em>target's</em> favor (they called correctly), Chance immediately abandons the action, gains no benefit from this ability, and moves on to a different target as his next action. If the result is in <em>Chance's</em> favor, the triggering action gains a <strong>+2 circumstance bonus</strong> to its attack roll or DC, and on a successful Strike deals an additional <strong>@Damage[2d6[precision]]</strong> damage.</p>`,
		),
		createAction(
			'Sneak Attack',
			'passive',
			[],
			`<p>When Chance Strikes a creature that is off-guard with an agile or finesse melee weapon or an agile or finesse unarmed attack, he deals an additional <strong>2d6 precision damage</strong>.</p>`,
			[
				{
					key: 'DamageDice',
					selector: 'strike-damage',
					diceNumber: 2,
					dieSize: 'd6',
					damageType: 'precision',
					predicate: [
						'target:condition:off-guard',
						{ or: ['item:trait:agile', 'item:trait:finesse'] },
					],
					label: 'Sneak Attack',
				},
			],
		),
		createAction(
			'Tumble Behind',
			1,
			[],
			`<p><strong>Requirements</strong> Chance is not <strong>encumbered</strong>.</p>
<hr/>
<p>Chance Strides up to his Speed. During this movement, he can move through the space of any creature (as if Tumbling Through, but automatic — no Acrobatics check is required). If he ends his movement in a space adjacent to a creature whose space he passed through, that creature is <strong>off-guard</strong> against Chance until the start of his next turn.</p>`,
		),
		createAction(
			'Dive Through the Mirror',
			2,
			['arcane', 'teleportation'],
			`<p><strong>Frequency</strong> once per day</p>
<p><strong>Requirements</strong> Chance is within 15 feet of the enchanted mirror in his chamber.</p>
<hr/>
<p>Chance leaps into the mirror and vanishes, reappearing in his hidden secret room beyond. The mirror flickers briefly as he passes through; a creature with a free reaction can attempt to grab him with an @Check[type:athletics|dc:28] check to prevent the dive. On a failed attempt, the action is lost.</p>`,
		),
		createAction(
			"Gambler's Consolation",
			'reaction',
			['concentrate'],
			`<p><strong>Trigger</strong> Chance is targeted by an attack or effect that would reduce him to 0 Hit Points.</p>
<hr/>
<p>Chance rolls his dice one desperate time. He attempts a flat check (DC 11). On a success, the triggering damage is halved and he immediately drinks a <strong>potion of moderate healing</strong> (regaining @Damage[3d8+10[healing]] Hit Points) as a free action. Chance carries two potions of moderate healing and can use this reaction only while he has at least one remaining.</p>`,
		),
	],
};

// =============================================================================
// BARMIES - POWERS-IN-THE-MAKING
// =============================================================================

export const KAYDI: HarbingerNPC = {
	id: 'kaydi-the-dreamer',
	category: 'harbinger-resident',
	data: {
		name: 'Kaydi the Dreamer',
		type: 'npc',
		img: 'systems/pf2e/icons/default-icons/npc.svg',
		system: {
			abilities: {
				str: { mod: -2 },
				dex: { mod: -1 },
				con: { mod: -1 },
				int: { mod: 0 },
				wis: { mod: -1 },
				cha: { mod: 1 },
			},
			attributes: {
				hp: { value: 32, max: 32, temp: 0, details: '' },
				ac: { value: 18, details: 'only while asleep; any action to defend breaks her catatonia' },
				speed: { value: 0, otherSpeeds: [] },
				immunities: [{ type: 'mental', exceptions: [] }, { type: 'sleep' }],
			},
			perception: { mod: 14, details: 'aware only through dreams' },
			details: {
				level: { value: 8 },
				alignment: { value: 'NG' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Catatonic teenage girl whose dreaming mind devours nearby thought',
				publicNotes: `<p><strong>Kaydi</strong> is a teenage human girl who has lain almost constantly catatonic since her eighth birthday. The blankness of her own mind projects outward, rewriting the reality of the room around her. Of all of Harbinger House's powers-to-be, she is the closest to ascension — killing her risks releasing a weak, angry demipower of sleep into the multiverse.</p>
<p><strong>Stupor Field:</strong> A 15-foot aura of sleep that drags nearby minds into catatonia. The effects scale with proximity — see the "Stupor Field" action for exact values. This hazard is also statted separately as <em>Kaydi's Mind Trap</em>.</p>
<p><strong>Waking Kaydi:</strong> Shaking her requires a creature already inside the aura to reach her and spend 3 Interact actions. Once awake, she is lucid for only 2 rounds before falling asleep again — just long enough for the door to reappear and for the PCs to flee.</p>
<p><strong>Noncombatant:</strong> Kaydi never makes attacks. Her only "action" is the Stupor Field aura. If harmed, she does not retaliate; she simply dies and releases her latent power (see GM note about premature ascension).</p>`,
				privateNotes: `<p>If killed, Kaydi ascends prematurely as a demipower of sleep. Before departing, she uses <em>dream storm</em> on as many PCs as possible, and the affected PCs are troubled by nightmares for 1d6 months (frightened 1 while in the nightmare state, can only be ended by finding Kaydi and performing a service for her).</p>`,
			},
			saves: {
				fortitude: { value: 14, saveDetail: '' },
				reflex: { value: 12, saveDetail: '' },
				will: { value: 19, saveDetail: '+2 status to saves vs. mental effects while asleep' },
			},
			skills: {},
			traits: {
				value: ['unique', 'human', 'humanoid'],
				rarity: 'unique',
				size: { value: 'med' },
				languages: {
					value: ['common'],
					details: '',
				},
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'kaydi-the-dreamer',
				category: 'harbinger-resident',
			},
		},
		prototypeToken: {
			name: 'Kaydi',
			displayName: 20,
			actorLink: true,
			disposition: 0,
			texture: { src: 'systems/pf2e/icons/default-icons/npc.svg' },
		},
	},
	items: [
		createAction(
			'Stupor Field',
			'passive',
			['aura', 'incapacitation', 'mental', 'sleep'],
			`<p><strong>Aura</strong> 15 feet</p>
<p>Kaydi's blank, dreaming mind pushes outward, dragging everything within into the same empty stupor. At the start of each of its turns, a creature in the aura must attempt a @Check[type:will|dc:26] save. The effect on a failure depends on the creature's distance from Kaydi.</p>
<p><strong>Critical Success</strong> The creature is unaffected this round and gains a +2 circumstance bonus to saves against the Stupor Field until the start of its next turn.</p>
<p><strong>Success</strong> The creature takes @Damage[4[mental]] damage.</p>
<p><strong>Failure</strong> The creature takes mental damage based on distance from Kaydi:</p>
<ul>
<li>Within 5 feet: @Damage[4d8[mental]] damage</li>
<li>5 to 10 feet: @Damage[3d6[mental]] damage</li>
<li>10 to 15 feet: @Damage[2d6[mental]] damage</li>
</ul>
<p><strong>Critical Failure</strong> As failure, but damage is doubled and the creature is <strong>slowed 1</strong> until the start of its next turn.</p>
<hr/>
<p>A creature reduced to 0 HP by Stupor Field does not die — it falls into a catatonic sleep and can only be awakened by removing it from the aura. Lost HP return at a rate of 1 per round once clear of the effect.</p>`,
			[
				{
					key: 'Aura',
					slug: 'stupor-field',
					radius: 15,
					traits: ['incapacitation', 'mental', 'sleep'],
				},
			],
		),
		createAction(
			'Wake Her',
			'passive',
			[],
			`<p>A creature adjacent to Kaydi can spend 3 Interact actions to gently shake her awake. A <em>remove paralysis</em>, <em>restoration</em>, or equivalent effect wakes her instantly but only for a few seconds. Once awake, the Stupor Field suppresses, the hidden door to the room reappears, and the bedroom illusion fades. Kaydi remains awake for 2 rounds before falling back into catatonia; the aura resumes at the end of the 2nd round.</p>`,
		),
		createAction(
			'Premature Ascension',
			'reaction',
			[],
			`<p><strong>Trigger</strong> Kaydi is reduced to 0 Hit Points.</p>
<hr/>
<p>Kaydi's life force escapes as a raw, unfinished power of sleep. She uses <em>dream storm</em> (see the Harbinger House custom spell) against each creature within 60 feet, then vanishes from the Prime and from Sigil. She cannot be raised, resurrected, or revived by any means short of the intervention of a true power.</p>`,
		),
	],
};

export const AZTRAL_OF_THE_MANY_FACES: HarbingerNPC = {
	id: 'aztral-of-the-many-faces',
	category: 'harbinger-resident',
	data: {
		name: 'Aztral of the Many Faces',
		type: 'npc',
		img: 'systems/pf2e/icons/default-icons/npc.svg',
		system: {
			abilities: {
				str: { mod: 0 },
				dex: { mod: 4 },
				con: { mod: 1 },
				int: { mod: 2 },
				wis: { mod: -1 },
				cha: { mod: 0 },
			},
			attributes: {
				hp: { value: 95, max: 95, temp: 0, details: '' },
				ac: { value: 24, details: 'includes Dex, unarmored' },
				speed: { value: 25, otherSpeeds: [] },
			},
			perception: { mod: 11, details: '' },
			details: {
				level: { value: 5 },
				alignment: { value: 'CE' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Schizophrenic barmy who absorbs the talents of those around him',
				publicNotes: `<p><strong>Aztral of the Many Faces</strong> is a schizophrenic barmy whose personality and abilities mirror those around him. Once neutrally inclined, Nari has twisted his instincts: he now mimics anyone he meets as a <em>chaotic evil</em> version of themselves — a dark, laughing reflection wielding a glowing wooden spoon.</p>
<p><strong>Absorption:</strong> Aztral copies a single creature's attributes, combat skill, and even its weapon (rendered as his wooden spoon). While absorbing, his HP, attack, damage, and special abilities mirror the target's. He holds the imitation for 1d6 rounds before needing a new target or reverting to base stats.</p>
<p><strong>Tactic:</strong> On the first round, Aztral chooses the most powerful-looking PC and targets that character with Absorption. During the fight, he repeatedly asks if any PCs are lawful ("Nari has a place at her table for lawful sods...") but will not explain what he means.</p>`,
			},
			saves: {
				fortitude: { value: 12, saveDetail: '' },
				reflex: { value: 15, saveDetail: '' },
				will: { value: 10, saveDetail: '' },
			},
			skills: {
				acrobatics: { base: 13, value: 13, label: 'Acrobatics', visible: true },
				athletics: { base: 11, value: 11, label: 'Athletics', visible: true },
				deception: { base: 11, value: 11, label: 'Deception', visible: true },
				performance: { base: 11, value: 11, label: 'Performance', visible: true },
			},
			traits: {
				value: ['unique', 'human', 'humanoid'],
				rarity: 'unique',
				size: { value: 'med' },
				languages: { value: ['common'], details: '' },
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'aztral-of-the-many-faces',
				category: 'harbinger-resident',
			},
		},
		prototypeToken: {
			name: 'Aztral of the Many Faces',
			displayName: 20,
			actorLink: true,
			disposition: -1,
			texture: { src: 'systems/pf2e/icons/default-icons/npc.svg' },
		},
	},
	items: [
		createStrike(
			'Spoon of Absorption',
			15,
			{ dice: 2, die: '6', type: 'bludgeoning', modifier: 4 },
			['magical'],
			`<p>Aztral's glowing wooden spoon. Functions as a +1 striking club in his hands. When Aztral successfully Absorbs a target, the spoon's damage die increases by one step for 1 minute, and it mimics the reach and traits of the absorbed creature's signature weapon (GM's discretion).</p>`,
		),
		createAction(
			'Absorption',
			1,
			['concentrate', 'divine', 'mental', 'polymorph'],
			`<p><strong>Frequency</strong> once per 1d6 rounds</p>
<p><strong>Requirements</strong> Aztral can see a creature within 30 feet.</p>
<hr/>
<p>Aztral's body ripples like a mirror as he drinks in another mind. The target must succeed at a @Check[type:will|dc:22] or Aztral copies its personality and combat talents.</p>
<p><strong>Critical Success</strong> Aztral fails to absorb anything. He cannot target this creature again this encounter.</p>
<p><strong>Success</strong> The absorption fails, but Aztral can try again next round.</p>
<p><strong>Failure</strong> For 1d6 rounds, Aztral's Hit Points, AC, saves, attack bonus, damage, skills, and special abilities equal those of the target (use the target's statblock, but Aztral's personality becomes a chaotic evil mirror). His wooden spoon mimics the statistics and traits of the target's primary weapon. Aztral retains his own level, alignment, and identity for XP purposes.</p>
<p><strong>Critical Failure</strong> As failure, and the target is also <strong>stupefied 2</strong> for 1 minute from the mental violation.</p>
<hr/>
<p>When the duration ends (or if the target dies or leaves the encounter), Aztral must target another creature with Absorption or revert to his base statistics at the start of his next turn. He cannot hold more than one set of absorbed traits at a time.</p>`,
		),
		createAction(
			'Twisted Mirror',
			'passive',
			['mental'],
			`<p>While Aztral is in the middle of an Absorption, any creature that Strikes him must succeed at a @Check[type:will|dc:22] or be <strong>frightened 1</strong> for 1 round as they see their own warped reflection laughing back at them.</p>`,
		),
		createAction(
			'Call for the Lawful',
			'passive',
			['auditory', 'mental'],
			`<p>Between actions, Aztral loudly asks the PCs whether any of them are lawful, inviting "lawful sods" to Nari's table. This is a taunt, not a mechanical effect, but a PC who answers truthfully in the affirmative is flagged in Nari's scheme — see Chapter 3, Area 33.</p>`,
		),
	],
};

export const GALKIN_FARSEER: HarbingerNPC = {
	id: 'galkin-farseer',
	category: 'harbinger-resident',
	data: {
		name: 'Galkin Farseer',
		type: 'npc',
		img: 'systems/pf2e/icons/default-icons/npc.svg',
		system: {
			abilities: {
				str: { mod: 3 },
				dex: { mod: 3 },
				con: { mod: 2 },
				int: { mod: 2 },
				wis: { mod: 0 },
				cha: { mod: 1 },
			},
			attributes: {
				hp: { value: 170, max: 170, temp: 0, details: '' },
				ac: { value: 28, details: '' },
				speed: { value: 25, otherSpeeds: [] },
				immunities: [{ type: 'electricity' }],
			},
			perception: { mod: 19, details: 'sees every world at once — cannot be flat-footed to invisible creatures' },
			details: {
				level: { value: 10 },
				alignment: { value: 'CN' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Spell-touched seer whose mind holds every plane at once',
				publicNotes: `<p><strong>Galkin Farseer</strong> sees every world of the multiverse simultaneously, and the noise has driven him mad. The magical windows in his tower chamber let him transfer individual images out of his head, granting brief moments of clarity. He is what the Believers of the Source call "spell-touched" — his body embodies the living essence of a <em>lightning bolt</em> spell.</p>
<p><strong>Bolt Form:</strong> Galkin can briefly discorporate into a bolt of lightning, striking every creature in a 100-foot line. He must succeed at a Constitution check (flat check DC 14) to transform; on a failure he cannot try again for 1d4 rounds.</p>
<p><strong>Disturbing Him:</strong> Breaking any of his windows is catastrophic — the images rush back into his head and drive him to maximum violence. Kind words and calmly watching the windows with him can calm him enough to talk (DC 25 Diplomacy over 3 rounds).</p>`,
			},
			saves: {
				fortitude: { value: 18, saveDetail: '' },
				reflex: { value: 21, saveDetail: '' },
				will: { value: 16, saveDetail: "+1 status vs. effects that reveal information he doesn't want" },
			},
			skills: {
				acrobatics: { base: 19, value: 19, label: 'Acrobatics', visible: true },
				athletics: { base: 19, value: 19, label: 'Athletics', visible: true },
				arcana: { base: 17, value: 17, label: 'Arcana', visible: true },
				occultism: { base: 17, value: 17, label: 'Occultism', visible: true },
				planarLore: { base: 22, value: 22, label: 'Planar Lore', visible: true, lore: true },
			},
			traits: {
				value: ['unique', 'human', 'humanoid'],
				rarity: 'unique',
				size: { value: 'med' },
				languages: { value: ['common'], details: 'Planar Trade' },
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'galkin-farseer',
				category: 'harbinger-resident',
			},
		},
		prototypeToken: {
			name: 'Galkin Farseer',
			displayName: 20,
			actorLink: true,
			disposition: -1,
			texture: { src: 'systems/pf2e/icons/default-icons/npc.svg' },
		},
	},
	items: [
		createStrike(
			'Short Sword of Quickness',
			22,
			{ dice: 2, die: '6', type: 'piercing', modifier: 7 },
			['agile', 'finesse', 'magical', 'versatile-s'],
			`<p>+2 striking short sword. On the first round of combat, Galkin automatically acts before every other combatant (treat as initiative 40) if he is holding this weapon when initiative is rolled.</p>`,
			[
				{
					key: 'FlatModifier',
					selector: 'initiative',
					value: 20,
					label: 'Short Sword of Quickness (first round only)',
				},
			],
		),
		createAction(
			'Become the Bolt',
			2,
			['arcane', 'electricity', 'polymorph'],
			`<p>Galkin attempts a <strong>flat check DC 14</strong> to discorporate. On a success, he becomes a 100-foot line of lightning originating from his square. Each creature in the line takes @Damage[6d12[electricity]] damage (@Check[type:reflex|dc:29] basic save). At the end of the action, Galkin reforms in any unoccupied square along the line. On a failure, the action is lost and Galkin cannot attempt to Become the Bolt again for 1d4 rounds. While in bolt form, he is <strong>immune</strong> to all damage and effects.</p>`,
		),
		createAction(
			'Step Through the Window',
			1,
			['arcane', 'concentrate'],
			`<p><strong>Frequency</strong> once per window, per day</p>
<p><strong>Requirements</strong> Galkin is within 5 feet of one of his windows.</p>
<hr/>
<p>Galkin shoves a jarring stream of visions into the window in front of him, clearing his head for a single round. Until the start of his next turn, he gains a <strong>+2 circumstance bonus</strong> to all checks and DCs, and he gains <strong>truesight 60 feet</strong>. If the window is broken or destroyed before then, the bonus ends immediately and Galkin becomes <strong>confused</strong> for 1 round as the trapped images flood back.</p>`,
		),
		createAction(
			'Shattered Concentration',
			'reaction',
			['mental'],
			`<p><strong>Trigger</strong> A creature breaks or destroys one of Galkin's windows.</p>
<hr/>
<p>The returning images drive Galkin berserk. He gains a <strong>+2 status bonus</strong> to attack rolls and damage, and a <strong>-2 status penalty</strong> to AC and Will saves, for 1 minute. While Shattered Concentration is active, he automatically succeeds at the flat check to Become the Bolt, and he must use Become the Bolt as his first action each round if he can.</p>`,
		),
	],
};

export const GORG_REDEYES: HarbingerNPC = {
	id: 'gorg-redeyes',
	category: 'harbinger-resident',
	data: {
		name: 'Gorg Redeyes',
		type: 'npc',
		img: 'systems/pf2e/icons/default-icons/npc.svg',
		system: {
			abilities: {
				str: { mod: 2 },
				dex: { mod: 1 },
				con: { mod: 1 },
				int: { mod: 1 },
				wis: { mod: 0 },
				cha: { mod: 3 },
			},
			attributes: {
				hp: { value: 62, max: 62, temp: 0, details: '' },
				ac: { value: 21, details: '' },
				speed: { value: 35, otherSpeeds: [] },
			},
			perception: { mod: 10, details: '' },
			details: {
				level: { value: 4 },
				alignment: { value: 'CN' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Manic-depressive bariaur sculptor who petrifies his subjects',
				publicNotes: `<p><strong>Gorg Redeyes</strong> is a bariaur barmy who tends a miniature forest beneath Arborea's sunlight. He considers himself an artist — he waits until a living subject strikes just the right pose, then petrifies them with his gaze. Afterward, he agonizes over what he has done before swinging back into manic glee at the finished "statue."</p>
<p><strong>Mood Swings:</strong> When the PCs arrive, Gorg is in his manic phase and attacks immediately with his Petrifying Gaze. After two creatures are turned to stone, his mood flips: he becomes severely depressed, demands the PCs leave, and will not willingly attack again this encounter. Shouting, mockery, or threats flip him back into mania.</p>
<p><strong>Nari's Disciple:</strong> Gorg is convinced Nari is already a power, and speaks of her with reverent devotion.</p>`,
			},
			saves: {
				fortitude: { value: 11, saveDetail: '' },
				reflex: { value: 13, saveDetail: '' },
				will: { value: 8, saveDetail: '-2 to saves vs. emotion while in a manic or depressive phase' },
			},
			skills: {
				acrobatics: { base: 11, value: 11, label: 'Acrobatics', visible: true },
				athletics: { base: 12, value: 12, label: 'Athletics', visible: true },
				crafting: { base: 11, value: 11, label: 'Crafting', visible: true },
				nature: { base: 10, value: 10, label: 'Nature', visible: true },
				sculptureLore: { base: 13, value: 13, label: 'Sculpture Lore', visible: true, lore: true },
			},
			traits: {
				value: ['unique', 'humanoid', 'bariaur'],
				rarity: 'unique',
				size: { value: 'lg' },
				languages: { value: ['common'], details: 'Planar Trade' },
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'gorg-redeyes',
				category: 'harbinger-resident',
			},
		},
		prototypeToken: {
			name: 'Gorg Redeyes',
			displayName: 20,
			actorLink: true,
			disposition: -1,
			texture: { src: 'systems/pf2e/icons/default-icons/npc.svg' },
		},
	},
	items: [
		systemWeapon('dagger'),
		createStrike(
			'Horn Ram',
			13,
			{ dice: 1, die: '10', type: 'bludgeoning', modifier: 4 },
			['forceful'],
			`<p>Gorg lowers his head and charges, striking with his horns.</p>`,
		),
		createAction(
			'Petrifying Gaze',
			1,
			['aura', 'concentrate', 'incapacitation', 'primal', 'visual'],
			`<p><strong>Frequency</strong> three times per day</p>
<hr/>
<p>Gorg fixes a creature he can see within 30 feet with his glowing red eyes. The target must attempt a @Check[type:fortitude|dc:22].</p>
<p><strong>Critical Success</strong> The target is unaffected and is temporarily immune to Petrifying Gaze for 24 hours.</p>
<p><strong>Success</strong> The target is <strong>slowed 1</strong> for 1 round as its limbs stiffen.</p>
<p><strong>Failure</strong> The target is <strong>slowed 2</strong> for 1 round, and at the start of its next turn must succeed at another Fortitude save or be <strong>petrified</strong> permanently.</p>
<p><strong>Critical Failure</strong> The target is immediately <strong>petrified</strong> permanently. Two <em>scrolls of stone to flesh</em> found in Area 27 can reverse this condition.</p>`,
		),
		createAction(
			'Mood Swing',
			'reaction',
			['emotion', 'mental'],
			`<p><strong>Trigger</strong> A creature is petrified by Gorg's Petrifying Gaze, <em>or</em> a creature hurls a sharp insult at him.</p>
<hr/>
<p>Gorg's mood flips. He gains either the <strong>manic</strong> or <strong>depressive</strong> state, whichever he is not currently in.</p>
<ul>
<li><strong>Manic:</strong> +1 circumstance bonus to attack rolls, Petrifying Gaze, and damage. Must use Petrifying Gaze as his first action each round if he can.</li>
<li><strong>Depressive:</strong> -2 circumstance penalty to attack rolls and damage, cannot use Petrifying Gaze. Gains resistance 5 to all damage as he curls inward.</li>
</ul>
<p>When he flips to depressive after two creatures have been petrified in a single encounter, he will not willingly attack again for the rest of that encounter unless provoked by shouting, mockery, or a direct Strike.</p>`,
		),
		...createSpellcastingEntryWithSpells('Primal Innate Spells', 'primal', 11, 22, [
			['dizzyingColors', 1],
			['grease', 1],
		]),
	],
};

export const TOMIN_THE_FIGMENT_MAKER: HarbingerNPC = {
	id: 'tomin-the-figment-maker',
	category: 'harbinger-resident',
	data: {
		name: 'Tomin the Figment-Maker',
		type: 'npc',
		img: 'systems/pf2e/icons/default-icons/npc.svg',
		system: {
			abilities: {
				str: { mod: 3 },
				dex: { mod: 2 },
				con: { mod: 2 },
				int: { mod: 1 },
				wis: { mod: 2 },
				cha: { mod: 0 },
			},
			attributes: {
				hp: { value: 135, max: 135, temp: 0, details: '' },
				ac: { value: 27, details: '+2 item bonus from cloak of figments' },
				speed: { value: 25, otherSpeeds: [] },
				immunities: [{ type: 'emotion' }],
			},
			perception: { mod: 15, details: '' },
			details: {
				level: { value: 8 },
				alignment: { value: 'CE' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Cruel barmy cloaked in his own imagined shadow-creatures',
				publicNotes: `<p><strong>Tomin</strong> is a tall, wiry, cruel barmy with greasy hair and a wide, gap-toothed grin. He wears his <em>cloak of figments</em> — a writhing cape of tiny shadow-creatures that are literally figments of his own imagination made real by his unhinged mind.</p>
<p><strong>Figments:</strong> Tomin peels figments off his cloak and hurls them at enemies. Figments come in three sizes (small, medium, large) and have the chilling property that they are only "real" to those who believe them. A PC who fails a Will save against an attacking figment takes real damage; if even one PC in a group fails the save, the figment becomes real for everyone.</p>
<p><strong>Addled Devotion:</strong> Tomin cackles about Nari with cracked, childlike adoration. He insists the Lady of Pain cannot see anyone inside Harbinger House — "that's why Nari's going to win!"</p>`,
			},
			saves: {
				fortitude: { value: 17, saveDetail: '' },
				reflex: { value: 15, saveDetail: '' },
				will: { value: 18, saveDetail: '+2 status vs. charm and illusion effects' },
			},
			skills: {
				athletics: { base: 16, value: 16, label: 'Athletics', visible: true },
				deception: { base: 14, value: 14, label: 'Deception', visible: true },
				intimidation: { base: 14, value: 14, label: 'Intimidation', visible: true },
				occultism: { base: 15, value: 15, label: 'Occultism', visible: true },
				stealth: { base: 16, value: 16, label: 'Stealth', visible: true },
			},
			traits: {
				value: ['unique', 'human', 'humanoid'],
				rarity: 'unique',
				size: { value: 'med' },
				languages: { value: ['common'], details: 'Planar Trade' },
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'tomin-the-figment-maker',
				category: 'harbinger-resident',
			},
		},
		prototypeToken: {
			name: 'Tomin',
			displayName: 20,
			actorLink: true,
			disposition: -1,
			texture: { src: 'systems/pf2e/icons/default-icons/npc.svg' },
		},
	},
	items: [
		createStrike(
			'Broad Sword +1',
			18,
			{ dice: 2, die: '8', type: 'slashing', modifier: 6 },
			['magical', 'versatile-p'],
			'Tomin wields this enchanted broad sword in his off hand while commanding his figments.',
		),
		createAction(
			'Charm and Illusion Immunity',
			'passive',
			[],
			`<p>Tomin's fractured mind is its own illusion — outside illusions slide off him. He gains a +2 status bonus to saving throws against spells and effects with the <strong>charm</strong> or <strong>illusion</strong> trait.</p>`,
			[
				{
					key: 'FlatModifier',
					selector: 'saving-throw',
					value: 2,
					type: 'status',
					predicate: [{ or: ['item:trait:charm', 'item:trait:illusion'] }],
					label: 'Charm and Illusion Immunity',
				},
			],
		),
		createAction(
			'Release Figments',
			1,
			['concentrate', 'illusion', 'occult', 'summon'],
			`<p><strong>Frequency</strong> once per round</p>
<hr/>
<p>Tomin peels figments from his cloak. Choose one configuration:</p>
<ul>
<li><strong>Four small figments</strong> (level 1)</li>
<li><strong>Two medium figments</strong> (level 4)</li>
<li><strong>One large figment</strong> (level 7)</li>
</ul>
<p>The figments appear in unoccupied squares within 30 feet and act on Tomin's initiative. Tomin can have at most 4 small, 2 medium, or 1 large figment in play at a time (cumulative bulk: 4 small = 2 medium = 1 large). See the <em>Figment (Small/Medium/Large)</em> statblocks for their combat abilities.</p>
<p>A figment's attacks are harmless to any creature that succeeds at a @Check[type:will|dc:25] against it — but if <em>any</em> creature in the group fails, the figment becomes real to <strong>all</strong> of them and deals full damage. Each creature attempts its own save the first time a figment attacks it, and the save applies for the whole encounter.</p>`,
		),
		createAction(
			'Dismiss Figments',
			'free',
			['concentrate'],
			`<p>Tomin dissolves one of his active figments as a free action, reclaiming it into his cloak. He may then use Release Figments again on his next turn without waiting for the frequency.</p>`,
		),
		createAction(
			'Nari Cackle',
			'passive',
			['auditory', 'emotion', 'mental'],
			`<p>Each round, Tomin laughs hysterically about Nari and the Lady of Pain. Any creature that starts its turn within 30 feet of Tomin and can hear him must succeed at a @Check[type:will|dc:24] or take a -1 status penalty to saves against mental effects for 1 round.</p>`,
		),
	],
};

export const VORINA: HarbingerNPC = {
	id: 'vorina-of-the-sensates',
	category: 'harbinger-resident',
	data: {
		name: 'Vorina',
		type: 'npc',
		img: 'systems/pf2e/icons/default-icons/npc.svg',
		system: {
			abilities: {
				str: { mod: -1 },
				dex: { mod: 3 },
				con: { mod: 4 },
				int: { mod: 1 },
				wis: { mod: 4 },
				cha: { mod: 4 },
			},
			attributes: {
				hp: { value: 135, max: 135, temp: 0, details: '' },
				ac: { value: 25, details: '' },
				speed: { value: 25, otherSpeeds: [] },
			},
			perception: { mod: 16, details: '' },
			details: {
				level: { value: 8 },
				alignment: { value: 'CG' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Sensate cleric-cook whose kitchen feeds Harbinger House',
				publicNotes: `<p><strong>Vorina</strong> is one of Harbinger House's two cooks — a cheerful Sensate priest who believes that food prepared with love is a sacrament. Her kitchen is the softer half of the kitchen; she works in counterpoint to Teela, and the tension between them keeps Harbinger House's meals strange, delicious, and vaguely ominous.</p>
<p><strong>Feast Domain:</strong> Vorina never lets the barmies go hungry. She has innate abilities to conjure food and water, speed plant growth, purify meals, and heal the injured. In a pinch, she will use those same abilities to stabilize dying PCs.</p>
<p><strong>Not a Warrior:</strong> Vorina would much rather bake bread than fight. She uses her healing and support spells on allies — including friendly PCs — and only attacks in self-defense.</p>`,
			},
			saves: {
				fortitude: { value: 18, saveDetail: '' },
				reflex: { value: 15, saveDetail: '' },
				will: { value: 19, saveDetail: '' },
			},
			skills: {
				diplomacy: { base: 18, value: 18, label: 'Diplomacy', visible: true },
				medicine: { base: 18, value: 18, label: 'Medicine', visible: true },
				nature: { base: 16, value: 16, label: 'Nature', visible: true },
				performance: { base: 16, value: 16, label: 'Performance', visible: true },
				religion: { base: 18, value: 18, label: 'Religion', visible: true },
				cookingLore: { base: 20, value: 20, label: 'Cooking Lore', visible: true, lore: true },
			},
			traits: {
				value: ['unique', 'human', 'humanoid'],
				rarity: 'unique',
				size: { value: 'med' },
				languages: { value: ['common'], details: 'Planar Trade' },
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'vorina-of-the-sensates',
				category: 'harbinger-resident',
			},
		},
		prototypeToken: {
			name: 'Vorina',
			displayName: 20,
			actorLink: true,
			disposition: 1,
			texture: { src: 'systems/pf2e/icons/default-icons/npc.svg' },
		},
	},
	items: [
		createStrike(
			'Ladle',
			11,
			{ dice: 1, die: '6', type: 'bludgeoning', modifier: 3 },
			['nonlethal'],
			`<p>Vorina's heavy iron kitchen ladle. She hits things with it only as an absolute last resort — though she does know how to swing it.</p>`,
		),
		createAction(
			'Create Food',
			2,
			['concentrate', 'divine', 'manipulate'],
			`<p><strong>Frequency</strong> three times per day</p>
<hr/>
<p>Vorina fills a 5-foot square with enough food and clean water to feed 6 Medium creatures for 1 day. The food is plain but wholesome and tastes of home — creatures that eat it gain a +1 status bonus to saves against fear for 24 hours.</p>`,
		),
		createAction(
			'Plant Growth',
			2,
			['concentrate', 'divine', 'manipulate', 'plant'],
			`<p><strong>Frequency</strong> three times per day</p>
<hr/>
<p>Plants within a 30-foot emanation grow at double speed for 1 minute, becoming dense enough to count as difficult terrain. Any food plants in the area produce a full meal's worth of ripe fruit or vegetables.</p>`,
		),
		...createSpellcastingEntryWithSpells('Divine Prepared Spells', 'divine', 18, 26, [
			['heal', 5],
			['heal', 4],
			['heal', 3],
			['command', 1],
			['silence', 2],
			['blindness', 3],
			['suggestion', 4],
		]),
	],
};

export const TEELA: HarbingerNPC = {
	id: 'teela-of-the-dustmen',
	category: 'harbinger-resident',
	data: {
		name: 'Teela',
		type: 'npc',
		img: 'systems/pf2e/icons/default-icons/npc.svg',
		system: {
			abilities: {
				str: { mod: 0 },
				dex: { mod: 1 },
				con: { mod: -1 },
				int: { mod: 5 },
				wis: { mod: 1 },
				cha: { mod: -1 },
			},
			attributes: {
				hp: { value: 155, max: 155, temp: 0, details: '' },
				ac: { value: 28, details: 'bracers of armor (type II)' },
				speed: { value: 25, otherSpeeds: [] },
				weaknesses: [{ type: 'vitality', value: 10 }],
			},
			perception: { mod: 18, details: '' },
			details: {
				level: { value: 10 },
				alignment: { value: 'CE' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Dustman necromancer whose kitchen mirrors Vorina\'s life with death',
				publicNotes: `<p><strong>Teela</strong> is Harbinger House's second cook — a Dustman wizard whose half of the kitchen is kept cold, sterile, and funerary. She believes all living beings are already dead and the only kindness left is to speed them along. She and Vorina share a kitchen the way opposite poles share a magnet; neither can leave, neither can win.</p>
<p><strong>Staff of Withering:</strong> Teela fights with a gnarled black staff that drains life from its victims. The staff is a +2 striking staff and can be prepared with necromantic spells each day. See the "Withering Touch" action.</p>
<p><strong>Innate Malice:</strong> As a Dustman of unusual power, Teela has developed innate necromantic abilities including <em>vampiric touch</em>, <em>harm</em>, and the ability to drain levels directly from anything living.</p>
<p><strong>The Mirror of Mortality:</strong> Teela's kitchen mirror shows the slow rot of every viewer. Staring into it too long inflicts frightened 1 and drained 1 — see her unique item.</p>`,
			},
			saves: {
				fortitude: { value: 17, saveDetail: '' },
				reflex: { value: 19, saveDetail: '' },
				will: { value: 22, saveDetail: '' },
			},
			skills: {
				arcana: { base: 21, value: 21, label: 'Arcana', visible: true },
				intimidation: { base: 16, value: 16, label: 'Intimidation', visible: true },
				medicine: { base: 17, value: 17, label: 'Medicine', visible: true },
				occultism: { base: 21, value: 21, label: 'Occultism', visible: true },
				religion: { base: 17, value: 17, label: 'Religion', visible: true },
				cookingLore: { base: 19, value: 19, label: 'Cooking Lore', visible: true, lore: true },
			},
			traits: {
				value: ['unique', 'human', 'humanoid'],
				rarity: 'unique',
				size: { value: 'med' },
				languages: { value: ['common', 'necril'], details: 'Planar Trade' },
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'teela-of-the-dustmen',
				category: 'harbinger-resident',
			},
		},
		prototypeToken: {
			name: 'Teela',
			displayName: 20,
			actorLink: true,
			disposition: -1,
			texture: { src: 'systems/pf2e/icons/default-icons/npc.svg' },
		},
	},
	items: [
		createStrike(
			'Staff of Withering',
			20,
			{ dice: 2, die: '4', type: 'bludgeoning', modifier: 4 },
			['magical', 'two-hand-d8'],
			`<p>+2 striking staff of withering. On a hit, the target also takes @Damage[1d6[void]] void damage.</p>`,
			[
				{
					key: 'DamageDice',
					selector: '{item|_id}-damage',
					diceNumber: 1,
					dieSize: 'd6',
					damageType: 'void',
					label: 'Withering Void',
				},
			],
		),
		createAction(
			'Withering Touch',
			2,
			['concentrate', 'magical', 'void'],
			`<p><strong>Frequency</strong> once per day</p>
<hr/>
<p>Teela channels the staff's full withering power into a melee Strike. On a hit, in addition to normal damage, the target must succeed at a @Check[type:fortitude|dc:29] save.</p>
<p><strong>Critical Success</strong> The target is unaffected.</p>
<p><strong>Success</strong> The target is <strong>drained 1</strong>.</p>
<p><strong>Failure</strong> The target is <strong>enfeebled 2</strong> and <strong>drained 1</strong> for 1 minute.</p>
<p><strong>Critical Failure</strong> The target is <strong>enfeebled 3</strong> and <strong>drained 2</strong> for 1 minute.</p>`,
		),
		createAction(
			'Vampiric Touch',
			2,
			['concentrate', 'arcane', 'void'],
			`<p><strong>Frequency</strong> three times per day</p>
<hr/>
<p>Teela makes a melee touch Strike. On a hit, the target takes @Damage[6d6[void]] damage (@Check[type:fortitude|dc:27] basic save), and Teela gains temporary Hit Points equal to half the damage dealt.</p>`,
		),
		createAction(
			'Energy Drain',
			3,
			['concentrate', 'arcane', 'incapacitation', 'void'],
			`<p><strong>Frequency</strong> twice per day</p>
<hr/>
<p>Teela touches a living creature within reach. The target must succeed at a @Check[type:fortitude|dc:29] or become <strong>drained 2</strong> and lose @Damage[4d6[void]] HP (this cannot be reduced by resistances, only by immunity to void). On a critical failure, the target is also <strong>stunned 1</strong>.</p>`,
		),
		...createSpellcastingEntryWithSpells('Arcane Prepared Spells', 'arcane', 20, 29, [
			['fear', 1],
			['magicMissile', 1],
			['blindness', 3],
			['fireball', 3],
			['confusion', 4],
			['phantasmalKiller', 5],
			['waveOfDespair', 5],
			['coneOfCold', 5],
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
	CHANCE_THE_BARMY,
	KAYDI,
	AZTRAL_OF_THE_MANY_FACES,
	GALKIN_FARSEER,
	GORG_REDEYES,
	TOMIN_THE_FIGMENT_MAKER,
	VORINA,
	TEELA,
];

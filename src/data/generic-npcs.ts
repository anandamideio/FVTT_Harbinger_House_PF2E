import type { HarbingerNPC, NPCEntry } from './harbinger-residents';
import {
	createAction,
	createSpellcastingEntryWithSpells,
	createStrike,
	systemAction,
	systemActor,
	systemWeapon,
} from './utils';

// =============================================================================
// FIENDS AND MONSTERS
// =============================================================================

// Dretch → Pusk (remaster rename). Use the system compendium entry directly.
export const DRETCH = systemActor('dretch', 'fiend', 'pusk', 'Pusk (Dretch)');

// Manes → Quasit replacement. Keep sourceId "manes" for backward compatibility.
export const MANES = systemActor('manes', 'fiend', 'quasit', 'Quasit (Manes)');

export const CRANIUM_RAT_SWARM: HarbingerNPC = {
	id: 'cranium-rat-swarm',
	category: 'fiend',
	data: {
		name: 'Cranium Rat Swarm',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/Planescape-CRANIUM-RATS-IN-DISGUISE01.jpg',
		system: {
			abilities: {
				str: { mod: 0 },
				dex: { mod: 4 },
				con: { mod: 2 },
				int: { mod: 2 },
				wis: { mod: 3 },
				cha: { mod: 1 },
			},
			attributes: {
				hp: { value: 60, max: 60, temp: 0, details: '' },
				ac: { value: 21, details: '' },
				speed: { value: 30, otherSpeeds: [{ type: 'climb', value: 15 }] },
				immunities: [{ type: 'precision' }],
				weaknesses: [
					{ type: 'area-damage', value: 5 },
					{ type: 'splash-damage', value: 5 },
				],
				resistances: [{ type: 'physical', value: 5 }],
			},
			perception: { mod: 13, details: 'thoughtsense 30 feet' },
			details: {
				level: { value: 5 },
				alignment: { value: 'NE' },
				creatureType: 'Aberration',
				source: { value: 'Harbinger House' },
				blurb: 'Telepathic rat swarm with collective intelligence',
				publicNotes: `<p>Cranium rats are rats implanted with brain tissue by mind flayers. When gathered in swarms, their collective intelligence allows them to cast spells.</p>
<p><strong>Collective Intelligence:</strong> The swarm's Intelligence increases based on its remaining HP: full HP = Int +2, below 50% = Int +1, below 25% = Int −2. Their spell DCs and attack rolls adjust accordingly.</p>`,
			},
			saves: {
				fortitude: { value: 11, saveDetail: '' },
				reflex: { value: 15, saveDetail: '' },
				will: { value: 12, saveDetail: '' },
			},
			skills: {
				acrobatics: { base: 12, value: 12, label: 'Acrobatics', visible: true },
				stealth: { base: 14, value: 14, label: 'Stealth', visible: true },
			},
			traits: {
				value: ['aberration', 'swarm'],
				rarity: 'uncommon',
				size: { value: 'lg' },
				languages: { value: [], details: 'telepathy 30 feet (among swarm only)' },
				senses: [{ type: 'darkvision' }],
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'cranium-rat-swarm',
				category: 'fiend',
			},
		},
		prototypeToken: {
			name: 'Cranium Rat Swarm',
			displayName: 20,
			actorLink: false,
			disposition: -1,
			texture: { src: 'modules/harbinger-house-pf2e/dist/assets/tokens/Cranium_Rats.png' },
		},
	},
	items: [
		createStrike(
			'Swarming Bites',
			14,
			{ dice: 2, die: '8', type: 'piercing', modifier: 0 },
			[],
			`<p>The swarm surges over creatures in its space, dealing @Damage[2d8[piercing]] damage (@Check[type:reflex|dc:22] basic save).</p>`,
		),
		createAction(
			'Collective Intelligence',
			'passive',
			[],
			`<p>The swarm's Intelligence increases based on its remaining HP: full HP = Int +2, below 50% = Int +1, below 25% = Int −2. Their spell DCs and attack rolls adjust accordingly.</p>`,
		),
		...createSpellcastingEntryWithSpells('Occult Innate Spells', 'occult', 5, 22, [
			['laughingFit', 2],
			['dizzyingColors', 1],
			['command', 1],
		]),
	],
};

// Use the PF2e Gray Ooze directly from system compendium.
export const GRAY_OOZE = systemActor('gray-ooze', 'fiend', 'grayOoze', 'Gray Ooze');

// =============================================================================
// GENERIC NPCs
// =============================================================================

export const DABUS: HarbingerNPC = {
	id: 'dabus',
	category: 'generic-npc',
	data: {
		name: 'Dabus',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/Dabus.webp',
		system: {
			abilities: {
				str: { mod: 3 },
				dex: { mod: 2 },
				con: { mod: 2 },
				int: { mod: 4 },
				wis: { mod: 3 },
				cha: { mod: 0 },
			},
			attributes: {
				hp: { value: 90, max: 90, temp: 0, details: '' },
				ac: { value: 23, details: '' },
				speed: { value: 0, otherSpeeds: [{ type: 'fly', value: 25 }] },
				immunities: [{ type: 'effects targeting ground or air' }],
			},
			perception: { mod: 14, details: '' },
			details: {
				level: { value: 6 },
				alignment: { value: 'N' },
				creatureType: 'Celestial',
				source: { value: 'Harbinger House' },
				blurb: 'Enigmatic servants of the Lady of Pain',
				publicNotes: `<p>Dabus are the enigmatic servants of the Lady of Pain, endlessly maintaining Sigil's streets and structures. They communicate through illusory rebuses that float in the air.</p>
<p><strong>Rebus Communication:</strong> Creatures must succeed at a DC 22 Society check to interpret their meaning.</p>
<p><strong>The Lady's Servants:</strong> If attacked, 1d4 additional dabus arrive each round until the threat is neutralized.</p>`,
			},
			saves: {
				fortitude: { value: 12, saveDetail: '' },
				reflex: { value: 14, saveDetail: '' },
				will: { value: 15, saveDetail: '' },
			},
			skills: {
				acrobatics: { base: 14, value: 14, label: 'Acrobatics', visible: true },
				crafting: { base: 16, value: 16, label: 'Crafting', visible: true },
				society: { base: 14, value: 14, label: 'Society', visible: true },
				stealth: { base: 12, value: 12, label: 'Stealth', visible: true },
			},
			traits: {
				value: ['celestial'],
				rarity: 'uncommon',
				size: { value: 'med' },
				languages: { value: [], details: 'telepathy 100 feet (rebuses only)' },
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'dabus',
				category: 'generic-npc',
			},
		},
		prototypeToken: {
			name: 'Dabus',
			displayName: 20,
			actorLink: false,
			disposition: 0,
			texture: { src: 'modules/harbinger-house-pf2e/dist/assets/tokens/Dabus.png' },
		},
	},
	items: [
		createStrike('Tool', 15, { dice: 2, die: '8', type: 'bludgeoning', modifier: 5 }, ['versatile-s']),
		createAction(
			'Rebus Communication',
			'passive',
			[],
			`<p>Dabus communicate through illusory rebuses that float in the air. Creatures must succeed at a DC 22 Society check to interpret their meaning.</p>`,
		),
		createAction(
			'Civic Duty',
			'passive',
			[],
			`<p>Dabus gain a +2 circumstance bonus to Crafting checks to repair structures or trim razorvine.</p>`,
			[
				{
					key: 'FlatModifier',
					selector: 'crafting',
					value: 2,
					type: 'circumstance',
					predicate: ['action:repair'],
					label: 'Civic Duty',
				},
			],
		),
		createAction(
			"The Lady's Servants",
			'passive',
			[],
			`<p>If the dabus are attacked, they can call for reinforcements. 1d4 additional dabus arrive each round until the threat is neutralized.</p>`,
		),
	],
};

export const HARMONIUM_AGENT: HarbingerNPC = {
	id: 'harmonium-agent',
	category: 'generic-npc',
	data: {
		name: 'Harmonium Agent',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/PGFactionHarmonium.webp',
		system: {
			abilities: {
				str: { mod: 4 },
				dex: { mod: 1 },
				con: { mod: 3 },
				int: { mod: 1 },
				wis: { mod: 2 },
				cha: { mod: 2 },
			},
			attributes: {
				hp: { value: 75, max: 75, temp: 0, details: '' },
				ac: { value: 23, details: '' },
				speed: { value: 20, otherSpeeds: [] },
			},
			perception: { mod: 12, details: '' },
			details: {
				level: { value: 5 },
				alignment: { value: 'LG' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Harmonium law enforcement',
				publicNotes: `<p>Harmonium agents (also called Hardheads) enforce law and order throughout Sigil. They work under Narcovi's direction in the murder investigation.</p>`,
			},
			saves: {
				fortitude: { value: 14, saveDetail: '' },
				reflex: { value: 10, saveDetail: '' },
				will: { value: 11, saveDetail: '' },
			},
			skills: {
				athletics: { base: 13, value: 13, label: 'Athletics', visible: true },
				intimidation: { base: 11, value: 11, label: 'Intimidation', visible: true },
				legalLore: { base: 10, value: 10, label: 'Legal Lore', visible: true, lore: true },
				society: { base: 10, value: 10, label: 'Society', visible: true },
			},
			traits: {
				value: ['human', 'humanoid'],
				rarity: 'common',
				size: { value: 'med' },
				languages: { value: ['common'], details: '' },
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'harmonium-agent',
				category: 'generic-npc',
			},
		},
		prototypeToken: {
			name: 'Harmonium Agent',
			displayName: 20,
			actorLink: false,
			disposition: 1,
			texture: { src: 'modules/harbinger-house-pf2e/dist/assets/tokens/Harmonium.png' },
		},
	},
	items: [
		createStrike(
			'Scimitar',
			14,
			{ dice: 2, die: '6', type: 'slashing', modifier: 5 },
			[],
			`<p>Standard Harmonium sidearm for close-quarters arrests and skirmishes.</p>`,
		),
		systemAction('attackOfOpportunity'),
		createAction(
			'Hardhead Tactics',
			'passive',
			[],
			`<p>When a Harmonium agent succeeds at an Athletics check to Shove, the target is also flat-footed until the end of the agent's next turn.</p>`,
		),
		createAction(
			'Arrest',
			1,
			[],
			`<p>The agent can attempt to Grapple a creature. On a success, they can also attempt to apply manacles as part of the same action.</p>`,
		),
	],
};

export const ANARCHIST: HarbingerNPC = {
	id: 'anarchist',
	category: 'generic-npc',
	data: {
		name: 'Anarchist',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/anarchist.webp',
		system: {
			abilities: {
				str: { mod: 4 },
				dex: { mod: 4 },
				con: { mod: 3 },
				int: { mod: 1 },
				wis: { mod: 2 },
				cha: { mod: 2 },
			},
			attributes: {
				hp: { value: 110, max: 110, temp: 0, details: '' },
				ac: { value: 25, details: '' },
				speed: { value: 25, otherSpeeds: [] },
			},
			perception: { mod: 13, details: '' },
			details: {
				level: { value: 7 },
				alignment: { value: 'CN' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Revolutionary League member',
				publicNotes: `<p>Anarchists are members of the Revolutionary League who oppose all authority and work to tear down established power structures.</p>`,
			},
			saves: {
				fortitude: { value: 14, saveDetail: '' },
				reflex: { value: 17, saveDetail: '' },
				will: { value: 13, saveDetail: '' },
			},
			skills: {
				acrobatics: { base: 15, value: 15, label: 'Acrobatics', visible: true },
				athletics: { base: 15, value: 15, label: 'Athletics', visible: true },
				deception: { base: 13, value: 13, label: 'Deception', visible: true },
				stealth: { base: 15, value: 15, label: 'Stealth', visible: true },
			},
			traits: {
				value: ['human', 'humanoid'],
				rarity: 'common',
				size: { value: 'med' },
				languages: { value: ['common'], details: '' },
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'anarchist',
				category: 'generic-npc',
			},
		},
		prototypeToken: {
			texture: { src: 'modules/harbinger-house-pf2e/dist/assets/tokens/anarchist.png' },
		},
	},
	items: [
		createStrike(
			'Shortsword',
			17,
			{ dice: 2, die: '6', type: 'piercing', modifier: 6 },
			['agile', 'finesse', 'versatile-s'],
			`<p>An anarchist's preferred close weapon for quick, mobile strikes.</p>`,
		),
		createAction(
			'Sneak Attack',
			'passive',
			[],
			`<p>The anarchist deals an extra 2d6 precision damage to flat-footed creatures.</p>`,
			[
				{
					key: 'DamageDice',
					selector: 'strike-damage',
					diceNumber: 2,
					dieSize: 'd6',
					category: 'precision',
					predicate: ['target:condition:off-guard'],
					label: 'Sneak Attack',
				},
			],
		),
		createAction(
			'Revolutionary Fervor',
			'passive',
			[],
			`<p>The anarchist gains a +2 circumstance bonus to saves against effects that would make them change their beliefs or follow authority.</p>`,
		),
		createAction(
			'Sudden Strike',
			'free',
			[],
			`<p><strong>Trigger</strong> The anarchist rolls initiative.</p>
<p><strong>Effect</strong> The anarchist can Stride up to half their Speed.</p>`,
		),
	],
};

export const XERO_BAOX: HarbingerNPC = {
	id: 'xero-baox',
	category: 'generic-npc',
	data: {
		name: 'Xero Baox',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/Xero.jpg',
		system: {
			abilities: {
				str: { mod: 5 },
				dex: { mod: 4 },
				con: { mod: 4 },
				int: { mod: 2 },
				wis: { mod: 2 },
				cha: { mod: 3 },
			},
			attributes: {
				hp: { value: 210, max: 210, temp: 0, details: '' },
				ac: { value: 33, details: '' },
				speed: { value: 25, otherSpeeds: [] },
				resistances: [{ type: 'fire', value: 5 }],
			},
			perception: { mod: 20, details: '' },
			details: {
				level: { value: 12 },
				alignment: { value: 'CE' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Revolutionary League leader with a bard slaying arrow',
				publicNotes: `<p><strong>Xero Baox</strong> is a prominent Anarchist leader who hates authority and loves revolution. He possesses a special arrow that can slay bards instantly.</p>`,
			},
			saves: {
				fortitude: { value: 23, saveDetail: '' },
				reflex: { value: 21, saveDetail: '' },
				will: { value: 19, saveDetail: '' },
			},
			skills: {
				acrobatics: { base: 21, value: 21, label: 'Acrobatics', visible: true },
				athletics: { base: 24, value: 24, label: 'Athletics', visible: true },
				deception: { base: 20, value: 20, label: 'Deception', visible: true },
				intimidation: { base: 22, value: 22, label: 'Intimidation', visible: true },
				stealth: { base: 21, value: 21, label: 'Stealth', visible: true },
				warfareLore: { base: 18, value: 18, label: 'Warfare Lore', visible: true, lore: true },
			},
			traits: {
				value: ['unique', 'tiefling', 'humanoid'],
				rarity: 'unique',
				size: { value: 'med' },
				languages: { value: ['common', 'infernal'], details: '' },
				senses: [{ type: 'darkvision' }],
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'xero-baox',
				category: 'generic-npc',
			},
		},
	},
	items: [
		createStrike(
			'Longsword +1',
			25,
			{ dice: 3, die: '8', type: 'slashing', modifier: 10 },
			['magical', 'versatile-p'],
			`<p>+1 striking longsword carried by Xero for brutal close combat.</p>`,
		),
		createStrike(
			'Composite Longbow',
			23,
			{ dice: 3, die: '8', type: 'piercing', modifier: 8 },
			[],
			`<p>Ranged bow strike (range increment 100 feet).</p>`,
		),
		systemAction('attackOfOpportunity'),
		createAction(
			'Bard Slaying Arrow',
			1,
			['magical'],
			`<p>Xero fires the slaying arrow. If it hits a bard, that creature must succeed at a @Check[type:fortitude|dc:32] or die instantly. On a success, the target takes @Damage[10d10[piercing]] damage.</p>`,
		),
		createAction(
			'Fanatic Assault',
			2,
			[],
			`<p>Xero makes two Strikes. If both hit the same target, the target is flat-footed against Xero until the end of Xero's next turn.</p>`,
		),
	],
};

export const LADYS_CULTIST: HarbingerNPC = {
	id: 'ladys-cultist',
	category: 'cultist',
	data: {
		name: "Lady's Cultist",
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/ladys-cultist.jpg',
		system: {
			abilities: {
				str: { mod: 0 },
				dex: { mod: 1 },
				con: { mod: 0 },
				int: { mod: 0 },
				wis: { mod: 1 },
				cha: { mod: 2 },
			},
			attributes: {
				hp: { value: 12, max: 12, temp: 0, details: '' },
				ac: { value: 13, details: '' },
				speed: { value: 25, otherSpeeds: [] },
			},
			perception: { mod: 4, details: '' },
			details: {
				level: { value: 0 },
				alignment: { value: 'N' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Member of Those Who Court the Lady',
				publicNotes: `<p>Members of <strong>Those Who Court the Lady</strong> have been inspired by Trolan's words to openly worship the Lady of Pain—a practice that traditionally leads to death.</p>
<p><strong>Devoted:</strong> The cultist gains a +2 circumstance bonus to saves against fear effects related to the Lady of Pain.</p>
<p><strong>Willing Sacrifice:</strong> The cultist does not attempt to flee or defend themselves against the Lady of Pain or her servants.</p>`,
			},
			saves: {
				fortitude: { value: 2, saveDetail: '' },
				reflex: { value: 3, saveDetail: '' },
				will: { value: 6, saveDetail: '' },
			},
			skills: {
				diplomacy: { base: 5, value: 5, label: 'Diplomacy', visible: true },
				performance: { base: 5, value: 5, label: 'Performance', visible: true },
				religion: { base: 4, value: 4, label: 'Religion', visible: true },
			},
			traits: {
				value: ['human', 'humanoid'],
				rarity: 'common',
				size: { value: 'med' },
				languages: { value: ['common'], details: '' },
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'ladys-cultist',
				category: 'cultist',
			},
		},
		prototypeToken: {
			texture: { src: 'modules/harbinger-house-pf2e/dist/assets/tokens/ladys-cultist.png' },
		},
	},
	items: [
		createStrike('Fist', 3, { dice: 1, die: '4', type: 'bludgeoning', modifier: 0 }, ['agile', 'nonlethal']),
		createAction(
			'Devoted',
			'passive',
			[],
			`<p>The cultist gains a +2 circumstance bonus to saves against fear effects related to the Lady of Pain.</p>`,
		),
		createAction(
			'Willing Sacrifice',
			'passive',
			[],
			`<p>The cultist does not attempt to flee or defend themselves against the Lady of Pain or her servants.</p>`,
		),
	],
};

export const BARMY: HarbingerNPC = {
	id: 'barmy',
	category: 'cultist',
	data: {
		name: 'Barmy',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/Barmy.png',
		system: {
			abilities: {
				str: { mod: 2 },
				dex: { mod: 1 },
				con: { mod: 2 },
				int: { mod: 2 },
				wis: { mod: 0 },
				cha: { mod: 0 },
			},
			attributes: {
				hp: { value: 30, max: 30, temp: 0, details: '' },
				ac: { value: 15, details: '' },
				speed: { value: 25, otherSpeeds: [] },
			},
			perception: { mod: 6, details: '' },
			details: {
				level: { value: 2 },
				alignment: { value: 'N' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Average resident of Harbinger House',
				publicNotes: `<p>Barmies are the general residents of Harbinger House who haven't yet developed significant powers. Each has a minor supernatural ability marking them as a "power-to-be."</p>
<p><strong>Addled Mind:</strong> The barmy's chaotic thought patterns grant them a +2 circumstance bonus to Will saves against mental effects but a −2 penalty to initiative.</p>`,
			},
			saves: {
				fortitude: { value: 8, saveDetail: '' },
				reflex: { value: 7, saveDetail: '' },
				will: { value: 4, saveDetail: '+2 vs mental effects' },
			},
			skills: {
				athletics: { base: 7, value: 7, label: 'Athletics', visible: true },
			},
			traits: {
				value: ['human', 'humanoid'],
				rarity: 'common',
				size: { value: 'med' },
				languages: { value: ['common'], details: 'may speak in confused manner' },
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'barmy',
				category: 'cultist',
			},
		},
		prototypeToken: {
			name: 'Barmy',
			displayName: 20,
			actorLink: false,
			disposition: 0,
			texture: { src: 'modules/harbinger-house-pf2e/dist/assets/tokens/Barmy.png' },
		},
	},
	items: [
		createStrike('Fist', 8, { dice: 1, die: '4', type: 'bludgeoning', modifier: 4 }, ['agile', 'nonlethal']),
		createAction(
			'Addled Mind',
			'passive',
			[],
			`<p>The barmy's chaotic thought patterns grant them a +2 circumstance bonus to Will saves against mental effects but a −2 penalty to initiative (already included in Perception).</p>`,
			[
				{
					key: 'FlatModifier',
					selector: 'will',
					value: 2,
					type: 'circumstance',
					predicate: ['mental'],
					label: 'Addled Mind',
				},
				{
					key: 'FlatModifier',
					selector: 'initiative',
					value: -2,
					label: 'Addled Mind',
				},
			],
		),
		createAction(
			'Innate Spark',
			'passive',
			[],
			`<p>Each barmy in Harbinger House has a minor supernatural ability marking them as a "power-to-be" (specific ability varies).</p>`,
		),
	],
};

export const GODSMAN_CARETAKER: HarbingerNPC = {
	id: 'godsman-caretaker',
	category: 'cultist',
	data: {
		name: 'Godsman Caretaker',
		type: 'npc',
		img: 'modules/harbinger-house-pf2e/dist/assets/character-images/Caretaker.png',
		system: {
			abilities: {
				str: { mod: 1 },
				dex: { mod: 1 },
				con: { mod: 1 },
				int: { mod: 2 },
				wis: { mod: 3 },
				cha: { mod: 2 },
			},
			attributes: {
				hp: { value: 18, max: 18, temp: 0, details: '' },
				ac: { value: 14, details: '' },
				speed: { value: 25, otherSpeeds: [] },
			},
			perception: { mod: 6, details: '' },
			details: {
				level: { value: 1 },
				alignment: { value: 'N' },
				creatureType: 'Humanoid',
				source: { value: 'Harbinger House' },
				blurb: 'Believers of the Source caretaker',
				publicNotes: `<p>Godsman caretakers work in Harbinger House, tending to the needs of the resident barmies and believing they are helping potential future powers on their path to ascension.</p>`,
			},
			saves: {
				fortitude: { value: 4, saveDetail: '' },
				reflex: { value: 4, saveDetail: '' },
				will: { value: 8, saveDetail: '' },
			},
			skills: {
				diplomacy: { base: 5, value: 5, label: 'Diplomacy', visible: true },
				medicine: { base: 6, value: 6, label: 'Medicine', visible: true },
				religion: { base: 6, value: 6, label: 'Religion', visible: true },
				society: { base: 5, value: 5, label: 'Society', visible: true },
			},
			traits: {
				value: ['human', 'humanoid'],
				rarity: 'common',
				size: { value: 'med' },
				languages: { value: ['common'], details: '' },
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'godsman-caretaker',
				category: 'cultist',
			},
		},
		prototypeToken: {
			name: 'Godsman Caretaker',
			displayName: 20,
			actorLink: false,
			disposition: 0,
			texture: { src: 'modules/harbinger-house-pf2e/dist/assets/tokens/Caretaker.png' },
		},
	},
	items: [
		createStrike('Fist', 4, { dice: 1, die: '4', type: 'bludgeoning', modifier: 1 }, ['agile', 'nonlethal']),
		createAction(
			"Believer's Patience",
			'passive',
			[],
			`<p>The Godsman gains a +2 circumstance bonus to Diplomacy checks to calm distressed individuals and to Medicine checks to treat mental conditions.</p>`,
			[
				{
					key: 'FlatModifier',
					selector: 'diplomacy',
					value: 2,
					type: 'circumstance',
					label: "Believer's Patience (calm distressed individuals)",
				},
				{
					key: 'FlatModifier',
					selector: 'medicine',
					value: 2,
					type: 'circumstance',
					label: "Believer's Patience (treat mental conditions)",
				},
			],
		),
		createAction(
			'Source Philosophy',
			'passive',
			[],
			`<p>The Godsman believes all beings are on a path toward ultimate ascension and treats even the most disturbed residents with respect and care.</p>`,
		),
	],
};

// =============================================================================
// FIGMENTS (Tomin's Imagined Creatures)
// =============================================================================

export const FIGMENT_SMALL: HarbingerNPC = {
	id: 'figment-small',
	category: 'figment',
	data: {
		name: 'Figment, Small',
		type: 'npc',
		img: 'systems/pf2e/icons/default-icons/npc.svg',
		system: {
			abilities: {
				str: { mod: 0 },
				dex: { mod: 3 },
				con: { mod: 0 },
				int: { mod: -4 },
				wis: { mod: 0 },
				cha: { mod: 0 },
			},
			attributes: {
				hp: { value: 22, max: 22, temp: 0, details: '' },
				ac: { value: 18, details: '' },
				speed: { value: 25, otherSpeeds: [{ type: 'fly', value: 20 }] },
				resistances: [{ type: 'physical', value: 5, except: ['magical'] }],
				immunities: [{ type: 'precision' }],
			},
			perception: { mod: 6, details: '' },
			details: {
				level: { value: 1 },
				alignment: { value: 'N' },
				creatureType: 'Aberration',
				source: { value: 'Harbinger House' },
				blurb: "A pixie-shark or tentacle-goblin conjured from Tomin's fractured mind",
				publicNotes: `<p>A small figment appears as something impossible — a pixie with a shark's head, a goblin whose arms are writhing tentacles, or a floating eye with spider legs. It is only real to creatures who believe in it.</p>
<p><strong>Belief-Dependent:</strong> The first time a figment attacks a creature, the target attempts a @Check[type:will|dc:20]. On a success, that creature treats the figment as harmless illusion for the rest of the encounter (it passes through them and deals no damage). On a failure, the figment deals real damage to that creature — and, if any creature in the encounter fails, the figment's damage is real for <em>all</em> creatures from then on.</p>
<p><strong>Physical Resistance:</strong> Only magical weapons can overcome the figment's resistance.</p>`,
			},
			saves: {
				fortitude: { value: 6, saveDetail: '' },
				reflex: { value: 9, saveDetail: '' },
				will: { value: 4, saveDetail: '' },
			},
			skills: {
				acrobatics: { base: 8, value: 8, label: 'Acrobatics', visible: true },
				stealth: { base: 8, value: 8, label: 'Stealth', visible: true },
			},
			traits: {
				value: ['aberration', 'illusion', 'shadow'],
				rarity: 'uncommon',
				size: { value: 'sm' },
				languages: { value: [], details: '' },
				senses: [{ type: 'darkvision' }],
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'figment-small',
				category: 'figment',
			},
		},
		prototypeToken: {
			name: 'Small Figment',
			displayName: 20,
			actorLink: false,
			disposition: -1,
			texture: { src: 'systems/pf2e/icons/default-icons/npc.svg' },
		},
	},
	items: [
		createStrike(
			'Shadow Bite',
			9,
			{ dice: 1, die: '4', type: 'piercing', modifier: 3 },
			['agile', 'finesse', 'magical'],
			`<p>The figment snaps, slashes, or claws with whatever nightmare shape it has today.</p>`,
		),
		createAction(
			'Belief-Dependent',
			'passive',
			['illusion', 'mental'],
			`<p>The first time the figment attacks a creature, that creature attempts a @Check[type:will|dc:20]. On a success, the figment is harmless illusion to that creature for the rest of the encounter. On a failure, the figment's attacks deal real damage — and if any creature fails, the figment becomes real for every creature in the encounter.</p>`,
		),
	],
};

export const FIGMENT_MEDIUM: HarbingerNPC = {
	id: 'figment-medium',
	category: 'figment',
	data: {
		name: 'Figment, Medium',
		type: 'npc',
		img: 'systems/pf2e/icons/default-icons/npc.svg',
		system: {
			abilities: {
				str: { mod: 3 },
				dex: { mod: 3 },
				con: { mod: 2 },
				int: { mod: -4 },
				wis: { mod: 1 },
				cha: { mod: 0 },
			},
			attributes: {
				hp: { value: 60, max: 60, temp: 0, details: '' },
				ac: { value: 21, details: '' },
				speed: { value: 30, otherSpeeds: [{ type: 'fly', value: 25 }] },
				resistances: [{ type: 'physical', value: 5, except: ['magical'] }],
				immunities: [{ type: 'precision' }],
			},
			perception: { mod: 11, details: '' },
			details: {
				level: { value: 4 },
				alignment: { value: 'N' },
				creatureType: 'Aberration',
				source: { value: 'Harbinger House' },
				blurb: 'A wolf-headed man, a winged beetle with a mouth-lined belly, or a red-dragon centaur',
				publicNotes: `<p>A medium figment's shape is more coherent — and more horrifying. They move with the deliberation of a predator and may talk in the voices of the PCs' past victims. Like smaller figments, they are bound to belief: see the Small Figment for the full rules on Belief-Dependent.</p>`,
			},
			saves: {
				fortitude: { value: 13, saveDetail: '' },
				reflex: { value: 14, saveDetail: '' },
				will: { value: 10, saveDetail: '' },
			},
			skills: {
				acrobatics: { base: 12, value: 12, label: 'Acrobatics', visible: true },
				athletics: { base: 13, value: 13, label: 'Athletics', visible: true },
				intimidation: { base: 10, value: 10, label: 'Intimidation', visible: true },
				stealth: { base: 11, value: 11, label: 'Stealth', visible: true },
			},
			traits: {
				value: ['aberration', 'illusion', 'shadow'],
				rarity: 'uncommon',
				size: { value: 'med' },
				languages: { value: [], details: '' },
				senses: [{ type: 'darkvision' }],
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'figment-medium',
				category: 'figment',
			},
		},
		prototypeToken: {
			name: 'Medium Figment',
			displayName: 20,
			actorLink: false,
			disposition: -1,
			texture: { src: 'systems/pf2e/icons/default-icons/npc.svg' },
		},
	},
	items: [
		createStrike(
			'Nightmare Claw',
			14,
			{ dice: 2, die: '6', type: 'slashing', modifier: 5 },
			['agile', 'finesse', 'magical'],
			`<p>A scything strike from whatever appendage the medium figment currently wears — a claw, a tooth-lined proboscis, or a draconic hoof.</p>`,
		),
		createAction(
			'Flurry of Forms',
			2,
			['manipulate'],
			`<p>The figment makes two Nightmare Claw Strikes. Its multiple attack penalty does not increase between these Strikes.</p>`,
		),
		createAction(
			'Belief-Dependent',
			'passive',
			['illusion', 'mental'],
			`<p>The first time the figment attacks a creature, that creature attempts a @Check[type:will|dc:22]. On a success, the figment is harmless illusion to that creature for the rest of the encounter. On a failure, the figment's attacks deal real damage — and if any creature fails, the figment becomes real for every creature in the encounter.</p>`,
		),
	],
};

export const FIGMENT_LARGE: HarbingerNPC = {
	id: 'figment-large',
	category: 'figment',
	data: {
		name: 'Figment, Large',
		type: 'npc',
		img: 'systems/pf2e/icons/default-icons/npc.svg',
		system: {
			abilities: {
				str: { mod: 5 },
				dex: { mod: 2 },
				con: { mod: 4 },
				int: { mod: -4 },
				wis: { mod: 2 },
				cha: { mod: 1 },
			},
			attributes: {
				hp: { value: 110, max: 110, temp: 0, details: '' },
				ac: { value: 24, details: '' },
				speed: { value: 30, otherSpeeds: [{ type: 'fly', value: 25 }] },
				resistances: [{ type: 'physical', value: 10, except: ['magical (+2 or greater)'] }],
				immunities: [{ type: 'precision' }],
			},
			perception: { mod: 14, details: '' },
			details: {
				level: { value: 7 },
				alignment: { value: 'N' },
				creatureType: 'Aberration',
				source: { value: 'Harbinger House' },
				blurb: 'A tentacle-legged cyclops or dagger-toothed snakeman',
				publicNotes: `<p>A large figment is the nightmare at the bottom of Tomin's head — a cyclops with octopus legs and human arms, or a sixty-foot snakeman with scimitars for arms and dagger teeth. It is very real, very dangerous, and only <strong>+2 or better magical weapons</strong> overcome its resistance.</p>`,
			},
			saves: {
				fortitude: { value: 17, saveDetail: '' },
				reflex: { value: 15, saveDetail: '' },
				will: { value: 13, saveDetail: '' },
			},
			skills: {
				athletics: { base: 17, value: 17, label: 'Athletics', visible: true },
				intimidation: { base: 14, value: 14, label: 'Intimidation', visible: true },
				stealth: { base: 13, value: 13, label: 'Stealth', visible: true },
			},
			traits: {
				value: ['aberration', 'illusion', 'shadow'],
				rarity: 'uncommon',
				size: { value: 'lg' },
				languages: { value: [], details: '' },
				senses: [{ type: 'darkvision' }],
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'figment-large',
				category: 'figment',
			},
		},
		prototypeToken: {
			name: 'Large Figment',
			displayName: 20,
			actorLink: false,
			disposition: -1,
			texture: { src: 'systems/pf2e/icons/default-icons/npc.svg' },
		},
	},
	items: [
		createStrike(
			'Dagger Jaw',
			18,
			{ dice: 2, die: '8', type: 'piercing', modifier: 7 },
			['magical', 'reach-10'],
			`<p>A bite, a scimitar-slash, or a tentacle lash from the figment's preferred anatomy.</p>`,
		),
		createAction(
			'Triple Nightmare',
			2,
			['manipulate'],
			`<p>The figment makes three Dagger Jaw Strikes. Its multiple attack penalty does not increase between these Strikes.</p>`,
		),
		createAction(
			'Belief-Dependent',
			'passive',
			['illusion', 'mental'],
			`<p>The first time the figment attacks a creature, that creature attempts a @Check[type:will|dc:25]. On a success, the figment is harmless illusion to that creature for the rest of the encounter. On a failure, the figment's attacks deal real damage — and if any creature fails, the figment becomes real for every creature in the encounter.</p>`,
		),
	],
};

// =============================================================================
// LOOT NPCs
// =============================================================================

export const GORG_STATUE_CACHE: HarbingerNPC = {
	id: 'gorg-statue-cache',
	category: 'loot',
	data: {
		name: "Gorg's Statue Cache (Area 27)",
		type: 'loot',
		img: 'icons/containers/chest/chest-reinforced-steel.webp',
		system: {
			attributes: {
				hp: { value: 1, max: 1, temp: 0, details: '' },
				ac: { value: 10, details: '' },
				speed: { value: 0, otherSpeeds: [] },
			},
			details: {
				level: { value: 11 },
				alignment: { value: 'N' },
				source: { value: 'Harbinger House — Area 27 (Statue Forest)' },
				blurb: 'A locked cabinet behind the grove where Gorg keeps emergency supplies',
				publicNotes: `<p>Tucked behind the oldest of Gorg's stone "statues" is a small wooden cabinet, unremarkable unless you're looking for it. A successful @Check[type:perception|dc:22] reveals it; a @Check[type:thievery|dc:25] opens its simple lock.</p>
<p><strong>Contents:</strong></p>
<ul>
<li>2× <em>scroll of stone to flesh</em> (6th-level) — left here by the Godsmen as an insurance policy against Gorg's gaze. Each can be used in place of casting <em>stone to flesh</em> yourself; see the item for activation rules and the save-progression table for restoring petrified creatures.</li>
</ul>
<p><strong>Why they're here:</strong> The Godsmen know Gorg is dangerous and leave these scrolls within arm's reach of his room on purpose. A clever PC who has watched Gorg turn an ally to stone can double back to this cache rather than retreating all the way out of the House.</p>`,
				privateNotes: `<p>If players miss this cache entirely and lose party members to Gorg's gaze, the GM should ensure Bereth (or Kaydi, if awakened) mentions that "the Godsmen keep remedies for the garden" as a hint.</p>`,
			},
			saves: {
				fortitude: { value: 0, saveDetail: '' },
				reflex: { value: 0, saveDetail: '' },
				will: { value: 0, saveDetail: '' },
			},
			traits: {
				value: [],
				rarity: 'unique',
				size: { value: 'med' },
				languages: { value: [], details: '' },
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'gorg-statue-cache',
				category: 'loot',
			},
		},
		prototypeToken: {
			name: "Gorg's Statue Cache",
			displayName: 20,
			actorLink: true,
			disposition: 0,
			texture: { src: 'icons/containers/chest/chest-reinforced-steel.webp' },
		},
	},
	items: [
		// The two stone to flesh scrolls are referenced by slug so the importer
		// wires them to the module's own Scroll of Stone to Flesh item entry.
		{
			name: 'Scroll of Stone to Flesh',
			type: 'consumable',
			img: 'icons/sundries/scrolls/scroll-bound-sealed-brown.webp',
			system: {
				description: {
					value: `<p>This scroll contains a 6th-level <em>stone to flesh</em> spell. Activate it to cast the spell at 6th level, targeting one petrified creature (Fortitude save DC 27 by the target):</p>
<ul>
<li><strong>Critical Success:</strong> The creature is fully restored.</li>
<li><strong>Success:</strong> The creature is restored but slowed 1 for 24 hours.</li>
<li><strong>Failure:</strong> The creature is restored but slowed 1 for 1 week and permanently drained 1.</li>
<li><strong>Critical Failure:</strong> The creature remains petrified.</li>
</ul>
<p><em>See the module's full <strong>Scroll of Stone to Flesh</strong> item entry for detailed activation rules.</em></p>`,
				},
				rules: [],
				slug: 'scroll-of-stone-to-flesh',
				level: { value: 11 },
				price: { value: { gp: 300 } },
				traits: { value: ['consumable', 'magical', 'scroll'], rarity: 'common' },
				consumableType: { value: 'scroll' },
				bulk: { value: 'L' },
				uses: { value: 1, max: 1, autoDestroy: true },
			},
		},
		{
			name: 'Scroll of Stone to Flesh',
			type: 'consumable',
			img: 'icons/sundries/scrolls/scroll-bound-sealed-brown.webp',
			system: {
				description: {
					value: `<p>This scroll contains a 6th-level <em>stone to flesh</em> spell. Activate it to cast the spell at 6th level, targeting one petrified creature (Fortitude save DC 27 by the target):</p>
<ul>
<li><strong>Critical Success:</strong> The creature is fully restored.</li>
<li><strong>Success:</strong> The creature is restored but slowed 1 for 24 hours.</li>
<li><strong>Failure:</strong> The creature is restored but slowed 1 for 1 week and permanently drained 1.</li>
<li><strong>Critical Failure:</strong> The creature remains petrified.</li>
</ul>
<p><em>See the module's full <strong>Scroll of Stone to Flesh</strong> item entry for detailed activation rules.</em></p>`,
				},
				rules: [],
				slug: 'scroll-of-stone-to-flesh',
				level: { value: 11 },
				price: { value: { gp: 300 } },
				traits: { value: ['consumable', 'magical', 'scroll'], rarity: 'common' },
				consumableType: { value: 'scroll' },
				bulk: { value: 'L' },
				uses: { value: 1, max: 1, autoDestroy: true },
			},
		},
	],
};

export const STORAGE_ALCOVE_CACHE: HarbingerNPC = {
	id: 'storage-alcove-cache',
	category: 'loot',
	data: {
		name: 'Hidden Storage Alcove',
		type: 'loot',
		img: 'icons/containers/kitchenware/vase-clay-painted-pink.webp',
		system: {
			attributes: {
				hp: { value: 1, max: 1, temp: 0, details: '' },
				ac: { value: 10, details: '' },
				speed: { value: 0, otherSpeeds: [] },
			},
			details: {
				level: { value: 8 },
				alignment: { value: 'N' },
				source: { value: 'Harbinger House — Storage Room' },
				blurb: 'A secret panel behind piled blankets hides an emergency supply of potions and elixirs',
				publicNotes: `<p>A stack of dusty blankets leans against the wall of this storage room. A @Check[type:perception|dc:25] (or a methodical search) reveals that the wall behind the blankets is false — a small panel swings open to reveal an alcove packed with glassware.</p>
<p><strong>Contents:</strong></p>
<ul>
<li>2× <em>potion of healing (moderate)</em> — @Damage[3d8+12[healing]] on activation.</li>
<li>1× <em>potion of healing (greater)</em> — @Damage[5d8+20[healing]] on activation, and the drinker is no longer sickened.</li>
<li>1× <em>elixir of health</em> — see module item; cures one of the barmies of Harbinger House, or purges a PC who drank the elixir of madness. Does not restore Hit Points.</li>
<li>1× <em>elixir of madness</em> — see module item; Will save DC 26 or become stupefied and confused for extended durations. An elixir of health cancels it.</li>
</ul>
<p><strong>Why they're here:</strong> The Godsmen cache emergency supplies throughout the House so that the caretakers can stabilize a barmy without running back to the infirmary. The elixir of madness is kept alongside the elixir of health because, in the Godsmen's philosophy, one cannot exist without the other.</p>`,
				privateNotes: `<p>GM note: The elixir of health is the intended "cure" for any PC affected by the elixir of madness, and it can also be used to "cure" one of the barmies — but a cured barmy permanently loses their innate power. Use this as a moral lever if the PCs are considering who to save.</p>`,
			},
			saves: {
				fortitude: { value: 0, saveDetail: '' },
				reflex: { value: 0, saveDetail: '' },
				will: { value: 0, saveDetail: '' },
			},
			traits: {
				value: [],
				rarity: 'unique',
				size: { value: 'med' },
				languages: { value: [], details: '' },
			},
		},
		flags: {
			'harbinger-house-pf2e': {
				sourceId: 'storage-alcove-cache',
				category: 'loot',
			},
		},
		prototypeToken: {
			name: 'Hidden Storage Alcove',
			displayName: 20,
			actorLink: true,
			disposition: 0,
			texture: { src: 'icons/containers/kitchenware/vase-clay-painted-pink.webp' },
		},
	},
	items: [
		{
			name: 'Potion of Healing (Moderate)',
			type: 'consumable',
			img: 'icons/consumables/potions/potion-tube-corked-bat-gold-red.webp',
			system: {
				description: {
					value: `<p>A ruby-red healing potion. On activation, regain @Damage[3d8+12[healing]] Hit Points.</p>`,
				},
				rules: [],
				slug: 'potion-of-healing-moderate',
				level: { value: 6 },
				price: { value: { gp: 50 } },
				traits: { value: ['consumable', 'healing', 'magical', 'potion', 'vitality'], rarity: 'common' },
				consumableType: { value: 'potion' },
				bulk: { value: 'L' },
				uses: { value: 1, max: 1, autoDestroy: true },
			},
		},
		{
			name: 'Potion of Healing (Moderate)',
			type: 'consumable',
			img: 'icons/consumables/potions/potion-tube-corked-bat-gold-red.webp',
			system: {
				description: {
					value: `<p>A ruby-red healing potion. On activation, regain @Damage[3d8+12[healing]] Hit Points.</p>`,
				},
				rules: [],
				slug: 'potion-of-healing-moderate',
				level: { value: 6 },
				price: { value: { gp: 50 } },
				traits: { value: ['consumable', 'healing', 'magical', 'potion', 'vitality'], rarity: 'common' },
				consumableType: { value: 'potion' },
				bulk: { value: 'L' },
				uses: { value: 1, max: 1, autoDestroy: true },
			},
		},
		{
			name: 'Potion of Healing (Greater)',
			type: 'consumable',
			img: 'icons/consumables/potions/potion-tube-corked-magenta.webp',
			system: {
				description: {
					value: `<p>A glowing ruby healing potion. On activation, regain @Damage[5d8+20[healing]] Hit Points, and remove the sickened condition.</p>`,
				},
				rules: [],
				slug: 'potion-of-healing-greater',
				level: { value: 9 },
				price: { value: { gp: 160 } },
				traits: { value: ['consumable', 'healing', 'magical', 'potion', 'vitality'], rarity: 'common' },
				consumableType: { value: 'potion' },
				bulk: { value: 'L' },
				uses: { value: 1, max: 1, autoDestroy: true },
			},
		},
		{
			name: 'Elixir of Health',
			type: 'consumable',
			img: 'icons/consumables/potions/bottle-pear-corked-pink.webp',
			system: {
				description: {
					value: `<p>Crystal-clear elixir that purifies mind and body. See the module item entry for full activation details.</p>
<p><strong>Effect:</strong> Gain the effects of a 4th-level <em>restoration</em> spell. Removes drained, enfeebled, or clumsy, or reduces stupefied/confused by 2.</p>
<p><strong>Harbinger House Special:</strong> Cures the madness of one barmy (who then permanently loses their innate power), or removes all effects of the <em>elixir of madness</em>.</p>`,
				},
				rules: [],
				slug: 'elixir-of-health',
				level: { value: 8 },
				price: { value: { gp: 100 } },
				traits: { value: ['alchemical', 'consumable', 'elixir', 'healing'], rarity: 'common' },
				consumableType: { value: 'elixir' },
				bulk: { value: 'L' },
				uses: { value: 1, max: 1, autoDestroy: true },
			},
		},
		{
			name: 'Elixir of Madness',
			type: 'consumable',
			img: 'icons/consumables/potions/bottle-round-flask-fumes-purple.webp',
			system: {
				description: {
					value: `<p>Iridescent liquid that whispers at the edge of hearing. On activation, attempt a @Check[type:will|dc:26].</p>
<ul>
<li><strong>Critical Success:</strong> Unaffected.</li>
<li><strong>Success:</strong> Stupefied 1 for 1 hour.</li>
<li><strong>Failure:</strong> Stupefied 2 and confused for 1 minute, then stupefied 2 for 1 hour.</li>
<li><strong>Critical Failure:</strong> Stupefied 3 and confused for 10 minutes, then stupefied 2 for 24 hours. Gain a persistent delusion.</li>
</ul>
<p><strong>Cure:</strong> An elixir of health removes all effects.</p>`,
				},
				rules: [],
				slug: 'elixir-of-madness',
				level: { value: 8 },
				price: { value: { gp: 100 } },
				traits: { value: ['alchemical', 'consumable', 'elixir', 'poison'], rarity: 'uncommon' },
				consumableType: { value: 'elixir' },
				bulk: { value: 'L' },
				uses: { value: 1, max: 1, autoDestroy: true },
			},
		},
	],
};

export const FIGMENTS: HarbingerNPC[] = [FIGMENT_SMALL, FIGMENT_MEDIUM, FIGMENT_LARGE];
export const LOOT_NPCS: HarbingerNPC[] = [GORG_STATUE_CACHE, STORAGE_ALCOVE_CACHE];

export const FIENDS: NPCEntry[] = [DRETCH, MANES, CRANIUM_RAT_SWARM, GRAY_OOZE];

export const GENERIC_NPCS: NPCEntry[] = [
	DABUS,
	HARMONIUM_AGENT,
	ANARCHIST,
	XERO_BAOX,
	LADYS_CULTIST,
	BARMY,
	GODSMAN_CARETAKER,
];

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
		createAction(
			'Swarming Bites',
			1,
			[],
			`<p>Each creature in the swarm's space takes @Damage[2d8[piercing]] damage (@Check[type:reflex|dc:22] basic save).</p>`,
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
export const GRAY_OOZE = systemActor('gray-ooze', 'fiend', 'grayOoze');

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
		systemWeapon('scimitar'),
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
		systemWeapon('shortsword'),
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
		systemWeapon('longsword', { potency: 1, striking: 'striking' }),
		systemWeapon('compositeLongbow'),
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

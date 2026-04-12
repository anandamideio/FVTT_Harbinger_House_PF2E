import type { PF2eHazardSystem } from '../types/foundry';

// Hazard categories for organization
export type HazardCategory = 'trap' | 'environmental' | 'haunt' | 'aura';

export interface HarbingerHazard {
	id: string;
	category: HazardCategory;
	location: string;
	/** Optional PF2e compendium actor UUID used to merge canonical system data at import time. */
	systemActorRef?: string;
	data: HazardData;
}

// PF2e Hazard specific data structure
export interface HazardData {
	name: string;
	type: 'hazard';
	img?: string;
	system: PF2eHazardSystem;
}

// ============================================================================
// MAGICAL TRAPS
// ============================================================================

const KAYDIS_MIND_TRAP: HarbingerHazard = {
	id: 'kaydis-mind-trap',
	category: 'trap',
	location: 'Area 23',
	data: {
		name: "Kaydi's Mind Trap",
		type: 'hazard',
		img: 'icons/magic/perception/silhouette-stealth-shadow.webp',
		system: {
			description: {
				value: `<p>A catatonic teenage girl lies in the center of an apparently empty room. Her mental blankness projects outward, affecting all who enter.</p>
<hr/>
<h3>Stupor Field</h3>
<p><span class="action-glyph">R</span> <em>(aura, enchantment, mental)</em></p>
<p><strong>Trigger</strong> A creature enters the room</p>
<p><strong>Effect</strong> The triggering creature and all creatures in the room must attempt a @Check[type:will|dc:26] at the start of each of their turns.</p>
<p><strong>Critical Success:</strong> The creature is unaffected this round and gains a +2 circumstance bonus to future saves against this hazard.</p>
<p><strong>Success:</strong> The creature takes @Damage[4[mental]] damage.</p>
<p><strong>Failure:</strong> The creature takes mental damage based on distance from Kaydi:
<ul>
<li>Within 5 feet: @Damage[4d8[mental]] damage</li>
<li>5-10 feet: @Damage[3d6[mental]] damage</li>
<li>10-15 feet: @Damage[2d6[mental]] damage</li>
</ul>
</p>
<p><strong>Critical Failure:</strong> As failure, but damage is doubled, and the creature is <strong>slowed 1</strong> until the start of their next turn.</p>
<hr/>
<p><strong>Special:</strong> When a creature's Hit Points are reduced to 0 by this effect, they fall into a catatonic sleep rather than dying. They can only be awakened by removing them from the room or waking Kaydi.</p>
<p>The room's door disappears after all creatures enter. To find the exit, creatures must succeed at a @Check[type:perception|dc:28] to locate the hidden door (which only appears while Kaydi is awake).</p>`,
			},
			rules: [],
			slug: 'kaydis-mind-trap',
			traits: {
				value: ['magical', 'trap', 'mental'],
				rarity: 'unique',
			},
			details: {
				level: { value: 8 },
				disable: '@Check[type:medicine|dc:26] to gently wake Kaydi (3 actions), or @Check[type:occultism|dc:30] to shield your mind from the effect (1 action, affects only you)',
				reset:
					'The trap resets 2 rounds after Kaydi falls back asleep (she remains awake for only 2 rounds when awakened).',
				routine:
					'On initiative count, the field surges. Each creature in the room attempts a @Check[type:will|dc:26] against Stupor Field.',
				isComplex: true,
			},
			attributes: {
				ac: { value: 26 },
				hp: { value: 64, max: 64 },
				hardness: { value: 16 },
				stealth: { value: 18, dc: 28, details: '(expert)' },
			},
			saves: {
				fortitude: { value: 17 },
				reflex: { value: 15 },
				will: { value: 20 },
			},
			immunities: { value: ['critical-hits', 'object-immunities', 'precision'] },
		},
	},
};

const REPEATING_FIREBALL_TRAP: HarbingerHazard = {
	id: 'repeating-fireball-trap',
	category: 'trap',
	location: 'Area 30 (The Last Hall)',
	data: {
		name: 'Repeating Fireball Trap',
		type: 'hazard',
		img: 'icons/magic/fire/explosion-fireball-medium-purple-pink.webp',
		system: {
			description: {
				value: `<p>A magic mouth on the floor warns "Halt! Turn back! No one may cross this room!" before exhaling a massive fireball that rolls down the hall.</p>
<hr/>
<h3>Fireball</h3>
<p><span class="action-glyph">R</span></p>
<p><strong>Trigger</strong> A creature stands on the hallway floor</p>
<p><strong>Effect</strong> The magic mouth speaks its warning and launches a fireball that deals @Damage[13d6[fire]] damage to all creatures in the hall (@Check[type:reflex|dc:29] basic save).</p>
<hr/>
<h3>Routine</h3>
<p>(1 action) On its turn, if any creature remains standing on the floor, the magic mouth repeats its warning and launches another fireball. This continues every round until no creatures are on the floor.</p>
<hr/>
<p><strong>Special:</strong> Creatures can avoid triggering additional fireballs by levitating, flying, climbing the walls, or otherwise not touching the floor.</p>`,
			},
			rules: [],
			slug: 'repeating-fireball-trap',
			traits: {
				value: ['magical', 'trap', 'fire'],
				rarity: 'common',
			},
			details: {
				level: { value: 10 },
				disable:
					'@Check[type:thievery|dc:31] DC 31 Thievery (master) to disable the trigger mechanism, or @Check[type:arcana|dc:28] DC 28 Arcana (counteract) to dispel magic (5th level) targeting the magic mouth',
				reset:
					'The trap does not reset once disabled. However, if merely avoided (by not standing on the floor), it remains active indefinitely.',
				routine: 'On each round, if any creature is touching the floor, the trap launches another fireball.',
				isComplex: true,
			},
			attributes: {
				ac: { value: 30 },
				hp: { value: 72, max: 72 },
				hardness: { value: 18 },
				stealth: { value: 21, dc: 31, details: '(master)' },
			},
			saves: {
				fortitude: { value: 22 },
				reflex: { value: 14 },
			},
			immunities: { value: ['critical-hits', 'object-immunities', 'precision'] },
		},
	},
};

const MIRROR_OF_MORTALITY_TRAP: HarbingerHazard = {
	id: 'mirror-of-mortality-trap',
	category: 'trap',
	location: 'Area 16',
	data: {
		name: 'Mirror of Mortality',
		type: 'hazard',
		img: 'icons/commodities/treasure/gem-framed-spiral-purple.webp',
		system: {
			description: {
				value: `<p>An ornate dark mirror that shows viewers images of their own decay and death.</p>
<hr/>
<h3>Deadly Reflection</h3>
<p><span class="action-glyph">R</span> <em>(emotion, visual)</em></p>
<p><strong>Trigger</strong> A creature sees its reflection in the mirror</p>
<p><strong>Effect</strong> The creature must attempt a @Check[type:will|dc:25].</p>
<p><strong>Critical Success:</strong> The creature is unaffected and immune for 24 hours.</p>
<p><strong>Success:</strong> The creature is <strong>fascinated</strong> for 1 round but can look away freely.</p>
<p><strong>Failure:</strong> The creature is <strong>fascinated</strong> and can't willingly look away for 1d4 rounds. It takes @Damage[1d4[negative]] damage at the end of each of its turns.</p>
<p><strong>Critical Failure:</strong> As failure, but the duration is 1d4 minutes and the damage is @Damage[2d4[negative]] per round.</p>
<hr/>
<p><strong>Special:</strong> A creature that closes its eyes can attempt a @Check[type:will|dc:20] as a free action at the start of each of its turns to end the fascinated condition, but it is then blinded until it opens its eyes.</p>`,
			},
			rules: [],
			slug: 'mirror-of-mortality-trap',
			traits: {
				value: ['magical', 'trap', 'emotion', 'visual'],
				rarity: 'unique',
			},
			details: {
				level: { value: 7 },
				disable: '@Check[type:thievery|dc:27] to cover or turn the mirror, or @Check[type:religion|dc:25] to bless it (suppresses it for 1 hour)',
				reset: 'If not disabled, the mirror regains full effect at the start of each round.',
				routine:
					'On initiative count, the mirror targets one creature that can see its reflection. That creature attempts the Deadly Reflection @Check[type:will|dc:25].',
				isComplex: true,
			},
			attributes: {
				ac: { value: 24 },
				hp: { value: 56, max: 56 },
				hardness: { value: 14 },
				stealth: { value: 15, dc: 25, details: '(expert) initiative +15' },
			},
			saves: {
				fortitude: { value: 13 },
				reflex: { value: 11 },
				will: { value: 17 },
			},
			immunities: { value: ['critical-hits', 'object-immunities', 'precision'] },
		},
	},
};

// ============================================================================
// ENVIRONMENTAL HAZARDS
// ============================================================================

const THE_ENDLESS_STAIRS: HarbingerHazard = {
	id: 'the-endless-stairs',
	category: 'environmental',
	location: 'Area 9',
	data: {
		name: 'The Endless Stairs',
		type: 'hazard',
		img: 'icons/environment/settlement/stone-stairs.webp',
		system: {
			description: {
				value: `<p>A spiral staircase that descends and ascends infinitely in both directions. The entrance door becomes a hidden secret door.</p>
<hr/>
<h3>Infinite Loop</h3>
<p><span class="action-glyph">F</span></p>
<p><strong>Trigger</strong> A creature travels more than 100 feet on the stairs</p>
<p><strong>Effect</strong> The creature continues looping through the same section of stairs, unable to reach an endpoint. They take @Damage[1[mental]] damage per 10 minutes of fruitless travel as frustration builds.</p>
<hr/>
<p><strong>Special:</strong> Creatures can escape by:</p>
<ul>
<li>Finding the secret door back to the Hall of Doors</li>
<li>Using <em>plane shift</em>, <em>dimension door</em>, or similar magic</li>
<li>Succeeding at a @Check[type:survival|dc:28] to "navigate" the impossible geometry (reveals the door's location)</li>
</ul>`,
			},
			rules: [],
			slug: 'the-endless-stairs',
			traits: {
				value: ['magical', 'environmental', 'trap', 'teleportation'],
				rarity: 'uncommon',
			},
			details: {
				level: { value: 5 },
				disable: '@Check[type:perception|dc:25] to find the hidden door (10 minutes per 10-foot section), @Check[type:arcana|dc:27] or @Check[type:occultism|dc:27] to understand the loop and reduce search time to 1 minute per section, or @Check[type:survival|dc:28] to orient to the paradox and reveal the exit',
				reset: 'The hazard is always active. The door becomes secret again 1 minute after it closes.',
				routine:
					'On initiative count, each trapped creature must attempt a @Check[type:will|dc:22]. On a failure, it cannot attempt another check to locate the exit until the end of its next turn.',
				isComplex: true,
			},
			attributes: {
				ac: { value: 22 },
				hp: { value: 48, max: 48 },
				hardness: { value: 12 },
				stealth: { value: 13, dc: 23, details: '(trained) to notice the stairs loop impossibly; initiative +13' },
			},
			saves: {
				fortitude: { value: 12 },
				reflex: { value: 10 },
				will: { value: 14 },
			},
			immunities: { value: ['critical-hits', 'object-immunities', 'precision'] },
		},
	},
};

const BROWN_MOLD: HarbingerHazard = {
	id: 'brown-mold',
	category: 'environmental',
	location: "Area 17 (Teela's Bath)",
	systemActorRef: 'Compendium.pf2e.hazards.Actor.Q8bXKgDm8eguqThB',
	data: {
		name: 'Brown Mold',
		type: 'hazard',
		system: {
			description: {
				value: `<p>A 5-foot-wide patch of fuzzy brown fungus that absorbs heat from its surroundings. The brown mold in Teela's bath is particularly vigorous due to the stagnant, warm conditions.</p>
<hr/>
<h3>Heat Drain</h3>
<p><em>(aura, cold) 5 feet</em></p>
<p>Any creature that enters the aura or starts its turn there takes @Damage[5d8[cold]] damage (@Check[type:fortitude|dc:23] basic save) as the mold drains heat from their body.</p>
<hr/>
<h3>Fire Vulnerability</h3>
<p>If fire is brought within 5 feet of brown mold, the mold instantly doubles in size. A torch causes it to double, flaming oil quadruples it, and a <em>fireball</em> causes it to grow eightfold. Each size increase expands the aura by 5 feet.</p>
<hr/>
<p><strong>Destruction:</strong> Brown mold can only be destroyed by cold damage, which kills it instantly. It has no HP but is destroyed by any amount of cold damage.</p>`,
			},
			rules: [],
			slug: 'brown-mold',
			traits: {
				value: ['environmental', 'fungus', 'cold'],
				rarity: 'common',
			},
			details: {
				level: { value: 4 },
				disable: 'Deal any cold damage to instantly destroy the mold.',
				isComplex: false,
			},
			attributes: {
				stealth: { value: 12, dc: 22, details: '(trained) to notice before entering the area' },
			},
			weaknesses: [{ type: 'cold', value: 999 }],
		},
	},
};

// ============================================================================
// CATASTROPHIC HAZARDS
// ============================================================================

const FOCRUX_EXPLOSION: HarbingerHazard = {
	id: 'focrux-explosion',
	category: 'trap',
	location: 'Area 33 (Ritual Chamber)',
	data: {
		name: 'Focrux Explosion',
		type: 'hazard',
		img: 'icons/magic/lightning/bolt-strike-explosion-purple.webp',
		system: {
			description: {
				value: `<p>When the focrux is destroyed, it releases all stored planar energy in a catastrophic explosion.</p>
<hr/>
<h3>Destruction Cascade</h3>
<p><span class="action-glyph">R</span></p>
<p><strong>Trigger</strong> The focrux is destroyed (see The Focrux item entry)</p>
<p><strong>Effect</strong> The focrux explodes in a <strong>30-foot emanation</strong>. All creatures in the area take @Damage[10d10[piercing]] damage from shards and @Damage[4d10[force]] damage from planar energy (@Check[type:reflex|dc:38] basic save).</p>
<p>Additionally, all creatures in the area are exposed to raw planar energy. Each creature must attempt a @Check[type:will|dc:36].</p>
<p><strong>Critical Success:</strong> The creature is unaffected by the planar exposure.</p>
<p><strong>Success:</strong> The creature is <strong>dazzled</strong> for 1 round.</p>
<p><strong>Failure:</strong> The creature is <strong>stunned 2</strong> and <strong>dazzled</strong> for 1 minute.</p>
<p><strong>Critical Failure:</strong> The creature is <strong>stunned 4</strong>, <strong>blinded</strong> for 1 minute, and must succeed at a @Check[type:fortitude|dc:36] or be <em>plane shifted</em> to a random Outer Plane.</p>
<hr/>
<h3>Divine Attention</h3>
<p>The explosion creates a pillar of light visible from anywhere in Sigil. The Lady of Pain immediately becomes aware of the situation and arrives to deal with any creatures attempting to achieve godhood. Her arrival automatically kills Nari and Sougad (no save); other creatures are unaffected unless they are newly ascended powers, who are instead cast out of Sigil.</p>
<hr/>
<p><strong>Special:</strong> This hazard cannot be disabled—only avoiding the destruction of the focrux prevents the explosion.</p>`,
			},
			rules: [],
			slug: 'focrux-explosion',
			traits: {
				value: ['magical', 'trap', 'force'],
				rarity: 'unique',
			},
			details: {
				level: { value: 15 },
				disable: 'This hazard cannot be disabled—only avoiding the destruction of the focrux prevents the explosion.',
				isComplex: false,
			},
			attributes: {
				ac: { value: 35 },
				hp: { value: 140, max: 140 },
				hardness: { value: 20 },
				stealth: { value: 0, dc: 0, details: '— (the focrux is clearly visible)' },
			},
			saves: {
				fortitude: { value: 26 },
				reflex: { value: 18 },
				will: { value: 22 },
			},
			immunities: { value: ['critical-hits', 'object-immunities', 'precision'] },
		},
	},
};

// ============================================================================
// EXPORTS
// ============================================================================

// Group hazards by category
export const TRAP_HAZARDS: HarbingerHazard[] = [
	KAYDIS_MIND_TRAP,
	REPEATING_FIREBALL_TRAP,
	MIRROR_OF_MORTALITY_TRAP,
	FOCRUX_EXPLOSION,
];

export const ENVIRONMENTAL_HAZARDS: HarbingerHazard[] = [THE_ENDLESS_STAIRS, BROWN_MOLD];

export const AURA_HAZARDS: HarbingerHazard[] = [];

// All hazards combined
export const ALL_HAZARDS: HarbingerHazard[] = [...TRAP_HAZARDS, ...ENVIRONMENTAL_HAZARDS, ...AURA_HAZARDS];

// Hazards grouped by category for UI display
export const HAZARDS_BY_CATEGORY: Record<HazardCategory, HarbingerHazard[]> = {
	trap: TRAP_HAZARDS,
	environmental: ENVIRONMENTAL_HAZARDS,
	haunt: [], // No haunts in this adventure
	aura: AURA_HAZARDS,
};

// Get human-readable category names
export function getHazardCategoryLabel(category: HazardCategory): string {
	const labels: Record<HazardCategory, string> = {
		trap: 'Magical Traps',
		environmental: 'Environmental Hazards',
		haunt: 'Haunts',
		aura: 'NPC Auras',
	};
	return labels[category];
}

// Quick lookup by ID
export function getHazardById(id: string): HarbingerHazard | undefined {
	return ALL_HAZARDS.find((hazard) => hazard.id === id);
}

// Get hazards by location
export function getHazardsByLocation(location: string): HarbingerHazard[] {
	return ALL_HAZARDS.filter((hazard) => hazard.location.toLowerCase().includes(location.toLowerCase()));
}

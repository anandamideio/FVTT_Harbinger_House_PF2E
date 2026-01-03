/**
 * Harbinger House Hazard Data
 * Converted from AD&D 2e to Pathfinder 2e
 * 
 * This file contains all unique hazards, traps, and environmental dangers
 * from the Harbinger House adventure module.
 * 
 * Hazard Categories:
 * - trap: Magical or mechanical traps
 * - environmental: Natural or magical environmental hazards
 * - haunt: Supernatural hazards tied to spirits or psychic phenomena
 * - aura: Persistent magical effects around NPCs or locations
 */

import type { PF2eHazardSystem } from '../types/foundry';

// Hazard categories for organization
export type HazardCategory =
  | 'trap'
  | 'environmental'
  | 'haunt'
  | 'aura';

export interface HarbingerHazard {
  id: string;
  category: HazardCategory;
  location: string;
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
<p><strong>Effect</strong> The triggering creature and all creatures in the room must attempt a <strong>DC 26 Will save</strong> at the start of each of their turns.</p>
<p><strong>Critical Success:</strong> The creature is unaffected this round and gains a +2 circumstance bonus to future saves against this hazard.</p>
<p><strong>Success:</strong> The creature takes <strong>4 mental damage</strong>.</p>
<p><strong>Failure:</strong> The creature takes mental damage based on distance from Kaydi:
<ul>
<li>Within 5 feet: <strong>4d8 mental damage</strong></li>
<li>5-10 feet: <strong>3d6 mental damage</strong></li>
<li>10-15 feet: <strong>2d6 mental damage</strong></li>
</ul>
</p>
<p><strong>Critical Failure:</strong> As failure, but damage is doubled, and the creature is <strong>slowed 1</strong> until the start of their next turn.</p>
<hr/>
<p><strong>Special:</strong> When a creature's Hit Points are reduced to 0 by this effect, they fall into a catatonic sleep rather than dying. They can only be awakened by removing them from the room or waking Kaydi.</p>
<p>The room's door disappears after all creatures enter. To find the exit, creatures must succeed at a <strong>DC 28 Perception</strong> check to locate the hidden door (which only appears while Kaydi is awake).</p>`
      },
      rules: [],
      slug: 'kaydis-mind-trap',
      traits: {
        value: ['magical', 'trap', 'mental'],
        rarity: 'unique'
      },
      details: {
        level: { value: 8 },
        disable: 'DC 26 Medicine to gently wake Kaydi (3 actions), or DC 30 Occultism to shield your mind from the effect (1 action, affects only you)',
        reset: 'The trap resets 2 rounds after Kaydi falls back asleep (she remains awake for only 2 rounds when awakened).',
        isComplex: true
      },
      attributes: {
        stealth: { value: 18, dc: 28, details: '(expert)' }
      }
    }
  }
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
<p><strong>Effect</strong> The magic mouth speaks its warning and launches a fireball that deals <strong>13d6 fire damage</strong> to all creatures in the hall (<strong>DC 29 basic Reflex save</strong>).</p>
<hr/>
<h3>Routine</h3>
<p>(1 action) On its turn, if any creature remains standing on the floor, the magic mouth repeats its warning and launches another fireball. This continues every round until no creatures are on the floor.</p>
<hr/>
<p><strong>Special:</strong> Creatures can avoid triggering additional fireballs by levitating, flying, climbing the walls, or otherwise not touching the floor.</p>`
      },
      rules: [],
      slug: 'repeating-fireball-trap',
      traits: {
        value: ['magical', 'trap', 'fire'],
        rarity: 'common'
      },
      details: {
        level: { value: 10 },
        disable: 'DC 31 Thievery (master) to disable the trigger mechanism, or dispel magic (5th level, counteract DC 28) targeting the magic mouth',
        reset: 'The trap does not reset once disabled. However, if merely avoided (by not standing on the floor), it remains active indefinitely.',
        routine: 'On each round, if any creature is touching the floor, the trap launches another fireball.',
        isComplex: true
      },
      attributes: {
        ac: { value: 30 },
        hp: { value: 72, max: 72 },
        hardness: { value: 18 },
        stealth: { value: 21, dc: 31, details: '(master)' }
      },
      saves: {
        fortitude: { value: 22 },
        reflex: { value: 14 }
      },
      immunities: { value: ['critical-hits', 'object-immunities', 'precision'] }
    }
  }
};

const MIRROR_OF_MORTALITY_TRAP: HarbingerHazard = {
  id: 'mirror-of-mortality-trap',
  category: 'trap',
  location: 'Area 16',
  data: {
    name: 'Mirror of Mortality',
    type: 'hazard',
    img: 'icons/sundries/misc/mirror-cracked.webp',
    system: {
      description: {
        value: `<p>An ornate dark mirror that shows viewers images of their own decay and death.</p>
<hr/>
<h3>Deadly Reflection</h3>
<p><span class="action-glyph">R</span> <em>(emotion, visual)</em></p>
<p><strong>Trigger</strong> A creature sees its reflection in the mirror</p>
<p><strong>Effect</strong> The creature must attempt a <strong>DC 25 Will save</strong>.</p>
<p><strong>Critical Success:</strong> The creature is unaffected and immune for 24 hours.</p>
<p><strong>Success:</strong> The creature is <strong>fascinated</strong> for 1 round but can look away freely.</p>
<p><strong>Failure:</strong> The creature is <strong>fascinated</strong> and can't willingly look away for 1d4 rounds. It takes <strong>1d4 negative damage</strong> at the end of each of its turns.</p>
<p><strong>Critical Failure:</strong> As failure, but the duration is 1d4 minutes and the damage is <strong>2d4 negative</strong> per round.</p>
<hr/>
<p><strong>Special:</strong> A creature that closes its eyes can attempt a <strong>DC 20 Will save</strong> as a free action at the start of each of its turns to end the fascinated condition, but it is then blinded until it opens its eyes.</p>`
      },
      rules: [],
      slug: 'mirror-of-mortality-trap',
      traits: {
        value: ['magical', 'trap', 'death', 'visual'],
        rarity: 'unique'
      },
      details: {
        level: { value: 7 },
        disable: 'DC 27 Thievery to cover or turn the mirror, or DC 25 Religion to bless the mirror (suppresses it for 1 hour)',
        reset: 'The trap resets automatically at the start of each round.',
        isComplex: false
      },
      attributes: {
        stealth: { value: 15, dc: 25, details: '(expert)' }
      }
    }
  }
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
    img: 'icons/environment/settlement/stairs-spiral.webp',
    system: {
      description: {
        value: `<p>A spiral staircase that descends and ascends infinitely in both directions. The entrance door becomes a hidden secret door.</p>
<hr/>
<h3>Infinite Loop</h3>
<p><span class="action-glyph">F</span></p>
<p><strong>Trigger</strong> A creature travels more than 100 feet on the stairs</p>
<p><strong>Effect</strong> The creature continues looping through the same section of stairs, unable to reach an endpoint. They take <strong>1 mental damage</strong> per 10 minutes of fruitless travel as frustration builds.</p>
<hr/>
<p><strong>Special:</strong> Creatures can escape by:</p>
<ul>
<li>Finding the secret door back to the Hall of Doors</li>
<li>Using <em>plane shift</em>, <em>dimension door</em>, or similar magic</li>
<li>Succeeding at a <strong>DC 28 Survival</strong> check to "navigate" the impossible geometry (reveals the door's location)</li>
</ul>`
      },
      rules: [],
      slug: 'the-endless-stairs',
      traits: {
        value: ['magical', 'environmental', 'trap', 'teleportation'],
        rarity: 'uncommon'
      },
      details: {
        level: { value: 5 },
        disable: 'DC 25 Perception to find the hidden door (takes 10 minutes of searching per 10-foot section), or DC 27 Arcana/Occultism to identify the nature of the loop (allows targeted searching, reducing time to 1 minute per section)',
        reset: 'The hazard is always active. The door becomes secret again 1 minute after it closes.',
        isComplex: false
      },
      attributes: {
        stealth: { value: 13, dc: 23, details: '(trained) to notice the stairs loop impossibly' }
      }
    }
  }
};

const BROWN_MOLD: HarbingerHazard = {
  id: 'brown-mold',
  category: 'environmental',
  location: 'Area 17 (Teela\'s Bath)',
  data: {
    name: 'Brown Mold',
    type: 'hazard',
    img: 'icons/magic/nature/root-vine-entangled-brown.webp',
    system: {
      description: {
        value: `<p>A 5-foot-wide patch of fuzzy brown fungus that absorbs heat from its surroundings. The brown mold in Teela's bath is particularly vigorous due to the stagnant, warm conditions.</p>
<hr/>
<h3>Heat Drain</h3>
<p><em>(aura, cold) 5 feet</em></p>
<p>Any creature that enters the aura or starts its turn there takes <strong>5d8 cold damage</strong> (<strong>DC 23 basic Fortitude save</strong>) as the mold drains heat from their body.</p>
<hr/>
<h3>Fire Vulnerability</h3>
<p>If fire is brought within 5 feet of brown mold, the mold instantly doubles in size. A torch causes it to double, flaming oil quadruples it, and a <em>fireball</em> causes it to grow eightfold. Each size increase expands the aura by 5 feet.</p>
<hr/>
<p><strong>Destruction:</strong> Brown mold can only be destroyed by cold damage, which kills it instantly. It has no HP but is destroyed by any amount of cold damage.</p>`
      },
      rules: [],
      slug: 'brown-mold',
      traits: {
        value: ['environmental', 'fungus', 'cold'],
        rarity: 'common'
      },
      details: {
        level: { value: 4 },
        disable: 'Deal any cold damage to instantly destroy the mold',
        isComplex: false
      },
      attributes: {
        stealth: { value: 12, dc: 22, details: '(trained) to notice before entering the area' }
      },
      weaknesses: [
        { type: 'cold', value: 999 }
      ]
    }
  }
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
<p><strong>Effect</strong> The focrux explodes in a <strong>30-foot emanation</strong>. All creatures in the area take <strong>10d10 piercing damage</strong> from shards and <strong>4d10 force damage</strong> from planar energy (<strong>DC 38 basic Reflex save</strong>).</p>
<p>Additionally, all creatures in the area are exposed to raw planar energy. Each creature must attempt a <strong>DC 36 Will save</strong>.</p>
<p><strong>Critical Success:</strong> The creature is unaffected by the planar exposure.</p>
<p><strong>Success:</strong> The creature is <strong>dazzled</strong> for 1 round.</p>
<p><strong>Failure:</strong> The creature is <strong>stunned 2</strong> and <strong>dazzled</strong> for 1 minute.</p>
<p><strong>Critical Failure:</strong> The creature is <strong>stunned 4</strong>, <strong>blinded</strong> for 1 minute, and must succeed at a <strong>DC 36 Fortitude save</strong> or be <em>plane shifted</em> to a random Outer Plane.</p>
<hr/>
<h3>Divine Attention</h3>
<p>The explosion creates a pillar of light visible from anywhere in Sigil. The Lady of Pain immediately becomes aware of the situation and arrives to deal with any creatures attempting to achieve godhood. Her arrival automatically kills Nari and Sougad (no save); other creatures are unaffected unless they are newly ascended powers, who are instead cast out of Sigil.</p>
<hr/>
<p><strong>Special:</strong> This hazard cannot be disabled—only avoiding the destruction of the focrux prevents the explosion.</p>`
      },
      rules: [],
      slug: 'focrux-explosion',
      traits: {
        value: ['magical', 'trap', 'force'],
        rarity: 'unique'
      },
      details: {
        level: { value: 15 },
        disable: 'This hazard cannot be disabled—only avoiding the destruction of the focrux prevents the explosion.',
        isComplex: false
      },
      attributes: {
        stealth: { value: 0, dc: 0, details: '— (the focrux is clearly visible)' }
      }
    }
  }
};

// ============================================================================
// NPC AURAS (Hazard-like effects)
// ============================================================================

const CHANCES_FIELD_OF_BAD_LUCK: HarbingerHazard = {
  id: 'field-of-bad-luck',
  category: 'aura',
  location: 'Area 29 (Chance\'s Chamber)',
  data: {
    name: "Chance's Field of Bad Luck",
    type: 'hazard',
    img: 'icons/commodities/currency/coin-engraved-four-leaf-clover-gold.webp',
    system: {
      description: {
        value: `<p>Chance projects an aura of misfortune that affects everyone except himself.</p>
<hr/>
<h3>Bad Luck Aura</h3>
<p><em>(aura, enchantment, misfortune) 15 feet</em></p>
<p>Any creature except Chance that starts its turn in or enters the aura must attempt a <strong>DC 26 Will save</strong> before taking any actions that round.</p>
<p><strong>Critical Success:</strong> The creature is unaffected this round.</p>
<p><strong>Success:</strong> The creature takes a <strong>-1 status penalty</strong> to all checks and DCs this round.</p>
<p><strong>Failure:</strong> Something goes wrong with the creature's first action of the round. If it's a Strike, the weapon slips or misfires. If it's a spell, the wrong components are grabbed. If it's movement, they trip. The action is wasted.</p>
<p><strong>Critical Failure:</strong> As failure, but the creature also falls <strong>prone</strong> and drops one held item.</p>
<hr/>
<h3>Extreme Luck</h3>
<p>Chance himself gains a <strong>+4 item bonus</strong> to all checks and DCs while within his own aura. All effects targeting him specifically take a <strong>-4 penalty</strong>.</p>
<hr/>
<p><strong>Disable:</strong> The aura can only be disabled by rendering Chance unconscious, killing him, or moving him more than 30 feet away. The aura moves with Chance and cannot be separated from him.</p>`
      },
      rules: [],
      slug: 'field-of-bad-luck',
      traits: {
        value: ['magical'],
        rarity: 'unique'
      },
      details: {
        level: { value: 8 },
        disable: 'The aura can only be disabled by rendering Chance unconscious, killing him, or moving him more than 30 feet away.',
        isComplex: true
      },
      attributes: {
        stealth: { value: 18, dc: 28, details: '(expert) to notice the aura before entering' }
      }
    }
  }
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

export const ENVIRONMENTAL_HAZARDS: HarbingerHazard[] = [
  THE_ENDLESS_STAIRS,
  BROWN_MOLD,
];

export const AURA_HAZARDS: HarbingerHazard[] = [
  CHANCES_FIELD_OF_BAD_LUCK,
];

// All hazards combined
export const ALL_HAZARDS: HarbingerHazard[] = [
  ...TRAP_HAZARDS,
  ...ENVIRONMENTAL_HAZARDS,
  ...AURA_HAZARDS,
];

// Hazards grouped by category for UI display
export const HAZARDS_BY_CATEGORY: Record<HazardCategory, HarbingerHazard[]> = {
  'trap': TRAP_HAZARDS,
  'environmental': ENVIRONMENTAL_HAZARDS,
  'haunt': [], // No haunts in this adventure
  'aura': AURA_HAZARDS,
};

// Get human-readable category names
export function getHazardCategoryLabel(category: HazardCategory): string {
  const labels: Record<HazardCategory, string> = {
    'trap': 'Magical Traps',
    'environmental': 'Environmental Hazards',
    'haunt': 'Haunts',
    'aura': 'NPC Auras',
  };
  return labels[category];
}

// Quick lookup by ID
export function getHazardById(id: string): HarbingerHazard | undefined {
  return ALL_HAZARDS.find(hazard => hazard.id === id);
}

// Get hazards by location
export function getHazardsByLocation(location: string): HarbingerHazard[] {
  return ALL_HAZARDS.filter(hazard => 
    hazard.location.toLowerCase().includes(location.toLowerCase())
  );
}

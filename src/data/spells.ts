/**
 * Harbinger House Spell Data
 * Converted from AD&D 2e to Pathfinder 2e
 * 
 * This file contains custom spells unique to the Harbinger House adventure.
 * Most spells used in the adventure are standard PF2e spells, but these
 * are custom abilities tied to specific NPCs or plot elements.
 */

import type { ItemData } from '../types/foundry';

export interface HarbingerSpell {
  id: string;
  data: ItemData;
}

// ============================================================================
// CUSTOM SPELLS
// ============================================================================

/**
 * Word of Chaos
 * Sougad's signature spell, gained upon completing his ritual at the focrux.
 * Converted from AD&D 5th-level wizard spell "chaos".
 */
const WORD_OF_CHAOS: HarbingerSpell = {
  id: 'word-of-chaos',
  data: {
    name: 'Word of Chaos',
    type: 'spell',
    img: 'icons/magic/symbols/mask-metal-silver-white.webp',
    system: {
      description: {
        value: `<p>You speak a word of pure chaos that disrupts the minds of lawful creatures. Non-chaotic creatures in the area must attempt a Will save.</p>
<hr/>
<p><strong>Critical Success:</strong> The creature is unaffected.</p>
<p><strong>Success:</strong> The creature is <strong>stupefied 1</strong> for 1 round.</p>
<p><strong>Failure:</strong> The creature is <strong>stupefied 2</strong> and <strong>slowed 1</strong> for 1 minute.</p>
<p><strong>Critical Failure:</strong> The creature is <strong>stupefied 3</strong>, <strong>slowed 2</strong>, and <strong>confused</strong> for 1 minute.</p>
<hr/>
<p>Lawful creatures take a <strong>-2 circumstance penalty</strong> to their saving throws against this spell. Chaotic creatures are immune.</p>
<hr/>
<p><em>Note: This conversion is based on the AD&D 5th-level wizard spell "chaos" which Sougad gains upon completing his ritual at the focrux. In PF2e, similar effects exist in word of freedom and other divine spells.</em></p>`
      },
      rules: [],
      slug: 'word-of-chaos',
      level: { value: 7 },
      traits: {
        value: ['auditory', 'divine', 'mental'],
        rarity: 'uncommon'
      },
      traditions: { value: ['divine', 'occult'] },
      time: { value: '2' },
      components: { value: ['verbal'] },
      area: {
        value: 30,
        type: 'emanation'
      },
      defense: {
        save: { statistic: 'will', basic: false }
      },
      duration: { value: 'varies' }
    }
  }
};

/**
 * Dream Storm
 * Kaydi's signature spell, available only if she is killed and ascends prematurely.
 * Represents her power over sleep and nightmares.
 */
const DREAM_STORM: HarbingerSpell = {
  id: 'dream-storm',
  data: {
    name: 'Dream Storm',
    type: 'spell',
    img: 'icons/magic/perception/hand-eye-pink.webp',
    system: {
      description: {
        value: `<p>This spell is available only to Kaydi if she is killed and ascends to become a demipower of sleep prematurely.</p>
<p>You assault a creature's mind with nightmarish visions. The target takes <strong>3d8+10 mental damage</strong> and must attempt a Will save.</p>
<hr/>
<p><strong>Critical Success:</strong> The target takes no damage.</p>
<p><strong>Success:</strong> The target takes half damage.</p>
<p><strong>Failure:</strong> The target takes full damage and falls <strong>unconscious</strong> for 1d4 rounds.</p>
<p><strong>Critical Failure:</strong> The target takes double damage and falls <strong>unconscious</strong> for 1 minute. They experience terrible nightmares and are <strong>frightened 2</strong> when they awaken.</p>
<hr/>
<p><strong>Heightened (+1):</strong> The damage increases by 1d8.</p>`
      },
      rules: [],
      slug: 'dream-storm',
      level: { value: 5 },
      traits: {
        value: ['incapacitation', 'mental', 'sleep'],
        rarity: 'rare'
      },
      traditions: { value: ['occult'] },
      time: { value: '2' },
      components: { value: ['somatic', 'verbal'] },
      range: { value: '30 feet' },
      target: { value: '1 creature' },
      defense: {
        save: { statistic: 'will', basic: false }
      },
      damage: {
        formula: '3d8+10',
        type: 'mental'
      },
      heightening: {
        type: 'interval',
        interval: 1,
        damage: { formula: '1d8', type: 'mental' }
      }
    }
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export const ALL_SPELLS: HarbingerSpell[] = [
  WORD_OF_CHAOS,
  DREAM_STORM,
];

// Quick lookup by ID
export function getSpellById(id: string): HarbingerSpell | undefined {
  return ALL_SPELLS.find(spell => spell.id === id);
}

// Get all spell names for display
export function getSpellNames(): string[] {
  return ALL_SPELLS.map(spell => spell.data.name);
}

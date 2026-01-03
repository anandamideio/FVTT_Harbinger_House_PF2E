/**
 * Generic NPCs, Fiends, and Cultists
 * These are common enemies and NPCs encountered throughout the adventure
 */

import type { HarbingerNPC } from './harbinger-residents';
import type { ItemData } from '../types/foundry.d.ts';
import { createAction, createStrike, createSpell, systemWeapon, systemSpell, systemAction } from './utils';

// =============================================================================
// FIENDS AND MONSTERS
// =============================================================================

export const DRETCH: HarbingerNPC = {
  id: 'dretch',
  category: 'fiend',
  data: {
    name: 'Dretch',
    type: 'npc',
    img: 'modules/harbinger-house-pf2e/assets/tokens/dretch.webp',
    system: {
      abilities: {
        str: { mod: 2 },
        dex: { mod: 1 },
        con: { mod: 3 },
        int: { mod: -2 },
        wis: { mod: 0 },
        cha: { mod: 0 },
      },
      attributes: {
        hp: { value: 45, max: 45, temp: 0, details: '' },
        ac: { value: 17, details: '' },
        speed: { value: 20, otherSpeeds: [] },
        perception: { value: 6, details: '' },
        weaknesses: [
          { type: 'cold-iron', value: 3 },
          { type: 'good', value: 3 },
        ],
      },
      details: {
        level: { value: 2 },
        alignment: { value: 'CE' },
        creatureType: 'Fiend',
        source: { value: 'Harbinger House' },
        blurb: 'Minor demon servant',
        publicNotes: `<p>Dretches are among the lowest demons, often pressed into service by more powerful fiends. Nari uses them as guards throughout Harbinger House.</p>`,
      },
      saves: {
        fortitude: { value: 9, saveDetail: '' },
        reflex: { value: 5, saveDetail: '' },
        will: { value: 6, saveDetail: '' },
      },
      traits: {
        value: ['demon', 'fiend'],
        rarity: 'common',
        size: { value: 'sm' },
        languages: { value: ['abyssal'], details: 'telepathy 100 feet' },
        senses: [{ type: 'darkvision' }],
      },
    },
    flags: {
      'harbinger-house-pf2e': {
        sourceId: 'dretch',
        category: 'fiend',
      },
    },
  },
  items: [
    createStrike('Claw', 10, { dice: 1, die: '6', type: 'slashing', modifier: 4 }, ['agile']),
    createStrike('Bite', 10, { dice: 1, die: '8', type: 'piercing', modifier: 4 }, []),
    createAction(
      'Stinking Cloud',
      2,
      ['conjuration', 'divine', 'poison'],
      `<p><strong>Frequency</strong> once per day</p>
<p>The dretch creates a 10-foot burst of nauseating vapor within 30 feet. Creatures in the area must attempt a DC 18 Fortitude save.</p>
<p><strong>Success</strong> The creature is unaffected.</p>
<p><strong>Failure</strong> The creature is sickened 1.</p>
<p><strong>Critical Failure</strong> The creature is sickened 2.</p>`
    ),
    systemSpell('darkness', 2, 'divine'),
    systemSpell('fear', 1, 'divine'),
  ],
};

export const MANES: HarbingerNPC = {
  id: 'manes',
  category: 'fiend',
  data: {
    name: 'Manes',
    type: 'npc',
    img: 'modules/harbinger-house-pf2e/assets/tokens/manes.webp',
    system: {
      abilities: {
        str: { mod: 1 },
        dex: { mod: 1 },
        con: { mod: 2 },
        int: { mod: -4 },
        wis: { mod: 0 },
        cha: { mod: -3 },
      },
      attributes: {
        hp: { value: 15, max: 15, temp: 0, details: '' },
        ac: { value: 14, details: '' },
        speed: { value: 20, otherSpeeds: [] },
        perception: { value: 4, details: '' },
        immunities: [{ type: 'electricity' }, { type: 'poison' }],
        weaknesses: [
          { type: 'cold-iron', value: 2 },
          { type: 'good', value: 2 },
        ],
        resistances: [
          { type: 'cold', value: 2 },
          { type: 'fire', value: 2 },
        ],
      },
      details: {
        level: { value: 0 },
        alignment: { value: 'CE' },
        creatureType: 'Fiend',
        source: { value: 'Harbinger House' },
        blurb: 'Mindless demon fodder',
        publicNotes: `<p>Manes are the lowliest of demons—the misshapen, mindless souls of evil mortals consigned to the Abyss.</p>
<p><strong>Death Burst:</strong> When a manes dies, it explodes in a burst of acidic vapor, dealing 1d6 acid damage to creatures within 10 feet (DC 14 basic Reflex save).</p>`,
      },
      saves: {
        fortitude: { value: 8, saveDetail: '' },
        reflex: { value: 5, saveDetail: '' },
        will: { value: 2, saveDetail: '' },
      },
      traits: {
        value: ['demon', 'fiend'],
        rarity: 'common',
        size: { value: 'sm' },
        languages: { value: ['abyssal'], details: "can't speak" },
        senses: [{ type: 'darkvision' }],
      },
    },
    flags: {
      'harbinger-house-pf2e': {
        sourceId: 'manes',
        category: 'fiend',
      },
    },
  },
  items: [
    createStrike('Claw', 7, { dice: 1, die: '4', type: 'slashing', modifier: 1 }, ['agile']),
    createStrike('Bite', 7, { dice: 1, die: '6', type: 'piercing', modifier: 1 }, []),
    createAction(
      'Death Burst',
      'passive',
      ['acid', 'divine', 'evocation'],
      `<p>When the manes dies, it explodes in a burst of acidic vapor. Each creature within 10 feet takes 1d6 acid damage (DC 14 basic Reflex save).</p>`
    ),
  ],
};

export const CRANIUM_RAT_SWARM: HarbingerNPC = {
  id: 'cranium-rat-swarm',
  category: 'fiend',
  data: {
    name: 'Cranium Rat Swarm',
    type: 'npc',
    img: 'modules/harbinger-house-pf2e/assets/tokens/cranium-rats.webp',
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
        perception: { value: 13, details: 'thoughtsense 30 feet' },
        immunities: [{ type: 'precision' }],
        weaknesses: [
          { type: 'area-damage', value: 5 },
          { type: 'splash-damage', value: 5 },
        ],
        resistances: [{ type: 'physical', value: 5 }],
      },
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
  },
  items: [
    createAction(
      'Swarming Bites',
      1,
      [],
      `<p>Each creature in the swarm's space takes 2d8 piercing damage (DC 22 basic Reflex save).</p>`
    ),
    createAction(
      'Collective Intelligence',
      'passive',
      [],
      `<p>The swarm's Intelligence increases based on its remaining HP: full HP = Int +2, below 50% = Int +1, below 25% = Int −2. Their spell DCs and attack rolls adjust accordingly.</p>`
    ),
    systemSpell('hideousLaughter', 2, 'occult'),
    systemSpell('colorSpray', 1, 'occult'),
    systemSpell('command', 1, 'occult'),
  ],
};

export const GRAY_OOZE: HarbingerNPC = {
  id: 'gray-ooze',
  category: 'fiend',
  data: {
    name: 'Gray Ooze',
    type: 'npc',
    img: 'modules/harbinger-house-pf2e/assets/tokens/gray-ooze.webp',
    system: {
      abilities: {
        str: { mod: 4 },
        dex: { mod: -3 },
        con: { mod: 5 },
        int: { mod: -5 },
        wis: { mod: 0 },
        cha: { mod: -5 },
      },
      attributes: {
        hp: { value: 60, max: 60, temp: 0, details: '' },
        ac: { value: 14, details: '' },
        speed: { value: 10, otherSpeeds: [{ type: 'climb', value: 10 }] },
        perception: { value: 8, details: 'motion sense 60 feet, no vision' },
        immunities: [
          { type: 'acid' },
          { type: 'critical-hits' },
          { type: 'electricity' },
          { type: 'mental' },
          { type: 'precision' },
          { type: 'unconscious' },
          { type: 'visual' },
        ],
      },
      details: {
        level: { value: 4 },
        alignment: { value: 'N' },
        creatureType: 'Ooze',
        source: { value: 'Harbinger House' },
        blurb: 'Acidic ooze that corrodes metal',
        publicNotes: `<p>Gray oozes are found in Teela's bathroom in Harbinger House. They corrode metal on contact.</p>
<p><strong>Metal Corrosion:</strong> A creature struck by the gray ooze's pseudopod must succeed at a DC 21 Reflex save or their metal armor or weapon takes 1d6 acid damage (ignoring Hardness). On a critical failure, the item takes double damage.</p>`,
      },
      saves: {
        fortitude: { value: 13, saveDetail: '' },
        reflex: { value: 5, saveDetail: '' },
        will: { value: 6, saveDetail: '' },
      },
      skills: {
        athletics: { base: 11, value: 11, label: 'Athletics', visible: true },
        stealth: { base: 6, value: 6, label: 'Stealth', visible: true },
      },
      traits: {
        value: ['mindless', 'ooze'],
        rarity: 'common',
        size: { value: 'med' },
      },
    },
    flags: {
      'harbinger-house-pf2e': {
        sourceId: 'gray-ooze',
        category: 'fiend',
      },
    },
  },
  items: [
    createStrike(
      'Pseudopod',
      12,
      { dice: 1, die: '6', type: 'bludgeoning', modifier: 5 },
      ['grab'],
      'Plus 1d6 acid and Grab'
    ),
    createAction(
      'Constrict',
      1,
      [],
      `<p>1d6+3 bludgeoning plus 1d6 acid, DC 21</p>`
    ),
    createAction(
      'Metal Corrosion',
      'passive',
      [],
      `<p>A creature struck by the gray ooze's pseudopod must succeed at a DC 21 Reflex save or their metal armor or weapon takes 1d6 acid damage (ignoring Hardness). On a critical failure, the item takes double damage.</p>`
    ),
  ],
};

// =============================================================================
// GENERIC NPCs
// =============================================================================

export const DABUS: HarbingerNPC = {
  id: 'dabus',
  category: 'generic-npc',
  data: {
    name: 'Dabus',
    type: 'npc',
    img: 'modules/harbinger-house-pf2e/assets/tokens/dabus.webp',
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
        perception: { value: 14, details: '' },
        immunities: [{ type: 'effects targeting ground or air' }],
      },
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
  },
  items: [
    createStrike('Tool', 15, { dice: 2, die: '8', type: 'bludgeoning', modifier: 5 }, ['versatile']),
    createAction(
      'Rebus Communication',
      'passive',
      [],
      `<p>Dabus communicate through illusory rebuses that float in the air. Creatures must succeed at a DC 22 Society check to interpret their meaning.</p>`
    ),
    createAction(
      'Civic Duty',
      'passive',
      [],
      `<p>Dabus gain a +2 circumstance bonus to Crafting checks to repair structures or trim razorvine.</p>`
    ),
    createAction(
      "The Lady's Servants",
      'passive',
      [],
      `<p>If the dabus are attacked, they can call for reinforcements. 1d4 additional dabus arrive each round until the threat is neutralized.</p>`
    ),
  ],
};

export const HARMONIUM_AGENT: HarbingerNPC = {
  id: 'harmonium-agent',
  category: 'generic-npc',
  data: {
    name: 'Harmonium Agent',
    type: 'npc',
    img: 'modules/harbinger-house-pf2e/assets/tokens/harmonium-agent.webp',
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
        perception: { value: 12, details: '' },
      },
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
  },
  items: [
    systemWeapon('scimitar'),
    systemAction('attackOfOpportunity'),
    createAction(
      'Hardhead Tactics',
      'passive',
      [],
      `<p>When a Harmonium agent succeeds at an Athletics check to Shove, the target is also flat-footed until the end of the agent's next turn.</p>`
    ),
    createAction(
      'Arrest',
      1,
      [],
      `<p>The agent can attempt to Grapple a creature. On a success, they can also attempt to apply manacles as part of the same action.</p>`
    ),
  ],
};

export const ANARCHIST: HarbingerNPC = {
  id: 'anarchist',
  category: 'generic-npc',
  data: {
    name: 'Anarchist',
    type: 'npc',
    img: 'modules/harbinger-house-pf2e/assets/tokens/anarchist.webp',
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
        perception: { value: 13, details: '' },
      },
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
  },
  items: [
    systemWeapon('shortsword'),
    createAction(
      'Sneak Attack',
      'passive',
      [],
      `<p>The anarchist deals an extra 2d6 precision damage to flat-footed creatures.</p>`
    ),
    createAction(
      'Revolutionary Fervor',
      'passive',
      [],
      `<p>The anarchist gains a +2 circumstance bonus to saves against effects that would make them change their beliefs or follow authority.</p>`
    ),
    createAction(
      'Sudden Strike',
      'free',
      [],
      `<p><strong>Trigger</strong> The anarchist rolls initiative.</p>
<p><strong>Effect</strong> The anarchist can Stride up to half their Speed.</p>`
    ),
  ],
};

export const XERO_BAOX: HarbingerNPC = {
  id: 'xero-baox',
  category: 'generic-npc',
  data: {
    name: 'Xero Baox',
    type: 'npc',
    img: 'modules/harbinger-house-pf2e/assets/tokens/xero-baox.webp',
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
        perception: { value: 20, details: '' },
        resistances: [{ type: 'fire', value: 5 }],
      },
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
      `<p>Xero fires the slaying arrow. If it hits a bard, that creature must succeed at a DC 32 Fortitude save or die instantly. On a success, the target takes 10d10 piercing damage.</p>`
    ),
    createAction(
      'Fanatic Assault',
      2,
      [],
      `<p>Xero makes two Strikes. If both hit the same target, the target is flat-footed against Xero until the end of Xero's next turn.</p>`
    ),
  ],
};

export const LADYS_CULTIST: HarbingerNPC = {
  id: 'ladys-cultist',
  category: 'cultist',
  data: {
    name: "Lady's Cultist",
    type: 'npc',
    img: 'modules/harbinger-house-pf2e/assets/tokens/cultist.webp',
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
        perception: { value: 4, details: '' },
      },
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
  },
  items: [
    createStrike('Fist', 3, { dice: 1, die: '4', type: 'bludgeoning', modifier: 0 }, ['agile', 'nonlethal']),
    createAction(
      'Devoted',
      'passive',
      [],
      `<p>The cultist gains a +2 circumstance bonus to saves against fear effects related to the Lady of Pain.</p>`
    ),
    createAction(
      'Willing Sacrifice',
      'passive',
      [],
      `<p>The cultist does not attempt to flee or defend themselves against the Lady of Pain or her servants.</p>`
    ),
  ],
};

export const BARMY: HarbingerNPC = {
  id: 'barmy',
  category: 'cultist',
  data: {
    name: 'Barmy',
    type: 'npc',
    img: 'modules/harbinger-house-pf2e/assets/tokens/barmy.webp',
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
        perception: { value: 6, details: '' },
      },
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
  },
  items: [
    createStrike('Fist', 8, { dice: 1, die: '4', type: 'bludgeoning', modifier: 4 }, ['agile', 'nonlethal']),
    createAction(
      'Addled Mind',
      'passive',
      [],
      `<p>The barmy's chaotic thought patterns grant them a +2 circumstance bonus to Will saves against mental effects but a −2 penalty to initiative (already included in Perception).</p>`
    ),
    createAction(
      'Innate Spark',
      'passive',
      [],
      `<p>Each barmy in Harbinger House has a minor supernatural ability marking them as a "power-to-be" (specific ability varies).</p>`
    ),
  ],
};

export const GODSMAN_CARETAKER: HarbingerNPC = {
  id: 'godsman-caretaker',
  category: 'cultist',
  data: {
    name: 'Godsman Caretaker',
    type: 'npc',
    img: 'modules/harbinger-house-pf2e/assets/tokens/godsman.webp',
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
        perception: { value: 6, details: '' },
      },
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
  },
  items: [
    createStrike('Fist', 4, { dice: 1, die: '4', type: 'bludgeoning', modifier: 1 }, ['agile', 'nonlethal']),
    createAction(
      "Believer's Patience",
      'passive',
      [],
      `<p>The Godsman gains a +2 circumstance bonus to Diplomacy checks to calm distressed individuals and to Medicine checks to treat mental conditions.</p>`
    ),
    createAction(
      'Source Philosophy',
      'passive',
      [],
      `<p>The Godsman believes all beings are on a path toward ultimate ascension and treats even the most disturbed residents with respect and care.</p>`
    ),
  ],
};

// Export all generic NPCs and fiends
export const FIENDS: HarbingerNPC[] = [DRETCH, MANES, CRANIUM_RAT_SWARM, GRAY_OOZE];

export const GENERIC_NPCS: HarbingerNPC[] = [
  DABUS,
  HARMONIUM_AGENT,
  ANARCHIST,
  XERO_BAOX,
  LADYS_CULTIST,
  BARMY,
  GODSMAN_CARETAKER,
];

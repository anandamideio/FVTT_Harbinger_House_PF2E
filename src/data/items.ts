/**
 * Harbinger House Item Data
 * Converted from AD&D 2e to Pathfinder 2e
 * 
 * This file contains all unique magic items, artifacts, and consumables
 * from the Harbinger House adventure module.
 * 
 * Item Categories:
 * - artifact: Major artifacts (The Planarity, The Focrux)
 * - weapon: Unique magical weapons
 * - armor: Armor and protective items
 * - equipment: Wondrous items and staves
 * - consumable: Potions, elixirs, scrolls
 */

import type { ItemData } from '../types/foundry';

// Item categories for organization
export type ItemCategory =
  | 'artifact'
  | 'weapon'
  | 'armor'
  | 'equipment'
  | 'consumable';

export interface HarbingerItem {
  id: string;
  category: ItemCategory;
  data: ItemData;
}

// ============================================================================
// MAJOR ARTIFACTS
// ============================================================================

const THE_PLANARITY: HarbingerItem = {
  id: 'the-planarity',
  category: 'artifact',
  data: {
    name: 'The Planarity',
    type: 'equipment',
    img: 'icons/commodities/gems/gem-cluster-blue-white.webp',
    system: {
      description: {
        value: `<p>This deep-blue stone sphere fits perfectly in the palm of a hand. At rest, it appears perfectly round and smooth. However, when within 50 feet of a planar portal, the planarity reacts with visible excitement—spiky protrusions emerge and retract from its surface, and a storm of multicolored energy rises from its depths to dance along the inner surface.</p>
<p>The planarity is the key to Harbinger House, capable of opening any door within the structure—both mundane and planar. It also constantly records images and sounds from its immediate vicinity.</p>
<hr/>
<p><strong>Activate</strong> <span class="action-glyph">1</span> (command)</p>
<p><strong>Requirements</strong> You know the command word (held only by the Godsmen factol)</p>
<p><strong>Effect</strong> The planarity opens any locked door in Harbinger House or activates any planar portal within the House. The sphere rises and floats a few inches above your palm while the portal remains open.</p>
<hr/>
<p><strong>Activate</strong> <span class="action-glyph">2</span> (envision)</p>
<p><strong>Effect</strong> The planarity projects stored images from the previous few hours as life-sized illusions visible to all nearby. Only the Godsmen factol can access the complete historical record; others can only view recent events.</p>
<hr/>
<p><strong>Special</strong> The planarity must be held in an open palm to function; it doesn't work from a pocket or pack. The item is intricately tied to Harbinger House and functions only within or in proximity to the structure.</p>`
      },
      rules: [],
      slug: 'the-planarity',
      level: { value: 20 },
      traits: {
        value: ['artifact', 'magical', 'arcane'],
        rarity: 'unique'
      },
      usage: { value: 'held-in-one-hand' },
      bulk: { value: 'L' },
      equipped: { carryType: 'held', handsHeld: 1 }
    }
  }
};

const THE_FOCRUX: HarbingerItem = {
  id: 'the-focrux',
  category: 'artifact',
  data: {
    name: 'The Focrux',
    type: 'equipment',
    img: 'icons/commodities/gems/pearl-blue-gold.webp',
    system: {
      description: {
        value: `<p>This massive globe, approximately 15 feet in diameter, is a larger version of the planarity. It appears to be made of deep-blue stone with constantly shifting protrusions and an internal storm of planar energy. The focrux serves as the spiritual core of Harbinger House, acting as a conduit for planar energies.</p>
<hr/>
<h3>Anti-Scrying Field</h3>
<p><em>(aura, abjuration, magical) Harbinger House</em></p>
<p>The focrux generates a field that blocks all divination magic targeting Harbinger House or its inhabitants. Not even deities can scry within the House while the focrux is operational. This effect extends to the entire structure.</p>
<hr/>
<h3>Planar Nexus</h3>
<p>The focrux powers all of Harbinger House's unusual properties, including:</p>
<ul>
<li>The House being larger on the inside than the outside</li>
<li>The exterior reflecting magic (preventing teleportation into the House)</li>
<li>The stability of the numerous planar portals within</li>
</ul>
<hr/>
<h3>Destruction</h3>
<p>The focrux can only be destroyed by magical weapons. A creature must succeed at a Strike against <strong>AC 24</strong> with a magical weapon. Rather than dealing damage, each successful Strike forces the focrux to attempt a <strong>DC 15 flat check</strong> (with a bonus equal to the weapon's item bonus). On a failure, the focrux shatters.</p>
<p><strong>When the focrux is destroyed:</strong></p>
<ul>
<li>Everyone within 30 feet takes <strong>10d10 piercing damage</strong> (DC 40 basic Reflex save) from the explosion of sharp shards and planar energy</li>
<li>A pillar of light erupts through the roof, alerting the Lady of Pain</li>
<li>The anti-scrying field immediately ends</li>
<li>All planar portals within Harbinger House become unstable</li>
</ul>`
      },
      rules: [],
      slug: 'the-focrux',
      level: { value: 22 },
      traits: {
        value: ['artifact', 'magical'],
        rarity: 'unique'
      },
      bulk: { value: '-' }
    }
  }
};

// ============================================================================
// UNIQUE WEAPONS
// ============================================================================

const LAW_SLAYER: HarbingerItem = {
  id: 'law-slayer',
  category: 'weapon',
  data: {
    name: 'Law Slayer',
    type: 'weapon',
    img: 'icons/weapons/swords/sword-guard-purple.webp',
    system: {
      description: {
        value: `<p>This dark longsword radiates an aura of primal chaos. Its blade seems to shimmer with barely contained anarchic energy, and when it strikes a lawful creature, that energy erupts in a burst of destructive force.</p>
<p>The law slayer functions as a <strong>+2 greater striking anarchic longsword</strong>. Against lawful creatures, it deals an additional <strong>2d6 unholy damage</strong> beyond the normal anarchic property.</p>
<hr/>
<h3>Ritual Conduit</h3>
<p>The law slayer was forged to serve as a conduit for Sougad's ascension ritual. When used to slay lawful creatures in the proper ritual fashion (with specific spell components and blood-written parchments), it absorbs their spiritual essence. After 13 such ritual killings in proximity to the focrux, the wielder can use the sword to open a conduit to godhood.</p>
<hr/>
<p><strong>Special</strong> If the ritual is completed and the sword begins to glow with cascading planar energy, plunging it into a "power-to-be" (someone with divine potential like Sougad or Trolan) transforms them into a lesser deity. Using it on anyone else simply kills them without any transformation.</p>`
      },
      rules: [
        {
          key: 'FlatModifier',
          selector: 'damage',
          value: '2d6[unholy]',
          predicate: ['target:trait:holy'],
          label: 'Extra Unholy Damage vs Holy'
        }
      ],
      slug: 'law-slayer',
      level: { value: 14 },
      traits: {
        value: ['magical', 'unholy', 'aberration', 'demon'],
        rarity: 'unique'
      },
      usage: { value: 'held-in-one-hand' },
      bulk: { value: 1 },
      baseItem: 'longsword',
      damage: { dice: 3, die: 'd8', damageType: 'slashing' },
      bonus: { value: 2 },
      runes: {
        potency: 2,
        striking: 2,
        property: ['astral (greater)']
      },
      material: {
        type: 'warpglass'
      },
      group: 'sword',
      category: 'martial',
      equipped: { carryType: 'held', handsHeld: 1 }
    }
  }
};

const LONG_SWORD_OF_THE_PLANES: HarbingerItem = {
  id: 'long-sword-of-the-planes',
  category: 'weapon',
  data: {
    name: 'Long Sword of the Planes',
    type: 'weapon',
    img: 'icons/weapons/swords/sword-guard-brass-worn.webp',
    system: {
      description: {
        value: `<p>This elegant longsword features a black jewel in its pommel that glows with the energy of the multiverse. Looking into the jewel reveals what appears to be a portion of space, complete with stars and glowing gases, trapped within.</p>
<p>The sword's enchantment resonates with different planes, granting varying bonuses based on location or opponent origin:</p>
<ul>
<li><strong>Material Plane:</strong> +1 striking longsword</li>
<li><strong>Inner Planes</strong> (or vs. elementals): +1 striking longsword with +1 circumstance bonus to damage</li>
<li><strong>Outer Planes</strong> (or vs. celestials, fiends, monitors): +2 striking longsword</li>
<li><strong>Astral or Ethereal Planes</strong> (or vs. astral/ethereal creatures): +2 greater striking longsword</li>
</ul>
<p>The sword's properties also apply when fighting creatures native to those planes, regardless of the current location of the combat.</p>
<hr/>
<p><strong>Special</strong> The sword's true nature is not immediately apparent. Identifying the item requires a <strong>DC 30 Identify Magic</strong> check or experimentation on different planes.</p>`
      },
      rules: [],
      slug: 'long-sword-of-the-planes',
      level: { value: 12 },
      price: { value: { gp: 4000 } },
      traits: {
        value: ['magical', 'astral'],
        rarity: 'rare'
      },
      usage: { value: 'held-in-one-hand' },
      bulk: { value: 1 },
      baseItem: 'longsword',
      damage: { dice: 2, die: 'd8', damageType: 'slashing' },
      bonus: { value: 1 },
      runes: {
        potency: 1,
        striking: 1
      },
      group: 'sword',
      category: 'martial',
      equipped: { carryType: 'held', handsHeld: 1 }
    }
  }
};

const SHORT_SWORD_OF_QUICKNESS: HarbingerItem = {
  id: 'short-sword-of-quickness',
  category: 'weapon',
  data: {
    name: 'Short Sword of Quickness',
    type: 'weapon',
    img: 'icons/weapons/swords/shortsword-guard-purple.webp',
    system: {
      description: {
        value: `<p>This finely balanced blade seems to anticipate its wielder's movements, allowing for incredibly swift strikes.</p>
<p>The short sword of quickness functions as a <strong>+2 striking short sword</strong>. Additionally, on the first round of any combat, the wielder automatically acts before all other combatants (as if they rolled a natural 20 on initiative and had a +20 modifier). This effect only applies if the wielder is holding the sword when initiative is rolled.</p>
<hr/>
<p><strong>Activate</strong> <span class="action-glyph">R</span> (concentrate)</p>
<p><strong>Trigger</strong> You roll initiative</p>
<p><strong>Effect</strong> You draw the short sword of quickness as a free action.</p>`
      },
      rules: [
        {
          key: 'FlatModifier',
          selector: 'initiative',
          value: 20,
          label: 'Short Sword of Quickness (first round only)'
        }
      ],
      slug: 'short-sword-of-quickness',
      level: { value: 10 },
      traits: {
        value: ['magical', 'finesse'],
        rarity: 'rare'
      },
      usage: { value: 'held-in-one-hand' },
      bulk: { value: 'L' },
      baseItem: 'shortsword',
      damage: { dice: 2, die: 'd6', damageType: 'piercing' },
      bonus: { value: 2 },
      runes: {
        potency: 2,
        striking: 1
      },
      group: 'sword',
      category: 'martial',
      equipped: { carryType: 'held', handsHeld: 1 }
    }
  }
};

const AZTRALS_SPOON: HarbingerItem = {
  id: 'aztrals-spoon-of-absorption',
  category: 'weapon',
  data: {
    name: "Aztral's Spoon of Absorption",
    type: 'weapon',
    img: 'icons/tools/cooking/spoon-ladle-brown.webp',
    system: {
      description: {
        value: `<p>This large wooden cooking spoon glows with a faint silvery light. In Aztral's hands, it serves as both a focus for his absorption ability and a surprisingly effective weapon.</p>
<p>The spoon functions as a <strong>+1 striking club</strong>. When Aztral successfully uses his Absorption ability on a target, the spoon glows more brightly, and its damage die increases by one step for the next minute.</p>
<hr/>
<p><strong>Special</strong> This item only functions for Aztral of the Many Faces. In anyone else's hands, it's simply an ordinary wooden spoon worth 1 cp.</p>`
      },
      rules: [],
      slug: 'aztrals-spoon-of-absorption',
      level: { value: 8 },
      traits: {
        value: ['magical'],
        rarity: 'unique'
      },
      usage: { value: 'held-in-one-hand' },
      bulk: { value: 'L' },
      baseItem: 'club',
      damage: { dice: 2, die: 'd6', damageType: 'bludgeoning' },
      bonus: { value: 1 },
      runes: {
        potency: 1,
        striking: 1
      },
      group: 'club',
      category: 'simple',
      equipped: { carryType: 'held', handsHeld: 1 }
    }
  }
};

// ============================================================================
// ARMOR AND PROTECTIVE ITEMS
// ============================================================================

const CLOAK_OF_FIGMENTS: HarbingerItem = {
  id: 'cloak-of-figments',
  category: 'armor',
  data: {
    name: 'Cloak of Figments',
    type: 'armor',
    img: 'icons/equipment/back/cloak-layered-purple.webp',
    system: {
      description: {
        value: `<p>This appears to be a black cloak, but closer inspection reveals it to be composed of dozens of tiny, humanoid shadow creatures—figments of Tomin's imagination made real by his aberrant mental powers. They cling together from his back and arms, forming a cloaklike cape of moving, chattering beings.</p>
<p>The cloak grants a <strong>+2 item bonus to AC</strong> and provides the following ability:</p>
<hr/>
<p><strong>Figment Shield</strong> <span class="action-glyph">R</span></p>
<p><strong>Trigger</strong> You are targeted by an attack</p>
<p><strong>Effect</strong> The figments swirl protectively, granting you a <strong>+2 circumstance bonus to AC</strong> against the triggering attack.</p>
<hr/>
<p><strong>Special</strong> The cloak of figments only functions for Tomin. For anyone else, the figments dissipate harmlessly, leaving behind an ordinary black cloak worth 5 gp. The figments Tomin creates originate from this cloak.</p>`
      },
      rules: [
        {
          key: 'FlatModifier',
          selector: 'ac',
          value: 2,
          type: 'item'
        }
      ],
      slug: 'cloak-of-figments',
      level: { value: 10 },
      traits: {
        value: ['magical', 'illusion'],
        rarity: 'unique'
      },
      category: 'light',
      acBonus: 2,
      bulk: { value: 'L' },
      equipped: { carryType: 'worn' }
    }
  }
};

const BRACERS_OF_ARMOR: HarbingerItem = {
  id: 'bracers-of-armor-type-ii',
  category: 'armor',
  data: {
    name: 'Bracers of Armor (Type II)',
    type: 'equipment',
    img: 'icons/equipment/wrist/bracer-armored-gold.webp',
    system: {
      description: {
        value: `<p>These slim bracers grant a <strong>+2 item bonus to AC</strong> when you aren't wearing armor. The bracers can be etched with armor property runes, though their benefits apply only when not wearing armor.</p>
<p><em>Note: These are Teela's bracers, equivalent to standard PF2e bracers of armor.</em></p>`
      },
      rules: [
        {
          key: 'FlatModifier',
          selector: 'ac',
          value: 2,
          type: 'item',
          predicate: ['self:armor:none']
        }
      ],
      slug: 'bracers-of-armor-type-ii',
      level: { value: 9 },
      price: { value: { gp: 750 } },
      traits: {
        value: ['magical', 'invested'],
        rarity: 'common'
      },
      usage: { value: 'worn-bracers' },
      bulk: { value: 'L' },
      equipped: { carryType: 'worn', invested: true }
    }
  }
};

// ============================================================================
// STAVES AND IMPLEMENTS
// ============================================================================

const STAFF_OF_WITHERING: HarbingerItem = {
  id: 'staff-of-withering',
  category: 'equipment',
  data: {
    name: 'Staff of Withering',
    type: 'weapon',
    img: 'icons/weapons/staves/staff-ornate-skull.webp',
    system: {
      description: {
        value: `<p>This gnarled black staff is cold to the touch and seems to drain warmth from its surroundings. In the hands of a spellcaster devoted to death and entropy, it becomes a fearsome weapon.</p>
<p>The staff functions as a <strong>+2 striking staff</strong> and can be used as a weapon dealing 1d4 bludgeoning damage. It can be prepared with the following spells, requiring 4 charges at the beginning of each day:</p>
<ul>
<li><strong>Cantrip:</strong> chill touch</li>
<li><strong>1st:</strong> ray of enfeeblement</li>
<li><strong>2nd:</strong> gentle repose</li>
<li><strong>3rd:</strong> vampiric touch</li>
<li><strong>4th:</strong> enervation</li>
<li><strong>5th:</strong> cloudkill</li>
</ul>
<hr/>
<p><strong>Withering Touch</strong> <span class="action-glyph">2</span> (necromancy, magical)</p>
<p><strong>Frequency</strong> once per day</p>
<p><strong>Effect</strong> You make a melee Strike with the staff. On a hit, in addition to normal damage, the target must succeed at a <strong>DC 29 Fortitude save</strong> or become <strong>enfeebled 2</strong> and <strong>drained 1</strong>. On a critical failure, the conditions increase to <strong>enfeebled 3</strong> and <strong>drained 2</strong>.</p>`
      },
      rules: [],
      slug: 'staff-of-withering',
      level: { value: 12 },
      price: { value: { gp: 1800 } },
      traits: {
        value: ['magical', 'staff', 'unholy'],
        rarity: 'common'
      },
      usage: { value: 'held-in-one-hand' },
      bulk: { value: 1 },
      baseItem: 'staff',
      damage: { dice: 2, die: 'd4', damageType: 'bludgeoning' },
      bonus: { value: 2 },
      runes: {
        potency: 2,
        striking: 1
      },
      group: 'club',
      category: 'simple',
      equipped: { carryType: 'held', handsHeld: 1 }
    }
  }
};

// ============================================================================
// WONDROUS ITEMS
// ============================================================================

const VORINAS_HEALING_MIRROR: HarbingerItem = {
  id: 'vorinas-healing-mirror',
  category: 'equipment',
  data: {
    name: "Vorina's Healing Mirror",
    type: 'equipment',
    img: 'icons/sundries/misc/mirror-golden.webp',
    system: {
      description: {
        value: `<p>This ornate mirror hangs in Vorina's kitchen within Harbinger House. Rather than showing a true reflection, it displays the viewer at their most vital and alive—skin glowing with health, eyes bright, posture perfect. The mirror amplifies the viewer's life force.</p>
<hr/>
<p><strong>Activate</strong> (10 minutes) (concentrate, manipulate)</p>
<p><strong>Effect</strong> You spend 10 minutes gazing into the mirror, watching your reflection become increasingly vibrant. At the end of this time, you regain <strong>2d4 Hit Points</strong> (up to your maximum HP). This healing is a positive energy effect.</p>
<hr/>
<p><strong>Special</strong> The mirror can only heal each creature once per day. The mirror only functions within Harbinger House; if removed, it becomes an ordinary (though very flattering) mirror.</p>`
      },
      rules: [],
      slug: 'vorinas-healing-mirror',
      level: { value: 6 },
      traits: {
        value: ['magical', 'unholy', 'vitality'],
        rarity: 'unique'
      },
      usage: { value: 'mounted' },
      bulk: { value: 2 }
    }
  }
};

const TEELAS_MIRROR_OF_MORTALITY: HarbingerItem = {
  id: 'teelas-mirror-of-mortality',
  category: 'equipment',
  data: {
    name: "Teela's Mirror of Mortality",
    type: 'equipment',
    img: 'icons/sundries/misc/mirror-cracked.webp',
    system: {
      description: {
        value: `<p>This dark mirror hangs in Teela's kitchen within Harbinger House. It reflects viewers not as they are, but as Teela sees them—showing the slow decay of flesh, the ebbing of life force, the inevitable march toward death. Bodies appear pale, sickly, skeletal, or rotting depending on the viewer's age and health.</p>
<hr/>
<h3>Deadly Fascination</h3>
<p><em>(aura, emotion, enchantment, visual) 10 feet</em></p>
<p>Any creature that sees its reflection in the mirror must attempt a <strong>DC 27 Will save</strong>.</p>
<p><strong>Critical Success:</strong> The creature is unaffected and immune to this mirror for 24 hours.</p>
<p><strong>Success:</strong> The creature is fascinated for 1 round but can look away freely afterward.</p>
<p><strong>Failure:</strong> The creature is fascinated and cannot willingly look away for 1d4 rounds. At the end of each round, it takes <strong>1d4 negative damage</strong> as its life force drains away.</p>
<p><strong>Critical Failure:</strong> As failure, but the fascination lasts 1d4 minutes, and the damage increases to <strong>2d4 negative damage</strong> per round.</p>
<hr/>
<p><strong>Destruction:</strong> The mirror can be destroyed by dealing 30 points of positive energy damage to it or by casting <em>remove curse</em> at 5th level or higher while smashing it.</p>`
      },
      rules: [],
      slug: 'teelas-mirror-of-mortality',
      level: { value: 10 },
      traits: {
        value: ['magical', 'unholy', 'void'],
        rarity: 'unique'
      },
      usage: { value: 'mounted' },
      bulk: { value: 2 }
    }
  }
};

const LUCKY_CHARM_LIZARD_CLAW: HarbingerItem = {
  id: 'lucky-charm-lizard-claw',
  category: 'equipment',
  data: {
    name: "Lucky Charm (Lizard's Claw)",
    type: 'equipment',
    img: 'icons/commodities/claws/claw-green.webp',
    system: {
      description: {
        value: `<p>This preserved lizard's claw has been enchanted to bring good fortune to its bearer. While carrying it, you gain a <strong>+1 item bonus to all saving throws</strong>.</p>
<hr/>
<p><strong>Activate</strong> <span class="action-glyph">F</span> (fortune)</p>
<p><strong>Frequency</strong> once per day</p>
<p><strong>Trigger</strong> You fail a saving throw</p>
<p><strong>Effect</strong> Reroll the saving throw and use the better result.</p>`
      },
      rules: [
        {
          key: 'FlatModifier',
          selector: 'saving-throw',
          value: 1,
          type: 'item'
        }
      ],
      slug: 'lucky-charm-lizard-claw',
      level: { value: 5 },
      price: { value: { gp: 150 } },
      traits: {
        value: ['magical', 'scrying', 'fortune'],
        rarity: 'common'
      },
      usage: { value: 'worn' },
      bulk: { value: '-' },
      equipped: { carryType: 'worn' }
    }
  }
};

const LUCKY_CHARM_BLUE_FEATHER: HarbingerItem = {
  id: 'lucky-charm-blue-feather',
  category: 'equipment',
  data: {
    name: 'Lucky Charm (Blue Feather)',
    type: 'equipment',
    img: 'icons/commodities/materials/feather-blue.webp',
    system: {
      description: {
        value: `<p>This bright blue feather glows faintly with good fortune. While carrying it, you gain a <strong>+1 item bonus to all saving throws</strong>.</p>
<hr/>
<p><strong>Activate</strong> <span class="action-glyph">F</span> (fortune)</p>
<p><strong>Frequency</strong> once per day</p>
<p><strong>Trigger</strong> You fail a saving throw</p>
<p><strong>Effect</strong> Reroll the saving throw and use the better result.</p>`
      },
      rules: [
        {
          key: 'FlatModifier',
          selector: 'saving-throw',
          value: 1,
          type: 'item'
        }
      ],
      slug: 'lucky-charm-blue-feather',
      level: { value: 5 },
      price: { value: { gp: 150 } },
      traits: {
        value: ['magical', 'scrying', 'fortune'],
        rarity: 'common'
      },
      usage: { value: 'worn' },
      bulk: { value: '-' },
      equipped: { carryType: 'worn' }
    }
  }
};

// ============================================================================
// CONSUMABLES - ELIXIRS
// ============================================================================

const ELIXIR_OF_HEALTH: HarbingerItem = {
  id: 'elixir-of-health',
  category: 'consumable',
  data: {
    name: 'Elixir of Health',
    type: 'consumable',
    img: 'icons/consumables/potions/potion-bottle-corked-glowing-white.webp',
    system: {
      description: {
        value: `<p>This crystal-clear elixir purifies the mind and body of afflictions.</p>
<hr/>
<p><strong>Activate</strong> <span class="action-glyph">1</span> (Interact)</p>
<p><strong>Effect</strong> You drink the elixir. You gain the effects of a 4th-level <em>restoration</em> spell, removing one condition affecting you chosen from <strong>drained</strong>, <strong>enfeebled</strong>, or <strong>clumsy</strong>, or reducing your <strong>stupefied</strong> or <strong>confused</strong> condition by 2.</p>
<hr/>
<p><strong>Special</strong> Within Harbinger House, this elixir can cure the madness of the barmies (powers-to-be) residing there. However, a barmy "cured" in this manner loses all of their innate powers permanently.</p>`
      },
      rules: [],
      slug: 'elixir-of-health',
      level: { value: 8 },
      price: { value: { gp: 100 } },
      traits: {
        value: ['alchemical', 'consumable', 'elixir', 'healing'],
        rarity: 'common'
      },
      consumableType: { value: 'elixir' },
      bulk: { value: 'L' },
      uses: { value: 1, max: 1, autoDestroy: true }
    }
  }
};

const ELIXIR_OF_MADNESS: HarbingerItem = {
  id: 'elixir-of-madness',
  category: 'consumable',
  data: {
    name: 'Elixir of Madness',
    type: 'consumable',
    img: 'icons/consumables/potions/potion-bottle-corked-swirl-purple.webp',
    system: {
      description: {
        value: `<p>This swirling, iridescent liquid smells faintly of burning metal and seems to whisper at the edge of hearing.</p>
<hr/>
<p><strong>Activate</strong> <span class="action-glyph">1</span> (Interact)</p>
<p><strong>Effect</strong> You drink the elixir. You must attempt a <strong>DC 26 Will save</strong>.</p>
<p><strong>Critical Success:</strong> You are unaffected.</p>
<p><strong>Success:</strong> You are <strong>stupefied 1</strong> for 1 hour.</p>
<p><strong>Failure:</strong> You are <strong>stupefied 2</strong> and <strong>confused</strong> for 1 minute, then <strong>stupefied 2</strong> for 1 hour.</p>
<p><strong>Critical Failure:</strong> You are <strong>stupefied 3</strong> and <strong>confused</strong> for 10 minutes, then <strong>stupefied 2</strong> for 24 hours. You gain a persistent delusion chosen by the GM that can only be removed by an elixir of health or similar effect.</p>
<hr/>
<p><strong>Special</strong> The elixir of health can remove all effects from this elixir.</p>`
      },
      rules: [],
      slug: 'elixir-of-madness',
      level: { value: 8 },
      price: { value: { gp: 100 } },
      traits: {
        value: ['alchemical', 'consumable', 'elixir', 'poison'],
        rarity: 'uncommon'
      },
      consumableType: { value: 'elixir' },
      bulk: { value: 'L' },
      uses: { value: 1, max: 1, autoDestroy: true }
    }
  }
};

// ============================================================================
// CONSUMABLES - POTIONS
// ============================================================================

const POTION_HEALING_MINOR: HarbingerItem = {
  id: 'potion-of-healing-minor',
  category: 'consumable',
  data: {
    name: 'Potion of Healing (Minor)',
    type: 'consumable',
    img: 'icons/consumables/potions/potion-bottle-corked-red.webp',
    system: {
      description: {
        value: `<p>A simple healing potion that restores a small amount of health.</p>
<hr/>
<p><strong>Activate</strong> <span class="action-glyph">1</span> (Interact)</p>
<p><strong>Effect</strong> You regain <strong>1d8 Hit Points</strong>.</p>`
      },
      rules: [],
      slug: 'potion-of-healing-minor',
      level: { value: 1 },
      price: { value: { gp: 4 } },
      traits: {
        value: ['consumable', 'healing', 'magical', 'potion'],
        rarity: 'common'
      },
      consumableType: { value: 'potion' },
      bulk: { value: 'L' },
      uses: { value: 1, max: 1, autoDestroy: true }
    }
  }
};

const POTION_HEALING_LESSER: HarbingerItem = {
  id: 'potion-of-healing-lesser',
  category: 'consumable',
  data: {
    name: 'Potion of Healing (Lesser)',
    type: 'consumable',
    img: 'icons/consumables/potions/potion-bottle-corked-red.webp',
    system: {
      description: {
        value: `<p>A healing potion that restores a moderate amount of health.</p>
<hr/>
<p><strong>Activate</strong> <span class="action-glyph">1</span> (Interact)</p>
<p><strong>Effect</strong> You regain <strong>2d8+5 Hit Points</strong>.</p>`
      },
      rules: [],
      slug: 'potion-of-healing-lesser',
      level: { value: 3 },
      price: { value: { gp: 12 } },
      traits: {
        value: ['consumable', 'healing', 'magical', 'potion'],
        rarity: 'common'
      },
      consumableType: { value: 'potion' },
      bulk: { value: 'L' },
      uses: { value: 1, max: 1, autoDestroy: true }
    }
  }
};

const POTION_HEALING_MODERATE: HarbingerItem = {
  id: 'potion-of-healing-moderate',
  category: 'consumable',
  data: {
    name: 'Potion of Healing (Moderate)',
    type: 'consumable',
    img: 'icons/consumables/potions/potion-bottle-corked-red.webp',
    system: {
      description: {
        value: `<p>A potent healing potion that restores significant health. This is equivalent to AD&D's "potion of extra healing".</p>
<hr/>
<p><strong>Activate</strong> <span class="action-glyph">1</span> (Interact)</p>
<p><strong>Effect</strong> You regain <strong>3d8+10 Hit Points</strong>.</p>`
      },
      rules: [],
      slug: 'potion-of-healing-moderate',
      level: { value: 6 },
      price: { value: { gp: 50 } },
      traits: {
        value: ['consumable', 'healing', 'magical', 'potion'],
        rarity: 'common'
      },
      consumableType: { value: 'potion' },
      bulk: { value: 'L' },
      uses: { value: 1, max: 1, autoDestroy: true }
    }
  }
};

// ============================================================================
// CONSUMABLES - SCROLLS
// ============================================================================

const SCROLL_STONE_TO_FLESH: HarbingerItem = {
  id: 'scroll-of-stone-to-flesh',
  category: 'consumable',
  data: {
    name: 'Scroll of Stone to Flesh',
    type: 'consumable',
    img: 'icons/sundries/scrolls/scroll-bound-sealed-brown.webp',
    system: {
      description: {
        value: `<p>This scroll contains a 6th-level <em>stone to flesh</em> spell. Two such scrolls are found in Area 27 of Harbinger House.</p>
<hr/>
<p><strong>Activate</strong> Cast a Spell</p>
<p><strong>Effect</strong> You cast <em>stone to flesh</em> at 6th level. The spell returns a petrified creature (or a portion of a creature) to flesh. The creature must attempt a <strong>DC 27 Fortitude save</strong>.</p>
<p><strong>Critical Success:</strong> The creature is fully restored.</p>
<p><strong>Success:</strong> The creature is restored but is <strong>slowed 1</strong> for 24 hours.</p>
<p><strong>Failure:</strong> The creature is restored but is <strong>slowed 1</strong> for 1 week and is permanently <strong>drained 1</strong>.</p>
<p><strong>Critical Failure:</strong> The creature remains petrified.</p>`
      },
      rules: [],
      slug: 'scroll-of-stone-to-flesh',
      level: { value: 11 },
      price: { value: { gp: 300 } },
      traits: {
        value: ['consumable', 'magical', 'scroll'],
        rarity: 'common'
      },
      consumableType: { value: 'scroll' },
      bulk: { value: 'L' },
      uses: { value: 1, max: 1, autoDestroy: true },
      spell: {
        name: 'Stone to Flesh',
        level: 6
      }
    }
  }
};

const SOUGADS_RITUAL_SCROLL: HarbingerItem = {
  id: 'sougads-ritual-scroll',
  category: 'consumable',
  data: {
    name: "Sougad's Ascension Ritual",
    type: 'consumable',
    img: 'icons/sundries/scrolls/scroll-runed-brown-black.webp',
    system: {
      description: {
        value: `<p>This blood-stained scroll, won by Chance in a card game, details the steps of the ritual that Sougad and Nari hope will transform them into powers. The scroll itself holds no magical power—it is merely instructions.</p>
<hr/>
<h3>The Ritual Requirements</h3>
<ol>
<li>A specially prepared weapon (the law slayer)</li>
<li>13 lawful victims, each killed with a specific number of sword slashes (1 slash for the first, 2 for the second, up to 13 for the last)</li>
<li>Specific spell components for each kill:
  <ul>
    <li>Kills 1-4: Three nutshells</li>
    <li>Kills 5-8: One bronze disc and one iron rod</li>
    <li>Kills 9-12: One vrock feather</li>
    <li>Kill 13: One crushed black pearl worth 1,000 gp</li>
  </ul>
</li>
<li>A parchment note written in the victim's blood, proclaiming chaos</li>
<li>Proximity to the focrux during the final kill</li>
<li>The wielder must have the "spark of divinity" (be a power-to-be)</li>
</ol>
<hr/>
<p><strong>Knowledge:</strong> Only those with divine potential—individuals the Godsmen call "powers-to-be" like Sougad and Trolan—can actually ascend through this ritual. Anyone else who attempts it simply dies when they plunge the glowing sword into themselves.</p>`
      },
      rules: [],
      slug: 'sougads-ritual-scroll',
      level: { value: 15 },
      traits: {
        value: ['magical', 'unholy', 'void', 'scroll'],
        rarity: 'unique'
      },
      consumableType: { value: 'other' },
      bulk: { value: 'L' },
      uses: { value: 1, max: 1, autoDestroy: false }
    }
  }
};

// ============================================================================
// CONSUMABLES - SPELL COMPONENTS
// ============================================================================

const ABYSSAL_LEECH: HarbingerItem = {
  id: 'abyssal-leech',
  category: 'consumable',
  data: {
    name: 'Abyssal Leech',
    type: 'consumable',
    img: 'icons/creatures/invertebrates/leech-attack-green.webp',
    system: {
      description: {
        value: `<p>These writhing, sickly-pale leeches from the Abyss are used as spell components in certain chaotic and evil rituals. Sougad uses them as part of his ritual murders.</p>
<p>As a spell component, an Abyssal leech adds <strong>+1 to the DC</strong> of any spell with the <strong>evil</strong> or <strong>chaos</strong> trait. The leech is consumed in the casting.</p>
<hr/>
<h3>If Released as a Creature</h3>
<p><strong>Abyssal Leech</strong> (Creature -1, CE, Tiny, Fiend)</p>
<ul>
<li><strong>Perception</strong> +3; darkvision</li>
<li><strong>Skills</strong> Stealth +6</li>
<li><strong>AC</strong> 12; <strong>Fort</strong> +3, <strong>Ref</strong> +6, <strong>Will</strong> +1</li>
<li><strong>HP</strong> 4</li>
<li><strong>Speed</strong> 5 feet, swim 15 feet</li>
<li><strong>Melee</strong> <span class="action-glyph">1</span> bite +4, <strong>Damage</strong> 1 piercing plus attach</li>
<li><strong>Attach:</strong> When the leech hits with a bite, it attaches and automatically deals 1 bleed damage at the start of each of the target's turns. It can be removed with a DC 15 Athletics check (Interact action).</li>
</ul>`
      },
      rules: [],
      slug: 'abyssal-leech',
      level: { value: 3 },
      price: { value: { gp: 10 } },
      traits: {
        value: ['consumable', 'magical', 'unholy', 'void'],
        rarity: 'uncommon'
      },
      consumableType: { value: 'other' },
      bulk: { value: '-' },
      uses: { value: 1, max: 1, autoDestroy: true }
    }
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

// Group items by category
export const ARTIFACT_ITEMS: HarbingerItem[] = [
  THE_PLANARITY,
  THE_FOCRUX,
];

export const WEAPON_ITEMS: HarbingerItem[] = [
  LAW_SLAYER,
  LONG_SWORD_OF_THE_PLANES,
  SHORT_SWORD_OF_QUICKNESS,
  AZTRALS_SPOON,
  STAFF_OF_WITHERING,
];

export const ARMOR_ITEMS: HarbingerItem[] = [
  CLOAK_OF_FIGMENTS,
  BRACERS_OF_ARMOR,
];

export const EQUIPMENT_ITEMS: HarbingerItem[] = [
  VORINAS_HEALING_MIRROR,
  TEELAS_MIRROR_OF_MORTALITY,
  LUCKY_CHARM_LIZARD_CLAW,
  LUCKY_CHARM_BLUE_FEATHER,
];

export const CONSUMABLE_ITEMS: HarbingerItem[] = [
  ELIXIR_OF_HEALTH,
  ELIXIR_OF_MADNESS,
  POTION_HEALING_MINOR,
  POTION_HEALING_LESSER,
  POTION_HEALING_MODERATE,
  SCROLL_STONE_TO_FLESH,
  SOUGADS_RITUAL_SCROLL,
  ABYSSAL_LEECH,
];

// All items combined
export const ALL_ITEMS: HarbingerItem[] = [
  ...ARTIFACT_ITEMS,
  ...WEAPON_ITEMS,
  ...ARMOR_ITEMS,
  ...EQUIPMENT_ITEMS,
  ...CONSUMABLE_ITEMS,
];

// Items grouped by category for UI display
export const ITEMS_BY_CATEGORY: Record<ItemCategory, HarbingerItem[]> = {
  'artifact': ARTIFACT_ITEMS,
  'weapon': WEAPON_ITEMS,
  'armor': ARMOR_ITEMS,
  'equipment': EQUIPMENT_ITEMS,
  'consumable': CONSUMABLE_ITEMS,
};

// Get human-readable category names
export function getItemCategoryLabel(category: ItemCategory): string {
  const labels: Record<ItemCategory, string> = {
    'artifact': 'Artifacts',
    'weapon': 'Weapons',
    'armor': 'Armor & Protective Items',
    'equipment': 'Wondrous Items & Equipment',
    'consumable': 'Consumables',
  };
  return labels[category];
}

// Quick lookup by ID
export function getItemById(id: string): HarbingerItem | undefined {
  return ALL_ITEMS.find(item => item.id === id);
}

/**
 * PF2e System Compendium Item References
 * 
 * This file contains UUID mappings to items in the PF2e system compendiums.
 * Using system items ensures compatibility with system updates and reduces
 * maintenance burden for standard equipment.
 * 
 * UUID Format: Compendium.pf2e.<pack>.Item.<id>
 */

// =============================================================================
// WEAPONS
// =============================================================================

export const SYSTEM_WEAPONS = {
  // Simple Melee
  dagger: 'Compendium.pf2e.equipment-srd.Item.rQWaJhI5Bko5x14Z',
  gauntlet: 'Compendium.pf2e.equipment-srd.Item.kS9pwHr2xnQqK2We',
  lightMace: 'Compendium.pf2e.equipment-srd.Item.5sH5phL3FDrSVYlS',
  longspear: 'Compendium.pf2e.equipment-srd.Item.sRLJatTY9c5MxfGS',
  mace: 'Compendium.pf2e.equipment-srd.Item.6HVWqo0JFcDvUVcD',
  morningstar: 'Compendium.pf2e.equipment-srd.Item.9dJlBHtS8FLx7aSN',
  spear: 'Compendium.pf2e.equipment-srd.Item.6O5U8MJpqvXhZKqJ',
  staff: 'Compendium.pf2e.equipment-srd.Item.OXjlPBULxRqOjNNc',
  
  // Simple Ranged
  crossbow: 'Compendium.pf2e.equipment-srd.Item.VnB4VNPpjq9FPdBH',
  dart: 'Compendium.pf2e.equipment-srd.Item.V4yIXMnknpSAMQiV',
  heavyCrossbow: 'Compendium.pf2e.equipment-srd.Item.J7HCrXlbZ4ZLiCYJ',
  javelin: 'Compendium.pf2e.equipment-srd.Item.5puzPFz7pTTdHnxz',
  sling: 'Compendium.pf2e.equipment-srd.Item.UCm6NZ1DzYJM3aJc',
  
  // Martial Melee
  bastardSword: 'Compendium.pf2e.equipment-srd.Item.hdvPNNlCVnuGEtvW',
  battleAxe: 'Compendium.pf2e.equipment-srd.Item.rDfcZxJJtaurlTaM',
  flail: 'Compendium.pf2e.equipment-srd.Item.u41J0EIpJXJ7qIyN',
  glaive: 'Compendium.pf2e.equipment-srd.Item.V8gDrzK6luymlEXC',
  greataxe: 'Compendium.pf2e.equipment-srd.Item.5BfRfAP1HgYQAhXY',
  greatclub: 'Compendium.pf2e.equipment-srd.Item.V2bv0xLhRMJwk3bP',
  greatsword: 'Compendium.pf2e.equipment-srd.Item.WFRymwlJu6NZbC3L',
  halberd: 'Compendium.pf2e.equipment-srd.Item.1MuZMu6TYdH9XJB9',
  lance: 'Compendium.pf2e.equipment-srd.Item.bMbXXTjC2fIbIlNv',
  longsword: 'Compendium.pf2e.equipment-srd.Item.tLa4bewBhyqzi6Ow',
  maul: 'Compendium.pf2e.equipment-srd.Item.qZ5IVmrH6OOK0FMy',
  pick: 'Compendium.pf2e.equipment-srd.Item.fCKKLlBwHuBw4aQb',
  rapier: 'Compendium.pf2e.equipment-srd.Item.TLdmhB4TQNPK6sVE',
  scimitar: 'Compendium.pf2e.equipment-srd.Item.NfQyNwxELQb7SF08',
  shortbow: 'Compendium.pf2e.equipment-srd.Item.TfF1PiLg9iyiqhvY',
  shortsword: 'Compendium.pf2e.equipment-srd.Item.ODjxHaS4BQMIA5NY',
  trident: 'Compendium.pf2e.equipment-srd.Item.cyGCgDpFvzBp7thd',
  warhammer: 'Compendium.pf2e.equipment-srd.Item.EHmS5xX7taRoLPCe',
  
  // Martial Ranged
  compositeLongbow: 'Compendium.pf2e.equipment-srd.Item.dUC8Fsa6FZtVikS3',
  compositeShortbow: 'Compendium.pf2e.equipment-srd.Item.lYMESHv3m1xXg5mM',
  longbow: 'Compendium.pf2e.equipment-srd.Item.UH28lXyXBaE8SoWp',
  
  // Unarmed
  fist: 'Compendium.pf2e.equipment-srd.Item.7UOj5hfUxosI8V0W',
} as const;

export type SystemWeaponKey = keyof typeof SYSTEM_WEAPONS;

// =============================================================================
// PROPERTY RUNES
// =============================================================================

export const PROPERTY_RUNES = {
  // Fundamental Runes - Weapon Potency
  weaponPotency1: 'Compendium.pf2e.equipment-srd.Item.JQdwHECogcTzdd8R',
  weaponPotency2: 'Compendium.pf2e.equipment-srd.Item.xfpSijEUhMvSTuHk',
  weaponPotency3: 'Compendium.pf2e.equipment-srd.Item.rPt9q3E29R7zU3HS',
  
  // Fundamental Runes - Striking
  striking: 'Compendium.pf2e.equipment-srd.Item.JQdwHECogcTzdd8R',
  greaterStriking: 'Compendium.pf2e.equipment-srd.Item.xfpSijEUhMvSTuHk',
  majorStriking: 'Compendium.pf2e.equipment-srd.Item.rPt9q3E29R7zU3HS',
  
  // Property Runes - Damage
  anarchic: 'Compendium.pf2e.equipment-srd.Item.R0nO9g4L5Jvr9qNQ',
  axiomatic: 'Compendium.pf2e.equipment-srd.Item.4Bl8T7NW27TQ2z5W',
  corrosive: 'Compendium.pf2e.equipment-srd.Item.XCpT1DQwD4PfxVQ8',
  flaming: 'Compendium.pf2e.equipment-srd.Item.XWYLYuPqX8dgzxjX',
  frost: 'Compendium.pf2e.equipment-srd.Item.7gyZgTLjEA0E6N62',
  holy: 'Compendium.pf2e.equipment-srd.Item.bRyL1uZU1KPCB8Fs',
  shock: 'Compendium.pf2e.equipment-srd.Item.nGlPXQiGqk9kIBHN',
  unholy: 'Compendium.pf2e.equipment-srd.Item.FU3X0kOj6FqgxRiP',
  
  // Property Runes - Utility
  disrupting: 'Compendium.pf2e.equipment-srd.Item.6tFFkWvwDm4hxHvY',
  fearsome: 'Compendium.pf2e.equipment-srd.Item.9S4nxFLv1Rk0qSxS',
  keen: 'Compendium.pf2e.equipment-srd.Item.o3LzBdp6mK4xYaKV',
  returning: 'Compendium.pf2e.equipment-srd.Item.3BDGR5GvLNLzFBVB',
  shifting: 'Compendium.pf2e.equipment-srd.Item.Mxjf0DU9kRqF7qVS',
  wounding: 'Compendium.pf2e.equipment-srd.Item.xS4SyKz7X4B8MXDJ',
} as const;

export type PropertyRuneKey = keyof typeof PROPERTY_RUNES;

// =============================================================================
// SPELLS
// =============================================================================

export const SYSTEM_SPELLS = {
  // Cantrips (Level 0)
  daze: 'Compendium.pf2e.spells-srd.Item.9HpHDvG9Q28DWKGW',
  detectMagic: 'Compendium.pf2e.spells-srd.Item.MyN2jmHAbYjbMbqf',
  electricArc: 'Compendium.pf2e.spells-srd.Item.XjjjR6Q6lSOGIHIO',
  ghostSound: 'Compendium.pf2e.spells-srd.Item.z5eS2Y6RZnVFoyrv',
  light: 'Compendium.pf2e.spells-srd.Item.Og5oQ1xqF7jZAHpv',
  mageHand: 'Compendium.pf2e.spells-srd.Item.IIvdjtaZ7OqC77aI',
  message: 'Compendium.pf2e.spells-srd.Item.VzRoXlqp4yq1aDtG',
  prestidigitation: 'Compendium.pf2e.spells-srd.Item.BXMB6VKtxaGAlfzC',
  shieldCantrip: 'Compendium.pf2e.spells-srd.Item.TVi4eE1KToIooQOI',
  telekinticProjectile: 'Compendium.pf2e.spells-srd.Item.fFFbM8k9KyLIj1bM',
  
  // Level 1
  alarm: 'Compendium.pf2e.spells-srd.Item.Fhr0EMYjlKeqxrGe',
  burningHands: 'Compendium.pf2e.spells-srd.Item.1arb4RqmmYWpD3t6',
  charm: 'Compendium.pf2e.spells-srd.Item.6SsIFLnVtmCHLVkA',
  colorSpray: 'Compendium.pf2e.spells-srd.Item.lDC2lYAHjXPYpIat',
  command: 'Compendium.pf2e.spells-srd.Item.mM3oXHfapJMwXAVj',
  fear: 'Compendium.pf2e.spells-srd.Item.V2QA7MwJFM0IxaJx',
  grease: 'Compendium.pf2e.spells-srd.Item.eDiDShJxD3uvVLBQ',
  harm: 'Compendium.pf2e.spells-srd.Item.wdA52JJnsuQWeyqz',
  heal: 'Compendium.pf2e.spells-srd.Item.rfZpqmj0AIIdkVIs',
  jump: 'Compendium.pf2e.spells-srd.Item.VMl5rHbz8LR03Gld',
  magicMissile: 'Compendium.pf2e.spells-srd.Item.Mkbq9xlAUxHUHyR2',
  magicWeapon: 'Compendium.pf2e.spells-srd.Item.VhGLMkLELEfUhKLj',
  protectionFromEvil: 'Compendium.pf2e.spells-srd.Item.XNrk4jhh8lNY1Y4K',
  
  // Level 2
  blur: 'Compendium.pf2e.spells-srd.Item.SkejXfpb5w5yxX9R',
  darkness: 'Compendium.pf2e.spells-srd.Item.4GE2ZdODgIQtg51c',
  deafness: 'Compendium.pf2e.spells-srd.Item.qhXPcqxwkSj7FPIy',
  dispelMagic: 'Compendium.pf2e.spells-srd.Item.TuxoT3ug10qQpJsz',
  hideousLaughter: 'Compendium.pf2e.spells-srd.Item.HZjB6v6qdH1yeRT3',
  invisibility: 'Compendium.pf2e.spells-srd.Item.wU6hNzK8Yfqdmc8m',
  mirror: 'Compendium.pf2e.spells-srd.Item.v53L4VXpFDDvPpQP',
  seeInvisibility: 'Compendium.pf2e.spells-srd.Item.iwdjjMpGXlj9qEiS',
  silence: 'Compendium.pf2e.spells-srd.Item.e36Z2t6tLdW3RUzZ',
  soundBurst: 'Compendium.pf2e.spells-srd.Item.4prsKlRu6KHqhhRe',
  
  // Level 3
  blindness: 'Compendium.pf2e.spells-srd.Item.KI6N3piL5o5oJMf0',
  fireball: 'Compendium.pf2e.spells-srd.Item.OQaGV6O9rl9RFJX9',
  gustOfWind: 'Compendium.pf2e.spells-srd.Item.VNLMpXzELUCFdJD5',
  haste: 'Compendium.pf2e.spells-srd.Item.QO4p17HkbLjFLau2',
  lightningBolt: 'Compendium.pf2e.spells-srd.Item.V4hDNncjzgTVUDTd',
  mindReading: 'Compendium.pf2e.spells-srd.Item.p8tkzNdHe44aqxDq',
  slow: 'Compendium.pf2e.spells-srd.Item.LDKMQCbMmCe5bsHX',
  stinkingCloud: 'Compendium.pf2e.spells-srd.Item.IQv7OWQE9l5nG0OA',
  wallOfWind: 'Compendium.pf2e.spells-srd.Item.WaHW4k9BvQCgtjuK',
  
  // Level 4
  airWalk: 'Compendium.pf2e.spells-srd.Item.M7tn5w1FGfKKlLmv',
  confusion: 'Compendium.pf2e.spells-srd.Item.3x5BXC5aIW7IqRQO',
  dimensionDoor: 'Compendium.pf2e.spells-srd.Item.HWGFqCTr9RTFMMLG',
  fly: 'Compendium.pf2e.spells-srd.Item.qN9ZBbXJY8xIrpLa',
  iceStorm: 'Compendium.pf2e.spells-srd.Item.9B8IBmQIMJuCNVPt',
  suggestion: 'Compendium.pf2e.spells-srd.Item.Uq1LjANg6rJwqBFV',
  
  // Level 5
  cloudkill: 'Compendium.pf2e.spells-srd.Item.j0CDZ7Gmmt0DhBSq',
  coneOfCold: 'Compendium.pf2e.spells-srd.Item.OZ9kFqWwLRD3KXPY',
  crushingDespair: 'Compendium.pf2e.spells-srd.Item.xxW8lCGjvlqFphCL',
  flameStrike: 'Compendium.pf2e.spells-srd.Item.Tf2xddPmFbBFGCnt',
  phantasmalKiller: 'Compendium.pf2e.spells-srd.Item.YZKvlluzF2sQFRGN',
  synaesthesia: 'Compendium.pf2e.spells-srd.Item.7TjY1lmCNKzTL3fR',
  telekinesis: 'Compendium.pf2e.spells-srd.Item.clGvwIJiVJL0aJjD',
  
  // Level 6
  bladeBarrier: 'Compendium.pf2e.spells-srd.Item.jJCXlhCfWwZQ0F2V',
  chainLightning: 'Compendium.pf2e.spells-srd.Item.QSh0RaQj3nWGS8QD',
  dominate: 'Compendium.pf2e.spells-srd.Item.JqSP9MJGO4U4kMhw',
  spellTurning: 'Compendium.pf2e.spells-srd.Item.Mk4zSIOqrDGaQQId',
  trueSeeing: 'Compendium.pf2e.spells-srd.Item.ePLGRTxvIxB1rG5X',
  wallOfForce: 'Compendium.pf2e.spells-srd.Item.HsEK3wZBHPSsL3dR',
  
  // Level 7+
  fingerOfDeath: 'Compendium.pf2e.spells-srd.Item.RUwBNBelDKdaWTbr',
  planeShift: 'Compendium.pf2e.spells-srd.Item.RAZGzY1Lzzr1KPUP',
  powerWordBlind: 'Compendium.pf2e.spells-srd.Item.bQG5cqJmwMTsPLFb',
  prismaticWall: 'Compendium.pf2e.spells-srd.Item.g1Lmq2Xo2u5Vxm7W',
} as const;

export type SystemSpellKey = keyof typeof SYSTEM_SPELLS;

// =============================================================================
// ACTIONS
// =============================================================================

export const SYSTEM_ACTIONS = {
  // Standard Combat Actions
  attackOfOpportunity: 'Compendium.pf2e.actionspf2e.Item.KAVf7AmRnbCAHrkT',
  grab: 'Compendium.pf2e.actionspf2e.Item.Tkd0id24FVAVmLad',
  knockdown: 'Compendium.pf2e.actionspf2e.Item.POj2vMHLEdbV2KJX',
  constrict: 'Compendium.pf2e.actionspf2e.Item.VjxZFuUXrCU94MWR',
  
  // Movement Actions
  burrow: 'Compendium.pf2e.actionspf2e.Item.6oaXqLqNdELiSwlK',
  climb: 'Compendium.pf2e.actionspf2e.Item.A8v1yYfB3mJANArH',
  fly: 'Compendium.pf2e.actionspf2e.Item.QWexC8TsckaqyxEz',
  swim: 'Compendium.pf2e.actionspf2e.Item.E7LyQRACqiY8nYOT',
  
  // Skill Actions
  demoralize: 'Compendium.pf2e.actionspf2e.Item.2u915NdUyQan6uKF',
  feint: 'Compendium.pf2e.actionspf2e.Item.QNAVeNKtHA0EUw4X',
  grapple: 'Compendium.pf2e.actionspf2e.Item.PMbdMWc2QroouFGD',
  shove: 'Compendium.pf2e.actionspf2e.Item.7blmbDrQFNfdT731',
  trip: 'Compendium.pf2e.actionspf2e.Item.ge56Lu1xXVFYUnLP',
} as const;

export type SystemActionKey = keyof typeof SYSTEM_ACTIONS;

// =============================================================================
// ARMOR
// =============================================================================

export const SYSTEM_ARMOR = {
  // Light Armor
  leatherArmor: 'Compendium.pf2e.equipment-srd.Item.N6eEZk8AbEf7dq6U',
  studdedLeather: 'Compendium.pf2e.equipment-srd.Item.1aE06LjDPyRk8rJY',
  chainShirt: 'Compendium.pf2e.equipment-srd.Item.K7kJKdLdA5OKJMvS',
  
  // Medium Armor
  hiddenArmor: 'Compendium.pf2e.equipment-srd.Item.1d8XjvM7d5M5T13L',
  scaleMail: 'Compendium.pf2e.equipment-srd.Item.LHu2t0x1h2jmMiHv',
  chainmail: 'Compendium.pf2e.equipment-srd.Item.TUHO7Dl4PoFtbL1Q',
  breastplate: 'Compendium.pf2e.equipment-srd.Item.FjnWEzjvdbxHaRPH',
  
  // Heavy Armor
  splintMail: 'Compendium.pf2e.equipment-srd.Item.0EodM1YKf1S1L9Ii',
  halfPlate: 'Compendium.pf2e.equipment-srd.Item.47sUl9F7I8WPMoZ1',
  fullPlate: 'Compendium.pf2e.equipment-srd.Item.lWHVsQD4LdebSg5l',
  
  // Shields
  buckler: 'Compendium.pf2e.equipment-srd.Item.HSVn0yzV9ZBKx2TL',
  woodenShield: 'Compendium.pf2e.equipment-srd.Item.yYlFxfZoN5gxPzKy',
  steelShield: 'Compendium.pf2e.equipment-srd.Item.HJPuC9BNXuPNAVN8',
  towerShield: 'Compendium.pf2e.equipment-srd.Item.8A0smnX98XVBzOq9',
} as const;

export type SystemArmorKey = keyof typeof SYSTEM_ARMOR;

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Configuration for weapon runes to apply at import time
 */
export interface WeaponRuneConfig {
  potency?: 1 | 2 | 3;
  striking?: 'striking' | 'greaterStriking' | 'majorStriking';
  property?: PropertyRuneKey[];
}

/**
 * Describes a weapon from the system compendium with optional rune enhancements
 */
export interface SystemWeaponReference {
  type: 'system-weapon';
  /** The key from SYSTEM_WEAPONS or a raw UUID */
  uuid: string;
  /** Optional rune configuration to apply */
  runes?: WeaponRuneConfig;
  /** Custom description to add (e.g., for unique weapons based on standard ones) */
  customDescription?: string;
  /** Override the weapon name */
  customName?: string;
}

/**
 * Describes a spell from the system compendium
 */
export interface SystemSpellReference {
  type: 'system-spell';
  /** The key from SYSTEM_SPELLS or a raw UUID */
  uuid: string;
  /** Heightened level for the spell (if different from base) */
  heightenedLevel?: number;
  /** Spellcasting tradition override */
  tradition?: 'arcane' | 'divine' | 'occult' | 'primal';
}

/**
 * Describes an action from the system compendium
 */
export interface SystemActionReference {
  type: 'system-action';
  /** The key from SYSTEM_ACTIONS or a raw UUID */
  uuid: string;
  /** Custom description override */
  customDescription?: string;
}

/**
 * Union type for any system item reference
 */
export type SystemItemReference = 
  | SystemWeaponReference 
  | SystemSpellReference 
  | SystemActionReference;

/**
 * Resolve a weapon key to its UUID
 */
export function resolveWeaponUUID(key: SystemWeaponKey | string): string {
  return SYSTEM_WEAPONS[key as SystemWeaponKey] ?? key;
}

/**
 * Resolve a spell key to its UUID
 */
export function resolveSpellUUID(key: SystemSpellKey | string): string {
  return SYSTEM_SPELLS[key as SystemSpellKey] ?? key;
}

/**
 * Resolve an action key to its UUID
 */
export function resolveActionUUID(key: SystemActionKey | string): string {
  return SYSTEM_ACTIONS[key as SystemActionKey] ?? key;
}

/**
 * Shared utility functions for NPC data creation
 */

import type { ItemData } from '../types/foundry.d.ts';
import {
  SYSTEM_WEAPONS,
  SYSTEM_SPELLS,
  SYSTEM_ACTIONS,
  resolveWeaponUUID,
  resolveSpellUUID,
  resolveActionUUID,
  type SystemWeaponKey,
  type SystemSpellKey,
  type SystemActionKey,
  type WeaponRuneConfig,
  type SystemWeaponReference,
  type SystemSpellReference,
  type SystemActionReference,
} from './system-items';

// Re-export types for convenience
export type { SystemWeaponReference, SystemSpellReference, SystemActionReference } from './system-items';

/**
 * Action type parameter for createAction helper
 * - Numbers 1-3 represent standard actions with that many action icons
 * - 'reaction' for reactions (triggered abilities)
 * - 'free' for free actions
 * - 'passive' for passive abilities
 */
export type ActionType = 1 | 2 | 3 | 'reaction' | 'free' | 'passive';

/**
 * Helper to create action items with proper PF2e validation
 * 
 * @param name - The name of the action
 * @param actionType - The type of action: number (1-3) for standard actions, or 'reaction'/'free'/'passive'
 * @param traits - Array of trait tags for the action
 * @param description - HTML description of what the action does
 * @returns ItemData object configured for PF2e system
 */
export function createAction(
  name: string,
  actionType: ActionType,
  traits: string[] = [],
  description: string = ''
): ItemData {
  // Determine the actionType value and actions cost based on input
  let actionTypeValue: string;
  let actionsCost: number | null;

  if (typeof actionType === 'number') {
    // Standard actions with 1, 2, or 3 action icons
    actionTypeValue = 'action';
    actionsCost = actionType;
  } else {
    // Special action types (reaction, free, passive)
    actionTypeValue = actionType;
    actionsCost = null;
  }

  return {
    name,
    type: 'action',
    img: 'systems/pf2e/icons/default-icons/action.svg',
    system: {
      description: { value: description },
      rules: [],
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      actionType: { value: actionTypeValue },
      actions: { value: actionsCost },
      traits: { value: traits },
    },
  };
}

/**
 * Helper to create strike items for NPCs
 * 
 * @param name - The name of the strike
 * @param bonus - Attack bonus modifier
 * @param damage - Damage configuration object
 * @param traits - Array of trait tags for the strike
 * @param description - HTML description of the strike
 * @returns ItemData object configured for PF2e system
 */
export function createStrike(
  name: string,
  bonus: number,
  damage: { dice: number; die: string; type: string; modifier: number },
  traits: string[] = [],
  description: string = ''
): ItemData {
  return {
    name,
    type: 'melee',
    img: 'systems/pf2e/icons/default-icons/melee.svg',
    system: {
      description: { value: description },
      rules: [],
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      traits: { value: traits },
      damageRolls: {
        primary: {
          damage: `${damage.dice}d${damage.die}+${damage.modifier}`,
          damageType: damage.type,
        },
      },
      bonus: { value: bonus },
      attackEffects: { value: [] },
    },
  };
}

/**
 * Helper to create spell items for NPCs
 * 
 * @param name - The name of the spell
 * @param level - Spell level (0-10)
 * @param tradition - Magical tradition (arcane, divine, occult, primal)
 * @param traits - Array of trait tags for the spell
 * @param description - HTML description of the spell
 * @returns ItemData object configured for PF2e system
 */
export function createSpell(
  name: string,
  level: number,
  tradition: string,
  traits: string[] = [],
  description: string = ''
): ItemData {
  return {
    name,
    type: 'spell',
    img: 'systems/pf2e/icons/default-icons/spell.svg',
    system: {
      description: { value: description },
      rules: [],
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      level: { value: level },
      traits: { value: traits },
      traditions: { value: [tradition] },
    },
  };
}

// =============================================================================
// SYSTEM COMPENDIUM REFERENCE HELPERS
// =============================================================================

/**
 * Create a reference to a weapon from the PF2e system compendium.
 * This will be resolved to the actual item at import time.
 * 
 * @param weapon - Either a key from SYSTEM_WEAPONS or a full compendium UUID
 * @param runes - Optional rune configuration to apply
 * @param customName - Optional custom name override
 * @param customDescription - Optional additional description
 * @returns SystemWeaponReference to be processed by the importer
 * 
 * @example
 * // Basic weapon
 * systemWeapon('longsword')
 * 
 * @example
 * // +1 striking longsword
 * systemWeapon('longsword', { potency: 1, striking: 'striking' })
 * 
 * @example
 * // +2 greater striking flaming longsword
 * systemWeapon('longsword', { potency: 2, striking: 'greaterStriking', property: ['flaming'] })
 */
export function systemWeapon(
  weapon: SystemWeaponKey | string,
  runes?: WeaponRuneConfig,
  customName?: string,
  customDescription?: string
): SystemWeaponReference {
  const uuid = resolveWeaponUUID(weapon);
  return {
    type: 'system-weapon',
    uuid,
    runes,
    customName,
    customDescription,
  };
}

/**
 * Create a reference to a spell from the PF2e system compendium.
 * This will be resolved to the actual spell at import time.
 * 
 * @param spell - Either a key from SYSTEM_SPELLS or a full compendium UUID
 * @param heightenedLevel - Optional heightened level for the spell
 * @param tradition - Optional tradition override
 * @returns SystemSpellReference to be processed by the importer
 * 
 * @example
 * // Basic spell at base level
 * systemSpell('fireball')
 * 
 * @example
 * // Heightened spell
 * systemSpell('fireball', 5)
 * 
 * @example
 * // Spell with different tradition
 * systemSpell('charm', 4, 'occult')
 */
export function systemSpell(
  spell: SystemSpellKey | string,
  heightenedLevel?: number,
  tradition?: 'arcane' | 'divine' | 'occult' | 'primal'
): SystemSpellReference {
  const uuid = resolveSpellUUID(spell);
  return {
    type: 'system-spell',
    uuid,
    heightenedLevel,
    tradition,
  };
}

/**
 * Create a reference to an action from the PF2e system compendium.
 * This will be resolved to the actual action at import time.
 * 
 * @param action - Either a key from SYSTEM_ACTIONS or a full compendium UUID
 * @param customDescription - Optional description override
 * @returns SystemActionReference to be processed by the importer
 * 
 * @example
 * // Attack of Opportunity
 * systemAction('attackOfOpportunity')
 * 
 * @example
 * // With custom description
 * systemAction('grab', 'The creature can Grab on a successful claw Strike.')
 */
export function systemAction(
  action: SystemActionKey | string,
  customDescription?: string
): SystemActionReference {
  const uuid = resolveActionUUID(action);
  return {
    type: 'system-action',
    uuid,
    customDescription,
  };
}

/**
 * Type guard to check if an item is a system reference
 */
export function isSystemItemReference(
  item: ItemData | SystemWeaponReference | SystemSpellReference | SystemActionReference
): item is SystemWeaponReference | SystemSpellReference | SystemActionReference {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    (item.type === 'system-weapon' || item.type === 'system-spell' || item.type === 'system-action')
  );
}

/**
 * Type guard for system weapon reference
 */
export function isSystemWeaponReference(item: unknown): item is SystemWeaponReference {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    (item as SystemWeaponReference).type === 'system-weapon'
  );
}

/**
 * Type guard for system spell reference
 */
export function isSystemSpellReference(item: unknown): item is SystemSpellReference {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    (item as SystemSpellReference).type === 'system-spell'
  );
}

/**
 * Type guard for system action reference
 */
export function isSystemActionReference(item: unknown): item is SystemActionReference {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    (item as SystemActionReference).type === 'system-action'
  );
}

/**
 * Generate a rune-enhanced weapon name based on configuration
 * 
 * @param baseName - The base weapon name
 * @param runes - The rune configuration
 * @returns Formatted weapon name with rune prefix
 */
export function generateRuneWeaponName(baseName: string, runes?: WeaponRuneConfig): string {
  if (!runes) return baseName;

  const parts: string[] = [];

  // Add potency prefix (+1, +2, +3)
  if (runes.potency) {
    parts.push(`+${runes.potency}`);
  }

  // Add striking prefix
  if (runes.striking) {
    switch (runes.striking) {
      case 'striking':
        parts.push('Striking');
        break;
      case 'greaterStriking':
        parts.push('Greater Striking');
        break;
      case 'majorStriking':
        parts.push('Major Striking');
        break;
    }
  }

  // Add property rune names
  if (runes.property && runes.property.length > 0) {
    for (const prop of runes.property) {
      // Convert camelCase to Title Case
      const formatted = prop.replace(/([A-Z])/g, ' $1').trim();
      parts.push(formatted.charAt(0).toUpperCase() + formatted.slice(1));
    }
  }

  // Combine with base name
  if (parts.length > 0) {
    return `${parts.join(' ')} ${baseName}`;
  }

  return baseName;
}

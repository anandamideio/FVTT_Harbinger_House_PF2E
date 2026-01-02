/**
 * Shared utility functions for NPC data creation
 */

import type { ItemData } from '../types/foundry.d.ts';

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

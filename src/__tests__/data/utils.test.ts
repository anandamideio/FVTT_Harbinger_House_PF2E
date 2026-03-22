import { describe, expect, it } from 'vitest';
import {
	createAction,
	createSpell,
	createStrike,
	generateRuneWeaponName,
	isSystemActionReference,
	isSystemItemReference,
	isSystemSpellReference,
	isSystemWeaponReference,
} from '../../data/utils';

// ============================================================================
// createAction
// ============================================================================

describe('createAction', () => {
	it('creates a standard 1-action ability', () => {
		const action = createAction('Strike', 1, ['attack'], 'A basic strike');
		expect(action.name).toBe('Strike');
		expect(action.type).toBe('action');
		expect(action.system?.actionType?.value).toBe('action');
		expect(action.system?.actions?.value).toBe(1);
		expect(action.system?.traits?.value).toEqual(['attack']);
		expect(action.system?.description?.value).toBe('A basic strike');
		expect(action.system?.slug).toBe('strike');
	});

	it('creates a 2-action ability', () => {
		const action = createAction('Power Attack', 2);
		expect(action.system?.actionType?.value).toBe('action');
		expect(action.system?.actions?.value).toBe(2);
	});

	it('creates a 3-action ability', () => {
		const action = createAction('Desperate Finisher', 3);
		expect(action.system?.actions?.value).toBe(3);
	});

	it('creates a reaction', () => {
		const action = createAction('Attack of Opportunity', 'reaction', ['attack']);
		expect(action.system?.actionType?.value).toBe('reaction');
		expect(action.system?.actions?.value).toBeNull();
	});

	it('creates a free action', () => {
		const action = createAction('Recall Knowledge', 'free');
		expect(action.system?.actionType?.value).toBe('free');
		expect(action.system?.actions?.value).toBeNull();
	});

	it('creates a passive ability', () => {
		const action = createAction('Darkvision', 'passive');
		expect(action.system?.actionType?.value).toBe('passive');
		expect(action.system?.actions?.value).toBeNull();
	});

	it('defaults to empty traits and description', () => {
		const action = createAction('Test', 1);
		expect(action.system?.traits?.value).toEqual([]);
		expect(action.system?.description?.value).toBe('');
	});

	it('generates a slug from the name', () => {
		const action = createAction('Field of Fellowship', 'passive');
		expect(action.system?.slug).toBe('field-of-fellowship');
	});

	it('sets default action image', () => {
		const action = createAction('Test', 1);
		expect(action.img).toBe('systems/pf2e/icons/default-icons/action.svg');
	});
});

// ============================================================================
// createStrike
// ============================================================================

describe('createStrike', () => {
	it('creates a melee strike with correct structure', () => {
		const strike = createStrike(
			'Longsword',
			15,
			{ dice: 2, die: '8', type: 'slashing', modifier: 5 },
			['magical', 'versatile-p'],
			'A magical longsword strike',
		);

		expect(strike.name).toBe('Longsword');
		expect(strike.type).toBe('melee');
		expect(strike.system?.bonus?.value).toBe(15);
		expect(strike.system?.damageRolls?.primary?.damage).toBe('2d8+5');
		expect(strike.system?.damageRolls?.primary?.damageType).toBe('slashing');
		expect(strike.system?.traits?.value).toEqual(['magical', 'versatile-p']);
		expect(strike.system?.slug).toBe('longsword');
	});

	it('defaults to empty traits and description', () => {
		const strike = createStrike('Fist', 10, { dice: 1, die: '4', type: 'bludgeoning', modifier: 3 });
		expect(strike.system?.traits?.value).toEqual([]);
		expect(strike.system?.description?.value).toBe('');
	});

	it('sets default melee image', () => {
		const strike = createStrike('Claw', 12, { dice: 1, die: '6', type: 'slashing', modifier: 4 });
		expect(strike.img).toBe('systems/pf2e/icons/default-icons/melee.svg');
	});

	it('initializes empty attack effects', () => {
		const strike = createStrike('Bite', 10, { dice: 1, die: '8', type: 'piercing', modifier: 2 });
		expect(strike.system?.attackEffects?.value).toEqual([]);
	});
});

// ============================================================================
// createSpell
// ============================================================================

describe('createSpell', () => {
	it('creates a spell with correct structure', () => {
		const spell = createSpell('Fireball', 3, 'arcane', ['fire', 'concentrate'], 'A ball of fire');

		expect(spell.name).toBe('Fireball');
		expect(spell.type).toBe('spell');
		expect(spell.system?.level?.value).toBe(3);
		expect(spell.system?.traditions?.value).toEqual(['arcane']);
		expect(spell.system?.traits?.value).toEqual(['fire', 'concentrate']);
		expect(spell.system?.description?.value).toBe('A ball of fire');
		expect(spell.system?.slug).toBe('fireball');
	});

	it('defaults to empty traits and description', () => {
		const spell = createSpell('Test Spell', 1, 'divine');
		expect(spell.system?.traits?.value).toEqual([]);
		expect(spell.system?.description?.value).toBe('');
	});

	it('sets default spell image', () => {
		const spell = createSpell('Test', 0, 'occult');
		expect(spell.img).toBe('systems/pf2e/icons/default-icons/spell.svg');
	});
});

// ============================================================================
// generateRuneWeaponName
// ============================================================================

describe('generateRuneWeaponName', () => {
	it('returns base name when no runes', () => {
		expect(generateRuneWeaponName('Longsword')).toBe('Longsword');
	});

	it('returns base name when runes is undefined', () => {
		expect(generateRuneWeaponName('Dagger', undefined)).toBe('Dagger');
	});

	it('returns base name when runes object is empty', () => {
		expect(generateRuneWeaponName('Rapier', {})).toBe('Rapier');
	});

	it('adds potency prefix', () => {
		expect(generateRuneWeaponName('Longsword', { potency: 1 })).toBe('+1 Longsword');
	});

	it('adds striking prefix', () => {
		expect(generateRuneWeaponName('Longsword', { striking: 'striking' })).toBe('Striking Longsword');
	});

	it('adds greater striking prefix', () => {
		expect(generateRuneWeaponName('Longsword', { striking: 'greaterStriking' })).toBe('Greater Striking Longsword');
	});

	it('adds major striking prefix', () => {
		expect(generateRuneWeaponName('Longsword', { striking: 'majorStriking' })).toBe('Major Striking Longsword');
	});

	it('combines potency and striking', () => {
		expect(generateRuneWeaponName('Longsword', { potency: 1, striking: 'striking' })).toBe('+1 Striking Longsword');
	});

	it('adds property runes', () => {
		expect(generateRuneWeaponName('Longsword', { property: ['flaming'] })).toBe('Flaming Longsword');
	});

	it('converts camelCase property runes to Title Case', () => {
		expect(generateRuneWeaponName('Longsword', { property: ['greaterFlaming' as never] })).toBe(
			'Greater Flaming Longsword',
		);
	});

	it('combines all rune types', () => {
		const name = generateRuneWeaponName('Longsword', {
			potency: 2,
			striking: 'greaterStriking',
			property: ['flaming'],
		});
		expect(name).toBe('+2 Greater Striking Flaming Longsword');
	});

	it('handles multiple property runes', () => {
		const name = generateRuneWeaponName('Longsword', {
			potency: 3,
			striking: 'majorStriking',
			property: ['flaming', 'frost'],
		});
		expect(name).toBe('+3 Major Striking Flaming Frost Longsword');
	});
});

// ============================================================================
// Type Guards
// ============================================================================

describe('isSystemItemReference', () => {
	it('returns true for system-weapon', () => {
		expect(isSystemItemReference({ type: 'system-weapon', uuid: 'x' })).toBe(true);
	});

	it('returns true for system-spell', () => {
		expect(isSystemItemReference({ type: 'system-spell', uuid: 'x' })).toBe(true);
	});

	it('returns true for system-action', () => {
		expect(isSystemItemReference({ type: 'system-action', uuid: 'x' })).toBe(true);
	});

	it('returns false for regular ItemData', () => {
		expect(isSystemItemReference({ name: 'Sword', type: 'weapon' })).toBe(false);
	});

	it('returns false for null', () => {
		// @ts-expect-error
		expect(isSystemItemReference(null)).toBe(false);
	});
});

describe('isSystemWeaponReference', () => {
	it('returns true for system-weapon type', () => {
		expect(isSystemWeaponReference({ type: 'system-weapon', uuid: 'x' })).toBe(true);
	});

	it('returns false for other types', () => {
		expect(isSystemWeaponReference({ type: 'system-spell', uuid: 'x' })).toBe(false);
		expect(isSystemWeaponReference({ type: 'weapon' })).toBe(false);
		expect(isSystemWeaponReference(null)).toBe(false);
		expect(isSystemWeaponReference(undefined)).toBe(false);
		expect(isSystemWeaponReference('string')).toBe(false);
		expect(isSystemWeaponReference(42)).toBe(false);
	});
});

describe('isSystemSpellReference', () => {
	it('returns true for system-spell type', () => {
		expect(isSystemSpellReference({ type: 'system-spell', uuid: 'x' })).toBe(true);
	});

	it('returns false for other types', () => {
		expect(isSystemSpellReference({ type: 'system-weapon', uuid: 'x' })).toBe(false);
		expect(isSystemSpellReference(null)).toBe(false);
	});
});

describe('isSystemActionReference', () => {
	it('returns true for system-action type', () => {
		expect(isSystemActionReference({ type: 'system-action', uuid: 'x' })).toBe(true);
	});

	it('returns false for other types', () => {
		expect(isSystemActionReference({ type: 'system-weapon', uuid: 'x' })).toBe(false);
		expect(isSystemActionReference(null)).toBe(false);
	});
});

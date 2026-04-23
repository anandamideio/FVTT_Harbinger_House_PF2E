import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { NARCOVI, TROLAN_THE_MAD } from '../../data/content/npcs/harbinger-residents';
import type { HarbingerNPC, NPCItemEntry } from '../../data/schema/harbinger-npc';
import { formatPF2eStatblock } from '../../data/transform/pf2e-statblock-formatter';
import { SYSTEM_ACTIONS, SYSTEM_SPELLS, SYSTEM_WEAPONS } from '../../data/schema/system-items';

const FIXTURES_DIR = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'fixtures',
	'pf2e-statblock-formatter',
);

function makeNpc(system: Record<string, unknown>, items: NPCItemEntry[] = []): HarbingerNPC {
	return {
		id: 'test-npc',
		category: 'generic-npc',
		data: {
			name: 'Test NPC',
			type: 'npc',
			system,
		} as unknown as HarbingerNPC['data'],
		items,
	};
}

function occurrences(haystack: string, needle: string): number {
	return haystack.split(needle).length - 1;
}

function readFixture(fileName: string): string {
	return fs.readFileSync(path.join(FIXTURES_DIR, fileName), 'utf8');
}

function normalizeGolden(html: string): string {
	return html.replace(/\r\n/g, '\n').trim();
}

describe('formatPF2eStatblock', () => {
	it('renders a full statblock with core sections and mixed item types', () => {
		const npc = makeNpc(
			{
				details: {
					level: { value: 7 },
					creatureType: 'Humanoid',
					alignment: { value: 'CG' },
					blurb: 'Clever investigator',
					publicNotes: '<p><strong>Read this raw.</strong></p>',
				},
				traits: {
					rarity: 'rare',
					value: ['humanoid', 'common', 'humanoid'],
					size: { value: 'med' },
					languages: {
						value: ['common', 'elven'],
						details: 'telepathy 60 feet',
					},
					senses: ['low-light vision', { type: 'scent' }],
				},
				perception: { mod: 14, details: 'sees through lies' },
				skills: {
					athletics: { label: 'Athletics', value: 15 },
					stealth: { label: 'Stealth', base: 12 },
				},
				abilities: {
					str: { mod: 3 },
					dex: { mod: 4 },
					con: { mod: 1 },
					int: { mod: 2 },
					wis: { mod: 0 },
					cha: { mod: -1 },
				},
				attributes: {
					ac: { value: 25 },
					hp: { value: 120, details: 'regeneration 10' },
					speed: { value: 25, otherSpeeds: [{ type: 'fly', value: 35 }] },
					immunities: [{ type: 'poison' }],
					weaknesses: [{ type: 'cold iron', value: 5 }],
					resistances: [{ type: 'fire', value: 10 }],
				},
				saves: {
					fortitude: { value: 17, saveDetail: 'vs poison +2' },
					reflex: { value: 16 },
					will: { value: 14, saveDetail: 'vs fear +1' },
				},
			},
			[
				{
					name: 'Claw',
					type: 'melee',
					system: {
						bonus: { value: 18 },
						damageRolls: { primary: { damage: '2d6+8', damageType: 'slashing' } },
						traits: { value: ['agile', 'finesse'] },
					},
				} as NPCItemEntry,
				{
					type: 'system-weapon',
					uuid: SYSTEM_WEAPONS.longsword,
					runes: { potency: 2, striking: 'greaterStriking', property: ['flaming'] },
				} as NPCItemEntry,
				{
					name: 'Distracting Feint',
					type: 'action',
					system: {
						actionType: { value: 'action' },
						actions: { value: 1 },
						traits: { value: ['mental'] },
						description: { value: '<p>Feint with flourish.</p>' },
					},
				} as NPCItemEntry,
				{ type: 'system-action', uuid: SYSTEM_ACTIONS.attackOfOpportunity } as NPCItemEntry,
				{
					_id: 'entry-a',
					name: 'Occult Innate Spells',
					type: 'spellcastingEntry',
					system: { spelldc: { value: 18, dc: 26 } },
				} as NPCItemEntry,
				{ type: 'system-spell', uuid: SYSTEM_SPELLS.suggestion, heightenedLevel: 4, entryId: 'entry-a' } as NPCItemEntry,
				{ type: 'system-spell', uuid: SYSTEM_SPELLS.daze, heightenedLevel: 0, entryId: 'entry-a' } as NPCItemEntry,
			],
		);

		const html = formatPF2eStatblock(npc);

		expect(html).toContain(
			'<h1 class="pf2e-statblock-name"><span class="pf2e-statblock-name-link" role="link" tabindex="0" data-npc-id="test-npc">Test NPC</span></h1>',
		);
		expect(html).toContain('<em>Creature 7 — Medium Humanoid — CG');
		expect(html).toContain('<br>Clever investigator');
		expect(html).toContain('<p class="pf2e-traits">');
		expect(html).toContain('pf2e-trait-rare">rare');
		expect(occurrences(html, 'pf2e-trait-humanoid')).toBe(1);
		expect(html).not.toContain('pf2e-trait-common');
		expect(html).toContain('<strong>Perception</strong> +14; low-light vision, scent; sees through lies');
		expect(html).toContain('<strong>Languages</strong> common, elven; telepathy 60 feet');
		expect(html).toContain('<strong>Skills</strong> Athletics +15, Stealth +12');
		expect(html).toContain('<h3>Ability Modifiers</h3>');
		expect(html).toContain('<strong>AC</strong> 25; <strong>Fort</strong> +17, <strong>Ref</strong> +16, <strong>Will</strong> +14; vs poison +2; vs fear +1');
		expect(html).toContain('<strong>HP</strong> 120 (regeneration 10)');
		expect(html).toContain('<strong>Immunities</strong> poison');
		expect(html).toContain('<strong>Weaknesses</strong> cold iron 5');
		expect(html).toContain('<strong>Resistances</strong> fire 10');
		expect(html).toContain('<strong>Speed</strong> 25 feet, fly 35 feet');
		expect(html).toContain('<strong>Melee</strong> Claw +18 (agile, finesse), <strong>Damage</strong> 2d6+8 slashing');
		expect(html).toContain('<strong>Equipment</strong> Longsword (+2, greaterStriking, flaming)');
		expect(html).toContain('<h2>Abilities</h2>');
		expect(html).toContain('<strong>Distracting Feint</strong> [1-action] (mental)');
		expect(html).toContain('<strong>Attack Of Opportunity</strong> <em>(system action)</em>');
		expect(html).toContain('<h2>Spells</h2>');
		expect(html).toContain('<strong>Occult Innate Spells</strong> attack +18, DC 26');
		expect(html).toContain('<em>4th Level:</em> Suggestion');
		expect(html).toContain('<em>Cantrips:</em> Daze');
		expect(html).toContain('<div class="pf2e-notes"><p><strong>Read this raw.</strong></p></div>');
	});

	it('uses sensible defaults and omits optional sections when data is sparse', () => {
		const html = formatPF2eStatblock(makeNpc({}));

		expect(html).toContain('<em>Creature 0 — Medium Creature');
		expect(html).toContain('<strong>Perception</strong> +0');
		expect(html).toContain('<strong>AC</strong> 10; <strong>Fort</strong> +0, <strong>Ref</strong> +0, <strong>Will</strong> +0');
		expect(html).toContain('<strong>HP</strong> 0');
		expect(html).toContain('<strong>Speed</strong> 0 feet');
		expect(html).not.toContain('pf2e-traits');
		expect(html).not.toContain('<strong>Languages</strong>');
		expect(html).not.toContain('<strong>Skills</strong>');
		expect(html).not.toContain('<h2>Abilities</h2>');
		expect(html).not.toContain('<h2>Spells</h2>');
		expect(html).not.toContain('pf2e-notes');
	});

	it('returns an inner fragment and keeps the name header before descriptor', () => {
		const html = formatPF2eStatblock(
			makeNpc({
				details: {
					level: { value: 1 },
					creatureType: 'Humanoid',
					alignment: { value: 'N' },
				},
				attributes: { speed: { value: 20 } },
			}),
		);

		expect(
			html.startsWith(
				'<h1 class="pf2e-statblock-name"><span class="pf2e-statblock-name-link" role="link" tabindex="0" data-npc-id="test-npc">Test NPC</span></h1>\n<p><em>Creature 1 — Medium Humanoid — N',
			),
		).toBe(true);
		expect(html).not.toMatch(/^<div[^>]*>/i);
		expect(html).not.toContain('class="statblock-container"');
		expect(html).not.toContain('class="statblock pf2e"');
	});

	it('escapes user-facing scalar fields but keeps trusted rich text blocks raw', () => {
		const npc = makeNpc(
			{
				details: {
					level: { value: 3 },
					creatureType: 'Fiend <alpha>',
					alignment: { value: 'CE & NE' },
					blurb: '<script>alert(1)</script>',
					publicNotes: '<p><strong>Trusted HTML</strong></p>',
				},
				traits: {
					rarity: 'uncommon',
					value: ['acid<proof>'],
					size: { value: 'sm' },
					senses: [{ type: 'echo<vision>' }],
				},
				perception: { mod: 8, details: 'checks > normal' },
				attributes: { speed: { value: 25 } },
			},
			[
				{
					name: 'Bite <fang>',
					type: 'melee',
					system: {
						bonus: { value: 10 },
						damageRolls: { primary: { damage: '1d8+4', damageType: 'piercing&evil' } },
						traits: { value: ['magical<trait>'] },
					},
				} as unknown as NPCItemEntry,
				{
					type: 'system-weapon',
					uuid: SYSTEM_WEAPONS.dagger,
					customName: 'Dagger <ritual> & relic',
				} as NPCItemEntry,
				{
					name: 'Raw Action',
					type: 'action',
					system: {
						actionType: { value: 'passive' },
						actions: { value: null },
						traits: { value: [] },
						description: { value: '<p><em>Raw description</em></p>' },
					},
				} as NPCItemEntry,
			],
		);

		const html = formatPF2eStatblock(npc);

		expect(html).toContain('Fiend &lt;alpha&gt;');
		expect(html).toContain('CE &amp; NE');
		expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
		expect(html).toContain('echo&lt;vision&gt;');
		expect(html).toContain('<strong>Melee</strong> Bite &lt;fang&gt; +10 (magical&lt;trait&gt;), <strong>Damage</strong> 1d8+4 piercing&amp;evil');
		expect(html).toContain('<strong>Equipment</strong> Dagger &lt;ritual&gt; &amp; relic');
		expect(html).toContain('<p><em>Raw description</em></p>');
		expect(html).toContain('<div class="pf2e-notes"><p><strong>Trusted HTML</strong></p></div>');
	});

	it('renders action tags for action, reaction, and free actions', () => {
		const npc = makeNpc(
			{ attributes: { speed: { value: 20 } } },
			[
				{
					name: 'Twin Strike',
					type: 'action',
					system: {
						actionType: { value: 'action' },
						actions: { value: 2 },
						traits: { value: [] },
						description: { value: '<p>Attack twice.</p>' },
					},
				} as NPCItemEntry,
				{
					name: 'Parry',
					type: 'action',
					system: {
						actionType: { value: 'reaction' },
						actions: { value: null },
						traits: { value: [] },
						description: { value: '<p>Gain AC.</p>' },
					},
				} as NPCItemEntry,
				{
					name: 'Quick Step',
					type: 'action',
					system: {
						actionType: { value: 'free' },
						actions: { value: null },
						traits: { value: [] },
						description: { value: '<p>Reposition.</p>' },
					},
				} as NPCItemEntry,
			],
		);

		const html = formatPF2eStatblock(npc);

		expect(html).toContain('<strong>Twin Strike</strong> [2-actions]');
		expect(html).toContain('<strong>Parry</strong> [reaction]');
		expect(html).toContain('<strong>Quick Step</strong> [free action]');
	});

	it('shows system action names from known UUIDs and humanizes unknown tails', () => {
		const npc = makeNpc(
			{ attributes: { speed: { value: 20 } } },
			[
				{ type: 'system-action', uuid: SYSTEM_ACTIONS.attackOfOpportunity } as NPCItemEntry,
				{ type: 'system-action', uuid: 'Compendium.world.actions.Item.custom_counter-step' } as NPCItemEntry,
			],
		);

		const html = formatPF2eStatblock(npc);

		expect(html).toContain('<strong>Attack Of Opportunity</strong> <em>(system action)</em>');
		expect(html).toContain('<strong>Custom Counter Step</strong> <em>(system action)</em>');
	});

	it('groups spells by level in descending order and scopes by spellcasting entry id', () => {
		const npc = makeNpc(
			{ attributes: { speed: { value: 20 } } },
			[
				{ _id: 'entry-a', name: 'Arcane Spells', type: 'spellcastingEntry', system: { spelldc: { value: 16, dc: 24 } } } as NPCItemEntry,
				{ _id: 'entry-b', name: 'Occult Spells', type: 'spellcastingEntry', system: { spelldc: { value: 14, dc: 22 } } } as NPCItemEntry,
				{ type: 'system-spell', uuid: SYSTEM_SPELLS.fireball, heightenedLevel: 3, entryId: 'entry-a' } as NPCItemEntry,
				{ type: 'system-spell', uuid: SYSTEM_SPELLS.charm, heightenedLevel: 1, entryId: 'entry-a' } as NPCItemEntry,
				{ type: 'system-spell', uuid: SYSTEM_SPELLS.daze, heightenedLevel: 0, entryId: 'entry-a' } as NPCItemEntry,
				{ type: 'system-spell', uuid: 'Compendium.homebrew.spells.Item.void_burst', heightenedLevel: 4, entryId: 'entry-b' } as NPCItemEntry,
				{ type: 'system-spell', uuid: SYSTEM_SPELLS.harm, heightenedLevel: 2, entryId: 'other-entry' } as NPCItemEntry,
			],
		);

		const html = formatPF2eStatblock(npc);

		expect(html).toContain('<strong>Arcane Spells</strong> attack +16, DC 24');
		expect(html).toContain('<strong>Occult Spells</strong> attack +14, DC 22');
		expect(html).toContain('<em>4th Level:</em> Void Burst');
		expect(html).toContain('<em>3rd Level:</em> Fireball');
		expect(html).toContain('<em>1st Level:</em> Charm');
		expect(html).toContain('<em>Cantrips:</em> Daze');
		expect(html).not.toContain('Harm');

		const level3 = html.indexOf('<em>3rd Level:</em> Fireball');
		const level1 = html.indexOf('<em>1st Level:</em> Charm');
		const cantrips = html.indexOf('<em>Cantrips:</em> Daze');
		expect(level3).toBeGreaterThan(-1);
		expect(level1).toBeGreaterThan(level3);
		expect(cantrips).toBeGreaterThan(level1);
	});

	it('handles melee entries without damage and excludes non-melee inline items from offense', () => {
		const npc = makeNpc(
			{ attributes: { speed: { value: 30 } } },
			[
				{
					name: 'Fist',
					type: 'melee',
					system: {
						bonus: { value: 11 },
						traits: { value: [] },
					},
				} as NPCItemEntry,
				{
					name: 'Not A Strike',
					type: 'action',
					system: {
						actionType: { value: 'passive' },
						actions: { value: null },
						traits: { value: [] },
						description: { value: '<p>ignored in offense</p>' },
					},
				} as NPCItemEntry,
			],
		);

		const html = formatPF2eStatblock(npc);

		expect(html).toContain('<strong>Melee</strong> Fist +11');
		expect(html).not.toContain('<strong>Damage</strong>');
		expect(html).not.toContain('Not A Strike +');
	});

	it('formats type lists with or without numeric values based on the section', () => {
		const npc = makeNpc({
			attributes: {
				speed: { value: 20 },
				immunities: [{ type: 'fire', value: 10 }],
				weaknesses: [{ type: 'silver', value: '5' }],
				resistances: [{ type: 'physical', value: 3 }, { type: 'all' }],
			},
		});

		const html = formatPF2eStatblock(npc);

		expect(html).toContain('<strong>Immunities</strong> fire');
		expect(html).not.toContain('<strong>Immunities</strong> fire 10');
		expect(html).toContain('<strong>Weaknesses</strong> silver');
		expect(html).toContain('<strong>Resistances</strong> physical 3, all');
	});

	it('falls back to humanized UUID tail for unknown weapons and applies size label mapping', () => {
		const npc = makeNpc(
			{
				details: {
					level: { value: 2 },
					creatureType: 'Plant',
					alignment: { value: 'N' },
				},
				traits: {
					rarity: 'common',
					value: [],
					size: { value: 'grg' },
				},
				attributes: { speed: { value: 20 } },
			},
			[
				{
					type: 'system-weapon',
					uuid: 'Compendium.custom.items.Item.storm_lash',
					runes: { potency: 1, property: ['shock'] },
				} as NPCItemEntry,
			],
		);

		const html = formatPF2eStatblock(npc);

		expect(html).toContain('<em>Creature 2 — Gargantuan Plant — N</em>');
		expect(html).toContain('<strong>Equipment</strong> Storm Lash (+1, shock)');
	});

	describe('golden fixtures', () => {
		it('matches Trolan the Mad output fixture', () => {
			const html = formatPF2eStatblock(TROLAN_THE_MAD);
			const golden = readFixture('trolan-the-mad.html');

			expect(normalizeGolden(html)).toBe(normalizeGolden(golden));
		});

		it('matches Narcovi output fixture', () => {
			const html = formatPF2eStatblock(NARCOVI);
			const golden = readFixture('narcovi.html');

			expect(normalizeGolden(html)).toBe(normalizeGolden(golden));
		});
	});
});

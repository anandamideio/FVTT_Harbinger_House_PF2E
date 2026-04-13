import type { ItemData } from '../types/foundry.d.ts';
import type { HarbingerNPC, NPCItemEntry } from './harbinger-residents';
import {
	SYSTEM_ACTIONS,
	SYSTEM_SPELLS,
	SYSTEM_WEAPONS,
	type SystemActionReference,
	type SystemSpellReference,
	type SystemWeaponReference,
} from './system-items';
import {
	isSystemActionReference,
	isSystemItemReference,
	isSystemSpellReference,
	isSystemWeaponReference,
} from './utils';

type NPCSystemData = Partial<PF2eActorSystem>;
type TypeListEntry = {
	type?: string;
	value?: number;
};

type InlineActionItem = ItemData & {
	type: 'action';
	system?: Partial<PF2eActionSystem>;
};

type InlineSpellcastingEntryItem = ItemData & {
	type: 'spellcastingEntry';
	system?: Partial<PF2eSpellcastingEntrySystem>;
};

type InlineMeleeItem = ItemData & {
	type: 'melee';
	system?: {
		bonus?: { value?: number };
		damageRolls?: { primary?: { damage: string; damageType: string } };
		traits?: { value?: string[] };
	};
};

type FormatterItemIndex = {
	meleeStrikes: InlineMeleeItem[];
	inlineActions: InlineActionItem[];
	systemActions: SystemActionReference[];
	spellEntries: InlineSpellcastingEntryItem[];
	spellsByEntryId: Map<string, SystemSpellReference[]>;
	systemWeapons: SystemWeaponReference[];
};

export class PF2EStatblockFormatter {
	public constructor(
		private readonly actionTable: Record<string, string> = SYSTEM_ACTIONS,
		private readonly spellTable: Record<string, string> = SYSTEM_SPELLS,
		private readonly weaponTable: Record<string, string> = SYSTEM_WEAPONS,
	) {}

	public format(npc: HarbingerNPC): string {
		const system = (npc.data.system ?? {}) as NPCSystemData;
		const itemIndex = this.buildItemIndex(npc.items);
		const out: string[] = [];

		out.push(this.renderSubject(npc));
		out.push(this.renderDescriptor(system));
		out.push(this.renderTraitStrip(system));
		out.push(this.renderPerceptionAndLanguages(system));
		out.push(this.renderSkills(system));
		out.push(this.renderAbilityTable(system));
		out.push(this.renderDefense(system));
		out.push(this.renderOffense(system, itemIndex));
		out.push(this.renderAbilitiesSection(itemIndex));
		out.push(this.renderSpells(itemIndex));
		out.push(this.renderPublicNotes(system));

		return out.filter(Boolean).join('\n');
	}

	private renderSubject(npc: HarbingerNPC): string {
		const name = npc.data.name?.trim() || npc.id || 'Unknown Creature';
		return `<h1 class="pf2e-statblock-name">${this.esc(name)}</h1>`;
	}

	private buildItemIndex(items: NPCItemEntry[]): FormatterItemIndex {
		const index: FormatterItemIndex = {
			meleeStrikes: [],
			inlineActions: [],
			systemActions: [],
			spellEntries: [],
			spellsByEntryId: new Map(),
			systemWeapons: [],
		};

		for (const item of items) {
			if (isSystemWeaponReference(item)) {
				index.systemWeapons.push(item);
				continue;
			}
			if (isSystemActionReference(item)) {
				index.systemActions.push(item);
				continue;
			}
			if (isSystemSpellReference(item)) {
				if (item.entryId) {
					if (!index.spellsByEntryId.has(item.entryId)) {
						index.spellsByEntryId.set(item.entryId, []);
					}
					index.spellsByEntryId.get(item.entryId)!.push(item);
				}
				continue;
			}
			if (PF2EStatblockFormatter.isInlineMeleeItem(item)) {
				index.meleeStrikes.push(item);
				continue;
			}
			if (PF2EStatblockFormatter.isInlineActionItem(item)) {
				index.inlineActions.push(item);
				continue;
			}
			if (PF2EStatblockFormatter.isInlineSpellcastingEntryItem(item)) {
				index.spellEntries.push(item);
			}
		}

		return index;
	}

	private renderDescriptor(system: NPCSystemData): string {
		const level = system.details?.level?.value ?? 0;
		const creatureType = system.details?.creatureType ?? 'Creature';
		const size = this.sizeLabel(system.traits?.size?.value);
		const alignment = system.details?.alignment?.value ?? '';
		const blurb = system.details?.blurb ?? '';
		const parts = [`Creature ${level}`, `${size} ${creatureType}`];
		if (alignment) parts.push(alignment);
		let line = `<p><em>${this.esc(parts.join(' — '))}`;
		if (blurb) line += `<br>${this.esc(blurb)}`;
		line += `</em></p>`;
		return line;
	}

	private renderTraitStrip(system: NPCSystemData): string {
		const rarity: string = system.traits?.rarity ?? 'common';
		const traits: string[] = system.traits?.value ?? [];
		const seen = new Set<string>();
		const chips: string[] = [];
		for (const t of [rarity, ...traits]) {
			if (!t || t === 'common') continue;
			if (seen.has(t)) continue;
			seen.add(t);
			chips.push(t);
		}
		if (chips.length === 0) return '';
		return `<p class="pf2e-traits">${chips.map((t) => `<span class="pf2e-trait pf2e-trait-${this.esc(t)}">${this.esc(t)}</span>`).join('')}</p>`;
	}

	private renderPerceptionAndLanguages(system: NPCSystemData): string {
		const lines: string[] = [];
		const percMod = system.perception?.mod ?? 0;
		const percDetails = system.perception?.details ?? '';
		const senses = ((system.traits?.senses ?? []) as Array<SenseData | string>)
			.map((sense) => (typeof sense === 'string' ? sense : sense.type))
			.filter(Boolean)
			.join(', ');
		let perc = `<strong>Perception</strong> ${this.fmtMod(percMod)}`;
		if (senses) perc += `; ${this.esc(senses)}`;
		if (percDetails) perc += `; ${this.esc(percDetails)}`;
		lines.push(`<p>${perc}</p>`);

		const languages = system.traits?.languages;
		if (languages) {
			const langList = (languages.value ?? []).join(', ');
			const langDetails = languages.details ?? '';
			if (langList || langDetails) {
				let line = `<strong>Languages</strong> ${this.esc(langList || '—')}`;
				if (langDetails) line += `; ${this.esc(langDetails)}`;
				lines.push(`<p>${line}</p>`);
			}
		}
		return lines.join('\n');
	}

	private renderSkills(system: NPCSystemData): string {
		const skills = system.skills;
		if (!skills || Object.keys(skills).length === 0) return '';
		const entries = Object.values(skills)
			.map((skill) => `${this.esc(skill.label)} ${this.fmtMod(skill.value ?? skill.base ?? 0)}`)
			.join(', ');
		return `<p><strong>Skills</strong> ${entries}</p>`;
	}

	private renderAbilityTable(system: NPCSystemData): string {
		const abilities = system.abilities;
		const keys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
		const cells = keys.map((k) => `<td>${this.fmtMod(abilities?.[k]?.mod ?? 0)}</td>`).join('');
		const headers = keys.map((k) => `<th>${k[0].toUpperCase() + k.slice(1)}</th>`).join('');
		return [
			'<h3>Ability Modifiers</h3>',
			'<table><thead><tr>' + headers + '</tr></thead>',
			'<tbody><tr>' + cells + '</tr></tbody></table>',
		].join('\n');
	}

	private renderDefense(system: NPCSystemData): string {
		const out: string[] = ['<h2>Defense</h2>'];
		const ac = system.attributes?.ac?.value ?? 10;
		const saveLine =
			`<strong>AC</strong> ${ac}; ` +
			`<strong>Fort</strong> ${this.fmtMod(system.saves?.fortitude?.value ?? 0)}, ` +
			`<strong>Ref</strong> ${this.fmtMod(system.saves?.reflex?.value ?? 0)}, ` +
			`<strong>Will</strong> ${this.fmtMod(system.saves?.will?.value ?? 0)}`;
		const saveDetail = [system.saves?.fortitude?.saveDetail, system.saves?.reflex?.saveDetail, system.saves?.will?.saveDetail]
			.filter(Boolean)
			.join('; ');
		out.push(`<p>${saveLine}${saveDetail ? `; ${this.esc(saveDetail)}` : ''}</p>`);

		const hp = system.attributes?.hp;
		let hpLine = `<strong>HP</strong> ${hp?.value ?? 0}`;
		if (hp?.details) hpLine += ` (${this.esc(hp.details)})`;
		out.push(`<p>${hpLine}</p>`);

		const immunities = this.formatTypeList(system.attributes?.immunities);
		const weaknesses = this.formatTypeList(system.attributes?.weaknesses, true);
		const resistances = this.formatTypeList(system.attributes?.resistances, true);
		if (immunities) out.push(`<p><strong>Immunities</strong> ${this.esc(immunities)}</p>`);
		if (weaknesses) out.push(`<p><strong>Weaknesses</strong> ${this.esc(weaknesses)}</p>`);
		if (resistances) out.push(`<p><strong>Resistances</strong> ${this.esc(resistances)}</p>`);
		return out.join('\n');
	}

	private renderOffense(system: NPCSystemData, itemIndex: FormatterItemIndex): string {
		const out: string[] = ['<h2>Offense</h2>'];
		const speed = system.attributes?.speed?.value ?? 0;
		const other = system.attributes?.speed?.otherSpeeds ?? [];
		let speedLine = `<strong>Speed</strong> ${speed} feet`;
		if (other.length > 0) {
			speedLine += ', ' + other.map((s) => `${this.esc(s.type)} ${s.value} feet`).join(', ');
		}
		out.push(`<p>${speedLine}</p>`);

		for (const strike of itemIndex.meleeStrikes) {
			const bonus = strike.system?.bonus?.value ?? 0;
			const dmg = strike.system?.damageRolls?.primary;
			const dmgStr = dmg ? `${this.esc(dmg.damage)} ${this.esc(dmg.damageType)}` : '';
			const traits = (strike.system?.traits?.value ?? []).join(', ');
			let line = `<strong>Melee</strong> ${this.esc(strike.name)} ${this.fmtMod(bonus)}`;
			if (traits) line += ` (${this.esc(traits)})`;
			if (dmgStr) line += `, <strong>Damage</strong> ${dmgStr}`;
			out.push(`<p>${line}</p>`);
		}

		for (const item of itemIndex.systemWeapons) {
			out.push(`<p><strong>Equipment</strong> ${this.renderWeaponRef(item)}</p>`);
		}
		return out.join('\n');
	}

	private renderAbilitiesSection(itemIndex: FormatterItemIndex): string {
		const inlineActions = itemIndex.inlineActions;
		const systemActions = itemIndex.systemActions;
		if (inlineActions.length === 0 && systemActions.length === 0) return '';

		const out: string[] = ['<h2>Abilities</h2>'];
		for (const action of inlineActions) {
			const cost = action.system?.actions?.value;
			const kind = action.system?.actionType?.value;
			let costStr = '';
			if (typeof cost === 'number' && cost > 0) costStr = ` [${cost}-action${cost > 1 ? 's' : ''}]`;
			else if (kind === 'reaction') costStr = ' [reaction]';
			else if (kind === 'free') costStr = ' [free action]';
			const traits = (action.system?.traits?.value ?? []).join(', ');
			const rawDesc = (action.system?.description?.value ?? '').trim();
			let header = `<strong>${this.esc(action.name)}</strong>${costStr}`;
			if (traits) header += ` (${this.esc(traits)})`;
			out.push(`<div class="pf2e-ability"><p>${header}</p>${rawDesc}</div>`);
		}
		for (const ref of systemActions) {
			out.push(`<p><strong>${this.esc(this.nameFromUuid(ref.uuid, this.actionTable))}</strong> <em>(system action)</em></p>`);
		}
		return out.join('\n');
	}

	private renderSpells(itemIndex: FormatterItemIndex): string {
		const entries = itemIndex.spellEntries;
		if (entries.length === 0) return '';

		const out: string[] = ['<h2>Spells</h2>'];
		for (const entry of entries) {
			const atk = entry.system?.spelldc?.value ?? 0;
			const dc = entry.system?.spelldc?.dc ?? 0;
			out.push(
				`<p><strong>${this.esc(entry.name)}</strong> attack ${this.fmtMod(atk)}, DC ${dc}</p>`,
			);

			const entryId = this.getItemId(entry);
			if (!entryId) continue;
			const spells = itemIndex.spellsByEntryId.get(entryId) ?? [];
			if (spells.length === 0) continue;

			const byLevel = new Map<number, string[]>();
			for (const spell of spells) {
				const level = spell.heightenedLevel ?? 0;
				const name = this.nameFromUuid(spell.uuid, this.spellTable);
				if (!byLevel.has(level)) byLevel.set(level, []);
				byLevel.get(level)!.push(name);
			}
			const sorted = Array.from(byLevel.entries()).sort((a, b) => b[0] - a[0]);
			for (const [level, names] of sorted) {
				const levelLabel = level === 0 ? 'Cantrips' : `${this.ordinal(level)} Level`;
				out.push(`<p><em>${levelLabel}:</em> ${names.map((name) => this.esc(name)).join(', ')}</p>`);
			}
		}
		return out.join('\n');
	}

	private renderPublicNotes(system: NPCSystemData): string {
		const notes = system.details?.publicNotes;
		if (!notes) return '';
		return `<div class="pf2e-notes">${notes}</div>`;
	}

	private renderWeaponRef(ref: SystemWeaponReference): string {
		const base = ref.customName ?? this.nameFromUuid(ref.uuid, this.weaponTable);
		const runes: string[] = [];
		if (ref.runes?.potency) runes.push(`+${ref.runes.potency}`);
		if (ref.runes?.striking) runes.push(ref.runes.striking);
		if (ref.runes?.property?.length) runes.push(...ref.runes.property);
		return this.esc(base) + (runes.length ? ` (${this.esc(runes.join(', '))})` : '');
	}

	private nameFromUuid(uuid: string, table: Record<string, string>): string {
		for (const [key, value] of Object.entries(table)) {
			if (value === uuid) return this.humanizeKey(key);
		}
		const tail = uuid.split('.').pop() ?? uuid;
		return this.humanizeKey(tail);
	}

	private humanizeKey(key: string): string {
		return key
			.replace(/([a-z])([A-Z])/g, '$1 $2')
			.replace(/[-_]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()
			.replace(/\b\w/g, (c) => c.toUpperCase());
	}

	private formatTypeList(list: TypeListEntry[] | undefined, withValue = false): string {
		if (!list || list.length === 0) return '';
		return list
			.map((entry) => {
				const type = entry?.type ?? '';
				if (withValue && typeof entry?.value === 'number') return `${type} ${entry.value}`;
				return type;
			})
			.filter(Boolean)
			.join(', ');
	}

	private getItemId(item: ItemData): string | undefined {
		if (typeof item._id === 'string' && item._id.length > 0) return item._id;
		if ('id' in item && typeof item.id === 'string' && item.id.length > 0) return item.id;
		return undefined;
	}

	private sizeLabel(size: string | undefined): string {
		const labels: Record<string, string> = {
			tiny: 'Tiny',
			sm: 'Small',
			med: 'Medium',
			lg: 'Large',
			huge: 'Huge',
			grg: 'Gargantuan',
		};
		return labels[size ?? 'med'] ?? 'Medium';
	}

	private fmtMod(value: number): string {
		return value >= 0 ? `+${value}` : `${value}`;
	}

	private ordinal(n: number): string {
		const s = ['th', 'st', 'nd', 'rd'];
		const v = n % 100;
		return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
	}

	private esc(s: string): string {
		return String(s)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	private static isInlineActionItem(item: NPCItemEntry): item is InlineActionItem {
		return !isSystemItemReference(item) && item.type === 'action';
	}

	private static isInlineSpellcastingEntryItem(item: NPCItemEntry): item is InlineSpellcastingEntryItem {
		return !isSystemItemReference(item) && item.type === 'spellcastingEntry';
	}

	private static isInlineMeleeItem(item: NPCItemEntry): item is InlineMeleeItem {
		return !isSystemItemReference(item) && item.type === 'melee';
	}
}

const DEFAULT_FORMATTER = new PF2EStatblockFormatter();

/**
 * Format a HarbingerNPC as an HTML statblock that mirrors the classic
 * markdown statblock aesthetic already in the journal. The output is
 * wrapped by the caller in a <div class="statblock pf2e ..."> shell.
 */
export function formatPF2eStatblock(npc: HarbingerNPC): string {
	return DEFAULT_FORMATTER.format(npc);
}


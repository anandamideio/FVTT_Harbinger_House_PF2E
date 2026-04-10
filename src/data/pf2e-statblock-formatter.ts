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

/**
 * Format a HarbingerNPC as an HTML statblock that mirrors the classic
 * markdown statblock aesthetic already in the journal. The output is
 * wrapped by the caller in a <div class="statblock pf2e ..."> shell.
 */
export function formatPF2eStatblock(npc: HarbingerNPC): string {
	const system = npc.data.system as Record<string, any>;
	const out: string[] = [];

	out.push(renderDescriptor(npc, system));
	out.push(renderTraitStrip(system));
	out.push(renderPerceptionAndLanguages(system));
	out.push(renderSkills(system));
	out.push(renderAbilityTable(system));
	out.push(renderDefense(system));
	out.push(renderOffense(npc, system));
	out.push(renderAbilitiesSection(npc));
	out.push(renderSpells(npc));
	out.push(renderPublicNotes(system));

	return out.filter(Boolean).join('\n');
}

function renderDescriptor(npc: HarbingerNPC, system: Record<string, any>): string {
	const level = system.details?.level?.value ?? 0;
	const creatureType = system.details?.creatureType ?? 'Creature';
	const size = sizeLabel(system.traits?.size?.value);
	const alignment = system.details?.alignment?.value ?? '';
	const blurb = system.details?.blurb ?? '';
	const parts = [`Creature ${level}`, `${size} ${creatureType}`];
	if (alignment) parts.push(alignment);
	let line = `<p><em>${esc(parts.join(' — '))}`;
	if (blurb) line += `<br>${esc(blurb)}`;
	line += `</em></p>`;
	return line;
}

function renderTraitStrip(system: Record<string, any>): string {
	const rarity: string = system.traits?.rarity ?? 'common';
	const traits: string[] = system.traits?.value ?? [];
	const chips = [rarity, ...traits].filter((t) => t && t !== 'common');
	if (chips.length === 0) return '';
	return `<p class="pf2e-traits">${chips.map((t) => `<span class="pf2e-trait pf2e-trait-${esc(t)}">${esc(t)}</span>`).join('')}</p>`;
}

function renderPerceptionAndLanguages(system: Record<string, any>): string {
	const lines: string[] = [];
	const percMod = system.perception?.mod ?? 0;
	const percDetails = system.perception?.details ?? '';
	const senses = (system.traits?.senses ?? [])
		.map((s: any) => (typeof s === 'string' ? s : s.type))
		.filter(Boolean)
		.join(', ');
	let perc = `<strong>Perception</strong> ${fmtMod(percMod)}`;
	if (senses) perc += `; ${esc(senses)}`;
	if (percDetails) perc += `; ${esc(percDetails)}`;
	lines.push(`<p>${perc}</p>`);

	const languages = system.traits?.languages;
	if (languages) {
		const langList = (languages.value ?? []).join(', ');
		const langDetails = languages.details ?? '';
		if (langList || langDetails) {
			let line = `<strong>Languages</strong> ${esc(langList || '—')}`;
			if (langDetails) line += `; ${esc(langDetails)}`;
			lines.push(`<p>${line}</p>`);
		}
	}
	return lines.join('\n');
}

function renderSkills(system: Record<string, any>): string {
	const skills = system.skills;
	if (!skills || Object.keys(skills).length === 0) return '';
	const entries = Object.values(skills)
		.map((s: any) => `${esc(s.label)} ${fmtMod(s.value ?? s.base ?? 0)}`)
		.join(', ');
	return `<p><strong>Skills</strong> ${entries}</p>`;
}

function renderAbilityTable(system: Record<string, any>): string {
	const a = system.abilities ?? {};
	const keys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
	const cells = keys.map((k) => `<td>${fmtMod(a[k]?.mod ?? 0)}</td>`).join('');
	const headers = keys.map((k) => `<th>${k[0].toUpperCase() + k.slice(1)}</th>`).join('');
	return [
		'<h3>Ability Modifiers</h3>',
		'<table><thead><tr>' + headers + '</tr></thead>',
		'<tbody><tr>' + cells + '</tr></tbody></table>',
	].join('\n');
}

function renderDefense(system: Record<string, any>): string {
	const out: string[] = ['<h2>Defense</h2>'];
	const ac = system.attributes?.ac?.value ?? 10;
	const saves = system.saves ?? {};
	const saveLine =
		`<strong>AC</strong> ${ac}; ` +
		`<strong>Fort</strong> ${fmtMod(saves.fortitude?.value ?? 0)}, ` +
		`<strong>Ref</strong> ${fmtMod(saves.reflex?.value ?? 0)}, ` +
		`<strong>Will</strong> ${fmtMod(saves.will?.value ?? 0)}`;
	const saveDetail = [saves.fortitude?.saveDetail, saves.reflex?.saveDetail, saves.will?.saveDetail]
		.filter(Boolean)
		.join('; ');
	out.push(`<p>${saveLine}${saveDetail ? `; ${esc(saveDetail)}` : ''}</p>`);

	const hp = system.attributes?.hp;
	let hpLine = `<strong>HP</strong> ${hp?.value ?? 0}`;
	if (hp?.details) hpLine += ` (${esc(hp.details)})`;
	out.push(`<p>${hpLine}</p>`);

	const immunities = formatTypeList(system.attributes?.immunities);
	const weaknesses = formatTypeList(system.attributes?.weaknesses, true);
	const resistances = formatTypeList(system.attributes?.resistances, true);
	if (immunities) out.push(`<p><strong>Immunities</strong> ${esc(immunities)}</p>`);
	if (weaknesses) out.push(`<p><strong>Weaknesses</strong> ${esc(weaknesses)}</p>`);
	if (resistances) out.push(`<p><strong>Resistances</strong> ${esc(resistances)}</p>`);
	return out.join('\n');
}

function renderOffense(npc: HarbingerNPC, system: Record<string, any>): string {
	const out: string[] = ['<h2>Offense</h2>'];
	const speed = system.attributes?.speed?.value ?? 0;
	const other: any[] = system.attributes?.speed?.otherSpeeds ?? [];
	let speedLine = `<strong>Speed</strong> ${speed} feet`;
	if (other.length > 0) {
		speedLine += ', ' + other.map((s) => `${esc(s.type)} ${s.value} feet`).join(', ');
	}
	out.push(`<p>${speedLine}</p>`);

	for (const strike of npc.items) {
		if (isSystemItemReference(strike as NPCItemEntry)) continue;
		const item = strike as any;
		if (item.type !== 'melee') continue;
		const bonus = item.system?.bonus?.value ?? 0;
		const dmg = item.system?.damageRolls?.primary;
		const dmgStr = dmg ? `${esc(dmg.damage)} ${esc(dmg.damageType)}` : '';
		const traits = (item.system?.traits?.value ?? []).join(', ');
		let line = `<strong>Melee</strong> ${esc(item.name)} ${fmtMod(bonus)}`;
		if (traits) line += ` (${esc(traits)})`;
		if (dmgStr) line += `, <strong>Damage</strong> ${dmgStr}`;
		out.push(`<p>${line}</p>`);
	}

	for (const item of npc.items) {
		if (!isSystemWeaponReference(item)) continue;
		out.push(`<p><strong>Equipment</strong> ${renderWeaponRef(item)}</p>`);
	}
	return out.join('\n');
}

function renderAbilitiesSection(npc: HarbingerNPC): string {
	const inlineActions = npc.items.filter(
		(i) => !isSystemItemReference(i as NPCItemEntry) && (i as any).type === 'action',
	) as any[];
	const systemActions = npc.items.filter(isSystemActionReference) as SystemActionReference[];
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
		const desc = stripHtml(action.system?.description?.value ?? '');
		let line = `<strong>${esc(action.name)}</strong>${costStr}`;
		if (traits) line += ` (${esc(traits)})`;
		if (desc) line += ` ${esc(desc)}`;
		out.push(`<p>${line}</p>`);
	}
	for (const ref of systemActions) {
		out.push(`<p><strong>${esc(nameFromUuid(ref.uuid, SYSTEM_ACTIONS))}</strong> <em>(system action)</em></p>`);
	}
	return out.join('\n');
}

function renderSpells(npc: HarbingerNPC): string {
	const entries = npc.items.filter(
		(i) => !isSystemItemReference(i as NPCItemEntry) && (i as any).type === 'spellcastingEntry',
	) as any[];
	if (entries.length === 0) return '';

	const out: string[] = ['<h2>Spells</h2>'];
	for (const entry of entries) {
		const atk = entry.system?.spelldc?.value ?? 0;
		const dc = entry.system?.spelldc?.dc ?? 0;
		out.push(
			`<p><strong>${esc(entry.name)}</strong> attack ${fmtMod(atk)}, DC ${dc}</p>`,
		);

		const entryId = entry._id ?? entry.id;
		const spells = npc.items.filter(
			(i): i is SystemSpellReference => isSystemSpellReference(i) && (i as any).entryId === entryId,
		);
		if (spells.length === 0) continue;

		const byLevel = new Map<number, string[]>();
		for (const spell of spells) {
			const level = spell.heightenedLevel ?? 0;
			const name = nameFromUuid(spell.uuid, SYSTEM_SPELLS);
			if (!byLevel.has(level)) byLevel.set(level, []);
			byLevel.get(level)!.push(name);
		}
		const sorted = Array.from(byLevel.entries()).sort((a, b) => b[0] - a[0]);
		for (const [level, names] of sorted) {
			const levelLabel = level === 0 ? 'Cantrips' : `${ordinal(level)} Level`;
			out.push(`<p><em>${levelLabel}:</em> ${names.map(esc).join(', ')}</p>`);
		}
	}
	return out.join('\n');
}

function renderPublicNotes(system: Record<string, any>): string {
	const notes = system.details?.publicNotes;
	if (!notes) return '';
	return `<div class="pf2e-notes">${notes}</div>`;
}

function renderWeaponRef(ref: SystemWeaponReference): string {
	const base = ref.customName ?? nameFromUuid(ref.uuid, SYSTEM_WEAPONS);
	const runes: string[] = [];
	if (ref.runes?.potency) runes.push(`+${ref.runes.potency}`);
	if (ref.runes?.striking) runes.push(ref.runes.striking);
	if (ref.runes?.property?.length) runes.push(...ref.runes.property);
	return esc(base) + (runes.length ? ` (${esc(runes.join(', '))})` : '');
}

function nameFromUuid(uuid: string, table: Record<string, string>): string {
	for (const [key, value] of Object.entries(table)) {
		if (value === uuid) return humanizeKey(key);
	}
	const tail = uuid.split('.').pop() ?? uuid;
	return humanizeKey(tail);
}

function humanizeKey(key: string): string {
	return key
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/[-_]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTypeList(list: any[] | undefined, withValue = false): string {
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

function sizeLabel(size: string | undefined): string {
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

function fmtMod(value: number): string {
	return value >= 0 ? `+${value}` : `${value}`;
}

function ordinal(n: number): string {
	const s = ['th', 'st', 'nd', 'rd'];
	const v = n % 100;
	return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

function esc(s: string): string {
	return String(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function stripHtml(html: string): string {
	return html
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

import { localize, log, logDebug, MODULE_ID } from '../config';
import { openAlignmentPicker } from './AlignmentPickerApp';

// ============================================================================
// Alignment Definitions
// ============================================================================

export type AlignmentId = 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE';

export interface Alignment {
	id: AlignmentId;
	name: string;
	abbreviation: string;
	description: string;
	/** CSS hue value (0–360) for color theming */
	hue: number;
	/** CSS saturation percentage string (e.g. "60%") */
	sat: string;
	/** Emoji icon representing this alignment */
	icon: string;
	/** Whether this alignment counts as "lawful" for Law Slayer mechanics */
	isLawful: boolean;
}

export const ALIGNMENTS: Alignment[] = [
	{
		id: 'LG',
		name: 'Lawful Good',
		abbreviation: 'LG',
		description:
			'A paragon of order and virtue. Those who uphold justice through righteous law walk this path.',
		hue: 45,
		sat: '70%',
		icon: '⚜️',
		isLawful: true,
	},
	{
		id: 'NG',
		name: 'Neutral Good',
		abbreviation: 'NG',
		description:
			'Guided by conscience alone, doing good without regard for law or chaos.',
		hue: 120,
		sat: '45%',
		icon: '🌿',
		isLawful: false,
	},
	{
		id: 'CG',
		name: 'Chaotic Good',
		abbreviation: 'CG',
		description:
			'Freedom and kindness intertwined. Rebels with a cause, free spirits who fight tyranny wherever it festers.',
		hue: 170,
		sat: '50%',
		icon: '🦋',
		isLawful: false,
	},
	{
		id: 'LN',
		name: 'Lawful Neutral',
		abbreviation: 'LN',
		description:
			'Order above all — neither cruel nor kind, but devoted to structure. Judges, Modrons, and the Fraternity of Order embody this principle.',
		hue: 220,
		sat: '45%',
		icon: '⚖️',
		isLawful: true,
	},
	{
		id: 'N',
		name: 'True Neutral',
		abbreviation: 'N',
		description:
			'Balance incarnate. Druids of the Outlands, those who see all extremes as equal, and creatures of pure instinct.',
		hue: 60,
		sat: '20%',
		icon: '☯️',
		isLawful: false,
	},
	{
		id: 'CN',
		name: 'Chaotic Neutral',
		abbreviation: 'CN',
		description:
			'Pure freedom, unburdened by morality. Xaositects, tricksters, and those who answer to no one — not even their own conscience.',
		hue: 280,
		sat: '45%',
		icon: '🌀',
		isLawful: false,
	},
	{
		id: 'LE',
		name: 'Lawful Evil',
		abbreviation: 'LE',
		description:
			'Tyranny dressed in robes of law. Devils, corrupt magistrates, and those who use order as a weapon of domination.',
		hue: 0,
		sat: '55%',
		icon: '👑',
		isLawful: true,
	},
	{
		id: 'NE',
		name: 'Neutral Evil',
		abbreviation: 'NE',
		description:
			'Selfish malice without principle. Yugoloths and those who exploit any system — law or chaos — to serve their own dark ends.',
		hue: 330,
		sat: '40%',
		icon: '💀',
		isLawful: false,
	},
	{
		id: 'CE',
		name: 'Chaotic Evil',
		abbreviation: 'CE',
		description:
			'Destruction without purpose, cruelty without restraint. Demons, and those who revel in suffering and entropy.',
		hue: 10,
		sat: '65%',
		icon: '🔥',
		isLawful: false,
	},
];

export const ALIGNMENT_FLAG = 'alignment';

export function getAlignmentById(id: AlignmentId): Alignment | undefined {
	return ALIGNMENTS.find((a) => a.id === id);
}

export function getAlignmentName(id: string): string {
	return ALIGNMENTS.find((a) => a.id === id)?.name ?? '';
}

export function isLawfulAlignment(id: string): boolean {
	return ALIGNMENTS.find((a) => a.id === id)?.isLawful ?? false;
}

export function isValidAlignment(id: string): id is AlignmentId {
	return ALIGNMENTS.some((a) => a.id === id);
}

// ============================================================================
// Alignment Effect Synchronization
// ============================================================================
//
// PF2e rule elements run off of "roll options" — predicates like
// `target:harbinger:lawful` only resolve if the targeted actor exposes that
// option. The cleanest way to publish a roll option derived from external
// state (our alignment flag) is to drop a hidden Effect item on the actor
// whose only job is to hold a RollOption rule element. PF2e automatically
// processes Effects for rule elements, so this is framework-native.
// ============================================================================

/** Marker flag set on the synthetic Effect so we can find and replace it. */
const ALIGNMENT_EFFECT_MARKER = 'alignmentEffect';

/** Compendium-provided image path, falls back to a Foundry svg if missing. */
const ALIGNMENT_EFFECT_IMG = 'icons/svg/aura.svg';

interface ActorWithItems {
	items: {
		find: (fn: (item: unknown) => boolean) => unknown;
		filter: (fn: (item: unknown) => boolean) => unknown[];
	};
	createEmbeddedDocuments: (type: string, data: object[]) => Promise<unknown>;
	deleteEmbeddedDocuments: (type: string, ids: string[]) => Promise<unknown>;
	getFlag: (scope: string, key: string) => unknown;
}

interface AlignmentEffectItem {
	id: string;
	flags?: Record<string, Record<string, unknown>>;
}

/**
 * Synchronize the actor's hidden "alignment effect" item with the value
 * currently stored in the alignment module flag. Call this after any
 * change to the alignment flag. Safe to call repeatedly — it's idempotent.
 */
export async function syncAlignmentEffect(actor: unknown): Promise<void> {
	const typedActor = actor as ActorWithItems;
	const flagValue = (typedActor.getFlag(MODULE_ID, ALIGNMENT_FLAG) as string | undefined) ?? '';
	const alignment = flagValue ? getAlignmentById(flagValue as AlignmentId) : undefined;

	// Remove any existing alignment effect(s) on the actor
	const existing = typedActor.items.filter(
		(item) => (item as AlignmentEffectItem).flags?.[MODULE_ID]?.[ALIGNMENT_EFFECT_MARKER] === true,
	) as AlignmentEffectItem[];

	if (existing.length > 0) {
		await typedActor.deleteEmbeddedDocuments(
			'Item',
			existing.map((item) => item.id),
		);
	}

	if (!alignment) return; // cleared; nothing to add

	const rules: Array<Record<string, unknown>> = [
		{
			key: 'RollOption',
			domain: 'all',
			option: `harbinger:alignment:${alignment.id.toLowerCase()}`,
		},
	];

	if (alignment.isLawful) {
		rules.push({
			key: 'RollOption',
			domain: 'all',
			option: 'harbinger:lawful',
		});
	}

	await typedActor.createEmbeddedDocuments('Item', [
		{
			name: `Harbinger Alignment: ${alignment.name}`,
			type: 'effect',
			img: ALIGNMENT_EFFECT_IMG,
			system: {
				description: {
					value: `<p><em>Custom alignment tag set by the Harbinger House module.</em></p><p>This hidden effect publishes a roll option (<code>harbinger:alignment:${alignment.id.toLowerCase()}</code>${alignment.isLawful ? ', <code>harbinger:lawful</code>' : ''}) so weapons like Sougad's Law Slayer can mechanically react to alignment even after the PF2e Remaster.</p>`,
				},
				duration: { value: -1, unit: 'unlimited', sustained: false, expiry: null },
				level: { value: 1 },
				start: { value: 0, initiative: null },
				tokenIcon: { show: false },
				unidentified: true,
				traits: { value: [], rarity: 'common' },
				rules,
			},
			flags: {
				[MODULE_ID]: {
					[ALIGNMENT_EFFECT_MARKER]: true,
					alignmentId: alignment.id,
				},
			},
		},
	]);

	logDebug(`[Alignment] Synced alignment effect on actor: ${alignment.id}`);
}

// ============================================================================
// Sheet Injection
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function injectAlignmentSelector(app: any, html: JQuery): void {
	const actor = app.actor ?? app.object;
	if (!actor) return;

	// Only inject once per render
	if (html.find('.detail.harbinger-alignment').length > 0) return;

	const $abcd = html.find('.subsection.details .abcd');
	if ($abcd.length === 0) {
		logDebug('[AlignmentSelector] .abcd container not found, skipping injection');
		return;
	}

	const currentAlignment = (actor.getFlag(MODULE_ID, ALIGNMENT_FLAG) as string | undefined) ?? '';
	const isEditable = app.isEditable ?? app.options?.editable ?? false;

	const label = localize('alignment.label');
	const displayName = getAlignmentName(currentAlignment);

	const pickerBtn = isEditable
		? `<a class="harbinger-alignment-picker-btn" role="button" tabindex="0" title="${label}"><i class="fa-solid fa-fw fa-compass"></i></a>`
		: '';

	const $detail = $(`
		<div class="detail harbinger-alignment" data-harbinger-alignment>
			<span class="details-label">${label}</span>
			<h3>
				<span class="value">${displayName}</span>
				${pickerBtn}
			</h3>
		</div>
	`);

	// Insert after faction detail if present, otherwise after deity, otherwise append
	const $faction = $abcd.find('.detail.sigil-faction');
	const $deity = $abcd.find('.detail.deity');
	if ($faction.length > 0) {
		$faction.after($detail);
	} else if ($deity.length > 0) {
		$deity.after($detail);
	} else {
		$abcd.append($detail);
	}

	if (!isEditable) return;

	$detail.find('.harbinger-alignment-picker-btn').on('click keydown', async (event) => {
		if (event.type === 'keydown' && (event as KeyboardEvent).key !== 'Enter') return;

		const current = (actor.getFlag(MODULE_ID, ALIGNMENT_FLAG) as string | undefined) ?? '';
		const selected = await openAlignmentPicker(current as AlignmentId | '', actor.name);

		if (selected === null) return; // dialog dismissed

		await actor.setFlag(MODULE_ID, ALIGNMENT_FLAG, selected);
		await syncAlignmentEffect(actor);
		log(`[AlignmentSelector] Alignment set to "${selected}" for actor: ${actor.name}`);

		// Update the displayed value in-place
		$detail.find('.value').text(getAlignmentName(selected));
	});

	logDebug(`[AlignmentSelector] Injected alignment selector for actor: ${actor.name}`);
}

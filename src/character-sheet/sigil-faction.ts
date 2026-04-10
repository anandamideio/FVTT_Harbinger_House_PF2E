import { localize, log, logDebug, MODULE_ID } from '../config';
import { openFactionPicker } from './FactionPickerApp';
import { injectAlignmentSelector } from './alignment';

// ============================================================================
// Faction Definitions
// ============================================================================

export interface SigilFaction {
	id: string;
	name: string;
	image: string;
}

const FACTION_IMG = 'modules/harbinger-house-pf2e/dist/assets/icons/factions';

export const SIGIL_FACTIONS: SigilFaction[] = [
	{ id: 'athar', name: 'Athar', image: `${FACTION_IMG}/athar.png` },
	{ id: 'believers', name: 'Believers of the Source', image: `${FACTION_IMG}/believers_of_the_source.png` },
	{ id: 'bleak-cabal', name: 'Bleak Cabal', image: `${FACTION_IMG}/bleak_cabal.png` },
	{ id: 'doomguard', name: 'Doomguard', image: `${FACTION_IMG}/doomguard.png` },
	{ id: 'dustmen', name: 'Dustmen', image: `${FACTION_IMG}/FactionDustmen2e.webp` },
	{ id: 'fated', name: 'The Fated', image: `${FACTION_IMG}/FactionFated2e.webp` },
	{ id: 'fraternity-of-order', name: 'Fraternity of Order', image: `${FACTION_IMG}/the_fraternity_of_order.png` },
	{ id: 'free-league', name: 'Free League', image: `${FACTION_IMG}/FactionFreeLeague2e.webp` },
	{ id: 'harmonium', name: 'Harmonium', image: `${FACTION_IMG}/FactionHarmonium2e.webp` },
	{ id: 'mercykillers', name: 'Mercykillers', image: `${FACTION_IMG}/the_mercykillers.png` },
	{ id: 'revolutionary-league', name: 'Revolutionary League', image: `${FACTION_IMG}/the_revolutionary_league.png` },
	{ id: 'sign-of-one', name: 'Sign of One', image: `${FACTION_IMG}/the_sign_of_one.png` },
	{ id: 'society-of-sensation', name: 'Society of Sensation', image: `${FACTION_IMG}/the_society_of_sensation.png` },
	{ id: 'transcendent-order', name: 'Transcendent Order', image: `${FACTION_IMG}/the_transcendent_order.png` },
	{ id: 'xaositects', name: 'Xaositects', image: `${FACTION_IMG}/xaositects.png` },
];

export const FACTION_FLAG = 'sigilFaction';

function getFactionName(id: string): string {
	return SIGIL_FACTIONS.find((f) => f.id === id)?.name ?? '';
}

// ============================================================================
// Sheet Injection
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function injectFactionSelector(app: any, html: JQuery): void {
	const actor = app.actor ?? app.object;
	if (!actor) return;

	// Only inject once per render — bail if already present
	if (html.find('.detail.sigil-faction').length > 0) return;

	const $abcd = html.find('.subsection.details .abcd');
	if ($abcd.length === 0) {
		logDebug('[FactionSelector] .abcd container not found, skipping injection');
		return;
	}

	const currentFaction = (actor.getFlag(MODULE_ID, FACTION_FLAG) as string | undefined) ?? '';
	const isEditable = app.isEditable ?? app.options?.editable ?? false;

	const factionLabel = localize('faction.label');
	const displayName = getFactionName(currentFaction);

	const pickerBtn = isEditable
		? `<a class="harbinger-faction-picker-btn" role="button" tabindex="0" title="${factionLabel}"><i class="fa-solid fa-fw fa-search"></i></a>`
		: '';

	const $detail = $(`
		<div class="detail sigil-faction" data-harbinger-faction>
			<span class="details-label">${factionLabel}</span>
			<h3>
				<span class="value">${displayName}</span>
				${pickerBtn}
			</h3>
		</div>
	`);

	// Insert after deity detail (last item in the grid), or append to .abcd
	const $deity = $abcd.find('.detail.deity');
	if ($deity.length > 0) {
		$deity.after($detail);
	} else {
		$abcd.append($detail);
	}

	if (!isEditable) return;

	$detail.find('.harbinger-faction-picker-btn').on('click keydown', async (event) => {
		if (event.type === 'keydown' && (event as KeyboardEvent).key !== 'Enter') return;

		const current = (actor.getFlag(MODULE_ID, FACTION_FLAG) as string | undefined) ?? '';
		const selected = await openFactionPicker(current);

		if (selected === null) return; // dialog dismissed

		await actor.setFlag(MODULE_ID, FACTION_FLAG, selected);
		log(`[FactionSelector] Faction set to "${selected || 'none'}" for actor: ${actor.name}`);

		// Update the displayed value in-place without waiting for a full re-render
		$detail.find('.value').text(getFactionName(selected));
	});

	logDebug(`[FactionSelector] Injected faction selector for actor: ${actor.name}`);
}

// ============================================================================
// Hook Registration
// ============================================================================

export function registerCharacterSheetHooks(): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Hooks.on('renderCharacterSheetPF2e', (...args: any[]) => {
		const [app, html] = args;
		injectFactionSelector(app, html);
		injectAlignmentSelector(app, html);
	});

	log('Character sheet hooks registered');
}

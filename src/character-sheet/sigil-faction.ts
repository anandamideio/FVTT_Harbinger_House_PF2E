import { localize, log, logDebug, MODULE_ID } from '../config';
import { openFactionPicker } from './FactionPickerApp';
import { injectAlignmentSelector } from './alignment';
import { FACTION_FLAG, getSigilFactionName } from './factions';
export { FACTION_FLAG, SIGIL_FACTIONS, type SigilFaction } from './factions';

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
	const displayName = getSigilFactionName(currentFaction);

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
		$detail.find('.value').text(getSigilFactionName(selected));
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

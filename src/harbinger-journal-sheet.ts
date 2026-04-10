import { logDebug, MODULE_ID } from './config';
import { FACTION_FLAG, SIGIL_FACTIONS } from './character-sheet/factions';

/**
 * Custom journal sheet used by Harbinger House journal entries.
 * Adds the themed root CSS class so module styles apply consistently.
 */
export class HarbingerJournalSheet extends foundry.applications.sheets.journal.JournalEntrySheet {
	constructor(doc: JournalEntryClass, options?: Record<string, unknown>) {
		super(doc, options);

		if (!this.options.classes.includes('harbinger-journal')) {
			this.options.classes.push('harbinger-journal');
		}

		logDebug('[JournalFaction] HarbingerJournalSheet constructed', {
			journalId: this.document?.id,
			journalName: this.document?.name,
		});
	}

	async _onRender(context: unknown, options: unknown): Promise<void> {
		logDebug('[JournalFaction] HarbingerJournalSheet _onRender start', {
			journalId: this.document?.id,
			journalName: this.document?.name,
		});

		await super._onRender(context, options);

		const $root = $(this.element);
		if ($root.length === 0) {
			logDebug('[JournalFaction] _onRender abort: no sheet root element found');
			return;
		}

		$root.closest('.journal-sheet').addClass('harbinger-journal');

		if (this.document) {
			HarbingerJournalSheet.decorateFactionCallouts(this.document, $root);
		}

		logDebug('[JournalFaction] HarbingerJournalSheet _onRender complete', {
			journalName: this.document?.name,
		});
	}

	static decorateFactionCallouts(journal: JournalEntryClass, html: JQuery): void {
		logDebug('[JournalFaction] decorateFactionCallouts invoked', {
			journalId: journal.id,
			journalName: journal.name,
		});

		ensureFactionCalloutObserver(journal, html);

		if (!isIntroductionJournal(journal)) {
			logDebug('[JournalFaction] Skip decoration: journal is not Introduction', {
				journalName: journal.name,
			});
			return;
		}

		const $callouts = html.find('.faction-callout');
		if ($callouts.length === 0) {
			logDebug('[JournalFaction] No faction callouts found in current rendered DOM', {
				journalName: journal.name,
			});
			return;
		}

		const playersByFaction = collectPlayerFactionMembers();
		const playersByFactionSummary = Array.from(playersByFaction.entries()).map(([factionId, members]) => ({
			factionId,
			members: members.map((member) => member.actorName),
		}));

		logDebug('[JournalFaction] Found faction callouts and player faction assignments', {
			calloutCount: $callouts.length,
			playersByFaction: playersByFactionSummary,
		});

		let injectedCallouts = 0;

		for (const element of $callouts.toArray()) {
			const $callout = $(element);
			$callout.find('.harbinger-faction-player-strip').remove();

			const factionId = resolveFactionIdFromCalloutElement($callout);
			if (!factionId) {
				const heading =
					$callout.find('p strong').first().text() || $callout.children('p').first().text() || 'Unknown';
				logDebug('[JournalFaction] Could not resolve faction ID from callout', {
					heading,
					classes: $callout.attr('class') ?? '',
				});
				continue;
			}

			const players = playersByFaction.get(factionId);
			if (!players || players.length === 0) {
				logDebug('[JournalFaction] No players assigned to resolved faction', { factionId });
				continue;
			}

			const $titleParagraph = $callout.children('p').first();
			if ($titleParagraph.length === 0) {
				logDebug('[JournalFaction] Callout missing title paragraph; skipping chip injection', { factionId });
				continue;
			}

			$titleParagraph.addClass('harbinger-faction-callout-title');

			const $strip = $('<span class="harbinger-faction-player-strip"></span>');
			for (const player of players) {
				const $chip = $('<span class="harbinger-faction-player-chip"></span>');
				$('<img class="harbinger-faction-player-token" loading="lazy">')
					.attr('src', player.tokenSrc)
					.attr('alt', player.actorName)
					.appendTo($chip);
				$('<span class="harbinger-faction-player-name"></span>').text(player.actorName).appendTo($chip);
				$chip.appendTo($strip);
			}

			$titleParagraph.append($strip);
			injectedCallouts++;
			logDebug('[JournalFaction] Injected player chips for faction callout', {
				factionId,
				players: players.map((player) => player.actorName),
			});
		}

		logDebug('[JournalFaction] Decoration pass complete', {
			calloutCount: $callouts.length,
			injectedCallouts,
		});
	}
}

interface HarbingerJournalRootElement extends HTMLElement {
	__harbingerFactionObserver?: MutationObserver;
	__harbingerFactionApplyQueued?: boolean;
}

interface FactionMemberChip {
	actorName: string;
	tokenSrc: string;
}

const KNOWN_FACTION_IDS = new Set(SIGIL_FACTIONS.map((faction) => faction.id));

const FACTION_NAME_TO_ID = new Map(
	SIGIL_FACTIONS.map((faction) => [normalizeFactionHeading(faction.name), faction.id] as const),
);

function isIntroductionJournal(journal: JournalEntryClass): boolean {
	return normalizeFactionHeading(journal.name) === 'introduction';
}

function collectPlayerFactionMembers(): Map<string, FactionMemberChip[]> {
	const result = new Map<string, FactionMemberChip[]>();
	const actorsById = new Map<string, ActorClass>();

	for (const user of game.users?.contents ?? []) {
		if (user.isGM) continue;
		const actorId = user.character?.id;
		if (!actorId) continue;

		const actor = game.actors.get(actorId);
		if (!actor) continue;

		actorsById.set(actor.id, actor);
	}

	// Fallback: include flagged character actors even if users are not linked to
	// a specific character in world settings.
	if (actorsById.size === 0) {
		logDebug('[JournalFaction] No non-GM user-linked characters found; falling back to world character actors');

		for (const actor of game.actors.contents) {
			if (actor.type !== 'character') continue;
			actorsById.set(actor.id, actor);
		}
	}

	logDebug('[JournalFaction] Candidate character actor count', { actorCount: actorsById.size });

	for (const actor of actorsById.values()) {
		const factionId = (actor.getFlag(MODULE_ID, FACTION_FLAG) as string | undefined) ?? '';
		if (!KNOWN_FACTION_IDS.has(factionId)) continue;

		if (!result.has(factionId)) {
			result.set(factionId, []);
		}

		result.get(factionId)?.push({
			actorName: actor.name,
			tokenSrc: getActorTokenImage(actor),
		});
	}

	for (const members of result.values()) {
		members.sort((a, b) => a.actorName.localeCompare(b.actorName));
	}

	const factionCounts = Array.from(result.entries()).map(([factionId, members]) => ({
		factionId,
		count: members.length,
	}));

	logDebug('[JournalFaction] Completed actor-to-faction grouping', { factionCounts });

	return result;
}

function ensureFactionCalloutObserver(journal: JournalEntryClass, html: JQuery): void {
	const root = html.get(0) as HarbingerJournalRootElement | undefined;
	if (!root) {
		logDebug('[JournalFaction] Observer setup skipped: no root HTML element');
		return;
	}

	if (root.__harbingerFactionObserver) return;

	const scheduleApply = () => {
		if (root.__harbingerFactionApplyQueued) return;
		root.__harbingerFactionApplyQueued = true;

		queueMicrotask(() => {
			root.__harbingerFactionApplyQueued = false;
			HarbingerJournalSheet.decorateFactionCallouts(journal, html);
		});
	};

	const observer = new MutationObserver((mutations) => {
		if (!mutations.some((mutation) => mutationTouchesFactionCallouts(mutation))) return;
		logDebug('[JournalFaction] Detected faction callout DOM mutation; scheduling decoration');
		scheduleApply();
	});

	observer.observe(root, { childList: true, subtree: true });
	root.__harbingerFactionObserver = observer;

	logDebug('[JournalFaction] Attached faction callout observer', {
		journalId: journal.id,
		journalName: journal.name,
	});
}

function mutationTouchesFactionCallouts(mutation: MutationRecord): boolean {
	for (const node of [...mutation.addedNodes, ...mutation.removedNodes]) {
		if (!(node instanceof Element)) continue;
		if (node.classList.contains('faction-callout')) return true;
		if (node.querySelector('.faction-callout')) return true;
	}

	return false;
}

function getActorTokenImage(actor: ActorClass): string {
	const actorData = actor.toObject();
	const tokenImage = actorData.prototypeToken?.texture?.src?.trim();
	if (tokenImage) return tokenImage;

	const portrait = actor.img?.trim();
	if (portrait) return portrait;

	return 'icons/svg/mystery-man.svg';
}

function resolveFactionIdFromCalloutElement($callout: JQuery): string | null {
	const classList = ($callout.attr('class') ?? '').split(/\s+/).filter(Boolean);
	const heading = $callout.find('p strong').first().text() || $callout.children('p').first().text();
	return resolveFactionIdFromCallout(classList, heading);
}

export function resolveFactionIdFromCallout(classList: string[], heading: string): string | null {
	for (const className of classList) {
		if (KNOWN_FACTION_IDS.has(className)) {
			return className;
		}
	}

	const normalizedHeading = normalizeFactionHeading(heading);
	if (!normalizedHeading) return null;

	return FACTION_NAME_TO_ID.get(normalizedHeading) ?? null;
}

function normalizeFactionHeading(value: string): string {
	return value
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()
		.replace(/^the\s+/, '');
}

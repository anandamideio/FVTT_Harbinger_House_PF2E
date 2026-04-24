import { logDebug, MODULE_ID } from './config';
import { FACTION_FLAG, SIGIL_FACTIONS } from './character-sheet/factions';
import { ALL_NPCS, getNPCById } from './data';
import { NARCOVI_NOTEBOOK_FLAG } from './data/content/narcovi-notebook';
import { isSystemActorReference, type HarbingerNPC } from './data/schema/harbinger-npc';
import { formatPF2eStatblock } from './data/transform/pf2e-statblock-formatter';
import { applyNarcoviNotebookDecoration } from './narcovi-notebook-sheet';

const STATBLOCK_VIEW_FLAG = 'statblockView';
type StatblockView = 'pf2e' | 'classic';
const DEFAULT_STATBLOCK_VIEW: StatblockView = 'pf2e';

const KNOWN_NPC_IDS = new Set(
	ALL_NPCS.filter((npc) => !isSystemActorReference(npc)).map((npc) => (npc as HarbingerNPC).id),
);

const PAGE_NAV_CONTAINER_SELECTOR = [
	'aside.sidebar',
	'.journal-entry-pages > aside',
	'nav.pages-list',
	'.pages-list',
	'.journal-sidebar',
].join(', ');

const ACTIVE_PAGE_SELECTOR = [
	'li.active',
	'.directory-item.active',
	'[aria-current="page"]',
	'[aria-selected="true"]',
].join(', ');

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

		// Documents imported before the NarcoviNotebookSheet sheet-class override
		// landed still resolve to this sheet. Detect the flag and hand off to the
		// notebook decoration path so the parchment styling and font toggle apply.
		const isNarcoviNotebook = this.document?.getFlag(MODULE_ID, NARCOVI_NOTEBOOK_FLAG) === true;
		if (isNarcoviNotebook) {
			logDebug('[JournalFaction] Narcovi notebook flag detected on HarbingerJournalSheet; applying notebook decoration', {
				journalId: this.document?.id,
			});
			applyNarcoviNotebookDecoration($root);
			scheduleNavigationScrollToActivePage(this.document, $root);
			return;
		}

		$root.closest('.journal-sheet').addClass('harbinger-journal');

		if (this.document) {
			HarbingerJournalSheet.decorateFactionCallouts(this.document, $root);
			await HarbingerJournalSheet.decorateStatblocks(this.document, $root);
		}

		scheduleNavigationScrollToActivePage(this.document, $root);

		logDebug('[JournalFaction] HarbingerJournalSheet _onRender complete', {
			journalName: this.document?.name,
		});
	}

	static async decorateStatblocks(journal: JournalEntryClass, html: JQuery): Promise<void> {
		logDebug('[JournalStatblock] decorateStatblocks invoked', {
			journalId: journal.id,
			journalName: journal.name,
			knownNPCIdCount: KNOWN_NPC_IDS.size,
		});

		ensureStatblockObserver(journal, html);

		const $allStatblocks = html.find('.statblock');
		const $statblocks = $allStatblocks.not('.pf2e-rendered, .pf2e-rendering');
		logDebug('[JournalStatblock] Statblock DOM query result', {
			journalName: journal.name,
			totalFound: $allStatblocks.length,
			pendingDecoration: $statblocks.length,
			alreadyDecorated: $allStatblocks.length - $statblocks.length,
		});

		if ($statblocks.length === 0) {
			logDebug('[JournalStatblock] No undecorated statblocks present; exiting early');
			return;
		}

		// Claim all pending statblocks before any async work to avoid duplicate decoration
		// when multiple decorate passes run concurrently.
		$statblocks.addClass('pf2e-rendering');

		const view = (journal.getFlag(MODULE_ID, STATBLOCK_VIEW_FLAG) as StatblockView | undefined) ?? DEFAULT_STATBLOCK_VIEW;
		logDebug('[JournalStatblock] Resolved initial view from flag', { view });

		let decoratedCount = 0;
		let skippedNoId = 0;
		let skippedUnknownNPC = 0;
		const perElement: Array<Record<string, unknown>> = [];

		for (const element of $statblocks.toArray()) {
			const $classic = $(element);
			const classAttr = $classic.attr('class') ?? '';
			const npcId = resolveNPCIdFromStatblock($classic);

			if (!npcId) {
				$classic.removeClass('pf2e-rendering');
				skippedNoId++;
				perElement.push({ classAttr, outcome: 'skip:no-matching-id' });
				logDebug('[JournalStatblock] Skipping statblock: no known NPC id in class list', {
					classAttr,
					innerHtmlPreview: ($classic.html() ?? '').slice(0, 200),
				});
				continue;
			}

			const npc = getNPCById(npcId);
			if (!npc || isSystemActorReference(npc)) {
				$classic.removeClass('pf2e-rendering');
				skippedUnknownNPC++;
				perElement.push({ classAttr, npcId, outcome: 'skip:npc-lookup-failed' });
				continue;
			}

			let pf2eHtml: string;
			try {
				pf2eHtml = formatPF2eStatblock(npc as HarbingerNPC);
			} catch (err) {
				$classic.removeClass('pf2e-rendering');
				logDebug('[JournalStatblock] formatPF2eStatblock threw', {
					npcId,
					error: String(err),
				});
				perElement.push({ classAttr, npcId, outcome: 'skip:formatter-error', error: String(err) });
				continue;
			}

			try {
				pf2eHtml = await enrichStatblockHtml(pf2eHtml);
			} catch (err) {
				logDebug('[JournalStatblock] enrichHTML threw; falling back to raw HTML', {
					npcId,
					error: String(err),
				});
			}

			$classic.addClass('pf2e-rendered classic-view').removeClass('pf2e-rendering');

			const $pf2e = $(`<div class="statblock pf2e-view pf2e-rendered ${escapeClass(npcId)}"></div>`).html(pf2eHtml);

			const $container = $(`<div class="statblock-container" data-npc-id="${escapeClass(npcId)}" data-view="${view}"></div>`);
			const $header = $(
				`<div class="statblock-header">
					<button type="button" class="statblock-toggle" aria-pressed="${view === 'pf2e'}">
						<span class="statblock-toggle-label">${view === 'pf2e' ? 'Pathfinder 2e' : 'AD&amp;D 2e (Classic)'}</span>
						<span class="statblock-toggle-hint">click to switch</span>
					</button>
				</div>`,
			);

			$classic.before($container);
			$container.append($header).append($classic).append($pf2e);
			decoratedCount++;
			perElement.push({ classAttr, npcId, outcome: 'decorated' });
		}

		logDebug('[JournalStatblock] Decoration loop complete', {
			journalName: journal.name,
			decoratedCount,
			skippedNoId,
			skippedUnknownNPC,
			perElement,
		});

		if (decoratedCount === 0) {
			logDebug('[JournalStatblock] No statblocks decorated; skipping click handler binding');
			return;
		}

		html
			.off('click.harbinger-statblock')
			.off('keydown.harbinger-statblock')
			.on('click.harbinger-statblock', '.statblock-toggle', async (event) => {
				event.preventDefault();
				const $button = $(event.currentTarget as HTMLElement);
				const $container = $button.closest('.statblock-container');
				const current = ($container.attr('data-view') as StatblockView | undefined) ?? DEFAULT_STATBLOCK_VIEW;
				const next: StatblockView = current === 'pf2e' ? 'classic' : 'pf2e';

				logDebug('[JournalStatblock] Toggle clicked', {
					journalName: journal.name,
					from: current,
					to: next,
				});

				html.find('.statblock-container').each((_, el) => {
					const $c = $(el);
					$c.attr('data-view', next);
					const $btn = $c.find('.statblock-toggle');
					$btn.attr('aria-pressed', String(next === 'pf2e'));
					$btn.find('.statblock-toggle-label').text(next === 'pf2e' ? 'Pathfinder 2e' : 'AD\u0026D 2e (Classic)');
				});

				try {
					await journal.setFlag(MODULE_ID, STATBLOCK_VIEW_FLAG, next);
					logDebug('[JournalStatblock] Persisted statblock view flag', { next });
				} catch (err) {
					logDebug('[JournalStatblock] Failed to persist statblock view preference', { error: String(err) });
				}
			})
			.on('click.harbinger-statblock', '.pf2e-statblock-name-link', (event) => {
				event.preventDefault();
				event.stopPropagation();
				const $link = $(event.currentTarget as HTMLElement);
				const npcId = ($link.attr('data-npc-id') ?? $link.closest('.statblock-container').attr('data-npc-id') ?? '').trim();
				if (!npcId) return;

				const actor = findImportedActorBySourceId(npcId);
				if (!actor?.sheet) {
					logDebug('[JournalStatblock] Name link clicked but actor sheet was not found', {
						npcId,
					});
					return;
				}

				actor.sheet.render(true);
			})
			.on('keydown.harbinger-statblock', '.pf2e-statblock-name-link', (event) => {
				const key = (event as JQuery.KeyDownEvent).key;
				if (key !== 'Enter' && key !== ' ') return;
				event.preventDefault();
				event.stopPropagation();
				const $link = $(event.currentTarget as HTMLElement);
				const npcId = ($link.attr('data-npc-id') ?? $link.closest('.statblock-container').attr('data-npc-id') ?? '').trim();
				if (!npcId) return;

				const actor = findImportedActorBySourceId(npcId);
				if (!actor?.sheet) {
					logDebug('[JournalStatblock] Name link keypress but actor sheet was not found', {
						npcId,
						key,
					});
					return;
				}

				actor.sheet.render(true);
			});

		logDebug('[JournalStatblock] Decoration pass complete', {
			journalName: journal.name,
			decoratedCount,
			view,
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

function scheduleNavigationScrollToActivePage(journal: JournalEntryClass | undefined, html: JQuery): void {
	const retryDelaysMs = [0, 50, 150];
	let didScroll = false;

	retryDelaysMs.forEach((delayMs, index) => {
		globalThis.setTimeout(() => {
			if (didScroll) return;

			didScroll = scrollJournalNavigationToActivePage(html);
			if (didScroll) {
				logDebug('[JournalNavigation] Scrolled pages panel to active page', {
					journalId: journal?.id,
					journalName: journal?.name,
					attempt: index + 1,
				});
				return;
			}

			if (index === retryDelaysMs.length - 1) {
				logDebug('[JournalNavigation] Active page entry not found in navigation panel', {
					journalId: journal?.id,
					journalName: journal?.name,
				});
			}
		}, delayMs);
	});
}

export function scrollJournalNavigationToActivePage(html: JQuery): boolean {
	const rootElement = html.get(0);
	if (!(rootElement instanceof HTMLElement)) return false;

	const $sheetRoot = $(rootElement).closest('.journal-sheet');
	const $searchRoot = $sheetRoot.length > 0 ? $sheetRoot : $(rootElement);
	const $navigationPanels = $searchRoot.find(PAGE_NAV_CONTAINER_SELECTOR).add($searchRoot.filter(PAGE_NAV_CONTAINER_SELECTOR));

	for (const panel of $navigationPanels.toArray()) {
		const activePage = $(panel).find(ACTIVE_PAGE_SELECTOR).first().get(0);
		if (!(activePage instanceof HTMLElement)) continue;

		activePage.scrollIntoView({ block: 'nearest', inline: 'nearest' });
		return true;
	}

	return false;
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
	const nodes = [...Array.from(mutation.addedNodes), ...Array.from(mutation.removedNodes)];
	for (const node of nodes) {
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

function resolveNPCIdFromStatblock($statblock: JQuery): string | null {
	const classList = ($statblock.attr('class') ?? '').split(/\s+/).filter(Boolean);
	for (const className of classList) {
		if (KNOWN_NPC_IDS.has(className)) return className;
	}
	return null;
}

function findImportedActorBySourceId(sourceId: string): ActorClass | null {
	const actor = game.actors.find((candidate) => {
		const imported = candidate.getFlag(MODULE_ID, 'imported');
		const candidateSourceId = candidate.getFlag(MODULE_ID, 'sourceId');
		return imported === true && candidateSourceId === sourceId;
	});
	return actor ?? null;
}

function escapeClass(value: string): string {
	return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

async function enrichStatblockHtml(html: string): Promise<string> {
	type HtmlEnricher = {
		enrichHTML?: (content: string, options: { async: true }) => string | Promise<string>;
	};

	const g = globalThis as {
		game?: {
			pf2e?: {
				TextEditor?: HtmlEnricher;
			};
		};
		foundry?: {
			applications?: {
				ux?: {
					TextEditor?: {
						implementation?: HtmlEnricher;
					};
				};
			};
		};
		TextEditor?: HtmlEnricher;
	};

	const enricher =
		g.game?.pf2e?.TextEditor ??
		g.foundry?.applications?.ux?.TextEditor?.implementation ??
		g.TextEditor;
	if (!enricher?.enrichHTML) return html;
	return Promise.resolve(enricher.enrichHTML(html, { async: true }));
}

interface HarbingerStatblockRoot extends HTMLElement {
	__harbingerStatblockObserver?: MutationObserver;
	__harbingerStatblockApplyQueued?: boolean;
}

function ensureStatblockObserver(journal: JournalEntryClass, html: JQuery): void {
	const root = html.get(0) as HarbingerStatblockRoot | undefined;
	if (!root) {
		logDebug('[JournalStatblock] Observer setup skipped: no root HTML element');
		return;
	}

	if (root.__harbingerStatblockObserver) {
		logDebug('[JournalStatblock] Observer already attached; skipping setup');
		return;
	}

	const scheduleApply = () => {
		if (root.__harbingerStatblockApplyQueued) return;
		root.__harbingerStatblockApplyQueued = true;

		queueMicrotask(() => {
			root.__harbingerStatblockApplyQueued = false;
			HarbingerJournalSheet.decorateStatblocks(journal, html);
		});
	};

	const observer = new MutationObserver((mutations) => {
		if (!mutations.some((mutation) => mutationTouchesStatblocks(mutation))) return;
		logDebug('[JournalStatblock] Detected statblock DOM mutation; scheduling decoration');
		scheduleApply();
	});

	observer.observe(root, { childList: true, subtree: true });
	root.__harbingerStatblockObserver = observer;

	logDebug('[JournalStatblock] Attached statblock observer', {
		journalId: journal.id,
		journalName: journal.name,
	});
}

function mutationTouchesStatblocks(mutation: MutationRecord): boolean {
	const nodes = [...Array.from(mutation.addedNodes), ...Array.from(mutation.removedNodes)];
	for (const node of nodes) {
		if (!(node instanceof Element)) continue;
		if (node.classList.contains('statblock') && !node.classList.contains('pf2e-rendered') && !node.classList.contains('pf2e-rendering')) return true;
		const fresh = node.querySelector('.statblock:not(.pf2e-rendered):not(.pf2e-rendering)');
		if (fresh) return true;
	}
	return false;
}

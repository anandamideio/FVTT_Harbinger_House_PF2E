// @vitest-environment jsdom

import jquery from 'jquery';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	HarbingerJournalSheet,
	resolveFactionIdFromCallout,
	scrollJournalNavigationToActivePage,
} from '../harbinger-journal-sheet';

const $ = jquery as unknown as JQueryStatic;

function installJQueryGlobals(): void {
	const g = globalThis as unknown as { $: JQueryStatic; jQuery: JQueryStatic };
	g.$ = $;
	g.jQuery = $;
}

function makeJournalStub(): JournalEntryClass {
	return {
		id: 'journal-test',
		name: 'Test Journal',
		getFlag: () => undefined,
		setFlag: async () => undefined,
	} as unknown as JournalEntryClass;
}

function renderJournalHtml(statblockNpcIds: string[]): JQuery {
	const blocks = statblockNpcIds
		.map((npcId, index) => `<div class="statblock ${npcId}"><p>Classic block ${index + 1}</p></div>`)
		.join('');

	return $(`<section class="journal-sheet">${blocks}</section>`);
}

function containerNpcIds(html: JQuery): string[] {
	return html
		.find('.statblock-container')
		.toArray()
		.map((element) => $(element).attr('data-npc-id') ?? '');
}

function renderNavigationHtml(activeIndex: number): JQuery {
	const items = ['First Page', 'Second Page', 'Third Page']
		.map((title, index) => `<li class="${index === activeIndex ? 'active' : ''}"><a class="page-title">${title}</a></li>`)
		.join('');

	return $(
		`<section class="journal-sheet">
			<aside class="sidebar">
				<ol>${items}</ol>
			</aside>
		</section>`,
	);
}

beforeEach(() => {
	installJQueryGlobals();
	document.body.innerHTML = '';
});

describe('resolveFactionIdFromCallout', () => {
	it('prefers explicit faction class names when present', () => {
		const factionId = resolveFactionIdFromCallout(['faction-callout', 'harmonium'], 'The Athar');
		expect(factionId).toBe('harmonium');
	});

	it('maps headings with leading articles to known faction ids', () => {
		const factionId = resolveFactionIdFromCallout(['faction-callout'], 'The Fraternity of Order');
		expect(factionId).toBe('fraternity-of-order');
	});

	it('maps headings that already match without an article', () => {
		const factionId = resolveFactionIdFromCallout(['faction-callout'], 'Believers of the Source');
		expect(factionId).toBe('believers');
	});

	it('returns null for unknown faction callouts', () => {
		const factionId = resolveFactionIdFromCallout(['faction-callout'], 'The Xaositect Collective of Maybe');
		expect(factionId).toBeNull();
	});
});

describe('decorateStatblocks', () => {
	it('renders both statblocks when a page contains two', async () => {
		const html = renderJournalHtml(['trolan-the-mad', 'narcovi']);
		const journal = makeJournalStub();

		await HarbingerJournalSheet.decorateStatblocks(journal, html);

		expect(html.find('.statblock-container').length).toBe(2);
		expect(html.find('.statblock.classic-view.pf2e-rendered').length).toBe(2);
		expect(html.find('.statblock.pf2e-view.pf2e-rendered').length).toBe(2);
		expect(html.find('.statblock-toggle').length).toBe(2);
		expect(html.find('.statblock-container[data-view="pf2e"]').length).toBe(2);
		expect(containerNpcIds(html)).toEqual(['trolan-the-mad', 'narcovi']);
	});

	it('renders all statblocks when a page contains three', async () => {
		const html = renderJournalHtml(['trolan-the-mad', 'narcovi', 'crimjak-marquis-cambion']);
		const journal = makeJournalStub();

		await HarbingerJournalSheet.decorateStatblocks(journal, html);

		expect(html.find('.statblock-container').length).toBe(3);
		expect(html.find('.statblock.classic-view.pf2e-rendered').length).toBe(3);
		expect(html.find('.statblock.pf2e-view.pf2e-rendered').length).toBe(3);
		expect(html.find('.statblock-toggle').length).toBe(3);
		expect(html.find('.statblock-container[data-view="pf2e"]').length).toBe(3);
		expect(containerNpcIds(html)).toEqual(['trolan-the-mad', 'narcovi', 'crimjak-marquis-cambion']);

		const renderedText = html
			.find('.statblock.pf2e-view')
			.toArray()
			.map((element) => $(element).text())
			.join('\n');

		expect(renderedText).toContain('Creature 10');
		expect(renderedText).toContain('Creature 9');
	});

	it('does not duplicate wrappers when decoration runs concurrently', async () => {
		const html = renderJournalHtml(['xero-baox', 'anarchist']);
		const journal = makeJournalStub();

		const g = globalThis as {
			TextEditor?: {
				enrichHTML?: (content: string, options: { async: true }) => string | Promise<string>;
			};
		};
		const previousTextEditor = g.TextEditor;
		let releaseGate: (() => void) | undefined;
		const gate = new Promise<void>((resolve) => {
			releaseGate = resolve;
		});

		g.TextEditor = {
			enrichHTML: async (content: string) => {
				await gate;
				return content;
			},
		};

		try {
			const firstPass = HarbingerJournalSheet.decorateStatblocks(journal, html);
			await Promise.resolve();
			const secondPass = HarbingerJournalSheet.decorateStatblocks(journal, html);

			releaseGate?.();

			await Promise.all([firstPass, secondPass]);
		} finally {
			if (previousTextEditor) {
				g.TextEditor = previousTextEditor;
			} else {
				delete g.TextEditor;
			}
		}

		expect(html.find('.statblock-container').length).toBe(2);
		expect(html.find('.statblock-container .statblock-container').length).toBe(0);
		expect(html.find('.statblock-toggle').length).toBe(2);
		expect(html.find('.statblock.classic-view.pf2e-rendered').length).toBe(2);
		expect(html.find('.statblock.pf2e-view.pf2e-rendered').length).toBe(2);
		expect(containerNpcIds(html)).toEqual(['xero-baox', 'anarchist']);
	});
});

describe('scrollJournalNavigationToActivePage', () => {
	it('scrolls the active page entry into view', () => {
		const html = renderNavigationHtml(1);
		const activePage = html.find('li.active').get(0) as HTMLElement;
		const scrollSpy = vi.fn();
		activePage.scrollIntoView = scrollSpy as unknown as typeof activePage.scrollIntoView;

		const didScroll = scrollJournalNavigationToActivePage(html);

		expect(didScroll).toBe(true);
		expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
	});

	it('returns false when there is no active page entry', () => {
		const html = renderNavigationHtml(-1);

		expect(scrollJournalNavigationToActivePage(html)).toBe(false);
	});
});

// @vitest-environment jsdom

import jquery from 'jquery';
import { beforeEach, describe, expect, it } from 'vitest';

import { HarbingerJournalSheet, resolveFactionIdFromCallout } from '../harbinger-journal-sheet';

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
});

import { describe, expect, it } from 'vitest';
import { resolveFactionIdFromCallout } from '../harbinger-journal-sheet';

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

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
	DEFAULT_TOKEN_TEXTURE_FALLBACK,
	PF2E_BESTIARY_SUBJECTS_PREFIX,
	PF2E_BESTIARY_TOKENS_PREFIX,
	isBestiaryArtPath,
	resolveBestiaryTokenTextureFallback,
	shouldClearBestiarySubjectTexture,
} from '../../importer/helpers/bestiary-tokens';
import { SYSTEM_ACTORS } from '../../data/schema/system-items';

function parseCompendiumActorUuid(uuid: string): { pack: string; actorId: string } {
	const match = /^Compendium\.pf2e\.([^.]+)\.Actor\.([A-Za-z0-9]+)$/.exec(uuid);
	if (!match) throw new Error(`Unexpected actor UUID format: ${uuid}`);
	return { pack: `pf2e.${match[1]}`, actorId: match[2] };
}

describe('bestiary-art helpers', () => {
	it('identifies Bestiary token and subject paths', () => {
		expect(isBestiaryArtPath(`${PF2E_BESTIARY_TOKENS_PREFIX}fiendish/demon/dretch.webp`)).toBe(true);
		expect(isBestiaryArtPath(`${PF2E_BESTIARY_SUBJECTS_PREFIX}fiendish/demon/dretch.webp`)).toBe(true);
		expect(isBestiaryArtPath('modules/harbinger-house-pf2e/dist/assets/tokens/Trolan.png')).toBe(false);
	});

	it('returns actor prototype texture fallback when bestiary art is unavailable', () => {
		const fallback = resolveBestiaryTokenTextureFallback({
			bestiaryModuleActive: false,
			tokenTextureSrc: `${PF2E_BESTIARY_TOKENS_PREFIX}fiendish/demon/dretch.webp`,
			actorPrototypeTextureSrc: 'modules/harbinger-house-pf2e/dist/assets/tokens/Trolan.png',
			actorImageSrc: 'modules/harbinger-house-pf2e/dist/assets/character-images/Trolan_The_Mad.png',
		});

		expect(fallback).toBe('modules/harbinger-house-pf2e/dist/assets/tokens/Trolan.png');
	});

	it('falls back to actor image when actor prototype texture is also bestiary art', () => {
		const fallback = resolveBestiaryTokenTextureFallback({
			bestiaryModuleActive: false,
			tokenTextureSrc: `${PF2E_BESTIARY_TOKENS_PREFIX}fiendish/demon/dretch.webp`,
			actorPrototypeTextureSrc: `${PF2E_BESTIARY_TOKENS_PREFIX}fiendish/demon/dretch.webp`,
			actorImageSrc: 'modules/harbinger-house-pf2e/dist/assets/character-images/Trolan_The_Mad.png',
		});

		expect(fallback).toBe('modules/harbinger-house-pf2e/dist/assets/character-images/Trolan_The_Mad.png');
	});

	it('uses a safe default when no actor-owned fallback art is available', () => {
		const fallback = resolveBestiaryTokenTextureFallback({
			bestiaryModuleActive: false,
			tokenTextureSrc: `${PF2E_BESTIARY_TOKENS_PREFIX}fiendish/demon/dretch.webp`,
			actorPrototypeTextureSrc: `${PF2E_BESTIARY_TOKENS_PREFIX}fiendish/demon/dretch.webp`,
			actorImageSrc: `${PF2E_BESTIARY_TOKENS_PREFIX}fiendish/demon/dretch.webp`,
		});

		expect(fallback).toBe(DEFAULT_TOKEN_TEXTURE_FALLBACK);
	});

	it('does not rewrite texture paths when the bestiary module is active', () => {
		const fallback = resolveBestiaryTokenTextureFallback({
			bestiaryModuleActive: true,
			tokenTextureSrc: `${PF2E_BESTIARY_TOKENS_PREFIX}fiendish/demon/dretch.webp`,
			actorPrototypeTextureSrc: 'modules/harbinger-house-pf2e/dist/assets/tokens/Trolan.png',
			actorImageSrc: 'modules/harbinger-house-pf2e/dist/assets/character-images/Trolan_The_Mad.png',
		});

		expect(fallback).toBeUndefined();
	});

	it('clears subject texture only when inactive and path is bestiary art', () => {
		expect(
			shouldClearBestiarySubjectTexture(false, `${PF2E_BESTIARY_SUBJECTS_PREFIX}fiendish/demon/quasit.webp`),
		).toBe(true);
		expect(shouldClearBestiarySubjectTexture(true, `${PF2E_BESTIARY_SUBJECTS_PREFIX}fiendish/demon/quasit.webp`)).toBe(false);
		expect(shouldClearBestiarySubjectTexture(false, 'modules/harbinger-house-pf2e/dist/assets/tokens/Trolan.png')).toBe(false);
	});
});

describe('harbinger creature art mapping asset', () => {
	it('contains mappings for all configured system actor UUIDs', () => {
		const mapPath = path.resolve(process.cwd(), 'src/assets/art-mappings/harbinger-creature-art-map.json');
		const raw = fs.readFileSync(mapPath, 'utf8');
		const mapping = JSON.parse(raw) as Record<string, Record<string, { actor?: string }>>;

		for (const uuid of Object.values(SYSTEM_ACTORS)) {
			const actorRef = parseCompendiumActorUuid(uuid);
			expect(mapping[actorRef.pack]).toBeDefined();

			const mapped = mapping[actorRef.pack][actorRef.actorId];
			expect(mapped).toBeDefined();
			expect(mapped.actor).toMatch(/^modules\/pf2e-tokens-bestiaries\/portraits\//);
		}
	});
});

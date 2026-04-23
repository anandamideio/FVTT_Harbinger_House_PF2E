export const PF2E_BESTIARY_TOKENS_MODULE_ID = 'pf2e-tokens-bestiaries';
export const PF2E_BESTIARY_TOKENS_PREFIX = `modules/${PF2E_BESTIARY_TOKENS_MODULE_ID}/tokens/`;
export const PF2E_BESTIARY_SUBJECTS_PREFIX = `modules/${PF2E_BESTIARY_TOKENS_MODULE_ID}/subjects/`;
export const DEFAULT_TOKEN_TEXTURE_FALLBACK = 'icons/svg/mystery-man.svg';

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

export function isBestiaryArtPath(path: unknown): path is string {
	if (!isNonEmptyString(path)) return false;
	return path.startsWith(PF2E_BESTIARY_TOKENS_PREFIX) || path.startsWith(PF2E_BESTIARY_SUBJECTS_PREFIX);
}

type ResolveBestiaryTokenTextureFallbackParams = {
	bestiaryModuleActive: boolean;
	tokenTextureSrc: unknown;
	actorPrototypeTextureSrc: unknown;
	actorImageSrc: unknown;
};

/**
 * Resolve a safe token texture when a placed token references Bestiary art that
 * may not be available (for example when the Bestiary token module is inactive).
 */
export function resolveBestiaryTokenTextureFallback({
	bestiaryModuleActive,
	tokenTextureSrc,
	actorPrototypeTextureSrc,
	actorImageSrc,
}: ResolveBestiaryTokenTextureFallbackParams): string | undefined {
	if (bestiaryModuleActive || !isBestiaryArtPath(tokenTextureSrc)) {
		return undefined;
	}

	if (isNonEmptyString(actorPrototypeTextureSrc) && !isBestiaryArtPath(actorPrototypeTextureSrc)) {
		return actorPrototypeTextureSrc;
	}

	if (isNonEmptyString(actorImageSrc) && !isBestiaryArtPath(actorImageSrc)) {
		return actorImageSrc;
	}

	return DEFAULT_TOKEN_TEXTURE_FALLBACK;
}

export function shouldClearBestiarySubjectTexture(bestiaryModuleActive: boolean, subjectTexture: unknown): boolean {
	return !bestiaryModuleActive && isBestiaryArtPath(subjectTexture);
}

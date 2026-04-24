import { MODULE_ID } from '../../config';
import type { ImportDebug } from '../types';

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

/**
 * Replace token textures and subject paths that point at the optional Bestiary
 * token module when that module is inactive. Walks every imported scene and
 * rewrites token textures/subjects as needed.
 */
export async function normalizeSceneBestiaryTokenArt(debug: ImportDebug): Promise<void> {
	if (!game.scenes || !game.actors) return;

	const bestiaryModuleActive = game.modules.get(PF2E_BESTIARY_TOKENS_MODULE_ID)?.active === true;
	if (bestiaryModuleActive) {
		debug('Skipping Bestiary token normalization because token module is active');
		return;
	}

	const scenes = game.scenes.filter(
		(scene: SceneClass) => scene.flags?.[MODULE_ID]?.sourceId !== undefined,
	);
	if (scenes.length === 0) return;

	let updatedTokenCount = 0;
	let touchedSceneCount = 0;

	for (const scene of scenes) {
		const tokenCollection = (
			scene as unknown as {
				tokens?: { values?: () => Iterable<Record<string, unknown>> };
			}
		).tokens;
		const tokenDocuments =
			tokenCollection && typeof tokenCollection.values === 'function'
				? Array.from(tokenCollection.values())
				: [];
		if (tokenDocuments.length === 0) continue;

		const updates: Record<string, unknown>[] = [];

		for (const tokenDoc of tokenDocuments) {
			const token = tokenDoc as Record<string, unknown>;
			const tokenId =
				typeof token.id === 'string'
					? token.id
					: typeof token._id === 'string'
						? token._id
						: null;
			const actorId = typeof token.actorId === 'string' ? token.actorId : null;
			if (!tokenId || !actorId) continue;

			const actor = game.actors.get(actorId);
			if (!actor) continue;

			const actorModuleFlags = actor.flags?.[MODULE_ID] as Record<string, unknown> | undefined;
			const actorStats = (actor as unknown as { _stats?: { compendiumSource?: string } })._stats;
			const compendiumSource = actorStats?.compendiumSource;
			const systemActorRef = actorModuleFlags?.systemActorRef;

			const hasSystemActorRef =
				typeof systemActorRef === 'string' && systemActorRef.length > 0;
			const hasSystemCompendiumSource =
				typeof compendiumSource === 'string' && compendiumSource.startsWith('Compendium.pf2e.');
			if (!hasSystemActorRef && !hasSystemCompendiumSource) continue;

			const tokenTexture = token.texture as Record<string, unknown> | undefined;
			const tokenTextureSrc = tokenTexture?.src;
			const actorData = actor.toObject();
			const actorPrototypeTextureSrc = (
				actorData.prototypeToken as { texture?: { src?: string } } | undefined
			)?.texture?.src;

			const fallbackTextureSrc = resolveBestiaryTokenTextureFallback({
				bestiaryModuleActive,
				tokenTextureSrc,
				actorPrototypeTextureSrc,
				actorImageSrc: actor.img,
			});

			const ring = token.ring as Record<string, unknown> | undefined;
			const ringSubject = ring?.subject as Record<string, unknown> | undefined;
			const ringSubjectTexture = ringSubject?.texture;

			const update: Record<string, unknown> = { _id: tokenId };
			let changed = false;

			if (typeof fallbackTextureSrc === 'string' && fallbackTextureSrc !== tokenTextureSrc) {
				update['texture.src'] = fallbackTextureSrc;
				changed = true;
			}

			if (shouldClearBestiarySubjectTexture(bestiaryModuleActive, ringSubjectTexture)) {
				update['ring.subject.texture'] = null;
				changed = true;
			}

			if (changed) {
				updates.push(update);
			}
		}

		if (updates.length === 0) continue;

		const sceneWithEmbeds = scene as unknown as {
			updateEmbeddedDocuments?: (embeddedName: string, data: Record<string, unknown>[]) => Promise<unknown>;
		};

		if (typeof sceneWithEmbeds.updateEmbeddedDocuments !== 'function') continue;

		await sceneWithEmbeds.updateEmbeddedDocuments('Token', updates);
		updatedTokenCount += updates.length;
		touchedSceneCount += 1;
	}

	debug('Normalized scene token Bestiary art paths', {
		scenesScanned: scenes.length,
		touchedSceneCount,
		updatedTokenCount,
		bestiaryModuleActive,
	});
}

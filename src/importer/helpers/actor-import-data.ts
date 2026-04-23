import { MODULE_ID, logError, logWarn } from '../../config';
import type { ActorImportData, ImportDebug, SystemItemReferenceData } from '../types';

/**
 * Resolve system-item references stashed at `flags[MODULE_ID].unresolvedItems`
 * into embedded actor items before Foundry creates/updates the world actor.
 */
export async function resolveActorItemReferences(
	actors: Record<string, unknown>[],
	debug: ImportDebug,
): Promise<void> {
	let actorsWithUnresolved = 0;
	let resolvedItems = 0;

	for (const rawActor of actors) {
		const actor = rawActor as ActorImportData;
		const moduleFlags = actor.flags?.[MODULE_ID] as Record<string, unknown> | undefined;
		const unresolved = moduleFlags?.unresolvedItems;
		if (!Array.isArray(unresolved) || unresolved.length === 0) continue;

		actorsWithUnresolved += 1;
		debug('Resolving unresolved actor item refs', {
			actor: actor.name ?? 'Unknown',
			unresolvedCount: unresolved.length,
		});

		if (!Array.isArray(actor.items)) actor.items = [];
		const items = actor.items as Record<string, unknown>[];

		for (const rawRef of unresolved) {
			const ref = rawRef as SystemItemReferenceData;
			if (!ref?.uuid || typeof ref.uuid !== 'string') continue;

			try {
				const source = await fromUuid(ref.uuid);
				if (!source) {
					logWarn(`Unable to resolve system item reference for ${actor.name ?? 'Unknown'}: ${ref.uuid}`);
					continue;
				}

				const itemData = structuredClone(source.toObject() as Record<string, unknown>);
				itemData._id = foundry.utils.randomID(16);

				if (typeof ref.customName === 'string' && ref.customName.length > 0) {
					itemData.name = ref.customName;
				}

				applySystemItemReferenceOverrides(itemData, ref);
				items.push(itemData);
				resolvedItems += 1;
				debug('Resolved system item reference', {
					actor: actor.name ?? 'Unknown',
					uuid: ref.uuid,
					type: ref.type ?? 'unknown',
				});
			} catch (err) {
				logError(`Failed resolving system item reference for ${actor.name ?? 'Unknown'}:`, err);
			}
		}

		// Prevent stale unresolved data from lingering after we embed concrete items.
		if (moduleFlags) delete moduleFlags.unresolvedItems;
	}

	debug('resolveActorItemReferences complete', {
		actorsScanned: actors.length,
		actorsWithUnresolved,
		resolvedItems,
	});
}

/**
 * Apply reference-specific overrides after cloning a system item from compendium.
 * Mutates `itemData` in place.
 */
export function applySystemItemReferenceOverrides(
	itemData: Record<string, unknown>,
	ref: SystemItemReferenceData,
): void {
	const system =
		itemData.system && typeof itemData.system === 'object'
			? (itemData.system as Record<string, unknown>)
			: null;

	if (system && typeof ref.customDescription === 'string' && ref.customDescription.length > 0) {
		const description =
			system.description && typeof system.description === 'object'
				? (system.description as Record<string, unknown>)
				: {};
		const existing = typeof description.value === 'string' ? description.value : '';
		description.value = `${existing}${existing ? '<hr/>' : ''}<p>${ref.customDescription}</p>`;
		system.description = description;
	}

	if (system && ref.type === 'system-weapon' && ref.runes && typeof ref.runes === 'object') {
		const runes =
			system.runes && typeof system.runes === 'object' ? (system.runes as Record<string, unknown>) : {};
		if (typeof ref.runes.potency === 'number') runes.potency = ref.runes.potency;
		if (typeof ref.runes.striking === 'string') runes.striking = ref.runes.striking;
		if (Array.isArray(ref.runes.property)) {
			runes.property = ref.runes.property.filter((r): r is string => typeof r === 'string');
		}
		system.runes = runes;
	}

	if (system && ref.type === 'system-spell') {
		if (typeof ref.tradition === 'string' && ref.tradition.length > 0) {
			system.traditions = { value: [ref.tradition] };
		}

		if (typeof ref.heightenedLevel === 'number') {
			const level =
				system.level && typeof system.level === 'object'
					? (system.level as Record<string, unknown>)
					: {};
			level.value = ref.heightenedLevel;
			system.level = level;
		}

		if (typeof ref.entryId === 'string' && ref.entryId.length > 0) {
			const location =
				system.location && typeof system.location === 'object'
					? (system.location as Record<string, unknown>)
					: {};
			location.value = ref.entryId;
			system.location = location;
		}
	}

	const flags =
		itemData.flags && typeof itemData.flags === 'object' ? (itemData.flags as Record<string, unknown>) : {};
	const moduleFlags =
		flags[MODULE_ID] && typeof flags[MODULE_ID] === 'object'
			? (flags[MODULE_ID] as Record<string, unknown>)
			: {};
	if (typeof ref.uuid === 'string') moduleFlags.sourceUuid = ref.uuid;
	moduleFlags.imported = true;
	flags[MODULE_ID] = moduleFlags;
	itemData.flags = flags;
}

/**
 * Merge canonical system data into actors that reference PF2e compendium entries.
 * Mutates each actor record in place.
 */
export async function mergeCompendiumActors(
	actors: Record<string, unknown>[],
	debug: ImportDebug,
): Promise<void> {
	let mergedCount = 0;
	let skippedNoSource = 0;
	let skippedNonPf2e = 0;

	for (const rawActor of actors) {
		const actor = rawActor as ActorImportData;
		const stats = actor._stats;
		const moduleFlags = actor.flags?.[MODULE_ID] as { systemActorRef?: string } | undefined;
		const sourceId = stats?.compendiumSource ?? moduleFlags?.systemActorRef;
		if (!sourceId) {
			skippedNoSource += 1;
			continue;
		}

		// Only merge if the source is from the PF2e system (not our own module)
		if (!sourceId.startsWith('Compendium.pf2e.')) {
			skippedNonPf2e += 1;
			continue;
		}

		try {
			const source = await fromUuid(sourceId);
			if (source) {
				const sourceData = source.toObject() as Record<string, unknown>;
				const updateData: Record<string, unknown> = {
					system: sourceData.system,
					items: sourceData.items,
				};

				const hasExplicitImage = (value: unknown): value is string =>
					typeof value === 'string' && value.length > 0 && !value.startsWith('icons/svg/');

				const actorHasPortrait = hasExplicitImage(actor.img);
				if (!actorHasPortrait && hasExplicitImage(sourceData.img)) {
					updateData.img = sourceData.img;
				}

				const actorPrototypeToken =
					actor.prototypeToken && typeof actor.prototypeToken === 'object'
						? (actor.prototypeToken as Record<string, unknown>)
						: undefined;
				const actorTexture =
					actorPrototypeToken?.texture && typeof actorPrototypeToken.texture === 'object'
						? (actorPrototypeToken.texture as Record<string, unknown>)
						: undefined;
				const actorHasTokenTexture = hasExplicitImage(actorTexture?.src);

				const sourcePrototypeToken =
					sourceData.prototypeToken && typeof sourceData.prototypeToken === 'object'
						? (sourceData.prototypeToken as Record<string, unknown>)
						: undefined;
				if (!actorHasTokenTexture && sourcePrototypeToken) {
					updateData.prototypeToken = sourcePrototypeToken;
				}

				if (sourceData.effects) {
					updateData.effects = sourceData.effects;
				}
				// Preserve the compendium source reference
				updateData['_stats.compendiumSource'] = source.flags?.core?.sourceId ?? sourceId;
				foundry.utils.mergeObject(actor, updateData);
				mergedCount += 1;
				debug('Merged compendium actor data', {
					actor: actor.name ?? 'Unknown',
					sourceId,
				});
			}
		} catch (err) {
			logError(`Failed to merge compendium data for ${actor.name}:`, err);
		}
	}

	debug('mergeCompendiumActors complete', {
		actorsScanned: actors.length,
		mergedCount,
		skippedNoSource,
		skippedNonPf2e,
	});
}

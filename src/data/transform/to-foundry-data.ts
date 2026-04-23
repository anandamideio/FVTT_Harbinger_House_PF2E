import { HARBINGER_JOURNAL_SHEET_CLASS, MODULE_ID } from '../../config';
import type { ActorData, ItemData, JournalEntryData, MacroData, PlaylistData, PlaylistSoundData, SceneData } from '../../types/foundry';
import type { HarbingerNPC, NPCCategory, NPCEntry, NPCItemEntry } from '../schema/harbinger-npc';
import { isSystemActorReference } from '../schema/harbinger-npc';
import type { HarbingerHazard, HazardCategory } from '../content/hazards';
import type { HarbingerItem, ItemCategory } from '../schema/harbinger-item';
import type { HarbingerJournal } from '../content/journals';
import type { HarbingerMacro } from '../content/macros';
import type { HarbingerPlaylist } from '../content/playlists';
import type { HarbingerScene } from '../content/scenes/types';
import type { HarbingerSpell } from '../schema/harbinger-spell';
import type { SystemActorReference } from '../schema/system-items';
import { isSystemItemReference } from '../utils';

/**
 * Pure Data Transformation Functions
 *
 * These functions convert module data types (HarbingerItem, HarbingerNPC, etc.)
 * into Foundry-compatible document data objects WITHOUT depending on any
 * Foundry globals (game, fromUuid, Actor.create, etc.).
 *
 * Used by:
 * - Build script (scripts/build-packs.ts) to generate the Adventure LevelDB compendium pack
 */


// ============================================================================
// Items
// ============================================================================

function getItemDefaultImage(item: HarbingerItem): string {
	const typeDefaults: Record<string, string> = {
		weapon: 'icons/svg/sword.svg',
		armor: 'icons/svg/shield.svg',
		equipment: 'icons/svg/chest.svg',
		consumable: 'icons/svg/pill.svg',
	};

	if (typeDefaults[item.data.type]) {
		return typeDefaults[item.data.type];
	}

	const categoryDefaults: Record<ItemCategory, string> = {
		artifact: 'icons/commodities/gems/gem-faceted-radiant-purple.webp',
		weapon: 'icons/svg/sword.svg',
		armor: 'icons/svg/shield.svg',
		equipment: 'icons/svg/chest.svg',
		consumable: 'icons/svg/pill.svg',
	};

	return categoryDefaults[item.category] || 'icons/svg/item-bag.svg';
}

const PHYSICAL_ITEM_TYPES = new Set(['weapon', 'armor', 'equipment', 'consumable', 'treasure', 'backpack', 'shield']);

function normalizeLegacyBulkValue(value: unknown): number {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === 'string') {
		const normalized = value.trim();
		if (normalized === '-') return 0;
		if (normalized.toUpperCase() === 'L') return 0.1;

		const parsed = Number(normalized);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	return 0;
}

function normalizePhysicalItemSystem(itemType: string, inputSystem: Record<string, unknown>): Record<string, unknown> {
	if (!PHYSICAL_ITEM_TYPES.has(itemType)) {
		return inputSystem;
	}

	const system = { ...inputSystem };

	if (typeof system.quantity !== 'number' || !Number.isFinite(system.quantity) || system.quantity <= 0) {
		system.quantity = 1;
	}

	const rawBulk = system.bulk;
	if (rawBulk && typeof rawBulk === 'object') {
		const bulk = { ...(rawBulk as Record<string, unknown>) };
		bulk.value = normalizeLegacyBulkValue((rawBulk as Record<string, unknown>).value);
		system.bulk = bulk;
	} else {
		system.bulk = { value: 0 };
	}

	return system;
}

export function itemToDocumentData(item: HarbingerItem): ItemData {
	const sourceSystem =
		item.data.system && typeof item.data.system === 'object'
			? structuredClone(item.data.system as Record<string, unknown>)
			: {};
	const system = normalizePhysicalItemSystem(item.data.type, sourceSystem);

	return {
		name: item.data.name,
		type: item.data.type,
		img: item.data.img || getItemDefaultImage(item),
		system,
		flags: {
			[MODULE_ID]: {
				sourceId: item.id,
				category: item.category,
				imported: true,
			},
			...item.data.flags,
		},
	};
}

// ============================================================================
// Macros
// ============================================================================

export function macroToDocumentData(macro: HarbingerMacro): MacroData {
	return {
		name: macro.name,
		type: macro.type,
		command: macro.command,
		img: macro.img,
		flags: {
			[MODULE_ID]: {
				sourceId: macro.id,
				imported: true,
			},
		},
	};
}

// ============================================================================
// Playlists
// ============================================================================

export function playlistToDocumentData(playlist: HarbingerPlaylist): PlaylistData {
	const sounds: PlaylistSoundData[] = playlist.sounds.map((sound, idx) => ({
		name: sound.name,
		description: sound.description ?? '',
		path: sound.path,
		channel: sound.channel ?? playlist.channel ?? 'music',
		playing: false,
		pausedTime: null,
		repeat: sound.repeat ?? true,
		volume: sound.volume ?? 0.5,
		fade: null,
		sort: idx * 100,
		flags: {
			[MODULE_ID]: {
				sourceId: sound.id,
				imported: true,
			},
		},
	}));

	return {
		name: playlist.name,
		description: playlist.description ?? '',
		mode: playlist.mode ?? 0,
		playing: false,
		fade: playlist.fade ?? null,
		channel: playlist.channel ?? 'music',
		sounds,
		flags: {
			[MODULE_ID]: {
				sourceId: playlist.id,
				imported: true,
			},
		},
	};
}

// ============================================================================
// Spells
// ============================================================================

function getSpellDefaultImage(spell: HarbingerSpell): string {
	const traits = spell.data.system?.traits?.value || [];

	if (traits.includes('fire')) return 'icons/magic/fire/flame-burning-hand-brightness.webp';
	if (traits.includes('cold')) return 'icons/magic/water/snowflake-ice-snow-white.webp';
	if (traits.includes('mental')) return 'icons/magic/perception/eye-ringed-glow-blue-purple.webp';
	if (traits.includes('arcane')) return 'icons/magic/control/buff-flight-wings-runes-purple.webp';
	if (traits.includes('death')) return 'icons/magic/death/skull-humanoid-runes-red.webp';
	if (traits.includes('scrying')) return 'icons/magic/perception/eye-ringed-glow-yellow.webp';

	return 'icons/svg/explosion.svg';
}

export function spellToDocumentData(spell: HarbingerSpell): ItemData {
	return {
		name: spell.data.name,
		type: 'spell',
		img: spell.data.img || getSpellDefaultImage(spell),
		system: { ...spell.data.system },
		flags: {
			[MODULE_ID]: {
				sourceId: spell.id,
				imported: true,
			},
			...spell.data.flags,
		},
	};
}

// ============================================================================
// Hazards
// ============================================================================

function getHazardDefaultImage(hazard: HarbingerHazard): string {
	const categoryDefaults: Record<HazardCategory, string> = {
		trap: 'icons/svg/trap.svg',
		environmental: 'icons/svg/hazard.svg',
		haunt: 'icons/svg/skull.svg',
		aura: 'icons/svg/aura.svg',
	};
	return categoryDefaults[hazard.category] || 'icons/svg/hazard.svg';
}

function getHazardTokenData(hazard: HarbingerHazard): Partial<TokenData> {
	const isComplex = hazard.data.system.details.isComplex;
	return {
		name: hazard.data.name,
		displayName: 20,
		displayBars: isComplex ? 20 : 0,
		bar1: isComplex ? { attribute: 'attributes.hp' } : null,
		disposition: -1,
		width: 1,
		height: 1,
		texture: {
			src: hazard.data.img || getHazardDefaultImage(hazard),
		},
		sight: {
			enabled: false,
		},
		actorLink: false,
	};
}

export function hazardToDocumentData(hazard: HarbingerHazard): ActorData {
	const data = hazard.data;

	const system: Record<string, unknown> = {
		description: data.system.description,
		traits: {
			value: data.system.traits.value,
			rarity: data.system.traits.rarity || 'common',
		},
		details: {
			level: data.system.details.level,
			disable: data.system.details.disable || '',
			reset: data.system.details.reset || '',
			routine: data.system.details.routine || '',
			isComplex: data.system.details.isComplex,
		},
		attributes: {
			ac: data.system.attributes?.ac || { value: 0 },
			hp: data.system.attributes?.hp || { value: 0, max: 0 },
			hardness:
				typeof data.system.attributes?.hardness === 'number'
					? data.system.attributes.hardness
					: ((data.system.attributes?.hardness as { value: number } | undefined)?.value ?? 0),
			stealth: {
				value: data.system.attributes?.stealth?.value || 0,
				dc: data.system.attributes?.stealth?.dc || 0,
				details: data.system.attributes?.stealth?.details || '',
			},
		},
		saves: {
			fortitude: { value: data.system.saves?.fortitude?.value || 0 },
			reflex: { value: data.system.saves?.reflex?.value || 0 },
			will: { value: data.system.saves?.will?.value || 0 },
		},
		immunities: data.system.immunities || { value: [] },
		weaknesses: data.system.weaknesses || [],
		resistances: data.system.resistances || [],
	};

	return {
		name: data.name,
		type: 'hazard',
		img: data.img || getHazardDefaultImage(hazard),
		system,
		prototypeToken: getHazardTokenData(hazard),
		flags: {
			[MODULE_ID]: {
				sourceId: hazard.id,
				category: hazard.category,
				location: hazard.location,
				...(hazard.systemActorRef ? { systemActorRef: hazard.systemActorRef } : {}),
				imported: true,
			},
		},
	};
}

// ============================================================================
// Journals
// ============================================================================

export function journalToDocumentData(journal: HarbingerJournal): JournalEntryData {
	return {
		name: journal.name,
		pages: journal.pages.map((page, index) => ({
			name: page.name,
			type: page.type,
			title: page.title || { show: true, level: 1 },
			text: page.text,
			src: page.src,
			video: page.video,
			sort: (index + 1) * 100,
			ownership: {
				default: 0,
			},
		})),
		ownership: {
			default: 0,
		},
		sort: journal.sort || 0,
		flags: {
			core: {
				sheetClass: HARBINGER_JOURNAL_SHEET_CLASS,
			},
			[MODULE_ID]: {
				imported: true,
				sourceId: journal.id,
				folder: journal.folder || 'Reference',
				importedAt: Date.now(),
			},
		},
	};
}

// ============================================================================
// Scenes
// ============================================================================

export function sceneToDocumentData(scene: HarbingerScene): SceneData {
	const tokenVision = scene.tokenVision ?? true;
	const fogExploration = scene.fogExploration ?? true;
	const fogReset = Date.now();
	const notes = scene.notes ?? [];
	const darkness = Math.max(0, Math.min(1, scene.darkness ?? 0));
	const globalLightEnabled = scene.globalLight ?? false;
	const globalLightThreshold = scene.globalLightThreshold ?? null;
	const maxInitialX = Math.max(0, scene.width - 1);
	const maxInitialY = Math.max(0, scene.height - 1);
	const initialX = scene.initial.x == null ? null : Math.max(0, Math.min(maxInitialX, scene.initial.x));
	const initialY = scene.initial.y == null ? null : Math.max(0, Math.min(maxInitialY, scene.initial.y));
	const isVideoPath = (path: string): boolean => /\.(webm|mp4|m4v|mov)$/i.test(path);
	const foreground = scene.foreground ?? null;
	const thumb =
		isVideoPath(scene.img) || isVideoPath(scene.background.src)
			? foreground && !isVideoPath(foreground)
				? foreground
				: undefined
			: scene.img;

	return {
		name: scene.name,
		img: scene.img,
		background: {
			src: scene.background.src,
			offsetX: scene.background.offsetX ?? 6,
			offsetY: scene.background.offsetY ?? 2,
			scaleX: scene.background.scaleX ?? 1,
			scaleY: scene.background.scaleY ?? 1,
		},
		foreground,
		thumb,
		width: scene.width,
		height: scene.height,
		padding: 0,
		initial: {
			x: initialX,
			y: initialY,
			scale: scene.initial.scale,
		},
		backgroundColor: '#000000',
		grid: {
			type: scene.grid.type,
			size: scene.grid.size,
			style: scene.grid.style ?? 'solidLines',
			thickness: scene.grid.thickness ?? 1,
			color: scene.grid.color ?? '#000000',
			alpha: scene.grid.alpha ?? 0.2,
			distance: scene.grid.distance,
			units: scene.grid.units,
		},
		tokenVision,
		fogExploration,
		environment: {
			base: scene.environment?.base ?? {},
			cycle: scene.environment?.cycle ?? false,
			dark: scene.environment?.dark ?? {},
			darknessLevel: darkness,
			darknessLevelLock: false,
			globalLight: {
				enabled: globalLightEnabled ? 1 : 0,
				bright: false,
				...(globalLightThreshold != null
					? { darkness: { min: 0, max: globalLightThreshold } }
					: {}),
			},
		},
		fog: {
			colors: {
				explored: null,
				unexplored: null,
			},
			exploration: fogExploration,
			overlay: null,
			reset: fogReset,
		},
		fogReset,
		globalLight: globalLightEnabled,
		globalLightThreshold,
		darkness,
		drawings: scene.drawings ?? [],
		tokens: scene.tokens ?? [],
		lights: scene.lights ?? [],
		notes,
		sounds: scene.sounds ?? [],
		templates: scene.templates ?? [],
		tiles: scene.tiles ?? [],
		walls: scene.walls ?? [],
		playlist: null,
		playlistSound: null,
		journal: null,
		journalEntryPage: null,
		weather: '',
		folder: null,
		sort: scene.sort || 0,
		ownership: {
			default: 0,
		},
		flags: {
			[MODULE_ID]: {
				sourceId: scene.id,
				folder: scene.folder || 'Maps',
				imported: true,
				...(scene.playlistSourceId ? { playlistSourceId: scene.playlistSourceId } : {}),
			},
		},
		navigation: scene.navigation,
		navOrder: scene.navOrder,
		navName: '',
	};
}

// ============================================================================
// NPCs
// ============================================================================

function getNPCDefaultImage(npc: HarbingerNPC): string {
	const defaults: Record<NPCCategory, string> = {
		'major-npc': 'icons/svg/mystery-man.svg',
		'harbinger-resident': 'icons/svg/mystery-man.svg',
		'generic-npc': 'icons/svg/mystery-man.svg',
		fiend: 'icons/svg/skull.svg',
		cultist: 'icons/svg/cowled.svg',
		figment: 'icons/svg/aura.svg',
		loot: 'icons/svg/chest.svg',
	};
	return defaults[npc.category] || 'icons/svg/mystery-man.svg';
}

function getTokenSize(size: string): number {
	const sizes: Record<string, number> = {
		tiny: 0.5,
		sm: 1,
		med: 1,
		lg: 2,
		huge: 3,
		grg: 4,
	};
	return sizes[size] || 1;
}

function getNPCDisposition(npc: HarbingerNPC): number {
	const sys = npc.data.system as Partial<PF2eActorSystem> | undefined;
	const alignment = sys?.details?.alignment?.value || '';

	if (alignment.includes('G') || npc.category === 'major-npc') {
		return 0; // NEUTRAL
	}
	if (alignment.includes('E') || npc.category === 'fiend') {
		return -1; // HOSTILE
	}
	return 0; // NEUTRAL
}

function getNPCTokenData(npc: HarbingerNPC): Partial<TokenData> {
	const sys = npc.data.system as Partial<PF2eActorSystem> | undefined;
	const size = sys?.traits?.size?.value || 'med';
	const tokenSize = getTokenSize(size);
	const override = (npc.data.prototypeToken ?? {}) as Partial<TokenData> & {
		texture?: { src?: string };
	};
	const overrideTextureSrc = override.texture?.src;

	return {
		name: override.name ?? npc.data.name,
		displayName: override.displayName ?? 20,
		displayBars: override.displayBars ?? 20,
		bar1: override.bar1 ?? { attribute: 'attributes.hp' },
		disposition: override.disposition ?? getNPCDisposition(npc),
		width: override.width ?? tokenSize,
		height: override.height ?? tokenSize,
		texture: {
			...(override.texture ?? {}),
			src: overrideTextureSrc || npc.data.img || getNPCDefaultImage(npc),
		},
		sight: override.sight ?? {
			enabled: true,
			range: sys?.traits?.senses?.some((s: { type: string }) => s.type === 'darkvision') ? 60 : 0,
		},
		actorLink: override.actorLink ?? npc.category === 'major-npc',
	};
}

/**
 * Get inline items only (no system references), for use in compendium packs.
 * System references are stored in flags for runtime resolution.
 */
function getInlineItemDefaultImage(type: string): string {
	const defaults: Record<string, string> = {
		melee: 'icons/svg/sword.svg',
		ranged: 'icons/svg/target.svg',
		spell: 'icons/svg/explosion.svg',
		action: 'icons/svg/lightning.svg',
		equipment: 'icons/svg/chest.svg',
		weapon: 'icons/svg/sword.svg',
		armor: 'icons/svg/shield.svg',
	};
	return defaults[type] || 'icons/svg/item-bag.svg';
}

export function extractInlineItems(items: NPCItemEntry[]): { inline: ItemData[]; unresolved: NPCItemEntry[] } {
	const inline: ItemData[] = [];
	const unresolved: NPCItemEntry[] = [];

	for (const item of items) {
		if (isSystemItemReference(item)) {
			unresolved.push(item);
		} else {
			const itemData = item;
			const sourceSystem =
				itemData.system && typeof itemData.system === 'object'
					? structuredClone(itemData.system as Record<string, unknown>)
					: {};
			const system = normalizePhysicalItemSystem(itemData.type, sourceSystem);

			inline.push({
				...(itemData._id ? { _id: itemData._id } : {}),
				name: itemData.name,
				type: itemData.type,
				img: itemData.img || getInlineItemDefaultImage(itemData.type),
				system,
				flags: itemData.flags || {},
			});
		}
	}

	return { inline, unresolved };
}

/**
 * Convert a custom-statblock NPC to Foundry ActorData.
 * Only includes inline items; system references are stored in flags.unresolvedItems.
 */
export function npcToDocumentData(npc: HarbingerNPC): ActorData {
	const { inline, unresolved } = extractInlineItems(npc.items || []);

	return {
		name: npc.data.name,
		type: npc.data.type,
		img: npc.data.img || getNPCDefaultImage(npc),
		system: { ...npc.data.system },
		prototypeToken: getNPCTokenData(npc),
		items: inline,
		flags: {
			[MODULE_ID]: {
				imported: true,
				sourceId: npc.id,
				category: npc.category,
				importedAt: Date.now(),
				...(unresolved.length > 0 ? { unresolvedItems: unresolved } : {}),
			},
		},
	};
}

/**
 * Create a stub entry for a SystemActorReference.
 * The real data must be resolved at runtime via fromUuid().
 */
export function systemActorRefToStubData(ref: SystemActorReference): ActorData {
	return {
		name: ref.displayName ?? ref.id,
		type: 'npc',
		flags: {
			[MODULE_ID]: {
				imported: true,
				sourceId: ref.id,
				importedAt: Date.now(),
				systemActorRef: ref.uuid,
				category: ref.category,
			},
		},
	} as ActorData;
}

/**
 * Convert any NPCEntry (custom or system ref) to document data.
 */
export function npcEntryToDocumentData(entry: NPCEntry): ActorData {
	if (isSystemActorReference(entry)) {
		return systemActorRefToStubData(entry);
	}
	return npcToDocumentData(entry);
}

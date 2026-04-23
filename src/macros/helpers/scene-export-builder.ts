import { MODULE_ID } from '../../config';
import type { HarbingerScene } from '../../data/scenes/types';

const PLACEABLE_FIELDS = [
	'drawings',
	'tokens',
	'lights',
	'notes',
	'sounds',
	'templates',
	'tiles',
	'walls',
] as const;

interface PlaylistDocumentLike {
	name?: string;
	flags?: Record<string, Record<string, unknown>>;
	sounds?: {
		get: (id: string) => { name?: string } | undefined;
	};
}

interface ScenePlaylistResolution {
	playlistId?: string;
	playlistName?: string;
	playlistSoundId?: string;
	playlistSoundName?: string;
	playlistSourceId?: string;
}

interface SceneAmbienceExport {
	darkness?: number;
	globalLight?: boolean;
	globalLightThreshold?: number | null;
	environment?: HarbingerScene['environment'];
	playlistSourceId?: string;
}

export interface SceneAmbienceExportContext {
	exportData: SceneAmbienceExport;
	playlistId?: string;
	playlistName?: string;
	playlistSoundId?: string;
	playlistSoundName?: string;
	hasUnmappedPlaylist: boolean;
}

type SceneEnvironmentOverride = NonNullable<HarbingerScene['environment']>;
type SceneEnvironmentLightOverride = NonNullable<SceneEnvironmentOverride['base']>;

const ENVIRONMENT_LIGHT_KEYS = ['hue', 'intensity', 'luminosity', 'saturation', 'shadows'] as const;
const DEFAULT_GRID_STYLE = 'solidLines';
const DEFAULT_GRID_THICKNESS = 1;
const DEFAULT_GRID_COLOR = '#000000';
const DEFAULT_GRID_ALPHA = 0.2;

interface LegacySceneGridData {
	grid?: SceneData['grid'] | number;
	gridType?: number;
	gridDistance?: number;
	gridUnits?: string;
	gridColor?: string;
	gridAlpha?: number;
	gridStyle?: string;
	gridThickness?: number;
}

interface LegacySceneBackgroundData {
	backgroundScale?: number | string;
	backgroundScaleX?: number | string;
	backgroundScaleY?: number | string;
}

function slugifySceneId(name: string): string {
	const slug = name
		.toLowerCase()
		.replaceAll(/[^a-z0-9]+/g, '-')
		.replaceAll(/^-+|-+$/g, '')
		.replaceAll(/-{2,}/g, '-');

	return slug ? `scene-${slug}` : 'scene-export';
}

function sanitizePlaceables(placeables: unknown): object[] | undefined {
	if (!Array.isArray(placeables) || placeables.length === 0) {
		return undefined;
	}

	return placeables.map((entry) => {
		if (!entry || typeof entry !== 'object') {
			return entry as object;
		}

		const cloned = JSON.parse(JSON.stringify(entry)) as Record<string, unknown>;
		delete cloned._id;
		delete cloned._stats;
		delete cloned.folder;
		delete cloned.ownership;
		delete cloned.sort;
		return cloned;
	});
}

function getSceneModuleFlagValue(scene: SceneClass, key: 'sourceId' | 'folder' | 'playlistSourceId'): string | undefined {
	const moduleFlags = scene.flags?.[MODULE_ID];
	if (!moduleFlags || typeof moduleFlags !== 'object') {
		return undefined;
	}

	const value = (moduleFlags as Record<string, unknown>)[key];
	return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getSceneFolderName(scene: SceneClass): string | undefined {
	const fromFlag = getSceneModuleFlagValue(scene, 'folder');
	if (fromFlag) return fromFlag;

	const folderName = (scene as unknown as { folder?: { name?: string | null } | null }).folder?.name;
	return typeof folderName === 'string' && folderName.length > 0 ? folderName : undefined;
}

function getSceneEnvironmentLightOverride(
	lighting: SceneData['environment']['base'] | SceneData['environment']['dark'] | undefined,
): SceneEnvironmentLightOverride | undefined {
	const override: SceneEnvironmentLightOverride = {};

	for (const key of ENVIRONMENT_LIGHT_KEYS) {
		const value = lighting?.[key];
		if (typeof value === 'number' && value !== 0) {
			override[key] = value;
		}
	}

	return Object.keys(override).length > 0 ? override : undefined;
}

function getSceneEnvironmentOverride(sceneData: SceneData): SceneEnvironmentOverride | undefined {
	const cycle = sceneData.environment?.cycle === true;
	const base = getSceneEnvironmentLightOverride(sceneData.environment?.base);
	const dark = getSceneEnvironmentLightOverride(sceneData.environment?.dark);

	if (!cycle && !base && !dark) {
		return undefined;
	}

	return {
		...(cycle ? { cycle: true } : {}),
		...(base ? { base } : {}),
		...(dark ? { dark } : {}),
	};
}

function getSceneDarkness(sceneData: SceneData): number | undefined {
	const environmentDarkness = sceneData.environment?.darknessLevel;
	return typeof environmentDarkness === 'number' ? environmentDarkness : undefined;
}

function getSceneGlobalLightEnabled(sceneData: SceneData): boolean | undefined {
	const environmentEnabled = sceneData.environment?.globalLight?.enabled;
	if (typeof environmentEnabled === 'boolean') {
		return environmentEnabled;
	}

	if (typeof environmentEnabled === 'number') {
		return environmentEnabled > 0;
	}

	return undefined;
}

function getSceneGlobalLightThreshold(sceneData: SceneData): number | undefined {
	const darknessMax = sceneData.environment?.globalLight?.darkness?.max;
	return typeof darknessMax === 'number' ? darknessMax : undefined;
}

function toFiniteNumber(value: unknown): number | undefined {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === 'string') {
		const parsed = Number(value.trim());
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	return undefined;
}

function isNonDefaultScale(value: number | undefined): value is number {
	return typeof value === 'number' && Number.isFinite(value) && Math.abs(value - 1) > 1e-6;
}

function inferBackgroundScaleFromCanvas(
	scene: SceneClass,
	sceneData: SceneData,
): { scaleX?: number; scaleY?: number } {
	if (!canvas.scene || canvas.scene.id !== scene.id) {
		return {};
	}

	const backgroundTexture = (
		canvas as unknown as {
			primary?: {
				background?: {
					texture?: {
						width?: number;
						height?: number;
					};
				};
			};
		}
	).primary?.background?.texture;

	const textureWidth = toFiniteNumber(backgroundTexture?.width);
	const textureHeight = toFiniteNumber(backgroundTexture?.height);
	const sceneWidth = toFiniteNumber(sceneData.width);
	const sceneHeight = toFiniteNumber(sceneData.height);

	const computeScale = (dimension: number | undefined, textureDimension: number | undefined): number | undefined => {
		if (!dimension || !textureDimension || textureDimension === 0) {
			return undefined;
		}

		return Number((dimension / textureDimension).toFixed(4));
	};

	return {
		scaleX: computeScale(sceneWidth, textureWidth),
		scaleY: computeScale(sceneHeight, textureHeight),
	};
}

function getSceneBackgroundScaleOverride(
	scene: SceneClass,
	sceneData: SceneData,
): Pick<HarbingerScene['background'], 'scaleX' | 'scaleY'> {
	const background = sceneData.background as Record<string, unknown> | undefined;
	const legacySceneData = sceneData as SceneData & LegacySceneBackgroundData;

	let scaleX =
		toFiniteNumber(background?.scaleX) ??
		toFiniteNumber(legacySceneData.backgroundScaleX) ??
		toFiniteNumber(legacySceneData.backgroundScale);
	let scaleY =
		toFiniteNumber(background?.scaleY) ??
		toFiniteNumber(legacySceneData.backgroundScaleY) ??
		toFiniteNumber(legacySceneData.backgroundScale);

	if (!isNonDefaultScale(scaleX) || !isNonDefaultScale(scaleY)) {
		const inferred = inferBackgroundScaleFromCanvas(scene, sceneData);
		if (!isNonDefaultScale(scaleX) && isNonDefaultScale(inferred.scaleX)) {
			scaleX = inferred.scaleX;
		}
		if (!isNonDefaultScale(scaleY) && isNonDefaultScale(inferred.scaleY)) {
			scaleY = inferred.scaleY;
		}
	}

	return {
		...(isNonDefaultScale(scaleX) ? { scaleX } : {}),
		...(isNonDefaultScale(scaleY) ? { scaleY } : {}),
	};
}

function getSceneGridOverride(sceneData: SceneData): HarbingerScene['grid'] {
	const legacySceneData = sceneData as LegacySceneGridData;
	const gridField = legacySceneData.grid;
	const grid =
		gridField && typeof gridField === 'object'
			? (gridField as Record<string, unknown>)
			: undefined;

	const type =
		typeof grid?.type === 'number'
			? grid.type
			: typeof legacySceneData.gridType === 'number'
				? legacySceneData.gridType
				: 1;
	const size =
		typeof grid?.size === 'number'
			? grid.size
			: typeof gridField === 'number'
				? gridField
				: 70;
	const distance =
		typeof grid?.distance === 'number'
			? grid.distance
			: typeof legacySceneData.gridDistance === 'number'
				? legacySceneData.gridDistance
				: 5;
	const units =
		typeof grid?.units === 'string'
			? grid.units
			: typeof legacySceneData.gridUnits === 'string'
				? legacySceneData.gridUnits
				: 'ft';

	const exportGrid: HarbingerScene['grid'] = {
		type,
		size,
		distance,
		units,
	};

	const style =
		typeof grid?.style === 'string'
			? grid.style
			: typeof legacySceneData.gridStyle === 'string'
				? legacySceneData.gridStyle
				: undefined;
	if (style && style !== DEFAULT_GRID_STYLE) {
		exportGrid.style = style;
	}

	const thickness =
		typeof grid?.thickness === 'number'
			? grid.thickness
			: typeof legacySceneData.gridThickness === 'number'
				? legacySceneData.gridThickness
				: undefined;
	if (typeof thickness === 'number' && thickness !== DEFAULT_GRID_THICKNESS) {
		exportGrid.thickness = thickness;
	}

	const color =
		typeof grid?.color === 'string'
			? grid.color
			: typeof legacySceneData.gridColor === 'string'
				? legacySceneData.gridColor
				: undefined;
	if (color && color !== DEFAULT_GRID_COLOR) {
		exportGrid.color = color;
	}

	const alpha =
		typeof grid?.alpha === 'number'
			? grid.alpha
			: typeof legacySceneData.gridAlpha === 'number'
				? legacySceneData.gridAlpha
				: undefined;
	if (typeof alpha === 'number' && alpha !== DEFAULT_GRID_ALPHA) {
		exportGrid.alpha = alpha;
	}

	return exportGrid;
}

function resolveScenePlaylist(sceneData: SceneData): ScenePlaylistResolution {
	const playlistId = typeof sceneData.playlist === 'string' && sceneData.playlist.length > 0 ? sceneData.playlist : undefined;
	const playlistSoundId =
		typeof sceneData.playlistSound === 'string' && sceneData.playlistSound.length > 0 ? sceneData.playlistSound : undefined;

	if (!playlistId) {
		return {
			...(playlistSoundId ? { playlistSoundId } : {}),
		};
	}

	const playlists = (game as unknown as { playlists?: { get: (id: string) => PlaylistDocumentLike | undefined } }).playlists;
	const playlist = playlists?.get(playlistId);
	const sourceId = playlist?.flags?.[MODULE_ID]?.sourceId;
	const playlistSourceId = typeof sourceId === 'string' && sourceId.length > 0 ? sourceId : undefined;
	const soundName = playlistSoundId ? playlist?.sounds?.get(playlistSoundId)?.name : undefined;

	return {
		playlistId,
		...(typeof playlist?.name === 'string' ? { playlistName: playlist.name } : {}),
		...(playlistSoundId ? { playlistSoundId } : {}),
		...(typeof soundName === 'string' ? { playlistSoundName: soundName } : {}),
		...(playlistSourceId ? { playlistSourceId } : {}),
	};
}

export function buildHarbingerSceneAmbienceExport(scene: SceneClass): SceneAmbienceExportContext {
	const sceneData = scene.toObject();
	const exportData: SceneAmbienceExport = {};

	const darkness = getSceneDarkness(sceneData);
	if (typeof darkness === 'number' && darkness !== 0) {
		exportData.darkness = darkness;
	}

	const globalLight = getSceneGlobalLightEnabled(sceneData);
	if (globalLight === true) {
		exportData.globalLight = true;
	}

	const globalLightThreshold = getSceneGlobalLightThreshold(sceneData);
	if (typeof globalLightThreshold === 'number') {
		exportData.globalLightThreshold = globalLightThreshold;
	}

	const environment = getSceneEnvironmentOverride(sceneData);
	if (environment) {
		exportData.environment = environment;
	}

	const sceneFlagPlaylistSourceId = getSceneModuleFlagValue(scene, 'playlistSourceId');
	const playlist = resolveScenePlaylist(sceneData);
	const playlistSourceId = sceneFlagPlaylistSourceId ?? playlist.playlistSourceId;

	if (playlistSourceId) {
		exportData.playlistSourceId = playlistSourceId;
	}

	return {
		exportData,
		...(playlist.playlistId ? { playlistId: playlist.playlistId } : {}),
		...(playlist.playlistName ? { playlistName: playlist.playlistName } : {}),
		...(playlist.playlistSoundId ? { playlistSoundId: playlist.playlistSoundId } : {}),
		...(playlist.playlistSoundName ? { playlistSoundName: playlist.playlistSoundName } : {}),
		hasUnmappedPlaylist: Boolean(playlist.playlistId && !playlistSourceId),
	};
}

export function buildHarbingerSceneExport(
	scene: SceneClass,
	ambience: SceneAmbienceExportContext = buildHarbingerSceneAmbienceExport(scene),
): HarbingerScene {
	const sceneData = scene.toObject();
	const backgroundSrc = sceneData.background?.src ?? sceneData.img ?? '';
	const foregroundSrc =
		typeof sceneData.foreground === 'string' && sceneData.foreground.length > 0 ? sceneData.foreground : undefined;
	const fogExploration = sceneData.fog?.exploration ?? sceneData.fogExploration;
	const backgroundOffsetX = sceneData.background?.offsetX;
	const backgroundOffsetY = sceneData.background?.offsetY;
	const backgroundScale = getSceneBackgroundScaleOverride(scene, sceneData);

	const exportData: HarbingerScene = {
		id: getSceneModuleFlagValue(scene, 'sourceId') ?? slugifySceneId(sceneData.name),
		name: sceneData.name,
		img: backgroundSrc,
		...(foregroundSrc ? { foreground: foregroundSrc } : {}),
		background: {
			src: backgroundSrc,
			...(typeof backgroundOffsetX === 'number' ? { offsetX: backgroundOffsetX } : {}),
			...(typeof backgroundOffsetY === 'number' ? { offsetY: backgroundOffsetY } : {}),
			...backgroundScale,
		},
		grid: getSceneGridOverride(sceneData),
		initial: {
			x: sceneData.initial?.x ?? null,
			y: sceneData.initial?.y ?? null,
			scale: sceneData.initial?.scale ?? 1,
		},
		width: sceneData.width ?? 0,
		height: sceneData.height ?? 0,
		navigation: sceneData.navigation ?? true,
		navOrder: sceneData.navOrder ?? 0,
	};

	if (sceneData.tokenVision === false) {
		exportData.tokenVision = false;
	}

	if (fogExploration === false) {
		exportData.fogExploration = false;
	}

	const folder = getSceneFolderName(scene);
	if (folder) {
		exportData.folder = folder;
	}

	if (typeof sceneData.sort === 'number') {
		exportData.sort = sceneData.sort;
	}

	if (typeof ambience.exportData.darkness === 'number') {
		exportData.darkness = ambience.exportData.darkness;
	}

	if (typeof ambience.exportData.globalLight === 'boolean') {
		exportData.globalLight = ambience.exportData.globalLight;
	}

	if ('globalLightThreshold' in ambience.exportData) {
		exportData.globalLightThreshold = ambience.exportData.globalLightThreshold ?? null;
	}

	if (ambience.exportData.environment) {
		exportData.environment = ambience.exportData.environment;
	}

	if (ambience.exportData.playlistSourceId) {
		exportData.playlistSourceId = ambience.exportData.playlistSourceId;
	}

	for (const field of PLACEABLE_FIELDS) {
		const collection = sanitizePlaceables(sceneData[field]);
		if (collection) {
			exportData[field] = collection;
		}
	}

	return exportData;
}

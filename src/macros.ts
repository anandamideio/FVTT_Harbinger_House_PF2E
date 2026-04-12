import { requestAlignmentFromPlayers } from './character-sheet/alignment-sockets';
import { MODULE_ID, log, logWarn } from './config';
import type { HarbingerScene } from './data/scenes/types';
import { ALL_SIGIL_LOCATIONS, getLocationById, type SigilLocation } from './data/sigil-locations';
import { isSigilScene } from './sigil-map/sigil-map-state';

type JournalWithShareSheet = JournalEntryClass & {
	sheet: {
		render(force?: boolean, options?: { sharedWithPlayers?: boolean }): void;
	};
};

interface PointerLikeEvent {
	global?: {
		x: number;
		y: number;
	};
	stopPropagation?: () => void;
	preventDefault?: () => void;
}

export interface HarbingerHouseMacroAPI {
	setLandingPage: () => Promise<void>;
	openImportDialog: () => Promise<void>;
	exportSceneData: () => Promise<void>;
	calibrateSigilLocation: () => Promise<void>;
	assignPlayerAlignments: () => Promise<void>;
}

export type HarbingerHouseMacroName = keyof HarbingerHouseMacroAPI;

interface LegacyHarbingerHouseMacroAPI {
	exportSceneAmbienceData: () => Promise<void>;
}

function getDialogRoot(html: HTMLElement | JQuery): HTMLElement {
	return html instanceof HTMLElement ? html : ((html as unknown as HTMLElement[])[0] ?? document.body);
}

async function setLandingPage(): Promise<void> {
	const journal = game.journal?.find((entry: JournalEntryClass) => entry.flags?.[MODULE_ID]?.imported === true);
	if (!journal) {
		ui.notifications.warn('No Harbinger House journal found. Please import journals first.');
		return;
	}

	(journal as JournalWithShareSheet).sheet.render(true, { sharedWithPlayers: true });
	ui.notifications.info('Displaying Harbinger House journal to all players.');
}

async function openImportDialog(): Promise<void> {
	if (!game.user?.isGM) {
		ui.notifications.warn('Only a GM can import content.');
		return;
	}

	if (!game.harbingerHouse?.openImporter) {
		ui.notifications.error('Harbinger House module is not active.');
		return;
	}

	await game.harbingerHouse.openImporter();
}

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

interface SceneAmbienceExportContext {
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

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

function escapeTsString(value: string): string {
	return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function isIdentifierKey(key: string): boolean {
	return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

function formatTypeScriptLiteral(value: unknown, indent = 0): string {
	if (value === null) return 'null';

	const type = typeof value;
	if (type === 'string') return `'${escapeTsString(value as string)}'`;
	if (type === 'number' || type === 'boolean') return String(value);

	if (Array.isArray(value)) {
		if (value.length === 0) return '[]';
		const padding = '\t'.repeat(indent);
		const childPadding = '\t'.repeat(indent + 1);
		const lines = value.map((entry) => `${childPadding}${formatTypeScriptLiteral(entry, indent + 1)},`);
		return `[\n${lines.join('\n')}\n${padding}]`;
	}

	if (type === 'object') {
		const entries = Object.entries(value as Record<string, unknown>).filter(([, entry]) => entry !== undefined);
		if (entries.length === 0) return '{}';

		const padding = '\t'.repeat(indent);
		const childPadding = '\t'.repeat(indent + 1);
		const lines = entries.map(([key, entry]) => {
			const keyLabel = isIdentifierKey(key) ? key : `'${escapeTsString(key)}'`;
			return `${childPadding}${keyLabel}: ${formatTypeScriptLiteral(entry, indent + 1)},`;
		});

		return `{\n${lines.join('\n')}\n${padding}}`;
	}

	return 'null';
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

function buildHarbingerSceneAmbienceExport(scene: SceneClass): SceneAmbienceExportContext {
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

function buildHarbingerSceneExport(
	scene: SceneClass,
	ambience: SceneAmbienceExportContext = buildHarbingerSceneAmbienceExport(scene),
): HarbingerScene {
	const sceneData = scene.toObject();
	const backgroundSrc = sceneData.background?.src ?? sceneData.img ?? '';
	const fogExploration = sceneData.fog?.exploration ?? sceneData.fogExploration;
	const backgroundOffsetX = sceneData.background?.offsetX;
	const backgroundOffsetY = sceneData.background?.offsetY;

	const exportData: HarbingerScene = {
		id: getSceneModuleFlagValue(scene, 'sourceId') ?? slugifySceneId(sceneData.name),
		name: sceneData.name,
		img: backgroundSrc,
		background: {
			src: backgroundSrc,
			...(typeof backgroundOffsetX === 'number' ? { offsetX: backgroundOffsetX } : {}),
			...(typeof backgroundOffsetY === 'number' ? { offsetY: backgroundOffsetY } : {}),
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

async function copyToClipboard(text: string): Promise<boolean> {
	if (!navigator.clipboard?.writeText) {
		return false;
	}

	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		logWarn('Unable to copy scene export to clipboard.', err);
		return false;
	}
}

async function exportSceneData(): Promise<void> {
	if (!game.user?.isGM) {
		ui.notifications.warn('Only a GM can export scene data.');
		return;
	}

	const scene = canvas.scene;
	if (!scene) {
		ui.notifications.warn('No active scene to export.');
		return;
	}

	const ambience = buildHarbingerSceneAmbienceExport(scene);
	const exportData = buildHarbingerSceneExport(scene, ambience);
	const snippet = `${formatTypeScriptLiteral(exportData)},`;
	const copied = await copyToClipboard(snippet);

	log(`[Scene Export] ${exportData.id} (${exportData.name})`, {
		export: exportData,
		playlistId: ambience.playlistId ?? null,
		playlistSourceId: ambience.exportData.playlistSourceId ?? null,
	});

	const playlistDetails = [
		...(ambience.playlistId
			? [
				`<li><strong>Playlist:</strong> ${escapeHtml(ambience.playlistName ?? ambience.playlistId)}${
					ambience.playlistName ? ` <code>(${escapeHtml(ambience.playlistId)})</code>` : ''
				}</li>`,
			]
			: []),
		...(ambience.playlistSoundId
			? [
				`<li><strong>Sound:</strong> ${escapeHtml(ambience.playlistSoundName ?? ambience.playlistSoundId)}${
					ambience.playlistSoundName ? ` <code>(${escapeHtml(ambience.playlistSoundId)})</code>` : ''
				}</li>`,
			]
			: []),
		...(ambience.exportData.playlistSourceId
			? [
				`<li><strong>Scene data field:</strong> <code>playlistSourceId: '${escapeHtml(ambience.exportData.playlistSourceId)}'</code></li>`,
			]
			: []),
	];

	new Dialog(
		{
			title: `Scene Export: ${exportData.name}`,
			content: `
				<p>Paste this object into the appropriate scene array in <code>src/data/scenes/*.ts</code>.</p>
				<p>This export includes ambience overrides and complete grid settings when present.</p>
				${
					playlistDetails.length > 0
						? `<ul>${playlistDetails.join('')}</ul>`
						: '<p>No playlist selected in Scene Ambience.</p>'
				}
				${
					ambience.hasUnmappedPlaylist
						? '<p><strong>Playlist mapping note:</strong> The selected playlist is missing this module\'s <code>sourceId</code> flag, so <code>playlistSourceId</code> could not be generated automatically.</p>'
						: ''
				}
				<p>${copied ? 'Copied to clipboard.' : 'Clipboard copy failed. Copy from the box below.'}</p>
				<textarea style="width: 100%; min-height: 360px; font-family: monospace;">${escapeHtml(snippet)}</textarea>
			`,
			buttons: {
				ok: {
					icon: '<i class="fas fa-check"></i>',
					label: 'Done',
				},
			},
			default: 'ok',
		},
		{
			width: 780,
			classes: ['harbinger-house'],
		},
	).render(true);

	ui.notifications.info(`Exported scene data for ${exportData.name}.`);
}

async function exportSceneAmbienceDataLegacy(): Promise<void> {
	ui.notifications.info('Scene ambience export has been merged into Export Scene Data.');
	await exportSceneData();
}

function chooseCalibrationLocation(): Promise<string | null> {
	return new Promise((resolve) => {
		let settled = false;
		const finish = (value: string | null) => {
			if (settled) return;
			settled = true;
			resolve(value);
		};

		const options = ALL_SIGIL_LOCATIONS
			.map(
				(location) =>
					`<option value="${location.id}">${location.name} (${location.category.replace(/-/g, ' ')})</option>`,
			)
			.join('');

		new Dialog(
			{
				title: 'Sigil Marker Calibration',
				content: `
					<form class="sigil-calibration-form">
						<p>Select a location, then click <strong>Start Calibration</strong>.</p>
						<p>After the dialog closes, click once on the Sigil map to capture coordinates.</p>
						<p>Press <strong>Escape</strong> to cancel click capture.</p>
						<div class="form-group">
							<label for="hh-sigil-location">Location</label>
							<select id="hh-sigil-location" name="location">${options}</select>
						</div>
					</form>
				`,
				buttons: {
					start: {
						icon: '<i class="fas fa-crosshairs"></i>',
						label: 'Start Calibration',
						callback: (html: HTMLElement | JQuery) => {
							const root = getDialogRoot(html);
							const select = root.querySelector<HTMLSelectElement>('#hh-sigil-location');
							finish(select?.value ?? null);
						},
					},
					cancel: {
						icon: '<i class="fas fa-times"></i>',
						label: 'Cancel',
						callback: () => finish(null),
					},
				},
				default: 'start',
				close: () => finish(null),
			},
			{
				width: 520,
				classes: ['harbinger-house'],
			},
		).render(true);
	});
}

function captureNextMapClick(): Promise<{ x: number; y: number } | null> {
	return new Promise((resolve) => {
		const stage = canvas.stage;
		const interactiveStage = stage as PIXI.Container & {
			eventMode?: string;
			on: (event: string, fn: (event: unknown) => void) => unknown;
			off: (event: string, fn: (event: unknown) => void) => unknown;
		};

		const previousEventMode = interactiveStage.eventMode;
		interactiveStage.eventMode = 'static';

		let settled = false;
		const finish = (coords: { x: number; y: number } | null): void => {
			if (settled) return;
			settled = true;
			interactiveStage.off('pointerdown', onPointerDown);
			window.removeEventListener('keydown', onKeyDown);
			if (previousEventMode !== undefined) {
				interactiveStage.eventMode = previousEventMode;
			}
			resolve(coords);
		};

		const onKeyDown = (event: KeyboardEvent): void => {
			if (event.key !== 'Escape') return;
			ui.notifications.info('Sigil calibration cancelled.');
			finish(null);
		};

		const onPointerDown = (event: unknown): void => {
			const pointer = event as PointerLikeEvent;
			const globalPoint = pointer.global;
			if (!globalPoint) {
				logWarn('Sigil calibration pointer event was missing global coordinates.');
				finish(null);
				return;
			}

			pointer.preventDefault?.();
			pointer.stopPropagation?.();

			const stageWithToLocal = stage as unknown as {
				toLocal: (point: { x: number; y: number }) => { x: number; y: number };
			};
			const localPoint = stageWithToLocal.toLocal(globalPoint);
			finish({
				x: Math.round(localPoint.x),
				y: Math.round(localPoint.y),
			});
		};

		interactiveStage.on('pointerdown', onPointerDown);
		window.addEventListener('keydown', onKeyDown);
	});
}

async function showCalibrationResult(location: SigilLocation, x: number, y: number): Promise<void> {
	const snippet = `id: '${location.id}',\n\tx: ${x},\n\ty: ${y},`;

	let copied = false;
	if (navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(snippet);
			copied = true;
		} catch (err) {
			logWarn('Unable to copy calibration snippet to clipboard.', err);
		}
	}

	new Dialog(
		{
			title: `Captured Coordinates: ${location.name}`,
			content: `
				<p><strong>${location.name}</strong> captured at <strong>x: ${x}</strong>, <strong>y: ${y}</strong>.</p>
				<p>Paste this snippet into <code>src/data/sigil-locations.ts</code>:</p>
				<textarea style="width: 100%; min-height: 120px; font-family: monospace;">${snippet}</textarea>
				<p>${copied ? 'Snippet copied to clipboard.' : 'Clipboard copy failed; snippet is ready above.'}</p>
			`,
			buttons: {
				ok: {
					icon: '<i class="fas fa-check"></i>',
					label: 'Done',
				},
			},
			default: 'ok',
		},
		{
			width: 560,
			classes: ['harbinger-house'],
		},
	).render(true);
}

async function calibrateSigilLocation(): Promise<void> {
	if (!game.user?.isGM) {
		ui.notifications.warn('Only a GM can calibrate Sigil coordinates.');
		return;
	}

	const scene = canvas.scene;
	if (!scene || !isSigilScene(scene)) {
		ui.notifications.warn('Open the Sigil scene before starting calibration.');
		return;
	}

	const locationId = await chooseCalibrationLocation();
	if (!locationId) return;

	const location = getLocationById(locationId);
	if (!location) {
		ui.notifications.error(`Unknown location ID: ${locationId}`);
		return;
	}

	ui.notifications.info(`Calibration active for ${location.name}. Click once on the map.`);
	const coordinates = await captureNextMapClick();
	if (!coordinates) return;

	const { x, y } = coordinates;
	log(`[Sigil Calibration] ${location.id} (${location.name}) -> x: ${x}, y: ${y}`);
	await showCalibrationResult(location, x, y);
}

async function assignPlayerAlignments(): Promise<void> {
	await requestAlignmentFromPlayers();
}

export const MACROS: HarbingerHouseMacroAPI & Partial<LegacyHarbingerHouseMacroAPI> = {
	setLandingPage,
	openImportDialog,
	exportSceneData,
	exportSceneAmbienceData: exportSceneAmbienceDataLegacy,
	calibrateSigilLocation,
	assignPlayerAlignments,
};

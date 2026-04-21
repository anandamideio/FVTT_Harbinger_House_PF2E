import { log, logDebug, MODULE_ID, SETTINGS } from '../config';
import type { SigilLocation } from '../data/sigil-locations';
import type { LocationState } from '../types/module-flags';
import { DISCOVERY_SOUNDS, SOUNDS, SOUND_VOLUME } from './constants';
import { InvestigationBoardApp } from './InvestigationBoardApp';
import { LocationDetailApp } from './LocationDetailApp';
import type { SigilMapLayer } from './SigilMapLayer';
import { SigilMapMarker } from './SigilMapMarker';
import {
	advanceLocationState,
	consumeNextDiscoveryCycleIndex,
	isSigilScene,
	resetLocationState,
} from './sigil-map-state';
import { broadcastLocationStateChange, requestStateRefresh } from './sigil-map-sockets';

/** Last mouse position for context menu placement */
let _lastContextMenuEvent: { clientX: number; clientY: number } | null = null;

// ============================================================================
// Registration
// ============================================================================

/** Register all hooks for the Sigil map feature. Call once during init. */
export function registerSigilMapHooks(): void {
	Hooks.on('canvasReady', onCanvasReady);
	Hooks.on('updateScene', onUpdateScene);
	Hooks.on('getSceneControlButtons', onGetSceneControlButtons);

	// Custom hooks dispatched by the layer
	Hooks.on('harbinger-house.openLocationDetail', (...args: unknown[]) => {
		onOpenLocationDetail(args[0] as SigilLocation, args[1] as LocationState);
	});
	Hooks.on('harbinger-house.markerContext', (...args: unknown[]) => {
		// Capture mouse position for context menu placement
		const event = args[1] as { data?: { originalEvent?: MouseEvent } } | undefined;
		const mouseEvent = event?.data?.originalEvent;
		if (mouseEvent) {
			_lastContextMenuEvent = { clientX: mouseEvent.clientX, clientY: mouseEvent.clientY };
		}
		onMarkerContext(args[0] as SigilMapMarker);
	});
	Hooks.on('harbinger-house.playRevealSound', (...args: unknown[]) => {
		playRevealSound(args[0] as string, args[1] as string | undefined);
	});

	log('Sigil map hooks registered');
}

// ============================================================================
// canvasReady - Initialize layer when viewing Sigil scene
// ============================================================================

function onCanvasReady(): void {
	const scene = canvas.scene;
	if (!scene || !isSigilScene(scene)) return;

	try {
		if (!game.settings.get(MODULE_ID, SETTINGS.SIGIL_MAP_ENABLED)) return;
	} catch {
		return;
	}

	logDebug('Canvas ready on Sigil scene, initializing map layer');

	const layer = canvas.sigilMap as SigilMapLayer | undefined;
	if (layer) {
		layer.draw();
	}

	// Hide any legacy Sigil scene Note placeables immediately so our custom
	// markers remain the only hover/click target on this map.
	hideLegacySigilNotePlaceables();

	// Remove old module-generated Sigil notes from existing worlds.
	if (game.user?.isGM) {
		void removeLegacySigilSceneNotes(scene);
	}

	// Players joining mid-session should request a state refresh
	if (!game.user?.isGM) {
		requestStateRefresh();
	}
}

// ============================================================================
// updateScene - React to flag changes on the Sigil scene
// ============================================================================

function onUpdateScene(...args: unknown[]): void {
	const [scene, changes] = args as [SceneClass, { flags?: Record<string, unknown> }];
	if (!isSigilScene(scene)) return;

	// Check if our flags changed
	const flagChanges = changes.flags?.[MODULE_ID] as Record<string, unknown> | undefined;
	if (!flagChanges) return;

	logDebug('Sigil scene flags updated, refreshing markers');

	const layer = canvas.sigilMap as SigilMapLayer | undefined;
	if (layer) {
		layer.refreshFromFlags();
	}

	// Also refresh the Investigation Board if open
	InvestigationBoardApp.instance?.refreshFromFlags();
}

// ============================================================================
// getSceneControlButtons - Add GM toolbar when on Sigil scene
// ============================================================================

function onGetSceneControlButtons(...args: unknown[]): void {
	const [controls] = args as [Record<string, SceneControlGroup>];

	// Only show on the Sigil scene and for GMs
	if (!game.user?.isGM) return;
	if (!canvas.scene || !isSigilScene(canvas.scene)) return;

	try {
		if (!game.settings.get(MODULE_ID, SETTINGS.SIGIL_MAP_ENABLED)) return;
	} catch {
		return;
	}

	controls['sigil-investigation'] = {
		name: 'sigil-investigation',
		title: 'Sigil Investigation',
		icon: 'fas fa-map-marked-alt',
		order: 100,
		activeTool: 'sigil-open-board',
		tools: {
			'sigil-open-board': {
				name: 'sigil-open-board',
				title: 'Investigation Board',
				icon: 'fas fa-map-marked-alt',
				order: 0,
				button: true,
				onChange: (event: Event, active: boolean) => {
					if (!active) return;

					InvestigationBoardApp.open();
					void activateTokenControls(event);
				},
			},
		},
	};
}

// ============================================================================
// Context Menu (GM right-click on marker)
// ============================================================================

function onMarkerContext(marker: SigilMapMarker): void {
	if (!game.user?.isGM) return;

	const scene = canvas.scene;
	if (!scene) return;

	const menuItems: ContextMenuItem[] = [];

	// Advance state
	if (marker.revealState !== 'investigated') {
		const nextLabel = marker.revealState === 'hidden' ? 'Reveal to Players' : 'Reveal to Investigated';
		menuItems.push({
			name: nextLabel,
			icon: '<i class="fas fa-eye"></i>',
			callback: async () => {
				const result = await advanceLocationState(scene, marker.location.id);
				if (result) {
					const isFirstDiscovery =
						result.previousRevealState === 'hidden'
						&& result.state.revealState === 'discovered';

					if (isFirstDiscovery) {
						const layer = canvas.sigilMap as SigilMapLayer | undefined;
						void layer?.focusOnLocation(marker.location.id);
					}

					const soundSrc = isFirstDiscovery ? await pickNextDiscoverySound(scene) : undefined;

					marker.setState(result.state, true);
					broadcastLocationStateChange(marker.location.id, result.state, {
						focusCamera: isFirstDiscovery,
						soundSrc,
					});
					playRevealSound(result.state.revealState, soundSrc);
					InvestigationBoardApp.instance?.refreshFromFlags();
				}
			},
		});
	}

	// Open detail panel
	menuItems.push({
		name: 'Open Detail Panel',
		icon: '<i class="fas fa-info-circle"></i>',
		callback: () => {
			onOpenLocationDetail(marker.location, marker.state);
		},
	});

	// Open Investigation Board
	menuItems.push({
		name: 'Open Investigation Board',
		icon: '<i class="fas fa-map-marked-alt"></i>',
		callback: () => {
			InvestigationBoardApp.open();
		},
	});

	// Hide location (reset)
	if (marker.revealState !== 'hidden') {
		menuItems.push({
			name: 'Hide Location',
			icon: '<i class="fas fa-eye-slash"></i>',
			callback: async () => {
				const newState = await resetLocationState(scene, marker.location.id);
				marker.setState(newState, false);
				broadcastLocationStateChange(marker.location.id, newState);
				InvestigationBoardApp.instance?.refreshFromFlags();
			},
		});
	}

	// Open linked journal
	if (marker.location.journalId) {
		menuItems.push({
			name: 'Open Linked Journal',
			icon: '<i class="fas fa-book-open"></i>',
			callback: () => {
				const journal = game.journal?.find(
					(j: JournalEntryClass) => j.flags?.[MODULE_ID]?.sourceId === marker.location.journalId
				);
				if (journal) {
					journal.sheet.render({ force: true });
				}
			},
		});
	}

	// Render the context menu at cursor position
	showContextMenu(menuItems);
}

// ============================================================================
// Detail Panel
// ============================================================================

function onOpenLocationDetail(location: SigilLocation, state: LocationState): void {
	LocationDetailApp.open(location, state);
}

// ============================================================================
// Sound Effects
// ============================================================================

/**
 * GM-only: pick the next discovery sound and persist the rotation index on the scene
 * so every client plays the same sound in the same order.
 */
export async function pickNextDiscoverySound(scene: SceneClass): Promise<string> {
	const index = await consumeNextDiscoveryCycleIndex(scene, DISCOVERY_SOUNDS.length);
	return DISCOVERY_SOUNDS[index];
}

function playRevealSound(state: string, overrideSrc?: string): void {
	try {
		if (!game.settings.get(MODULE_ID, SETTINGS.SIGIL_MAP_SOUNDS)) return;
	} catch {
		return;
	}

	const src = overrideSrc ?? (state === 'investigated' ? SOUNDS.INVESTIGATE : undefined);
	if (!src) return;

	foundry.audio.AudioHelper.play({
		src,
		volume: SOUND_VOLUME,
		autoplay: true,
		loop: false,
	});
}

async function activateTokenControls(event?: Event): Promise<void> {
	const controlsUi = (ui as unknown as { controls?: SceneControlsUI }).controls;
	if (!controlsUi?.activate) return;

	const activationOptions: SceneControlsActivationOptions[] = [
		{ control: 'tokens', tool: 'select', event },
		{ control: 'tokens', event },
		{ control: 'token', tool: 'select', event },
		{ control: 'token', event },
	];

	for (const options of activationOptions) {
		try {
			await controlsUi.activate(options);
			return;
		} catch {
			// Try fallback option names between Foundry versions.
		}
	}

	logDebug('Unable to switch back to token controls after opening the Sigil board');
}

// ============================================================================
// Helpers
// ============================================================================

type NotePlaceableLike = {
	document?: { flags?: Record<string, Record<string, unknown>> };
	visible?: boolean;
	renderable?: boolean;
	interactive?: boolean;
	eventMode?: string;
};

function isLegacySigilLocationNote(note: { flags?: Record<string, Record<string, unknown>> } | undefined): boolean {
	const moduleFlags = note?.flags?.[MODULE_ID] as Record<string, unknown> | undefined;
	return typeof moduleFlags?.sigilLocationId === 'string';
}

function hideLegacySigilNotePlaceables(): void {
	const notesLayer = (canvas as unknown as { notes?: { placeables?: NotePlaceableLike[] } }).notes;
	const placeables = notesLayer?.placeables ?? [];

	for (const placeable of placeables) {
		if (!isLegacySigilLocationNote(placeable.document)) continue;

		placeable.visible = false;
		placeable.renderable = false;
		placeable.interactive = false;
		placeable.eventMode = 'none';
	}
}

async function removeLegacySigilSceneNotes(scene: SceneClass): Promise<void> {
	const legacyNoteIds = scene.notes
		.filter((note: NoteDocument) => isLegacySigilLocationNote(note))
		.map((note: NoteDocument) => note.id)
		.filter((id): id is string => typeof id === 'string' && id.length > 0);

	if (legacyNoteIds.length === 0) return;

	const sceneWithEmbeddedDelete = scene as SceneClass & {
		deleteEmbeddedDocuments?: (type: 'Note', ids: string[]) => Promise<unknown>;
	};

	if (typeof sceneWithEmbeddedDelete.deleteEmbeddedDocuments !== 'function') {
		logDebug('Scene.deleteEmbeddedDocuments unavailable; cannot remove legacy Sigil notes');
		return;
	}

	try {
		await sceneWithEmbeddedDelete.deleteEmbeddedDocuments('Note', legacyNoteIds);
		log(`Removed ${legacyNoteIds.length} legacy Sigil journal note(s)`);
	} catch (error) {
		logDebug('Failed to remove legacy Sigil notes', error);
	}
}

function showContextMenu(items: ContextMenuItem[]): void {
	// Build a simple HTML context menu at the mouse position
	const existing = document.getElementById('sigil-context-menu');
	if (existing) existing.remove();

	const menu = document.createElement('nav');
	menu.id = 'sigil-context-menu';
	menu.classList.add('sigil-context-menu');

	for (const item of items) {
		const entry = document.createElement('div');
		entry.classList.add('context-item');
		entry.innerHTML = `${item.icon} <span>${item.name}</span>`;
		entry.addEventListener('click', () => {
			item.callback();
			menu.remove();
		});
		menu.appendChild(entry);
	}

	document.body.appendChild(menu);

	// Position near cursor
	const { clientX, clientY } = _lastContextMenuEvent ?? { clientX: 100, clientY: 100 };
	menu.style.left = `${clientX}px`;
	menu.style.top = `${clientY}px`;

	// Remove on next click anywhere
	const removeHandler = () => {
		menu.remove();
		document.removeEventListener('click', removeHandler);
	};
	setTimeout(() => {
		document.addEventListener('click', removeHandler);
	}, 100);
}

// ============================================================================
// Type Helpers (Foundry V13 scene controls)
// ============================================================================

interface SceneControlTool {
	name: string;
	title: string;
	icon: string;
	order: number;
	toggle?: boolean;
	button?: boolean;
	active?: boolean;
	onChange?: (event: Event, active: boolean) => void;
}

interface SceneControlGroup {
	name: string;
	title: string;
	icon: string;
	order: number;
	activeTool: string;
	onChange?: (event: Event, active: boolean) => void;
	onToolChange?: (event: Event, tool: SceneControlTool) => void;
	tools: Record<string, SceneControlTool>;
	visible?: boolean;
}

interface SceneControlsActivationOptions {
	event?: Event;
	control?: string;
	tool?: string;
	toggles?: Record<string, boolean>;
}

interface SceneControlsUI {
	activate: (options?: SceneControlsActivationOptions) => Promise<void> | void;
}

interface ContextMenuItem {
	name: string;
	icon: string;
	callback: () => void;
}

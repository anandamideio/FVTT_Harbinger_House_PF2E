import { log, logDebug, MODULE_ID, SETTINGS } from '../config';
import type { SigilLocation } from '../data/sigil-locations';
import { ALL_SIGIL_LOCATIONS } from '../data/sigil-locations';
import type { LocationState } from '../types/module-flags';
import { SOUNDS, SOUND_VOLUME } from './constants';
import { LocationDetailApp } from './LocationDetailApp';
import type { SigilMapLayer } from './SigilMapLayer';
import { SigilMapMarker } from './SigilMapMarker';
import {
	advanceLocationState,
	getAllLocationStates,
	isSigilScene,
	resetAllLocationStates,
	resetLocationState,
	setLocationRevealState,
} from './sigil-map-state';
import { broadcastLocationStateChange, requestStateRefresh } from './sigil-map-sockets';

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
		onMarkerContext(args[0] as SigilMapMarker);
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

	const sigilTools: Record<string, SceneControlTool> = {
		'sigil-reveal-mode': {
			name: 'sigil-reveal-mode',
			title: 'Reveal Mode',
			icon: 'fas fa-eye',
			toggle: true,
			active: false,
			onChange: (active: boolean) => {
				const layer = canvas.sigilMap as SigilMapLayer | undefined;
				if (layer) {
					layer.revealMode = active;
					logDebug(`Reveal mode ${active ? 'enabled' : 'disabled'}`);
				}
			},
		},
		'sigil-reset-all': {
			name: 'sigil-reset-all',
			title: 'Reset All Locations',
			icon: 'fas fa-undo',
			button: true,
			onChange: () => {
				handleResetAll();
			},
		},
		'sigil-bulk-reveal': {
			name: 'sigil-bulk-reveal',
			title: 'Bulk Reveal Locations',
			icon: 'fas fa-list-check',
			button: true,
			onChange: () => {
				handleBulkReveal();
			},
		},
	};

	controls['sigil-investigation'] = {
		name: 'sigil-investigation',
		title: 'Sigil Investigation',
		icon: 'fas fa-map-marked-alt',
		layer: 'sigilMap',
		tools: sigilTools,
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
					marker.setState(result.state, true);
					broadcastLocationStateChange(marker.location.id, result.state);
					playRevealSound(result.state.revealState);
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

	// Hide location (reset)
	if (marker.revealState !== 'hidden') {
		menuItems.push({
			name: 'Hide Location',
			icon: '<i class="fas fa-eye-slash"></i>',
			callback: async () => {
				const newState = await resetLocationState(scene, marker.location.id);
				marker.setState(newState, false);
				broadcastLocationStateChange(marker.location.id, newState);
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
	// Use Foundry's native ContextMenu or a simple HTML approach
	showContextMenu(menuItems);
}

// ============================================================================
// Detail Panel
// ============================================================================

function onOpenLocationDetail(location: SigilLocation, state: LocationState): void {
	LocationDetailApp.open(location, state);
}

// ============================================================================
// GM Tools
// ============================================================================

async function handleResetAll(): Promise<void> {
	const scene = canvas.scene;
	if (!scene) return;

	// Confirmation dialog
	const confirmed = await new Promise<boolean>((resolve) => {
		new Dialog({
			title: 'Reset All Locations',
			content: '<p>Reset all location markers to hidden? This cannot be undone.</p>',
			buttons: {
				yes: {
					icon: '<i class="fas fa-check"></i>',
					label: 'Reset All',
					callback: () => resolve(true),
				},
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: 'Cancel',
					callback: () => resolve(false),
				},
			},
			default: 'no',
		}).render(true);
	});

	if (!confirmed) return;

	await resetAllLocationStates(scene);

	const layer = canvas.sigilMap as SigilMapLayer | undefined;
	if (layer) {
		layer.refreshFromFlags();
	}

	log('All Sigil locations reset to hidden');
}

async function handleBulkReveal(): Promise<void> {
	const scene = canvas.scene;
	if (!scene) return;

	const states = getAllLocationStates(scene);

	// Build a checklist of all locations grouped by category
	const categories = ['murder-site', 'faction-hq', 'landmark', 'shop', 'encounter', 'hideout'] as const;
	let checklistHtml = '<form class="sigil-bulk-reveal">';

	for (const category of categories) {
		const locations = ALL_SIGIL_LOCATIONS.filter((l) => l.category === category);
		if (locations.length === 0) continue;

		const categoryLabel = category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
		checklistHtml += `<h3>${categoryLabel}</h3>`;

		for (const loc of locations) {
			const currentState = states[loc.id]?.revealState ?? 'hidden';
			const checked = currentState !== 'hidden' ? 'checked disabled' : '';
			const stateLabel = currentState !== 'hidden' ? ` (${currentState})` : '';

			checklistHtml += `
				<label class="bulk-reveal-item">
					<input type="checkbox" name="location" value="${loc.id}" ${checked} />
					<span>${loc.name}${stateLabel}</span>
				</label>
			`;
		}
	}

	checklistHtml += '</form>';

	new Dialog({
		title: 'Bulk Reveal Locations',
		content: checklistHtml,
		buttons: {
			discover: {
				icon: '<i class="fas fa-eye"></i>',
				label: 'Reveal as Discovered',
				callback: (html: HTMLElement | JQuery) => {
					const el = html instanceof HTMLElement ? html : (html as unknown as HTMLElement[])[0];
					bulkRevealSelected(el, scene, 'discovered');
				},
			},
			investigate: {
				icon: '<i class="fas fa-search"></i>',
				label: 'Reveal as Investigated',
				callback: (html: HTMLElement | JQuery) => {
					const el = html instanceof HTMLElement ? html : (html as unknown as HTMLElement[])[0];
					bulkRevealSelected(el, scene, 'investigated');
				},
			},
			cancel: {
				icon: '<i class="fas fa-times"></i>',
				label: 'Cancel',
			},
		},
		default: 'cancel',
	}, {
		classes: ['harbinger-house', 'sigil-bulk-reveal-dialog'],
		width: 480,
	}).render(true);
}

async function bulkRevealSelected(
	html: HTMLElement,
	scene: SceneClass,
	targetState: 'discovered' | 'investigated',
): Promise<void> {
	const checkboxes = Array.from(html.querySelectorAll<HTMLInputElement>('input[name="location"]:checked:not(:disabled)'));
	const layer = canvas.sigilMap as SigilMapLayer | undefined;

	for (const checkbox of checkboxes) {
		const locationId = checkbox.value;
		// For 'investigated', we may need to go through 'discovered' first
		if (targetState === 'investigated') {
			await setLocationRevealState(scene, locationId, 'discovered');
		}
		const newState = await setLocationRevealState(scene, locationId, targetState);
		if (newState) {
			layer?.updateMarkerState(locationId, newState, false);
			broadcastLocationStateChange(locationId, newState);
		}
	}

	// Refresh all markers to ensure consistency
	layer?.refreshFromFlags();
	log(`Bulk revealed ${checkboxes.length} locations as ${targetState}`);
}

// ============================================================================
// Sound Effects
// ============================================================================

function playRevealSound(state: string): void {
	try {
		if (!game.settings.get(MODULE_ID, SETTINGS.SIGIL_MAP_SOUNDS)) return;
	} catch {
		return;
	}

	const src = state === 'discovered' ? SOUNDS.DISCOVER : SOUNDS.INVESTIGATE;

	AudioHelper.play({
		src,
		volume: SOUND_VOLUME,
		autoplay: true,
		loop: false,
	});
}

// ============================================================================
// Helpers
// ============================================================================

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

	// Position near cursor (approximate -- Foundry events don't always pass coordinates)
	const lastEvent = window.event as MouseEvent | undefined;
	if (lastEvent) {
		menu.style.left = `${lastEvent.clientX}px`;
		menu.style.top = `${lastEvent.clientY}px`;
	}

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
// Type Helpers (Foundry scene controls)
// ============================================================================

interface SceneControlTool {
	name: string;
	title: string;
	icon: string;
	toggle?: boolean;
	button?: boolean;
	active?: boolean;
	onChange?: (active: boolean) => void;
}

interface SceneControlGroup {
	name: string;
	title: string;
	icon: string;
	layer?: string;
	tools: Record<string, SceneControlTool>;
}

interface ContextMenuItem {
	name: string;
	icon: string;
	callback: () => void;
}

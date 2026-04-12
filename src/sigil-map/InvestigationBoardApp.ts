import { mount, unmount } from 'svelte';
import { log, logDebug, MODULE_ID } from '../config';
import { ALL_SIGIL_LOCATIONS, getLocationById } from '../data/sigil-locations';
import type { RevealState } from '../data/sigil-locations';
import type { LocationState } from '../types/module-flags';
import InvestigationBoard from './InvestigationBoard.svelte';
import { boardState } from './investigation-board-state.svelte';
import {
	advanceLocationState,
	createDefaultState,
	getAllLocationStates,
	isSigilScene,
	resetAllLocationStates,
	resetLocationState,
	setBulkLocationStates,
	setGMNotes,
	toggleClueDiscovered,
} from './sigil-map-state';
import { broadcastLocationStateChange } from './sigil-map-sockets';
import type { SigilMapLayer } from './SigilMapLayer';

/**
 * Investigation Board — the unified GM interface for managing all Sigil investigation map locations.
 */
export class InvestigationBoardApp {
	private static _instance: InvestigationBoardApp | null = null;

	private _element: HTMLElement | null = null;
	private _svelteInstance: ReturnType<typeof mount> | null = null;
	private _windowApp: unknown = null;

	// ========================================================================
	// Singleton Access
	// ========================================================================

	static get instance(): InvestigationBoardApp | null {
		return InvestigationBoardApp._instance;
	}

	/** Open the Investigation Board, or focus it if already open. */
	static open(): void {
		if (InvestigationBoardApp._instance) {
			InvestigationBoardApp._instance._focusWindow();
			return;
		}

		const app = new InvestigationBoardApp();
		InvestigationBoardApp._instance = app;
		app._loadStates();
		app._render();
	}

	/** Close the Investigation Board if open. */
	static close(): void {
		InvestigationBoardApp._instance?._closeWindow();
	}

	// ========================================================================
	// State Sync
	// ========================================================================

	/** Re-read scene flags and push into the reactive boardState. */
	refreshFromFlags(): void {
		const scene = canvas.scene;
		if (!scene || !isSigilScene(scene)) {
			// Scene changed away from Sigil — close the board
			this._closeWindow();
			return;
		}
		this._loadStates();
	}

	private _loadStates(): void {
		const scene = canvas.scene;
		if (!scene) return;

		const flags = getAllLocationStates(scene);

		// Mutate boardState in place so Svelte's reactivity picks it up
		for (const loc of ALL_SIGIL_LOCATIONS) {
			boardState.states[loc.id] = flags[loc.id] ?? createDefaultState();
		}
	}

	// ========================================================================
	// Rendering
	// ========================================================================

	private _render(): void {
		const dialog = new Dialog(
			{
				title: 'Investigation Board',
				content: '<div class="investigation-board-mount"></div>',
				buttons: {},
				default: '',
				render: (html: HTMLElement | JQuery) => {
					const el = html instanceof HTMLElement ? html : (html as unknown as HTMLElement[])[0];
					const mountPoint =
						el?.querySelector?.('.investigation-board-mount') ?? (el as HTMLElement);

					if (mountPoint) {
						this._element = mountPoint as HTMLElement;
						this._mountSvelte();
					}
				},
				close: () => {
					this._cleanup();
				},
			},
			{
				classes: ['harbinger-house', 'sigil-investigation-board'],
				width: 680,
				height: 720,
				resizable: true,
				minimizable: true,
				id: 'sigil-investigation-board',
			},
		);

		dialog.render(true);
		this._windowApp = dialog;
	}

	private _mountSvelte(): void {
		if (!this._element) return;

		this._svelteInstance = mount(InvestigationBoard, {
			target: this._element,
			props: {
				locations: ALL_SIGIL_LOCATIONS,
				states: boardState.states,
				onAdvanceState: (locationId: string) => this._handleAdvanceState(locationId),
				onSetState: (locationId: string, targetState: RevealState) =>
					this._handleSetState(locationId, targetState),
				onResetLocation: (locationId: string) => this._handleResetLocation(locationId),
				onResetAll: () => this._handleResetAll(),
				onBulkSetState: (locationIds: string[], targetState: RevealState) =>
					this._handleBulkSetState(locationIds, targetState),
				onBulkReset: (locationIds: string[]) => this._handleBulkReset(locationIds),
				onToggleClue: (locationId: string, clueId: string) =>
					this._handleToggleClue(locationId, clueId),
				onUpdateGMNotes: (locationId: string, notes: string) =>
					this._handleUpdateGMNotes(locationId, notes),
				onOpenDetail: (locationId: string) => this._handleOpenDetail(locationId),
				onOpenJournal: (locationId: string) => this._handleOpenJournal(locationId),
			},
		});
	}

	private _focusWindow(): void {
		const el = document.getElementById('sigil-investigation-board');
		if (el) {
			(el as HTMLElement).style.zIndex = '9999';
		}
	}

	private _closeWindow(): void {
		const dialog = this._windowApp as { close?: () => void } | null;
		if (dialog?.close) {
			dialog.close();
		} else {
			this._cleanup();
		}
	}

	private _cleanup(): void {
		if (this._svelteInstance && this._element) {
			unmount(this._svelteInstance);
			this._svelteInstance = null;
		}
		this._element = null;
		this._windowApp = null;
		InvestigationBoardApp._instance = null;
	}

	// ========================================================================
	// Helpers
	// ========================================================================

	private _getScene(): SceneClass | null {
		const scene = canvas.scene;
		if (!scene || !game.user?.isGM) return null;
		return scene;
	}

	private _getLayer(): SigilMapLayer | undefined {
		return canvas.sigilMap as SigilMapLayer | undefined;
	}

	private _playRevealSound(state: RevealState): void {
		// Dispatch to the hook-based sound player
		Hooks.call('harbinger-house.playRevealSound', state);
	}

	// ========================================================================
	// Callback Handlers
	// ========================================================================

	private async _handleAdvanceState(locationId: string): Promise<void> {
		const scene = this._getScene();
		if (!scene) return;

		const result = await advanceLocationState(scene, locationId);
		if (result) {
			const isFirstDiscovery =
				result.previousRevealState === 'hidden'
				&& result.state.revealState === 'discovered';

			boardState.states[locationId] = result.state;
			if (isFirstDiscovery) {
				void this._getLayer()?.focusOnLocation(locationId);
			}
			this._getLayer()?.updateMarkerState(locationId, result.state, true);
			broadcastLocationStateChange(locationId, result.state, {
				focusCamera: isFirstDiscovery,
			});
			this._playRevealSound(result.state.revealState);
		}
	}

	private async _handleSetState(locationId: string, targetState: RevealState): Promise<void> {
		const scene = this._getScene();
		if (!scene) return;

		// For direct state setting (e.g. hidden→investigated), write the state directly
		const current = boardState.states[locationId] ?? createDefaultState();
		if (current.revealState === targetState) return;
		const isFirstDiscovery = current.revealState === 'hidden' && targetState === 'discovered';

		const newState: LocationState = {
			...current,
			revealState: targetState,
			updatedAt: Date.now(),
		};

		await scene.setFlag(MODULE_ID, `locationStates.${locationId}`, newState);
		boardState.states[locationId] = newState;
		if (isFirstDiscovery) {
			void this._getLayer()?.focusOnLocation(locationId);
		}
		this._getLayer()?.updateMarkerState(locationId, newState, true);
		broadcastLocationStateChange(locationId, newState, {
			focusCamera: isFirstDiscovery,
		});
		this._playRevealSound(targetState);
	}

	private async _handleResetLocation(locationId: string): Promise<void> {
		const scene = this._getScene();
		if (!scene) return;

		const newState = await resetLocationState(scene, locationId);
		boardState.states[locationId] = newState;
		this._getLayer()?.updateMarkerState(locationId, newState, false);
		broadcastLocationStateChange(locationId, newState);
	}

	private async _handleResetAll(): Promise<void> {
		const scene = this._getScene();
		if (!scene) return;

		const confirmed = await foundry.applications.api.DialogV2.confirm({
			window: { title: 'Reset All Locations' },
			content: '<p>Reset all location markers to hidden? This cannot be undone.</p>',
			rejectClose: false,
			modal: true,
		});

		if (!confirmed) return;

		await resetAllLocationStates(scene);

		// Update boardState for all locations
		for (const loc of ALL_SIGIL_LOCATIONS) {
			boardState.states[loc.id] = createDefaultState();
		}

		this._getLayer()?.refreshFromFlags();
		log('All Sigil locations reset to hidden');
	}

	private async _handleBulkSetState(
		locationIds: string[],
		targetState: RevealState,
	): Promise<void> {
		const scene = this._getScene();
		if (!scene) return;

		const updates: Record<string, LocationState> = {};
		for (const id of locationIds) {
			const current = boardState.states[id] ?? createDefaultState();
			updates[id] = {
				...current,
				revealState: targetState,
				updatedAt: Date.now(),
			};
		}

		await setBulkLocationStates(scene, updates);

		// Update boardState and broadcast
		for (const [id, state] of Object.entries(updates)) {
			boardState.states[id] = state;
			broadcastLocationStateChange(id, state);
		}

		this._getLayer()?.refreshFromFlags();
		this._playRevealSound(targetState);
		logDebug(`Bulk revealed ${locationIds.length} locations as ${targetState}`);
	}

	private async _handleBulkReset(locationIds: string[]): Promise<void> {
		const scene = this._getScene();
		if (!scene) return;

		const updates: Record<string, LocationState> = {};
		for (const id of locationIds) {
			updates[id] = createDefaultState();
		}

		await setBulkLocationStates(scene, updates);

		for (const [id, state] of Object.entries(updates)) {
			boardState.states[id] = state;
			broadcastLocationStateChange(id, state);
		}

		this._getLayer()?.refreshFromFlags();
		logDebug(`Bulk reset ${locationIds.length} locations`);
	}

	private async _handleToggleClue(locationId: string, clueId: string): Promise<void> {
		const scene = this._getScene();
		if (!scene) return;

		const newClues = await toggleClueDiscovered(scene, locationId, clueId);
		const current = boardState.states[locationId] ?? createDefaultState();
		boardState.states[locationId] = {
			...current,
			discoveredClues: newClues,
			updatedAt: Date.now(),
		};
	}

	private async _handleUpdateGMNotes(locationId: string, notes: string): Promise<void> {
		const scene = this._getScene();
		if (!scene) return;

		await setGMNotes(scene, locationId, notes);
		const current = boardState.states[locationId] ?? createDefaultState();
		boardState.states[locationId] = {
			...current,
			gmNotes: notes,
			updatedAt: Date.now(),
		};
	}

	private _handleOpenDetail(locationId: string): void {
		const location = getLocationById(locationId);
		if (!location) return;

		const state = boardState.states[locationId] ?? createDefaultState();
		Hooks.call('harbinger-house.openLocationDetail', location, state);
	}

	private _handleOpenJournal(locationId: string): void {
		const location = getLocationById(locationId);
		if (!location?.journalId) return;

		const journal = game.journal?.find(
			(j: JournalEntryClass) => j.flags?.[MODULE_ID]?.sourceId === location.journalId,
		);

		if (journal) {
			journal.sheet.render({ force: true });
		}
	}
}

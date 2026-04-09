import { log, logDebug, MODULE_ID, SETTINGS } from '../config';
import { ALL_SIGIL_LOCATIONS } from '../data/sigil-locations';
import type { SigilLocation } from '../data/sigil-locations';
import type { LocationState } from '../types/module-flags';
import { SigilMapMarker } from './SigilMapMarker';
import {
	getAllLocationStates,
	isSigilScene,
} from './sigil-map-state';

export class SigilMapLayer extends CanvasLayer {
	/** Map of location ID -> marker instance */
	private _markers: Map<string, SigilMapMarker> = new Map();

	/** Whether the layer is currently active (on Sigil scene) */
	private _active = false;

	/** Ticker callback reference for cleanup */
	private _tickerFn: ((dt: number) => void) | null = null;

	/** Reference to the currently open LocationDetailApp */
	private _detailApp: unknown = null;

	// ========================================================================
	// CanvasLayer options
	// ========================================================================

	static override get layerOptions(): { name: string; baseClass: typeof CanvasLayer } {
		return {
			...super.layerOptions,
			name: 'sigilMap',
		};
	}

	// ========================================================================
	// Lifecycle
	// ========================================================================

	/** Inner draw called by the CanvasLayer base class. */
	protected override async _draw(): Promise<void> {
		this.removeChildren();
		this._markers.clear();
		this._active = false;

		// Only activate on the Sigil scene
		const scene = canvas.scene;
		if (!scene || !isSigilScene(scene)) {
			this.visible = false;
			return;
		}

		// Check if feature is enabled
		try {
			if (!game.settings.get(MODULE_ID, SETTINGS.SIGIL_MAP_ENABLED)) {
				this.visible = false;
				return;
			}
		} catch {
			// Setting may not be registered yet during init
		}

		this._active = true;
		this.visible = true;

		// Enable pointer-event propagation to marker children.
		// eventMode = 'passive' lets the PIXI event system traverse into children.
		// hitArea must be set explicitly: without it, PIXI prunes this subtree via
		// getBounds() which can return stale/incorrect bounds for CanvasLayer
		// containers, causing markers to be non-interactive despite being visible.
		(this as CanvasLayer & { eventMode?: string }).eventMode = 'passive';
		this.interactiveChildren = true;

		const dims = (canvas as unknown as { dimensions?: { sceneWidth: number; sceneHeight: number } }).dimensions;
		if (dims) {
			this.hitArea = new PIXI.Rectangle(0, 0, dims.sceneWidth, dims.sceneHeight);
		}

		log('Drawing Sigil Investigation Map layer');

		// Read current state from scene flags
		const states = getAllLocationStates(scene);

		// Create markers for all locations
		for (const location of ALL_SIGIL_LOCATIONS) {
			const state = states[location.id] ?? {
				revealState: 'hidden' as const,
				updatedAt: Date.now(),
				discoveredClues: [],
			};
			this._createMarker(location, state);
		}

		// Start ambient animation ticker
		this._startTicker();

		logDebug(`Sigil map layer drawn with ${this._markers.size} markers`);
	}

	/** Inner tearDown called by the CanvasLayer base class. */
	protected override async _tearDown(): Promise<void> {
		this._stopTicker();
		this._markers.clear();
		this.removeChildren();
		this._active = false;
	}

	// ========================================================================
	// Marker Management
	// ========================================================================

	private _createMarker(location: SigilLocation, state: LocationState): SigilMapMarker {
		const marker = new SigilMapMarker(location, state);

		marker.onClick = (m) => this._onMarkerClick(m);
		marker.onContextMenu = (m, event) => this._onMarkerContextMenu(m, event);

		this.addChild(marker);
		this._markers.set(location.id, marker);
		return marker;
	}

	/** Get a marker by location ID */
	getMarker(locationId: string): SigilMapMarker | undefined {
		return this._markers.get(locationId);
	}

	/** Get all markers */
	getAllMarkers(): SigilMapMarker[] {
		return Array.from(this._markers.values());
	}

	// ========================================================================
	// State Updates
	// ========================================================================

	/**
	 * Update a location's visual state. Called when flags change or socket messages arrive.
	 * @param locationId - The location to update
	 * @param newState - The new state
	 * @param animate - Whether to play the transition animation
	 */
	updateMarkerState(locationId: string, newState: LocationState, animate: boolean): void {
		const marker = this._markers.get(locationId);
		if (!marker) return;

		logDebug(`Updating marker ${locationId} to ${newState.revealState}`, { animate });
		marker.setState(newState, animate);
	}

	/**
	 * Refresh all markers from scene flags (used after bulk operations or sync).
	 */
	refreshFromFlags(): void {
		const scene = canvas.scene;
		if (!scene || !this._active) return;

		const states = getAllLocationStates(scene);
		for (const [locationId, marker] of this._markers) {
			const state = states[locationId] ?? {
				revealState: 'hidden' as const,
				updatedAt: Date.now(),
				discoveredClues: [],
			};
			marker.setState(state, false);
		}
	}

	// ========================================================================
	// Interaction Handlers
	// ========================================================================

	private async _onMarkerClick(marker: SigilMapMarker): Promise<void> {
		// Open detail panel if the location is revealed (for both GM and players)
		if (marker.revealState !== 'hidden') {
			this._openDetailPanel(marker);
		}
	}

	private _onMarkerContextMenu(marker: SigilMapMarker, _event: unknown): void {
		if (!game.user?.isGM) return;

		// GM context menu handled by sigil-map-hooks.ts
		// Dispatch a custom event that the hook system picks up
		Hooks.call('harbinger-house.markerContext', marker, _event);
	}

	private _openDetailPanel(marker: SigilMapMarker): void {
		// Dispatch event for the LocationDetailApp to handle
		Hooks.call('harbinger-house.openLocationDetail', marker.location, marker.state);
	}

	private _broadcastStateChange(locationId: string, state: LocationState): void {
		// Dispatch for socket handler to pick up
		Hooks.call('harbinger-house.broadcastLocationState', locationId, state);
	}

	// ========================================================================
	// Animation Ticker
	// ========================================================================

	private _startTicker(): void {
		if (this._tickerFn) return;

		let lastTime = performance.now();

		this._tickerFn = () => {
			const now = performance.now();
			const deltaMs = now - lastTime;
			lastTime = now;

			for (const marker of this._markers.values()) {
				marker.tick(deltaMs);
			}
		};

		canvas.app.ticker.add(this._tickerFn);
	}

	private _stopTicker(): void {
		if (this._tickerFn) {
			canvas.app.ticker.remove(this._tickerFn);
			this._tickerFn = null;
		}
	}

	// ========================================================================
	// Detail App Reference (for cleanup)
	// ========================================================================

	get detailApp(): unknown {
		return this._detailApp;
	}

	set detailApp(app: unknown) {
		this._detailApp = app;
	}
}

import { log, logDebug, MODULE_ID, SETTINGS } from '../config';
import { ALL_SIGIL_LOCATIONS } from '../data/sigil-locations';
import type { SigilLocation } from '../data/sigil-locations';
import type { LocationState } from '../types/module-flags';
import { CAMERA_FOCUS } from './constants';
import { SigilMapMarker } from './SigilMapMarker';
import {
	getAllLocationStates,
	isSigilScene,
} from './sigil-map-state';

const CanvasLayerBase = foundry.canvas.layers.CanvasLayer;

export class SigilMapLayer extends CanvasLayerBase {
	/** Map of location ID -> marker instance */
	private _markers: Map<string, SigilMapMarker> = new Map();

	/** Whether the layer is currently active (on Sigil scene) */
	private _active = false;

	/** Ticker callback reference for cleanup */
	private _tickerFn: ((dt: number) => void) | null = null;

	/** Reference to the currently open LocationDetailApp */
	private _detailApp: unknown = null;

	/** Currently hovered marker (for DOM-based interaction) */
	private _hoveredMarker: SigilMapMarker | null = null;

	/** Registered DOM event handlers for cleanup */
	private _domHandlers: { event: string; fn: EventListener }[] = [];

	/** Last stage zoom used to scale markers. */
	private _lastStageZoom: number | null = null;

	// ========================================================================
	// CanvasLayer options
	// ========================================================================

	static override get layerOptions(): { name: string; baseClass: typeof CanvasLayerBase } {
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
		this._cleanupDomListeners();

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

		// Sync initial marker scale to current canvas zoom.
		this._syncMarkerZoomScaling(true);

		// Wire DOM-level pointer events on the canvas element.
		// We bypass PIXI's event propagation entirely because CanvasLayer
		// sits inside Foundry's InterfaceCanvasGroup where the active
		// InteractionLayer intercepts pointer events before they can
		// reach a plain CanvasLayer's children.
		this._setupDomListeners();

		// Start ambient animation ticker
		this._startTicker();

		logDebug(`Sigil map layer drawn with ${this._markers.size} markers`);
	}

	/** Inner tearDown called by the CanvasLayer base class. */
	protected override async _tearDown(): Promise<void> {
		this._cleanupDomListeners();
		this._stopTicker();
		this._markers.clear();
		this.removeChildren();
		this._active = false;
		this._lastStageZoom = null;
	}

	// ========================================================================
	// Marker Management
	// ========================================================================

	private _createMarker(location: SigilLocation, state: LocationState): SigilMapMarker {
		const marker = new SigilMapMarker(location, state);
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

	/**
	 * Pan+zoom the canvas camera to a specific location marker.
	 * The zoom never forces a zoom-out if the user is already closer.
	 */
	async focusOnLocation(locationId: string): Promise<void> {
		if (!this._active) return;

		const marker = this._markers.get(locationId);
		if (!marker) return;

		if (typeof canvas.animatePan !== 'function') return;
		if (!canvas.scene) return;

		const currentScaleRaw = canvas.stage?.scale?.x;
		const currentScale = Number.isFinite(currentScaleRaw) && currentScaleRaw > 0
			? currentScaleRaw
			: 1;

		const targetScale = Math.max(currentScale, CAMERA_FOCUS.DISCOVERY_SCALE);

		await canvas.animatePan({
			x: marker.location.x,
			y: marker.location.y,
			scale: targetScale,
			duration: CAMERA_FOCUS.DISCOVERY_DURATION,
		});
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
	// DOM-based Interaction
	// ========================================================================

	private _setupDomListeners(): void {
		const view = canvas.app?.view as HTMLCanvasElement | undefined;
		if (!view) return;

		const onMove = (e: PointerEvent) => this._onPointerMove(e);
		const onClick = (e: PointerEvent) => this._onPointerClick(e);
		const onContext = (e: PointerEvent) => this._onPointerContext(e);

		view.addEventListener('pointermove', onMove);
		view.addEventListener('pointerdown', onClick);
		view.addEventListener('contextmenu', onContext);

		this._domHandlers = [
			{ event: 'pointermove', fn: onMove as EventListener },
			{ event: 'pointerdown', fn: onClick as EventListener },
			{ event: 'contextmenu', fn: onContext as EventListener },
		];

		logDebug('DOM interaction listeners attached to canvas');
	}

	private _cleanupDomListeners(): void {
		const view = canvas.app?.view as HTMLCanvasElement | undefined;
		if (view) {
			for (const { event, fn } of this._domHandlers) {
				view.removeEventListener(event, fn);
			}
		}
		this._domHandlers = [];
		this._hoveredMarker = null;
	}

	/** Convert DOM client coordinates to this layer's local (scene) coordinates. */
	private _clientToLocal(clientX: number, clientY: number): { x: number; y: number } | null {
		const view = canvas.app?.view as HTMLCanvasElement | undefined;
		if (!view) return null;

		const rect = view.getBoundingClientRect();
		// DOM client coords → renderer pixel coords
		const scaleX = view.width / rect.width;
		const scaleY = view.height / rect.height;
		const rx = (clientX - rect.left) * scaleX;
		const ry = (clientY - rect.top) * scaleY;

		// Renderer coords → layer local coords via inverse world transform
		const tempPoint = new PIXI.Point(rx, ry);
		const wt = this.worldTransform;
		// Manually apply the inverse to avoid allocating a second Point
		const id = 1 / (wt.a * wt.d - wt.b * wt.c);
		const dx = tempPoint.x - wt.tx;
		const dy = tempPoint.y - wt.ty;
		return {
			x: (wt.d * dx - wt.c * dy) * id,
			y: (wt.a * dy - wt.b * dx) * id,
		};
	}

	/** Find the closest revealed marker within hit radius of a local point. */
	private _findMarkerAt(lx: number, ly: number): SigilMapMarker | undefined {
		let closest: SigilMapMarker | undefined;
		let closestDist = Number.POSITIVE_INFINITY;

		for (const marker of this._markers.values()) {
			if (marker.revealState === 'hidden') continue;
			const dx = lx - marker.location.x;
			const dy = ly - marker.location.y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist <= marker.hitRadius && dist < closestDist) {
				closestDist = dist;
				closest = marker;
			}
		}
		return closest;
	}

	private _onPointerMove(e: PointerEvent): void {
		if (!this._active) return;
		const local = this._clientToLocal(e.clientX, e.clientY);
		if (!local) return;

		const marker = this._findMarkerAt(local.x, local.y);

		if (marker !== this._hoveredMarker) {
			this._hoveredMarker?.setHovered(false);
			if (marker) {
				// Keep the hovered marker's hover plaque/text above neighboring markers.
				this.addChild(marker);
				marker.setHovered(true);
			}
			this._hoveredMarker = marker ?? null;

			// Update cursor on the canvas element
			const view = canvas.app?.view as HTMLCanvasElement | undefined;
			if (view) {
				view.style.cursor = marker ? 'pointer' : '';
			}
		}
	}

	private _onPointerClick(e: PointerEvent): void {
		// Only handle left click
		if (!this._active || e.button !== 0) return;
		const local = this._clientToLocal(e.clientX, e.clientY);
		if (!local) return;

		const marker = this._findMarkerAt(local.x, local.y);
		if (marker) {
			this._onMarkerClick(marker);
		}
	}

	private _onPointerContext(e: PointerEvent): void {
		if (!this._active || !game.user?.isGM) return;
		const local = this._clientToLocal(e.clientX, e.clientY);
		if (!local) return;

		const marker = this._findMarkerAt(local.x, local.y);
		if (marker) {
			e.preventDefault();
			// Store client coords for context menu positioning
			this._onMarkerContextMenu(marker, {
				data: { originalEvent: { clientX: e.clientX, clientY: e.clientY } },
			});
		}
	}

	// ========================================================================
	// Interaction Handlers
	// ========================================================================

	private async _onMarkerClick(marker: SigilMapMarker): Promise<void> {
		if (marker.revealState !== 'hidden') {
			this._openDetailPanel(marker);
		}
	}

	private _onMarkerContextMenu(marker: SigilMapMarker, event: unknown): void {
		if (!game.user?.isGM) return;
		Hooks.call('harbinger-house.markerContext', marker, event);
	}

	private _openDetailPanel(marker: SigilMapMarker): void {
		Hooks.call('harbinger-house.openLocationDetail', marker.location, marker.state);
	}

	// ========================================================================
	// Animation Ticker
	// ========================================================================

	private _startTicker(): void {
		if (this._tickerFn) return;

		let lastTime = performance.now();

		this._tickerFn = () => {
			this._syncMarkerZoomScaling();

			const now = performance.now();
			const deltaMs = now - lastTime;
			lastTime = now;

			for (const marker of this._markers.values()) {
				marker.tick(deltaMs);
			}
		};

		canvas.app.ticker.add(this._tickerFn);
	}

	private _syncMarkerZoomScaling(force = false): void {
		const rawZoom = canvas.stage?.scale?.x;
		const zoom = Number.isFinite(rawZoom) && rawZoom > 0 ? rawZoom : 1;

		if (!force && this._lastStageZoom !== null && Math.abs(zoom - this._lastStageZoom) < 0.001) {
			return;
		}

		this._lastStageZoom = zoom;
		for (const marker of this._markers.values()) {
			marker.setZoomCompensation(zoom);
		}
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

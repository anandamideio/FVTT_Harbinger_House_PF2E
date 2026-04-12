import { mount, unmount } from 'svelte';
import { MODULE_ID } from '../config';
import type { SigilLocation } from '../data/sigil-locations';
import type { RevealState } from '../data/sigil-locations';
import type { LocationState } from '../types/module-flags';
import LocationDetail from './LocationDetail.svelte';
import {
	getLocationState,
	setGMNotes,
	setLocationRevealState,
	toggleClueDiscovered,
} from './sigil-map-state';
import { broadcastLocationStateChange } from './sigil-map-sockets';
import type { SigilMapLayer } from './SigilMapLayer';

/** open detail apps by location ID */
const openApps = new Map<string, LocationDetailApp>();

export class LocationDetailApp {
	private _location: SigilLocation;
	private _state: LocationState;
	private _element: HTMLElement | null = null;
	private _svelteInstance: ReturnType<typeof mount> | null = null;
	private _windowApp: unknown = null;

	static get(locationId: string): LocationDetailApp | undefined {
		return openApps.get(locationId);
	}

	constructor(location: SigilLocation, state: LocationState) {
		this._location = location;
		this._state = state;
	}

	/**
	 * Open the detail panel for a location.
	 * If one is already open for this location, focus it instead.
	 */
	static open(location: SigilLocation, state: LocationState): LocationDetailApp {
		const existing = openApps.get(location.id);
		if (existing) {
			existing._focusWindow();
			return existing;
		}

		const app = new LocationDetailApp(location, state);
		app._render();
		openApps.set(location.id, app);
		return app;
	}

	/** Close and clean up */
	close(): void {
		if (this._svelteInstance && this._element) {
			unmount(this._svelteInstance);
			this._svelteInstance = null;
		}
		if (this._element) {
			// Close the Foundry dialog/window
			this._element.closest('.app')?.querySelector<HTMLElement>('.header-button.close')?.click();
			this._element = null;
		}
		openApps.delete(this._location.id);
	}

	/** Update the state displayed in the panel */
	updateState(state: LocationState): void {
		this._state = state;
		// Re-render the Svelte component with new state
		if (this._svelteInstance && this._element) {
			unmount(this._svelteInstance);
			this._mountSvelte();
		}
	}

	private _render(): void {
		// Create a Foundry Dialog as the container
		const dialog = new Dialog({
			title: this._location.name,
			content: '<div class="sigil-location-detail-mount"></div>',
			buttons: {},
			default: '',
			render: (html: HTMLElement | JQuery) => {
				const el = html instanceof HTMLElement ? html : (html as unknown as HTMLElement[])[0];
				const mountPoint = el?.querySelector?.('.sigil-location-detail-mount')
					?? (el as HTMLElement);

				if (mountPoint) {
					this._element = mountPoint as HTMLElement;
					this._mountSvelte();
				}
			},
			close: () => {
				if (this._svelteInstance && this._element) {
					unmount(this._svelteInstance);
					this._svelteInstance = null;
				}
				this._element = null;
				openApps.delete(this._location.id);
			},
		}, {
			classes: ['harbinger-house', 'sigil-location-detail'],
			width: 420,
			height: 'auto' as unknown as number,
			resizable: true,
			minimizable: true,
			id: `sigil-location-${this._location.id}`,
		});

		dialog.render(true);
		this._windowApp = dialog;
	}

	private _mountSvelte(): void {
		if (!this._element) return;

		const isGM = game.user?.isGM ?? false;

		this._svelteInstance = mount(LocationDetail, {
			target: this._element,
			props: {
				location: this._location,
				state: this._state,
				isGM,
				onToggleClue: (clueId: string) => this._handleToggleClue(clueId),
				onAdvanceState: (newState: 'discovered' | 'investigated') => this._handleAdvanceState(newState),
				onOpenJournal: () => this._handleOpenJournal(),
				onUpdateGMNotes: (notes: string) => this._handleUpdateGMNotes(notes),
			},
		});
	}

	private _focusWindow(): void {
		// Try to bring the existing dialog to front
		const el = document.getElementById(`sigil-location-${this._location.id}`);
		if (el) {
			(el as HTMLElement).style.zIndex = '9999';
		}
	}

	// ========================================================================
	// Event Handlers
	// ========================================================================

	private async _handleToggleClue(clueId: string): Promise<void> {
		const scene = canvas.scene;
		if (!scene || !game.user?.isGM) return;

		await toggleClueDiscovered(scene, this._location.id, clueId);
		this._refreshState();
	}

	private async _handleAdvanceState(target: RevealState): Promise<void> {
		const scene = canvas.scene;
		if (!scene || !game.user?.isGM) return;

		const previousRevealState = this._state.revealState;

		const newState = await setLocationRevealState(scene, this._location.id, target);
		if (newState) {
			this._state = newState;
			const isFirstDiscovery =
				previousRevealState === 'hidden'
				&& newState.revealState === 'discovered';

			// Update the canvas marker
			const layer = canvas.sigilMap as SigilMapLayer | undefined;
			if (isFirstDiscovery) {
				void layer?.focusOnLocation(this._location.id);
			}
			layer?.updateMarkerState(this._location.id, newState, true);

			// Broadcast to other clients
			broadcastLocationStateChange(this._location.id, newState, {
				focusCamera: isFirstDiscovery,
			});

			// Refresh our panel
			this.updateState(newState);
		}
	}

	private _handleOpenJournal(): void {
		if (!this._location.journalId) return;

		// Find the journal by its module source ID
		const journal = game.journal?.find(
			(j: JournalEntryClass) => j.flags?.[MODULE_ID]?.sourceId === this._location.journalId
		);

		if (journal) {
			journal.sheet.render({ force: true });
		}
	}

	private async _handleUpdateGMNotes(notes: string): Promise<void> {
		const scene = canvas.scene;
		if (!scene || !game.user?.isGM) return;

		await setGMNotes(scene, this._location.id, notes);
	}

	private _refreshState(): void {
		const scene = canvas.scene;
		if (!scene) return;

		const newState = getLocationState(scene, this._location.id);
		this.updateState(newState);
	}
}

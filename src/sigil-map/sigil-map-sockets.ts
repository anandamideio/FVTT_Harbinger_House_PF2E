import { log, logDebug, MODULE_ID } from '../config';
import type { LocationState } from '../types/module-flags';
import { InvestigationBoardApp } from './InvestigationBoardApp';
import { getAllLocationStates, getSigilScene } from './sigil-map-state';

/**
 * Sigil Investigation Map - Socket Handlers
 *
 * @NOTE Scene flags are the source of truth; sockets only trigger animations on other clients.
 */

// ============================================================================
// Socket Message Types
// ============================================================================

interface UpdateLocationMessage {
	type: 'updateLocationState';
	locationId: string;
	newState: LocationState;
	focusCamera?: boolean;
	/** User who triggered the state change, used to skip re-playing animations/sounds on the initiator. */
	initiatorId?: string;
	/** Sound file to play for this transition (picked by the GM so all clients stay in sync). */
	soundSrc?: string;
}

interface RequestRefreshMessage {
	type: 'requestRefresh';
	requesterId: string;
}

interface FullStateSyncMessage {
	type: 'fullStateSync';
	states: Record<string, LocationState>;
	targetId: string;
}

type SocketMessage = UpdateLocationMessage | RequestRefreshMessage | FullStateSyncMessage;

interface BroadcastLocationOptions {
	focusCamera?: boolean;
	soundSrc?: string;
}

const SOCKET_NAME = `module.${MODULE_ID}`;

// ============================================================================
// Registration
// ============================================================================

/** Register socket handlers. Call once during 'ready' hook. */
export function registerSigilMapSockets(): void {
	game.socket.on(SOCKET_NAME, (data: unknown) => handleSocketMessage(data as SocketMessage));
	log('Sigil map socket handlers registered');

	// Listen for internal broadcast events from the layer
	Hooks.on('harbinger-house.broadcastLocationState', (...args: unknown[]) => {
		broadcastLocationStateChange(
			args[0] as string,
			args[1] as LocationState,
			args[2] as BroadcastLocationOptions | undefined,
		);
	});
}

// ============================================================================
// Message Handling
// ============================================================================

function handleSocketMessage(message: SocketMessage): void {
	logDebug('Sigil map socket message received:', message.type);

	switch (message.type) {
		case 'updateLocationState':
			handleUpdateLocation(message);
			break;
		case 'requestRefresh':
			handleRefreshRequest(message);
			break;
		case 'fullStateSync':
			handleFullStateSync(message);
			break;
	}
}

function handleUpdateLocation(message: UpdateLocationMessage): void {
	// Update the local canvas layer with animation
	const layer = canvas.sigilMap as import('./SigilMapLayer').SigilMapLayer | undefined;
	if (layer) {
		const shouldFocusCamera =
			message.focusCamera === true
			&& message.newState.revealState === 'discovered'
			&& message.initiatorId !== game.user?.id;

		if (shouldFocusCamera) {
			void layer.focusOnLocation(message.locationId);
		}

		layer.updateMarkerState(message.locationId, message.newState, true);
	}

	if (message.soundSrc && message.initiatorId !== game.user?.id) {
		Hooks.call('harbinger-house.playRevealSound', message.newState.revealState, message.soundSrc);
	}
}

function handleRefreshRequest(message: RequestRefreshMessage): void {
	// Only the GM responds to refresh requests
	if (!game.user?.isGM) return;

	const scene = getSigilScene();
	if (!scene) return;

	const states = getAllLocationStates(scene);
	emitSocket({
		type: 'fullStateSync',
		states,
		targetId: message.requesterId,
	});
}

function handleFullStateSync(message: FullStateSyncMessage): void {
	// Only process if this message is for us
	if (message.targetId !== game.user?.id) return;

	const layer = canvas.sigilMap as import('./SigilMapLayer').SigilMapLayer | undefined;
	if (!layer) return;

	for (const [locationId, state] of Object.entries(message.states)) {
		layer.updateMarkerState(locationId, state, false);
	}

	// Also refresh the Investigation Board if open
	InvestigationBoardApp.instance?.refreshFromFlags();
}

// ============================================================================
// Outbound Messages
// ============================================================================

function emitSocket(message: SocketMessage): void {
	game.socket.emit(SOCKET_NAME, message);
}

/** Broadcast a location state change to all other clients (GM action) */
export function broadcastLocationStateChange(
	locationId: string,
	newState: LocationState,
	options?: BroadcastLocationOptions,
): void {
	const focusCamera = options?.focusCamera === true;

	emitSocket({
		type: 'updateLocationState',
		locationId,
		newState,
		focusCamera,
		initiatorId: game.user?.id,
		soundSrc: options?.soundSrc,
	});
}

/** Request a full state sync from the GM (player joining mid-session) */
export function requestStateRefresh(): void {
	if (!game.user) return;
	emitSocket({
		type: 'requestRefresh',
		requesterId: game.user.id,
	});
}

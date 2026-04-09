import { MODULE_ID } from '../config';
import type { RevealState } from '../data/sigil-locations';
import type { LocationState } from '../types/module-flags';
import { SIGIL_SCENE_ID } from './constants';

// ============================================================================
// State Defaults
// ============================================================================

/** Create a default hidden state for a location */
export function createDefaultState(): LocationState {
	return {
		revealState: 'hidden',
		updatedAt: Date.now(),
		discoveredClues: [],
	};
}

// ============================================================================
// Transition Validation
// ============================================================================

/** Valid state transitions: hidden -> discovered -> investigated */
const VALID_TRANSITIONS: Record<RevealState, RevealState[]> = {
	hidden: ['discovered'],
	discovered: ['investigated'],
	investigated: [],
};

/** Check if a state transition is valid (forward only) */
export function isValidTransition(from: RevealState, to: RevealState): boolean {
	return VALID_TRANSITIONS[from].includes(to);
}

/** Get the next valid state, or null if already at max */
export function getNextState(current: RevealState): RevealState | null {
	const transitions = VALID_TRANSITIONS[current];
	return transitions.length > 0 ? transitions[0] : null;
}

// ============================================================================
// Scene Identification
// ============================================================================

/** Check if a scene is the Sigil investigation map */
export function isSigilScene(scene: { flags?: Record<string, Record<string, unknown>> }): boolean {
	return scene.flags?.[MODULE_ID]?.sourceId === SIGIL_SCENE_ID;
}

/** Get the Sigil scene from the game's scene collection */
export function getSigilScene(): SceneClass | undefined {
	return game.scenes?.find((s: SceneClass) => isSigilScene(s));
}

// ============================================================================
// State Read
// ============================================================================

/** Get all location states from the Sigil scene flags */
export function getAllLocationStates(scene: SceneClass): Record<string, LocationState> {
	const states = scene.flags?.[MODULE_ID]?.locationStates as Record<string, LocationState> | undefined;
	return states ?? {};
}

/** Get a single location's state, returning default (hidden) if not set */
export function getLocationState(scene: SceneClass, locationId: string): LocationState {
	const states = getAllLocationStates(scene);
	return states[locationId] ?? createDefaultState();
}

// ============================================================================
// State Write (GM only)
// ============================================================================

/**
 * Update a single location's reveal state on the scene.
 * Returns the new state, or null if the transition was invalid.
 */
export async function setLocationRevealState(
	scene: SceneClass,
	locationId: string,
	newRevealState: RevealState,
): Promise<LocationState | null> {
	const current = getLocationState(scene, locationId);

	// Allow setting to same state (idempotent) or valid forward transition
	if (current.revealState !== newRevealState && !isValidTransition(current.revealState, newRevealState)) {
		return null;
	}

	const updatedState: LocationState = {
		...current,
		revealState: newRevealState,
		updatedAt: Date.now(),
	};

	await scene.setFlag(MODULE_ID, `locationStates.${locationId}`, updatedState);
	return updatedState;
}

/**
 * Advance a location to its next state.
 * Returns the new state, or null if already at max.
 */
export async function advanceLocationState(
	scene: SceneClass,
	locationId: string,
): Promise<{ state: LocationState; previousRevealState: RevealState } | null> {
	const current = getLocationState(scene, locationId);
	const next = getNextState(current.revealState);

	if (!next) return null;

	const updatedState = await setLocationRevealState(scene, locationId, next);
	if (!updatedState) return null;

	return { state: updatedState, previousRevealState: current.revealState };
}

/**
 * Reset a location back to hidden (GM correction tool).
 */
export async function resetLocationState(scene: SceneClass, locationId: string): Promise<LocationState> {
	const defaultState = createDefaultState();
	await scene.setFlag(MODULE_ID, `locationStates.${locationId}`, defaultState);
	return defaultState;
}

/**
 * Reset all locations to hidden.
 */
export async function resetAllLocationStates(scene: SceneClass): Promise<void> {
	await scene.setFlag(MODULE_ID, 'locationStates', {});
}

// ============================================================================
// Clue Tracking
// ============================================================================

/**
 * Toggle an optional clue's discovered status.
 * Returns the updated list of discovered clue IDs.
 */
export async function toggleClueDiscovered(
	scene: SceneClass,
	locationId: string,
	clueId: string,
): Promise<string[]> {
	const current = getLocationState(scene, locationId);
	const clues = [...current.discoveredClues];

	const index = clues.indexOf(clueId);
	if (index >= 0) {
		clues.splice(index, 1);
	} else {
		clues.push(clueId);
	}

	const updatedState: LocationState = {
		...current,
		discoveredClues: clues,
		updatedAt: Date.now(),
	};

	await scene.setFlag(MODULE_ID, `locationStates.${locationId}`, updatedState);
	return clues;
}

/**
 * Write multiple location states in a single flag update.
 * Used by the Investigation Board for bulk operations.
 */
export async function setBulkLocationStates(
	scene: SceneClass,
	updates: Record<string, LocationState>,
): Promise<void> {
	const existing = getAllLocationStates(scene);
	const merged = { ...existing, ...updates };
	await scene.setFlag(MODULE_ID, 'locationStates', merged);
}

/**
 * Set GM notes for a location.
 */
export async function setGMNotes(
	scene: SceneClass,
	locationId: string,
	notes: string,
): Promise<void> {
	const current = getLocationState(scene, locationId);
	const updatedState: LocationState = {
		...current,
		gmNotes: notes,
		updatedAt: Date.now(),
	};
	await scene.setFlag(MODULE_ID, `locationStates.${locationId}`, updatedState);
}

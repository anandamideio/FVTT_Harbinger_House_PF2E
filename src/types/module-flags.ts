import type { RevealState } from '../data/content/sigil-locations';

/** Flags stored on imported actors */
export interface HarbingerHouseFlags {
	/** Whether this actor was imported by the module */
	imported: boolean;
	/** Source NPC ID from the module data */
	sourceId: string;
	/** Import timestamp */
	importedAt?: number;
}

// ============================================================================
// Sigil Investigation Map Flags
// ============================================================================

/** Per-location state stored on the Sigil scene via module flags */
export interface LocationState {
	revealState: RevealState;
	/** Timestamp of last state change */
	updatedAt: number;
	/** Which optional clues have been checked off (array of clue IDs) */
	discoveredClues: string[];
	/** GM-only notes */
	gmNotes?: string;
}

/** Flags stored on the Sigil scene document */
export interface SigilLocationFlags {
	locationStates: Record<string, LocationState>;
	/** Round-robin index for the discovery sound rotation (0-based). */
	discoveryCycleIndex?: number;
}

/** Flags stored on individual Note documents embedded in the Sigil scene */
export interface SigilNoteFlags {
	sigilLocationId: string;
	category: string;
}

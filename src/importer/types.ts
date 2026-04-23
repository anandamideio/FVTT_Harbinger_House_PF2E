/**
 * Shared types for the importer package.
 *
 * Lives in its own module so actions, helpers, and the pipeline can import
 * without cycling through the sheet class.
 */

export type ImportOptionKey = 'customizeLogin' | 'displayJournal' | 'activateScene';

export interface ImportBootstrapConfig {
	initialSceneId: string;
	initialSceneSourceId: string;
	initialSceneName: string;
	initialJournalEntryId: string;
	initialLoginScreenBackground: string;
}

/** Uniform debug logger supplied to helpers and actions by the pipeline. */
export type ImportDebug = (message: string, data?: Record<string, unknown>) => void;

/** Execution context passed to every post-import action. */
export interface ImportContext {
	document: AdventureLike;
	bootstrap: ImportBootstrapConfig;
	debug: ImportDebug;
}

/** Minimal shape of the Adventure document surface used by actions. */
export interface AdventureLike {
	id?: string;
	name?: string;
	description?: string;
}

export type DocumentMap = Record<string, Record<string, unknown>[]>;

export interface PreImportPayload {
	toCreate: DocumentMap;
	toUpdate: DocumentMap;
}

export type ActorImportData = Record<string, unknown> & {
	name?: string;
	img?: string;
	prototypeToken?: Record<string, unknown>;
	items?: Record<string, unknown>[];
	flags?: Record<string, Record<string, unknown>>;
	_stats?: {
		compendiumSource?: string;
	};
};

export type SystemItemReferenceData = {
	type?: string;
	uuid?: string;
	runes?: {
		potency?: number;
		striking?: string;
		property?: string[];
	};
	customName?: string;
	customDescription?: string;
	heightenedLevel?: number;
	tradition?: string;
	entryId?: string;
};

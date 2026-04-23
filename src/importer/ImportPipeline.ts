import { logDebug, logError } from '../config';
import { ActivateInitialScene } from './actions/ActivateInitialScene';
import { CustomizeLoginScreen } from './actions/CustomizeLoginScreen';
import { DisplayInitialJournal } from './actions/DisplayInitialJournal';
import type { ImportAction } from './actions/ImportAction';
import {
	mergeCompendiumActors,
	resolveActorItemReferences,
} from './helpers/actor-import-data';
import { normalizeSceneBestiaryTokenArt } from './helpers/bestiary-tokens';
import { summarizeDocumentCounts } from './helpers/document-summary';
import {
	ensureActorFolderHierarchy,
	ensureItemFolderHierarchy,
	ensureJournalFolderHierarchy,
	ensureSceneFolderHierarchy,
} from './helpers/folder-hierarchies';
import type {
	ImportContext,
	ImportDebug,
	ImportOptionKey,
	PreImportPayload,
} from './types';

/**
 * Default ordering of post-import actions. Add new actions here (and a matching
 * key to ImportOptions.table) to expand the option dialog.
 */
export const DEFAULT_IMPORT_ACTIONS: ImportAction[] = [
	new CustomizeLoginScreen(),
	new DisplayInitialJournal(),
	new ActivateInitialScene(),
];

/**
 * Orchestrates pre-import and post-import work for a single adventure import.
 *
 * The sheet class (`HarbingerHouseImporter`) delegates to this pipeline so it
 * stays focused on Foundry's sheet lifecycle. Folder reconciliation,
 * compendium actor merges, and action dispatch all live here.
 */
export class ImportPipeline {
	private actorFolderHierarchyDeferred = false;

	constructor(
		private readonly actions: ImportAction[] = DEFAULT_IMPORT_ACTIONS,
		private readonly debug: ImportDebug = defaultDebug,
	) {}

	async preImport(data: PreImportPayload, importOptions: Record<string, boolean>): Promise<void> {
		this.debug('preImport hook called');
		this.debug('preImport payload', {
			importOptions,
			toCreate: summarizeDocumentCounts(data.toCreate),
			toUpdate: summarizeDocumentCounts(data.toUpdate),
		});

		if ('Actor' in data.toCreate) {
			this.debug('preImport processing Actor.toCreate', {
				count: data.toCreate.Actor.length,
			});
			await resolveActorItemReferences(data.toCreate.Actor, this.debug);
			await mergeCompendiumActors(data.toCreate.Actor, this.debug);
		}
		if ('Actor' in data.toUpdate) {
			this.debug('preImport processing Actor.toUpdate', {
				count: data.toUpdate.Actor.length,
			});
			await resolveActorItemReferences(data.toUpdate.Actor, this.debug);
			await mergeCompendiumActors(data.toUpdate.Actor, this.debug);
		}

		this.debug('preImport complete');
	}

	async postImport(
		importResult: Record<string, unknown>,
		resolvedOptions: Record<ImportOptionKey, boolean>,
		context: ImportContext,
	): Promise<void> {
		this.debug('postImport hook called', {
			resolvedOptions,
			created: summarizeDocumentCounts((importResult as { created?: unknown }).created),
			updated: summarizeDocumentCounts((importResult as { updated?: unknown }).updated),
		});

		// Folder hierarchy reconciliation
		await this.safeStep('ensureJournalFolderHierarchy', () =>
			ensureJournalFolderHierarchy(this.debug),
		);
		await this.safeStep('ensureActorFolderHierarchy', async () => {
			const completed = await ensureActorFolderHierarchy(this.debug);
			if (!completed) this.deferActorFolderHierarchyUntilCanvasReady();
		});
		await this.safeStep('ensureItemFolderHierarchy', () => ensureItemFolderHierarchy(this.debug));
		await this.safeStep('ensureSceneFolderHierarchy', () => ensureSceneFolderHierarchy(this.debug));
		await this.safeStep('normalizeSceneBestiaryTokenArt', () =>
			normalizeSceneBestiaryTokenArt(this.debug),
		);

		// Execute enabled post-import actions declaratively.
		for (const action of this.actions) {
			if (!resolvedOptions[action.key]) {
				this.debug('postImport action disabled', { key: action.key });
				continue;
			}
			await this.safeStep(action.key, () => action.apply(context));
		}

		this.debug('postImport complete');
	}

	/** Wrap a post-import step with uniform debug logging and error capture. */
	private async safeStep(name: string, step: () => Promise<void>): Promise<void> {
		try {
			this.debug(`postImport step start: ${name}`);
			await step();
			this.debug(`postImport step success: ${name}`);
		} catch (err) {
			logError(`[Importer] postImport step failed: ${name}`, err);
		}
	}

	/**
	 * Actor folder reconciliation requires a ready canvas grid. If canvas isn't
	 * ready when the post-import hook runs, retry once after `canvasReady`.
	 */
	private deferActorFolderHierarchyUntilCanvasReady(): void {
		if (this.actorFolderHierarchyDeferred) return;
		this.actorFolderHierarchyDeferred = true;
		this.debug(
			'Deferring actor folder hierarchy reconciliation until canvas grid is ready',
			{ canvasReady: canvas?.ready ?? false },
		);

		Hooks.once('canvasReady', () => {
			this.actorFolderHierarchyDeferred = false;
			void this.safeStep('ensureActorFolderHierarchy:deferred-canvas-ready', async () => {
				await ensureActorFolderHierarchy(this.debug);
			});
		});
	}
}

function defaultDebug(message: string, data?: Record<string, unknown>): void {
	if (data) {
		logDebug(`[Importer] ${message}`, data);
		return;
	}
	logDebug(`[Importer] ${message}`);
}

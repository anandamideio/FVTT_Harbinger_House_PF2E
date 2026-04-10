import { HARBINGER_JOURNAL_SHEET_CLASS, log, logDebug, logError, logWarn, MODULE_ID } from './config';

/**
 * Pre-computed deterministic IDs matching build-packs.ts output.
 * Generated via: MD5(sourceId).substring(0, 16)
 */
const STARTING_SCENE_ID = '851e935c54e67e62'; // scene-sigil
const STARTING_SCENE_SOURCE_ID = 'scene-sigil';
const GETTING_STARTED_JOURNAL_ID = '373d8b09682157da'; // journal-1

/** Background image for login screen customization */
const LOGIN_BACKGROUND = `modules/${MODULE_ID}/dist/assets/art/Harbinger_House_Exterior.jpg`;
const MAP_FOLDER_ROOT = 'Harbinger House Maps';
const MAP_ROOT_HINT_ALIASES = new Set(['Maps', MAP_FOLDER_ROOT]);
const MAP_CHAPTER_FOLDERS = ['Chapter 1', 'Chapter 2', 'Chapter 3'] as const;

type SystemItemReferenceData = {
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

type ActorImportData = Record<string, unknown> & {
	name?: string;
	img?: string;
	prototypeToken?: Record<string, unknown>;
	items?: Record<string, unknown>[];
	flags?: Record<string, Record<string, unknown>>;
	_stats?: {
		compendiumSource?: string;
	};
};

function summarizeDocumentCounts(record: unknown): Record<string, number> {
	if (!record || typeof record !== 'object') return {};

	return Object.fromEntries(
		Object.entries(record as Record<string, unknown>).map(([type, docs]) => [type, Array.isArray(docs) ? docs.length : 0]),
	);
}

/**
 * Custom AdventureImporter for Harbinger House.
 *
 * Extends Foundry's native AdventureImporter to add:
 * - Post-import options (login screen, journal display, scene activation)
 * - System actor merging via _preImport
 * - Themed UI styling
 *
 * Follows the same pattern as pf2e-abomination-vaults.
 */
export class HarbingerHouseImporter extends foundry.applications.sheets.AdventureImporter {
	constructor(options?: Record<string, unknown>) {
		super(options);
		this.options.classes.push('harbinger-house');
		this.#debug('Importer constructed', {
			adventureId: this.document?.id,
			adventureName: this.document?.name,
			classes: this.options.classes,
		});
	}

	#debug(message: string, data?: Record<string, unknown>) {
		if (data) {
			logDebug(`[Importer] ${message}`, data);
			return;
		}

		logDebug(`[Importer] ${message}`);
	}

	/**
	 * Define import options as BooleanFields.
	 * These render as checkboxes in the import dialog.
	 */
	_prepareImportOptionsSchema() {
		this.#debug('_prepareImportOptionsSchema invoked');

		const fields = foundry.data.fields;
		return new fields.SchemaField({
			customizeLogin: new fields.BooleanField({
				label: game.i18n.localize('HARBINGER-HOUSE.importOptions.customizeLogin.label'),
				hint: game.i18n.localize('HARBINGER-HOUSE.importOptions.customizeLogin.hint'),
				initial: false,
			}),
			displayJournal: new fields.BooleanField({
				label: game.i18n.localize('HARBINGER-HOUSE.importOptions.displayJournal.label'),
				hint: game.i18n.localize('HARBINGER-HOUSE.importOptions.displayJournal.hint'),
				initial: true,
			}),
			activateScene: new fields.BooleanField({
				label: game.i18n.localize('HARBINGER-HOUSE.importOptions.activateScene.label'),
				hint: game.i18n.localize('HARBINGER-HOUSE.importOptions.activateScene.hint'),
				initial: true,
			}),
		});
	}

	/**
	 * Enhance the rendered import dialog.
	 * - Injects flavor text into the adventure overview
	 * - Converts hints to label tooltips for cleaner UI (AV pattern)
	 */
	async _onRender(context: unknown, options: unknown) {
		this.#debug('_onRender start', {
			contextType: typeof context,
			optionsType: typeof options,
		});

		await super._onRender(context, options);

		// Inject flavor text before the overview section
		const overview = this.element.querySelector('.adventure-overview');
		let hintCount = 0;
		if (overview) {
			const flavor = document.createElement('blockquote');
			flavor.className = 'harbinger-flavor';
			flavor.innerHTML = '<em>"In the Cage, berks whisper of a house where the mad become gods..."</em>';
			overview.prepend(flavor);
		}

		// Swap hints for label tooltips
		for (const fg of Array.from(this.element.querySelectorAll('.import-options .form-group'))) {
			const hint = fg.querySelector('.hint');
			if (!hint) continue;
			hintCount += 1;
			const label = fg.querySelector('label');
			if (label) {
				label.toggleAttribute('data-tooltip', true);
				label.setAttribute('aria-label', hint.textContent ?? '');
			}
			hint.remove();
		}

		this.#debug('_onRender complete', {
			overviewFound: Boolean(overview),
			hintsConverted: hintCount,
			rootClasses: this.options.classes,
		});
	}

	/**
	 * V13 currently routes Adventure#import through a V1 sheet lookup internally.
	 * We pass our callbacks explicitly here so _preImport/_onImport always run.
	 */
	async _processSubmitData(
		event: SubmitEvent,
		form: HTMLFormElement,
		formData: { object?: Record<string, unknown> },
		options?: unknown,
	): Promise<void> {
		void event;
		void options;

		const processed = (formData.object ?? {}) as Record<string, unknown>;

		const coerceBoolean = (value: unknown): boolean | undefined => {
			if (typeof value === 'boolean') return value;
			if (typeof value === 'number') return value !== 0;
			if (typeof value === 'string') {
				const normalized = value.trim().toLowerCase();
				if (['true', '1', 'on', 'yes'].includes(normalized)) return true;
				if (['false', '0', 'off', 'no', ''].includes(normalized)) return false;
			}
			return undefined;
		};

		const readCheckbox = (name: string): HTMLInputElement | null =>
			form.querySelector<HTMLInputElement>(`input[name="${name}"]`) ??
			form.querySelector<HTMLInputElement>(`input[name$=".${name}"]`);

		const resolveOption = (key: 'customizeLogin' | 'displayJournal' | 'activateScene', fallback: boolean): boolean => {
			const fromProcessed = coerceBoolean(processed[key]);
			if (fromProcessed !== undefined) return fromProcessed;

			const input = readCheckbox(key);
			if (input) return input.checked;

			return fallback;
		};

		const customizeLogin = resolveOption('customizeLogin', false);
		const displayJournal = resolveOption('displayJournal', true);
		const activateScene = resolveOption('activateScene', true);

		const importOptions: Record<string, unknown> = {
			...processed,
			customizeLogin,
			displayJournal,
			activateScene,
			dialog: false,
			preImport: [this._preImport.bind(this)],
			postImport: [this._onImport.bind(this)],
		};

		this.#debug('_processSubmitData invoking Adventure.import with explicit callbacks', {
			processedKeys: Object.keys(processed),
			importKeys: Object.keys(importOptions),
			resolvedOptions: {
				customizeLogin,
				displayJournal,
				activateScene,
			},
			formInputs: Array.from(form.querySelectorAll('input[name]')).map((input) =>
				(input as HTMLInputElement).name,
			),
		});

		await (this.document as unknown as {
			import: (opts: Record<string, unknown>) => Promise<Record<string, unknown>>;
		}).import(importOptions);
	}

	/**
	 * Pre-import: merge system compendium actor data.
	 *
	 * For actors that reference PF2e system compendium entries (via _stats.compendiumSource),
	 * fetch the canonical data and merge system, items, and effects. This keeps actors
	 * up-to-date with the latest PF2e system data.
	 */
	async _preImport(
		data: {
			toCreate: Record<string, Record<string, unknown>[]>;
			toUpdate: Record<string, Record<string, unknown>[]>;
		},
		importOptions: Record<string, boolean>,
	) {
		this.#debug('_preImport hook called');
		this.#debug('_preImport payload', {
			importOptions,
			toCreate: summarizeDocumentCounts(data.toCreate),
			toUpdate: summarizeDocumentCounts(data.toUpdate),
		});

		if ('Actor' in data.toCreate) {
			this.#debug('_preImport processing Actor.toCreate', { count: data.toCreate.Actor.length });
			await this.#resolveActorItemReferences(data.toCreate.Actor);
			await this.#mergeCompendiumActors(data.toCreate.Actor);
		}
		if ('Actor' in data.toUpdate) {
			this.#debug('_preImport processing Actor.toUpdate', { count: data.toUpdate.Actor.length });
			await this.#resolveActorItemReferences(data.toUpdate.Actor);
			await this.#mergeCompendiumActors(data.toUpdate.Actor);
		}

		this.#debug('_preImport complete');
	}

	/**
	 * Post-import: execute enabled option handlers.
	 */
	async _onImport(importResult: Record<string, unknown>, importOptions: Record<string, boolean>) {
		const options = importOptions as Partial<Record<'customizeLogin' | 'displayJournal' | 'activateScene', boolean>>;
		const customizeLogin = options.customizeLogin ?? false;
		const displayJournal = options.displayJournal ?? true;
		const activateScene = options.activateScene ?? true;

		this.#debug('_onImport hook called');
		this.#debug('_onImport payload', {
			importOptions,
			resolvedOptions: {
				customizeLogin,
				displayJournal,
				activateScene,
			},
			created: summarizeDocumentCounts((importResult as { created?: unknown }).created),
			updated: summarizeDocumentCounts((importResult as { updated?: unknown }).updated),
		});

		try {
			this.#debug('_onImport step start: ensureJournalFolderHierarchy');
			await this.#ensureJournalFolderHierarchy();
			this.#debug('_onImport step success: ensureJournalFolderHierarchy');
		} catch (err) {
			logError('[Importer] _onImport step failed: ensureJournalFolderHierarchy', err);
		}

		try {
			this.#debug('_onImport step start: ensureActorFolderHierarchy');
			await this.#ensureActorFolderHierarchy();
			this.#debug('_onImport step success: ensureActorFolderHierarchy');
		} catch (err) {
			logError('[Importer] _onImport step failed: ensureActorFolderHierarchy', err);
		}

		try {
			this.#debug('_onImport step start: ensureItemFolderHierarchy');
			await this.#ensureItemFolderHierarchy();
			this.#debug('_onImport step success: ensureItemFolderHierarchy');
		} catch (err) {
			logError('[Importer] _onImport step failed: ensureItemFolderHierarchy', err);
		}

		try {
			this.#debug('_onImport step start: ensureSceneFolderHierarchy');
			await this.#ensureSceneFolderHierarchy();
			this.#debug('_onImport step success: ensureSceneFolderHierarchy');
		} catch (err) {
			logError('[Importer] _onImport step failed: ensureSceneFolderHierarchy', err);
		}

		if (customizeLogin) {
			try {
				this.#debug('_onImport step start: customizeLoginScreen');
				await this.#customizeLoginScreen();
				this.#debug('_onImport step success: customizeLoginScreen');
			} catch (err) {
				logError('[Importer] _onImport step failed: customizeLoginScreen', err);
			}
		} else {
			this.#debug('_onImport option disabled: customizeLogin');
		}
		if (displayJournal) {
			try {
				this.#debug('_onImport step start: displayGettingStartedJournal');
				await this.#displayGettingStartedJournal();
				this.#debug('_onImport step success: displayGettingStartedJournal');
			} catch (err) {
				logError('[Importer] _onImport step failed: displayGettingStartedJournal', err);
			}
		} else {
			this.#debug('_onImport option disabled: displayJournal');
		}
		if (activateScene) {
			try {
				this.#debug('_onImport step start: activateStartingScene');
				await this.#activateStartingScene();
				this.#debug('_onImport step success: activateStartingScene');
			} catch (err) {
				logError('[Importer] _onImport step failed: activateStartingScene', err);
			}
		} else {
			this.#debug('_onImport option disabled: activateScene');
		}

		this.#debug('_onImport complete');
	}

	/**
	 * Resolve system item references stored at flags[MODULE_ID].unresolvedItems
	 * into embedded actor items before the import creates/upates world actors.
	 */
	async #resolveActorItemReferences(actors: Record<string, unknown>[]) {
		let actorsWithUnresolved = 0;
		let resolvedItems = 0;

		for (const rawActor of actors) {
			const actor = rawActor as ActorImportData;
			const moduleFlags = actor.flags?.[MODULE_ID] as Record<string, unknown> | undefined;
			const unresolved = moduleFlags?.unresolvedItems;
			if (!Array.isArray(unresolved) || unresolved.length === 0) continue;

			actorsWithUnresolved += 1;
			this.#debug('Resolving unresolved actor item refs', {
				actor: actor.name ?? 'Unknown',
				unresolvedCount: unresolved.length,
			});

			if (!Array.isArray(actor.items)) actor.items = [];
			const items = actor.items as Record<string, unknown>[];

			for (const rawRef of unresolved) {
				const ref = rawRef as SystemItemReferenceData;
				if (!ref?.uuid || typeof ref.uuid !== 'string') continue;

				try {
					const source = await fromUuid(ref.uuid);
					if (!source) {
						logWarn(`Unable to resolve system item reference for ${actor.name ?? 'Unknown'}: ${ref.uuid}`);
						continue;
					}

					const itemData = structuredClone(source.toObject() as Record<string, unknown>);
					itemData._id = foundry.utils.randomID(16);

					if (typeof ref.customName === 'string' && ref.customName.length > 0) {
						itemData.name = ref.customName;
					}

					this.#applySystemItemReferenceOverrides(itemData, ref);
					items.push(itemData);
					resolvedItems += 1;
					this.#debug('Resolved system item reference', {
						actor: actor.name ?? 'Unknown',
						uuid: ref.uuid,
						type: ref.type ?? 'unknown',
					});
				} catch (err) {
					logError(`Failed resolving system item reference for ${actor.name ?? 'Unknown'}:`, err);
				}
			}

			// Prevent stale unresolved data from lingering after we embed concrete items.
			if (moduleFlags) delete moduleFlags.unresolvedItems;
		}

		this.#debug('#resolveActorItemReferences complete', {
			actorsScanned: actors.length,
			actorsWithUnresolved,
			resolvedItems,
		});
	}

	/**
	 * Apply reference-specific overrides after cloning a system item from compendium.
	 */
	#applySystemItemReferenceOverrides(itemData: Record<string, unknown>, ref: SystemItemReferenceData) {
		const system =
			itemData.system && typeof itemData.system === 'object'
				? (itemData.system as Record<string, unknown>)
				: null;

		if (system && typeof ref.customDescription === 'string' && ref.customDescription.length > 0) {
			const description =
				system.description && typeof system.description === 'object'
					? (system.description as Record<string, unknown>)
					: {};
			const existing = typeof description.value === 'string' ? description.value : '';
			description.value = `${existing}${existing ? '<hr/>' : ''}<p>${ref.customDescription}</p>`;
			system.description = description;
		}

		if (system && ref.type === 'system-weapon' && ref.runes && typeof ref.runes === 'object') {
			const runes =
				system.runes && typeof system.runes === 'object' ? (system.runes as Record<string, unknown>) : {};
			if (typeof ref.runes.potency === 'number') runes.potency = ref.runes.potency;
			if (typeof ref.runes.striking === 'string') runes.striking = ref.runes.striking;
			if (Array.isArray(ref.runes.property)) {
				runes.property = ref.runes.property.filter((r): r is string => typeof r === 'string');
			}
			system.runes = runes;
		}

		if (system && ref.type === 'system-spell') {
			if (typeof ref.tradition === 'string' && ref.tradition.length > 0) {
				system.traditions = { value: [ref.tradition] };
			}

			if (typeof ref.heightenedLevel === 'number') {
				const level = system.level && typeof system.level === 'object' ? (system.level as Record<string, unknown>) : {};
				level.value = ref.heightenedLevel;
				system.level = level;
			}

			if (typeof ref.entryId === 'string' && ref.entryId.length > 0) {
				const location =
					system.location && typeof system.location === 'object'
						? (system.location as Record<string, unknown>)
						: {};
				location.value = ref.entryId;
				system.location = location;
			}
		}

		const flags =
			itemData.flags && typeof itemData.flags === 'object' ? (itemData.flags as Record<string, unknown>) : {};
		const moduleFlags =
			flags[MODULE_ID] && typeof flags[MODULE_ID] === 'object'
				? (flags[MODULE_ID] as Record<string, unknown>)
				: {};
		if (typeof ref.uuid === 'string') moduleFlags.sourceUuid = ref.uuid;
		moduleFlags.imported = true;
		flags[MODULE_ID] = moduleFlags;
		itemData.flags = flags;
	}

	/**
	 * Merge canonical system data into actors that reference PF2e compendium entries.
	 */
	async #mergeCompendiumActors(actors: Record<string, unknown>[]) {
		let mergedCount = 0;
		let skippedNoSource = 0;
		let skippedNonPf2e = 0;

		for (const rawActor of actors) {
			const actor = rawActor as ActorImportData;
			const stats = actor._stats;
			const moduleFlags = actor.flags?.[MODULE_ID] as { systemActorRef?: string } | undefined;
			const sourceId = stats?.compendiumSource ?? moduleFlags?.systemActorRef;
			if (!sourceId) {
				skippedNoSource += 1;
				continue;
			}

			// Only merge if the source is from the PF2e system (not our own module)
			if (!sourceId.startsWith('Compendium.pf2e.')) {
				skippedNonPf2e += 1;
				continue;
			}

			try {
				const source = await fromUuid(sourceId);
				if (source) {
					const sourceData = source.toObject() as Record<string, unknown>;
					const updateData: Record<string, unknown> = {
						system: sourceData.system,
						items: sourceData.items,
					};

					const hasExplicitImage = (value: unknown): value is string =>
						typeof value === 'string' && value.length > 0 && !value.startsWith('icons/svg/');

					const actorHasPortrait = hasExplicitImage(actor.img);
					if (!actorHasPortrait && hasExplicitImage(sourceData.img)) {
						updateData.img = sourceData.img;
					}

					const actorPrototypeToken =
						actor.prototypeToken && typeof actor.prototypeToken === 'object'
							? (actor.prototypeToken as Record<string, unknown>)
							: undefined;
					const actorTexture =
						actorPrototypeToken?.texture && typeof actorPrototypeToken.texture === 'object'
							? (actorPrototypeToken.texture as Record<string, unknown>)
							: undefined;
					const actorHasTokenTexture = hasExplicitImage(actorTexture?.src);

					const sourcePrototypeToken =
						sourceData.prototypeToken && typeof sourceData.prototypeToken === 'object'
							? (sourceData.prototypeToken as Record<string, unknown>)
							: undefined;
					if (!actorHasTokenTexture && sourcePrototypeToken) {
						updateData.prototypeToken = sourcePrototypeToken;
					}

					if (sourceData.effects) {
						updateData.effects = sourceData.effects;
					}
					// Preserve the compendium source reference
					updateData['_stats.compendiumSource'] = source.flags?.core?.sourceId ?? sourceId;
					foundry.utils.mergeObject(actor, updateData);
					mergedCount += 1;
					this.#debug('Merged compendium actor data', {
						actor: actor.name ?? 'Unknown',
						sourceId,
					});
				}
			} catch (err) {
				logError(`Failed to merge compendium data for ${actor.name}:`, err);
			}
		}

		this.#debug('#mergeCompendiumActors complete', {
			actorsScanned: actors.length,
			mergedCount,
			skippedNoSource,
			skippedNonPf2e,
		});
	}

	/**
	 * Ensure imported journals are organized under the expected root and sub-folders.
	 * This is a defensive post-import step for cases where folder nesting is not preserved.
	 */
	async #ensureJournalFolderHierarchy() {
		if (!game.folders || !game.journal) return;

		const journals = game.journal.filter(
			(j: FoundryDocument) => j.flags?.[MODULE_ID]?.sourceId !== undefined,
		);
		if (journals.length === 0) return;

		this.#debug('Ensuring journal folder hierarchy', {
			journalCount: journals.length,
		});

		let root = game.folders.find(
			(f: FoundryDocument) => f.type === 'JournalEntry' && f.name === 'Harbinger House Adventure',
		) as FolderClass | undefined;
		if (!root) {
			root = await (Folder.create({
				name: 'Harbinger House Adventure',
				type: 'JournalEntry',
				color: '#6e0000',
				folder: null,
				flags: {
					[MODULE_ID]: {
						isHarbingerHouse: true,
					},
				},
			}) as Promise<FolderClass>);
		}

		const findJournalFolder = (name: string) =>
			game.folders?.find(
				(f: FoundryDocument) => f.type === 'JournalEntry' && f.name === name,
			) as FolderClass | undefined;

		let chapters = findJournalFolder('Chapters');
		if (!chapters) {
			chapters = await (Folder.create({
				name: 'Chapters',
				type: 'JournalEntry',
				folder: root.id,
				flags: {
					[MODULE_ID]: {
						isHarbingerHouse: true,
					},
				},
			}) as Promise<FolderClass>);
		} else if (chapters.folder?.id !== root.id) {
			await chapters.update({ folder: root.id });
		}

		let reference = findJournalFolder('Reference');
		if (!reference) {
			reference = await (Folder.create({
				name: 'Reference',
				type: 'JournalEntry',
				folder: root.id,
				flags: {
					[MODULE_ID]: {
						isHarbingerHouse: true,
					},
				},
			}) as Promise<FolderClass>);
		} else if (reference.folder?.id !== root.id) {
			await reference.update({ folder: root.id });
		}

		for (const journal of journals) {
			const folderHint = journal.flags?.[MODULE_ID]?.folder;
			const target = folderHint === 'Reference' ? reference : chapters;
			const currentSheetClass = journal.flags?.core?.sheetClass;
			const needsFolderUpdate = journal.folder?.id !== target.id;
			const needsSheetUpdate = currentSheetClass !== HARBINGER_JOURNAL_SHEET_CLASS;

			if (!needsFolderUpdate && !needsSheetUpdate) continue;

			const updateData: Record<string, unknown> = {};
			if (needsFolderUpdate) {
				updateData.folder = target.id;
			}
			if (needsSheetUpdate) {
				updateData['flags.core.sheetClass'] = HARBINGER_JOURNAL_SHEET_CLASS;
			}

			this.#debug('Updating imported journal configuration', {
				journal: journal.name,
				fromFolder: journal.folder?.id ?? null,
				toFolder: needsFolderUpdate ? target.id : journal.folder?.id ?? null,
				currentSheetClass: typeof currentSheetClass === 'string' ? currentSheetClass : null,
				targetSheetClass: HARBINGER_JOURNAL_SHEET_CLASS,
				folderHint: typeof folderHint === 'string' ? folderHint : 'Chapters',
			});

			await journal.update(updateData as Partial<JournalEntryData>);
		}

		this.#debug('Ensured Harbinger House journal folder hierarchy', {
			journalCount: journals.length,
			rootId: root.id,
			chaptersId: chapters.id,
			referenceId: reference.id,
		});
	}

	/**
	 * Find or create a folder with a specific type/name/parent.
	 */
	async #ensureFolder(
		type: string,
		name: string,
		parentId: string | null,
		color?: string,
	): Promise<FolderClass> {
		if (!game.folders) {
			throw new Error('game.folders is unavailable');
		}

		const parentMatches = (folder: FoundryDocument): boolean =>
			(parentId === null && !folder.folder) || folder.folder?.id === parentId;

		let folder = game.folders.find(
			(f: FoundryDocument) => f.type === type && f.name === name && parentMatches(f),
		) as FolderClass | undefined;

		if (!folder) {
			folder = game.folders.find(
				(f: FoundryDocument) => f.type === type && f.name === name,
			) as FolderClass | undefined;
		}

		if (!folder) {
			folder = await (Folder.create({
				name,
				type,
				folder: parentId,
				...(color ? { color } : {}),
				flags: {
					[MODULE_ID]: {
						isHarbingerHouse: true,
					},
				},
			}) as Promise<FolderClass>);

			this.#debug('Created folder', {
				type,
				name,
				parentId,
				id: folder.id,
			});
			return folder;
		}

		if (!parentMatches(folder)) {
			await folder.update({ folder: parentId });
			this.#debug('Moved folder to expected parent', {
				type,
				name,
				parentId,
				id: folder.id,
			});
		}

		return folder;
	}

	/**
	 * Ensure actors and hazards are routed to category subfolders.
	 */
	async #ensureActorFolderHierarchy() {
		if (!game.actors || !game.folders) return;

		const actors = game.actors.filter(
			(a: ActorClass) => a.flags?.[MODULE_ID]?.sourceId !== undefined,
		);
		if (actors.length === 0) return;

		const npcRoot = await this.#ensureFolder('Actor', 'Harbinger House NPCs', null, '#6e0000');
		const hazardRoot = await this.#ensureFolder('Actor', 'Harbinger House Hazards', null, '#4a3f5c');

		const fiends = await this.#ensureFolder('Actor', 'Fiends & Monsters', npcRoot.id);
		const cultists = await this.#ensureFolder('Actor', 'Cultist & Common NPCs', npcRoot.id);
		const generic = await this.#ensureFolder('Actor', "Generic NPC's", npcRoot.id);
		const residents = await this.#ensureFolder('Actor', 'Harbinger House Residents', npcRoot.id);

		const environmentalHazards = await this.#ensureFolder('Actor', 'Environmental Hazards', hazardRoot.id);
		const magicalTraps = await this.#ensureFolder('Actor', 'Magical Traps', hazardRoot.id);
		const npcAuras = await this.#ensureFolder('Actor', 'NPC Auras', hazardRoot.id);

		let reassigned = 0;

		for (const actor of actors) {
			const category = actor.flags?.[MODULE_ID]?.category;
			const actorType = actor.type;

			let target: FolderClass;

			if (
				actorType === 'hazard' ||
				category === 'trap' ||
				category === 'environmental' ||
				category === 'aura' ||
				category === 'haunt'
			) {
				target =
					category === 'environmental'
						? environmentalHazards
						: category === 'aura'
							? npcAuras
							: magicalTraps;
			} else {
				target =
					category === 'fiend'
						? fiends
						: category === 'cultist'
							? cultists
							: category === 'generic-npc' || category === 'generic-npcs'
								? generic
								: category === 'major-npc' || category === 'harbinger-resident'
									? residents
									: npcRoot;
			}

			if (actor.folder?.id !== target.id) {
							await (actor as unknown as { update: (data: Record<string, unknown>) => Promise<unknown> }).update({
								folder: target.id,
							});
				reassigned += 1;
				this.#debug('Reassigned actor folder', {
					actor: actor.name,
					category: typeof category === 'string' ? category : 'unknown',
					from: actor.folder?.id ?? null,
					to: target.id,
				});
			}
		}

		this.#debug('Ensured actor/hazard folder hierarchy', {
			actorCount: actors.length,
			reassigned,
		});
	}

	/**
	 * Ensure items are routed to category subfolders while spells remain at root spell folder.
	 */
	async #ensureItemFolderHierarchy() {
		if (!game.items || !game.folders) return;

		const items = game.items.filter(
			(i: ItemClass) => i.flags?.[MODULE_ID]?.sourceId !== undefined,
		);
		if (items.length === 0) return;

		const itemRoot = await this.#ensureFolder('Item', 'Harbinger House Items', null, '#c9a227');
		const spellRoot = await this.#ensureFolder('Item', 'Harbinger House Spells', null, '#4a3f5c');

		const armor = await this.#ensureFolder('Item', 'Armor & Protective Items', itemRoot.id);
		const artifacts = await this.#ensureFolder('Item', 'Artifacts', itemRoot.id);
		const consumables = await this.#ensureFolder('Item', 'Consumables', itemRoot.id);
		const weapons = await this.#ensureFolder('Item', 'Weapons', itemRoot.id);
		const equipment = await this.#ensureFolder('Item', 'Wonderous Items & Equipment', itemRoot.id);

		let reassigned = 0;

		for (const item of items) {
			const category = item.flags?.[MODULE_ID]?.category;

			let target: FolderClass;
			if (item.type === 'spell') {
				target = spellRoot;
			} else {
				target =
					category === 'armor'
						? armor
						: category === 'artifact'
							? artifacts
							: category === 'consumable'
								? consumables
								: category === 'weapon'
									? weapons
									: category === 'equipment'
										? equipment
										: itemRoot;
			}

			if (item.folder?.id !== target.id) {
				await (item as unknown as { update: (data: Record<string, unknown>) => Promise<unknown> }).update({
					folder: target.id,
				});
				reassigned += 1;
				this.#debug('Reassigned item folder', {
					item: item.name,
					itemType: item.type,
					category: typeof category === 'string' ? category : 'unknown',
					from: item.folder?.id ?? null,
					to: target.id,
				});
			}
		}

		this.#debug('Ensured item folder hierarchy', {
			itemCount: items.length,
			reassigned,
		});
	}

		/**
		 * Ensure scenes are grouped under Harbinger House Maps with chapter subfolders.
		 */
		async #ensureSceneFolderHierarchy() {
			if (!game.scenes || !game.folders) return;

			const scenes = game.scenes.filter(
				(s: SceneClass) => s.flags?.[MODULE_ID]?.sourceId !== undefined,
			);
			if (scenes.length === 0) return;

			const mapsRoot = await this.#ensureFolder('Scene', MAP_FOLDER_ROOT, null, '#2f4f6f');
			const chapterFolders = new Map<string, FolderClass>();

			for (const chapterName of MAP_CHAPTER_FOLDERS) {
				chapterFolders.set(chapterName, await this.#ensureFolder('Scene', chapterName, mapsRoot.id));
			}

			let reassigned = 0;

			for (const scene of scenes) {
				const rawFolderHint = scene.flags?.[MODULE_ID]?.folder;
				const folderHint = typeof rawFolderHint === 'string' ? rawFolderHint.trim() : '';

				let target = mapsRoot;
				if (folderHint.length > 0 && !MAP_ROOT_HINT_ALIASES.has(folderHint)) {
					let chapterFolder = chapterFolders.get(folderHint);
					if (!chapterFolder) {
						chapterFolder = await this.#ensureFolder('Scene', folderHint, mapsRoot.id);
						chapterFolders.set(folderHint, chapterFolder);
					}
					target = chapterFolder;
				}

				if (scene.folder?.id !== target.id) {
					await (scene as unknown as { update: (data: Record<string, unknown>) => Promise<unknown> }).update({
						folder: target.id,
					});
					reassigned += 1;
					this.#debug('Reassigned scene folder', {
						scene: scene.name,
						folderHint: folderHint || MAP_FOLDER_ROOT,
						from: scene.folder?.id ?? null,
						to: target.id,
					});
				}
			}

			this.#debug('Ensured scene folder hierarchy', {
				sceneCount: scenes.length,
				reassigned,
				chapterFolders: Array.from(chapterFolders.keys()),
			});
		}

	/**
	 * Customize the world login screen with Harbinger House artwork.
	 * Posts to Foundry's setup endpoint to update world background and description.
	 */
	async #customizeLoginScreen() {
		try {
			const module = game.modules.get(MODULE_ID);
			if (!module) return;

			const worldData = {
				action: 'editWorld',
				id: game.world.id,
				description: module.description,
				background: LOGIN_BACKGROUND,
			};

			const response = await foundry.utils.fetchJsonWithTimeout(foundry.utils.getRoute('setup'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(worldData),
			});

			this.#debug('customizeLoginScreen response', {
				status: response.status,
				ok: response.ok,
			});

			game.world.updateSource(worldData);
			log('Login screen customized with Harbinger House artwork');
		} catch (err) {
			logError('Failed to customize login screen:', err);
		}
	}

	/**
	 * Display the Getting Started journal after import.
	 */
	async #displayGettingStartedJournal() {
		try {
			let lookupStrategy: 'deterministic-id' | 'module-flag' | 'any-module-flag' | 'none' = 'none';

			// Try to find by deterministic ID first
			let journal = game.journal?.find(
				(j: FoundryDocument) => j.id === GETTING_STARTED_JOURNAL_ID,
			);
			if (journal) lookupStrategy = 'deterministic-id';

			// Fallback: find any journal with our flag
			if (!journal) {
				journal = game.journal?.find(
					(j: FoundryDocument) => j.flags?.[MODULE_ID]?.isHarbingerHouse === true,
				);
				if (journal) lookupStrategy = 'module-flag';
			}

			// Fallback: find the first journal from our module
			if (!journal) {
				journal = game.journal?.find(
					(j: FoundryDocument) => j.flags?.[MODULE_ID] !== undefined,
				);
				if (journal) lookupStrategy = 'any-module-flag';
			}

			if (journal) {
				(journal as unknown as { sheet: { render: (force: boolean) => void } }).sheet.render(true);
				this.#debug('displayGettingStartedJournal found journal', {
					lookupStrategy,
					journalId: journal.id,
					journalName: journal.name,
				});
				log(`Displaying journal: ${journal.name}`);
			} else {
				logWarn('No Harbinger House journal found to display after import');
			}
		} catch (err) {
			logError('Failed to display Getting Started journal:', err);
		}
	}

	/**
	 * Activate the starting scene (Sigil) after import.
	 */
	async #activateStartingScene() {
		try {
			let lookupStrategy:
				| 'deterministic-id'
				| 'module-source-id'
				| 'scene-name'
				| 'module-flag'
				| 'none' = 'none';

			// Try to find by deterministic ID first
			let scene = game.scenes?.find(
				(s: FoundryDocument) => s.id === STARTING_SCENE_ID,
			);
			if (scene) lookupStrategy = 'deterministic-id';

			// Prefer a stable sourceId lookup in case imported world IDs differ.
			if (!scene) {
				scene = game.scenes?.find(
					(s: FoundryDocument) => s.flags?.[MODULE_ID]?.sourceId === STARTING_SCENE_SOURCE_ID,
				);
				if (scene) lookupStrategy = 'module-source-id';
			}

			// Additional fallback for legacy worlds or migrated imports.
			if (!scene) {
				scene = game.scenes?.find(
					(s: FoundryDocument) => s.flags?.[MODULE_ID] !== undefined && s.name === 'Sigil',
				);
				if (scene) lookupStrategy = 'scene-name';
			}

			// Fallback: find the first scene from our module
			if (!scene) {
				scene = game.scenes?.find(
					(s: FoundryDocument) => s.flags?.[MODULE_ID] !== undefined,
				);
				if (scene) lookupStrategy = 'module-flag';
			}

			if (scene) {
				await (scene as SceneClass).activate();
				await Promise.resolve((scene as unknown as { view: () => unknown }).view());
				this.#debug('activateStartingScene found scene', {
					lookupStrategy,
					sceneId: scene.id,
					sceneName: scene.name,
				});
				log(`Activated starting scene: ${scene.name}`);
			} else {
				logWarn('No Harbinger House scene found to activate after import');
			}
		} catch (err) {
			logError('Failed to activate starting scene:', err);
		}
	}
}

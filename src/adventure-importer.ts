import { log, logError, logWarn, MODULE_ID } from './config';

/**
 * Pre-computed deterministic IDs matching build-packs.ts output.
 * Generated via: MD5(sourceId).substring(0, 16)
 */
const STARTING_SCENE_ID = 'aca450c8288821de'; // scene-first-floor
const GETTING_STARTED_JOURNAL_ID = '373d8b09682157da'; // journal-1

/** Background image for login screen customization */
const LOGIN_BACKGROUND = `modules/${MODULE_ID}/dist/assets/Harbinger_House_Exterior.jpg`;

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
	items?: Record<string, unknown>[];
	flags?: Record<string, Record<string, unknown>>;
	_stats?: {
		compendiumSource?: string;
	};
};

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
	}

	/**
	 * Define import options as BooleanFields.
	 * These render as checkboxes in the import dialog.
	 */
	_prepareImportOptionsSchema() {
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
		await super._onRender(context, options);

		// Inject flavor text before the overview section
		const overview = this.element.querySelector('.adventure-overview');
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
			const label = fg.querySelector('label');
			if (label) {
				label.toggleAttribute('data-tooltip', true);
				label.setAttribute('aria-label', hint.textContent ?? '');
			}
			hint.remove();
		}
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
		void importOptions;

		if ('Actor' in data.toCreate) {
			await this.#resolveActorItemReferences(data.toCreate.Actor);
			await this.#mergeCompendiumActors(data.toCreate.Actor);
		}
		if ('Actor' in data.toUpdate) {
			await this.#resolveActorItemReferences(data.toUpdate.Actor);
			await this.#mergeCompendiumActors(data.toUpdate.Actor);
		}
	}

	/**
	 * Post-import: execute enabled option handlers.
	 */
	async _onImport(importResult: Record<string, unknown>, importOptions: Record<string, boolean>) {
		await this.#ensureJournalFolderHierarchy();

		if (importOptions.customizeLogin) {
			await this.#customizeLoginScreen();
		}
		if (importOptions.displayJournal) {
			await this.#displayGettingStartedJournal();
		}
		if (importOptions.activateScene) {
			await this.#activateStartingScene();
		}
	}

	/**
	 * Resolve system item references stored at flags[MODULE_ID].unresolvedItems
	 * into embedded actor items before the import creates/upates world actors.
	 */
	async #resolveActorItemReferences(actors: Record<string, unknown>[]) {
		for (const rawActor of actors) {
			const actor = rawActor as ActorImportData;
			const moduleFlags = actor.flags?.[MODULE_ID] as Record<string, unknown> | undefined;
			const unresolved = moduleFlags?.unresolvedItems;
			if (!Array.isArray(unresolved) || unresolved.length === 0) continue;

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
				} catch (err) {
					logError(`Failed resolving system item reference for ${actor.name ?? 'Unknown'}:`, err);
				}
			}

			// Prevent stale unresolved data from lingering after we embed concrete items.
			if (moduleFlags) delete moduleFlags.unresolvedItems;
		}
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
		for (const rawActor of actors) {
			const actor = rawActor as ActorImportData;
			const stats = actor._stats;
			const moduleFlags = actor.flags?.[MODULE_ID] as { systemActorRef?: string } | undefined;
			const sourceId = stats?.compendiumSource ?? moduleFlags?.systemActorRef;
			if (!sourceId) continue;

			// Only merge if the source is from the PF2e system (not our own module)
			if (!sourceId.startsWith('Compendium.pf2e.')) continue;

			try {
				const source = await fromUuid(sourceId);
				if (source) {
					const sourceData = source.toObject() as Record<string, unknown>;
					const updateData: Record<string, unknown> = {
						system: sourceData.system,
						items: sourceData.items,
					};
					if (sourceData.effects) {
						updateData.effects = sourceData.effects;
					}
					// Preserve the compendium source reference
					updateData['_stats.compendiumSource'] = source.flags?.core?.sourceId ?? sourceId;
					foundry.utils.mergeObject(actor, updateData);
					log(`Merged system data for actor: ${actor.name}`);
				}
			} catch (err) {
				logError(`Failed to merge compendium data for ${actor.name}:`, err);
			}
		}
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
			if (journal.folder?.id !== target.id) {
				await journal.update({ folder: target.id });
			}
		}

		log('Ensured Harbinger House journal folder hierarchy');
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

			await fetchJsonWithTimeout(foundry.utils.getRoute('setup'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(worldData),
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
			// Try to find by deterministic ID first
			let journal = game.journal?.find(
				(j: FoundryDocument) => j.id === GETTING_STARTED_JOURNAL_ID,
			);

			// Fallback: find any journal with our flag
			if (!journal) {
				journal = game.journal?.find(
					(j: FoundryDocument) => j.flags?.[MODULE_ID]?.isHarbingerHouse === true,
				);
			}

			// Fallback: find the first journal from our module
			if (!journal) {
				journal = game.journal?.find(
					(j: FoundryDocument) => j.flags?.[MODULE_ID] !== undefined,
				);
			}

			if (journal) {
				(journal as unknown as { sheet: { render: (force: boolean) => void } }).sheet.render(true);
				log(`Displaying journal: ${journal.name}`);
			}
		} catch (err) {
			logError('Failed to display Getting Started journal:', err);
		}
	}

	/**
	 * Activate the starting scene (First Floor) after import.
	 */
	async #activateStartingScene() {
		try {
			// Try to find by deterministic ID first
			let scene = game.scenes?.find(
				(s: FoundryDocument) => s.id === STARTING_SCENE_ID,
			);

			// Fallback: find the first scene from our module
			if (!scene) {
				scene = game.scenes?.find(
					(s: FoundryDocument) => s.flags?.[MODULE_ID] !== undefined,
				);
			}

			if (scene) {
				await (scene as SceneClass).activate();
				log(`Activated starting scene: ${scene.name}`);
			}
		} catch (err) {
			logError('Failed to activate starting scene:', err);
		}
	}
}

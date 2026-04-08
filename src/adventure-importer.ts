import { log, logError, MODULE_ID } from './config';

/**
 * Pre-computed deterministic IDs matching build-packs.ts output.
 * Generated via: MD5(sourceId).substring(0, 16)
 */
const STARTING_SCENE_ID = 'aca450c8288821de'; // scene-first-floor
const GETTING_STARTED_JOURNAL_ID = '373d8b09682157da'; // journal-1

/** Background image for login screen customization */
const LOGIN_BACKGROUND = `modules/${MODULE_ID}/dist/assets/Harbinger_House_Exterior.jpg`;

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
	_prepareImportOptionsSchema(_options?: unknown) {
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
		// @ts-expect-error - calling super on Foundry ApplicationV2
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
		for (const fg of this.element.querySelectorAll('.import-options .form-group')) {
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
		if ('Actor' in data.toCreate) await this.#mergeCompendiumActors(data.toCreate.Actor);
		if ('Actor' in data.toUpdate) await this.#mergeCompendiumActors(data.toUpdate.Actor);
	}

	/**
	 * Post-import: execute enabled option handlers.
	 */
	async _onImport(importResult: Record<string, unknown>, importOptions: Record<string, boolean>) {
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
	 * Merge canonical system data into actors that reference PF2e compendium entries.
	 */
	async #mergeCompendiumActors(actors: Record<string, unknown>[]) {
		for (const actor of actors) {
			const stats = actor._stats as { compendiumSource?: string } | undefined;
			const sourceId = stats?.compendiumSource;
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

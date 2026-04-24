import { logDebug } from '../config';
import { ImportOptions } from './ImportOptions';
import { ImportPipeline } from './ImportPipeline';
import { resolveImportBootstrapConfig } from './helpers/bootstrap-config';
import type { ImportContext, ImportDebug, ImportOptionKey, PreImportPayload } from './types';

/**
 * Custom AdventureImporter for Harbinger House.
 *
 * Thin Foundry sheet class. All real work (pre-import merges, folder
 * reconciliation, post-import actions) lives in {@link ImportPipeline}. The
 * option table and form parsing live in {@link ImportOptions}.
 */
export class HarbingerHouseImporter extends foundry.applications.sheets.AdventureImporter {
	#importSubmitted = false;
	readonly #options = new ImportOptions();
	readonly #pipeline = new ImportPipeline(undefined, (message, data) => this.#debug(message, data));

	constructor(options?: Record<string, unknown>) {
		super(options);
		this.options.classes.push('harbinger-house');
		this.#debug('Importer constructed', {
			adventureId: this.document?.id,
			adventureName: this.document?.name,
			classes: this.options.classes,
		});
	}

	#debug: ImportDebug = (message, data) => {
		if (data) {
			logDebug(`[Importer] ${message}`, data);
			return;
		}
		logDebug(`[Importer] ${message}`);
	};

	/** Disable the submit button and update its label while an import is in flight. */
	#lockImportSubmit(root?: ParentNode | null): void {
		if (!root) return;

		const importingLabel =
			game.i18n.localize('HARBINGER-HOUSE.adventure.importing') ===
			'HARBINGER-HOUSE.adventure.importing'
				? 'Importing...'
				: game.i18n.localize('HARBINGER-HOUSE.adventure.importing');

		const submitControls = root.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
			'button[type="submit"], button[data-action="import"], input[type="submit"]',
		);

		for (const control of Array.from(submitControls)) {
			control.disabled = true;
			if (control instanceof HTMLInputElement && control.type === 'submit') {
				control.value = importingLabel;
			}
			if (control instanceof HTMLButtonElement) {
				control.textContent = importingLabel;
				control.setAttribute('aria-disabled', 'true');
				control.setAttribute('aria-label', importingLabel);
			}
		}
	}

	#buildContext(): ImportContext {
		return {
			document: this.document,
			bootstrap: resolveImportBootstrapConfig(this.document?.id, this.#debug),
			debug: this.#debug,
		};
	}

	/** Foundry hook: render the BooleanField checkboxes for our post-import options. */
	_prepareImportOptionsSchema() {
		this.#debug('_prepareImportOptionsSchema invoked');
		return this.#options.buildSchema();
	}

	/**
	 * Enhance the rendered import dialog.
	 * - Converts hints to label tooltips for cleaner UI (AV pattern)
	 * - Re-locks submit if we re-render during a submit
	 */
	public async _onRender(context: unknown, options: unknown) {
		this.#debug('_onRender start', {
			contextType: typeof context,
			optionsType: typeof options,
		});

		await super._onRender(context, options);

		let hintCount = 0;

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

		if (this.#importSubmitted) {
			this.#lockImportSubmit(this.element);
		}

		this.#debug('_onRender complete', {
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

		if (this.#importSubmitted) {
			this.#debug('_processSubmitData ignored duplicate submit');
			return;
		}

		this.#importSubmitted = true;
		this.#lockImportSubmit(form);

		const processed = (formData.object ?? {}) as Record<string, unknown>;
		const resolvedOptions = this.#options.resolveFromForm(processed, form);

		const importOptions: Record<string, unknown> = {
			...processed,
			...resolvedOptions,
			dialog: false,
			preImport: [this._preImport.bind(this)],
			postImport: [this._onImport.bind(this)],
		};

		this.#debug('_processSubmitData invoking Adventure.import with explicit callbacks', {
			processedKeys: Object.keys(processed),
			importKeys: Object.keys(importOptions),
			resolvedOptions,
			formInputs: Array.from(form.querySelectorAll('input[name]')).map(
				(input) => (input as HTMLInputElement).name,
			),
		});

		await (
			this.document as unknown as {
				import: (opts: Record<string, unknown>) => Promise<Record<string, unknown>>;
			}
		).import(importOptions);
	}

	/** Pre-import hook: merge compendium actor data before Foundry writes to the world. */
	async _preImport(data: PreImportPayload, importOptions: Record<string, boolean>): Promise<void> {
		await this.#pipeline.preImport(data, importOptions);
	}

	/** Post-import hook: reconcile folder hierarchy, then run enabled actions. */
	async _onImport(
		importResult: Record<string, unknown>,
		importOptions: Record<ImportOptionKey, boolean>,
	): Promise<void> {
		const resolved = this.#options.resolveFromResult(importOptions);
		await this.#pipeline.postImport(importResult, resolved, this.#buildContext());
	}
}

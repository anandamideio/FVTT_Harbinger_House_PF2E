import type { ImportOptionKey } from './types';

export interface ImportOptionMeta {
	/** i18n key for the checkbox label. */
	labelKey: string;
	/** i18n key for the hint text rendered under the label. */
	hintKey: string;
	/** Default state when a user first opens the dialog. */
	default: boolean;
}

export type ImportOptionTable = Record<ImportOptionKey, ImportOptionMeta>;

/**
 * Default option definitions for the Harbinger House importer.
 *
 * Ordering is preserved in the rendered dialog, so think twice before
 * reordering keys here.
 */
export const DEFAULT_IMPORT_OPTIONS: ImportOptionTable = {
	customizeLogin: {
		labelKey: 'HARBINGER-HOUSE.importOptions.customizeLogin.label',
		hintKey: 'HARBINGER-HOUSE.importOptions.customizeLogin.hint',
		default: false,
	},
	displayJournal: {
		labelKey: 'HARBINGER-HOUSE.importOptions.displayJournal.label',
		hintKey: 'HARBINGER-HOUSE.importOptions.displayJournal.hint',
		default: true,
	},
	activateScene: {
		labelKey: 'HARBINGER-HOUSE.importOptions.activateScene.label',
		hintKey: 'HARBINGER-HOUSE.importOptions.activateScene.hint',
		default: true,
	},
};

/**
 * Declarative table of post-import options.
 *
 * Owns option metadata, schema building, and form/payload parsing so the
 * sheet class and pipeline never hard-code option names in more than one place.
 */
export class ImportOptions {
	constructor(public readonly table: ImportOptionTable = DEFAULT_IMPORT_OPTIONS) {}

	get keys(): ImportOptionKey[] {
		return Object.keys(this.table) as ImportOptionKey[];
	}

	/**
	 * Build the Foundry SchemaField used by `_prepareImportOptionsSchema`.
	 * Uses the global `foundry` runtime so callers don't need to import it.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	buildSchema(): any {
		const fields = foundry.data.fields;
		const schemaShape = Object.fromEntries(
			this.keys.map((key) => {
				const meta = this.table[key];
				return [
					key,
					new fields.BooleanField({
						label: game.i18n.localize(meta.labelKey),
						hint: game.i18n.localize(meta.hintKey),
						initial: meta.default,
					}),
				];
			}),
		);
		return new fields.SchemaField(schemaShape);
	}

	/**
	 * Parse booleans out of a submitted form. Reads from the FormDataExtended
	 * `object` first, then falls back to reading the raw checkbox inputs,
	 * then falls back to each option's default.
	 */
	resolveFromForm(
		processed: Record<string, unknown>,
		form: HTMLFormElement,
	): Record<ImportOptionKey, boolean> {
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

		const resolveOption = (key: ImportOptionKey, fallback: boolean): boolean => {
			const fromProcessed = coerceBoolean(processed[key]);
			if (fromProcessed !== undefined) return fromProcessed;

			const input = readCheckbox(key);
			if (input) return input.checked;

			return fallback;
		};

		const resolved: Record<string, boolean> = {};
		for (const key of this.keys) {
			resolved[key] = resolveOption(key, this.table[key].default);
		}
		return resolved as Record<ImportOptionKey, boolean>;
	}

	/**
	 * Normalize the `importOptions` dictionary passed to `_onImport`, filling
	 * in defaults for any missing keys.
	 */
	resolveFromResult(importOptions: Record<string, boolean>): Record<ImportOptionKey, boolean> {
		return Object.fromEntries(
			this.keys.map((key) => [key, importOptions[key] ?? this.table[key].default]),
		) as Record<ImportOptionKey, boolean>;
	}
}

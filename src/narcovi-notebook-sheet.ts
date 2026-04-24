import { logDebug } from './config';

export type FontMode = 'cursive' | 'readable';

const DEFAULT_MODE: FontMode = 'cursive';
const STORAGE_KEY = 'harbinger-house-pf2e:narcovi-font-mode';

/**
 * Apply the Narcovi-notebook treatment (classes, font toggle, font mode)
 * to any JournalEntrySheet root. Exported so HarbingerJournalSheet can
 * fall back to notebook rendering when a document was imported before
 * the sheetClass override landed and still resolves to the generic sheet.
 */
export function applyNarcoviNotebookDecoration($root: JQuery): void {
	const $shell = $root.closest('.journal-sheet');
	$shell.addClass('narcovi-notebook');
	$shell.removeClass('harbinger-journal');
	$root.removeClass('harbinger-journal');

	const mode = readStoredMode();
	applyFontMode($root, mode);
	injectFontToggle($root, mode);
}

function readStoredMode(): FontMode {
	try {
		const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
		return raw === 'readable' ? 'readable' : DEFAULT_MODE;
	} catch {
		return DEFAULT_MODE;
	}
}

function writeStoredMode(mode: FontMode): void {
	try {
		globalThis.localStorage?.setItem(STORAGE_KEY, mode);
	} catch {
		// ignore — preference is non-critical
	}
}

/**
 * Sheet for Narcovi's Notebook — a single in-fiction handout styled as
 * a handwritten journal page on parchment, with a per-player toggle that
 * switches from the cursive hand-style to a plain readable typeface.
 */
export class NarcoviNotebookSheet extends foundry.applications.sheets.journal.JournalEntrySheet {
	constructor(doc: JournalEntryClass, options?: Record<string, unknown>) {
		super(doc, options);

		for (const cls of ['narcovi-notebook', 'harbinger-narcovi-notebook']) {
			if (!this.options.classes.includes(cls)) {
				this.options.classes.push(cls);
			}
		}
	}

	async _onRender(context: unknown, options: unknown): Promise<void> {
		await super._onRender(context, options);

		const $root = $(this.element);
		if ($root.length === 0) return;

		applyNarcoviNotebookDecoration($root);

		logDebug('[NarcoviNotebook] Sheet rendered', {
			journalId: this.document?.id,
		});
	}
}

function injectFontToggle($root: JQuery, mode: FontMode): void {
	// Avoid double-injection on re-render.
	$root.find('.narcovi-font-toggle').remove();

	const label = mode === 'cursive' ? 'Switch to readable font' : 'Switch to handwritten font';

	const $button = $(
		`<button type="button" class="narcovi-font-toggle" data-mode="${mode}">
			<span class="narcovi-font-toggle-icon" aria-hidden="true">&#9998;</span>
			<span class="narcovi-font-toggle-label">${label}</span>
		</button>`,
	);

	// Place the button inside the page content wrapper so it floats over
	// the parchment rather than the dark window chrome.
	const $target = firstExisting($root, [
		'.journal-entry-content',
		'section.journal-entry-content',
		'.journal-entry-pages',
	]);
	($target.length > 0 ? $target : $root).prepend($button);

	$root
		.off('click.narcovi-font-toggle')
		.on('click.narcovi-font-toggle', '.narcovi-font-toggle', (event) => {
			event.preventDefault();
			const current = ($root.attr('data-narcovi-font') as FontMode | undefined) ?? readStoredMode();
			const next: FontMode = current === 'cursive' ? 'readable' : 'cursive';
			applyFontMode($root, next);
			writeStoredMode(next);
			$root.find('.narcovi-font-toggle').attr('data-mode', next);
			$root
				.find('.narcovi-font-toggle-label')
				.text(next === 'cursive' ? 'Switch to readable font' : 'Switch to handwritten font');
			logDebug('[NarcoviNotebook] Font mode toggled', { next });
		});
}

function applyFontMode($root: JQuery, mode: FontMode): void {
	$root.attr('data-narcovi-font', mode);
	$root.closest('.journal-sheet').attr('data-narcovi-font', mode);
}

function firstExisting($root: JQuery, selectors: string[]): JQuery {
	for (const selector of selectors) {
		const $found = $root.find(selector).first();
		if ($found.length > 0) return $found;
	}
	return $();
}

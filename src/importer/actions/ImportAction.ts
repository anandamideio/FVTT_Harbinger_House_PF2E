import type { ImportContext, ImportOptionKey } from '../types';

/**
 * Abstract base for a single post-import action.
 *
 * Each action declares the option key that gates it and implements `apply()`.
 * The pipeline wires an action in by adding one entry to the actions list.
 */
export abstract class ImportAction {
	abstract readonly key: ImportOptionKey;
	abstract apply(context: ImportContext): Promise<void>;
}

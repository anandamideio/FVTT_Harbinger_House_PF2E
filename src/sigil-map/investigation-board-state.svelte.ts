import type { LocationState } from '../types/module-flags';

/**
 * Reactive state bridge between InvestigationBoardApp (TypeScript) and InvestigationBoard (Svelte).
 *
 * The app wrapper mutates `boardState.states` when scene flags change;
 * the Svelte component reads it reactively via $derived.
 * This avoids unmount/remount on every flag update.
 */
export const boardState = $state<{
	states: Record<string, LocationState>;
}>({
	states: {},
});

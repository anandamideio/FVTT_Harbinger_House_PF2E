/**
 * Summarize a document-type → array map to a document-type → count map.
 * Accepts the raw payload shape Foundry passes to _preImport / _onImport.
 */
export function summarizeDocumentCounts(record: unknown): Record<string, number> {
	if (!record || typeof record !== 'object') return {};

	return Object.fromEntries(
		Object.entries(record as Record<string, unknown>).map(([type, docs]) => [
			type,
			Array.isArray(docs) ? docs.length : 0,
		]),
	);
}

/** Return the trimmed string, or undefined if not a non-empty string. */
export function asStringOrUndefined(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

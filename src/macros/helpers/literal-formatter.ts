export function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

function escapeTsString(value: string): string {
	return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function isIdentifierKey(key: string): boolean {
	return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

export function formatTypeScriptLiteral(value: unknown, indent = 0): string {
	if (value === null) return 'null';

	const type = typeof value;
	if (type === 'string') return `'${escapeTsString(value as string)}'`;
	if (type === 'number' || type === 'boolean') return String(value);

	if (Array.isArray(value)) {
		if (value.length === 0) return '[]';
		const padding = '\t'.repeat(indent);
		const childPadding = '\t'.repeat(indent + 1);
		const lines = value.map((entry) => `${childPadding}${formatTypeScriptLiteral(entry, indent + 1)},`);
		return `[\n${lines.join('\n')}\n${padding}]`;
	}

	if (type === 'object') {
		const entries = Object.entries(value as Record<string, unknown>).filter(([, entry]) => entry !== undefined);
		if (entries.length === 0) return '{}';

		const padding = '\t'.repeat(indent);
		const childPadding = '\t'.repeat(indent + 1);
		const lines = entries.map(([key, entry]) => {
			const keyLabel = isIdentifierKey(key) ? key : `'${escapeTsString(key)}'`;
			return `${childPadding}${keyLabel}: ${formatTypeScriptLiteral(entry, indent + 1)},`;
		});

		return `{\n${lines.join('\n')}\n${padding}}`;
	}

	return 'null';
}

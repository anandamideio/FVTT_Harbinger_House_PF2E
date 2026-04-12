import fs from 'node:fs';

import type { DD2VTTFile } from './types.ts';

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export class DD2VTTParser {
	parseFile(filePath: string): DD2VTTFile {
		const raw = fs.readFileSync(filePath, 'utf8');
		const parsed = JSON.parse(raw) as unknown;
		this.validate(parsed, filePath);
		return parsed as DD2VTTFile;
	}

	decodeImageBase64(image: string): Buffer {
		return Buffer.from(image, 'base64');
	}

	private validate(parsed: unknown, filePath: string): void {
		if (!isObject(parsed)) {
			throw new Error(`Invalid dd2vtt payload in ${filePath}: expected an object.`);
		}

		if (!isObject(parsed.resolution)) {
			throw new Error(`Invalid dd2vtt payload in ${filePath}: missing resolution.`);
		}

		const resolution = parsed.resolution as Record<string, unknown>;
		if (!isObject(resolution.map_size) || typeof resolution.pixels_per_grid !== 'number') {
			throw new Error(`Invalid dd2vtt payload in ${filePath}: missing map_size or pixels_per_grid.`);
		}

		if (!Array.isArray(parsed.line_of_sight)) {
			throw new Error(`Invalid dd2vtt payload in ${filePath}: line_of_sight must be an array.`);
		}

		if (!Array.isArray(parsed.portals)) {
			throw new Error(`Invalid dd2vtt payload in ${filePath}: portals must be an array.`);
		}

		if (!Array.isArray(parsed.lights)) {
			throw new Error(`Invalid dd2vtt payload in ${filePath}: lights must be an array.`);
		}

		if (typeof parsed.image !== 'string' || parsed.image.length === 0) {
			throw new Error(`Invalid dd2vtt payload in ${filePath}: image must be a base64 string.`);
		}
	}
}

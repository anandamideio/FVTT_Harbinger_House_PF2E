import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { DD2VTTParser } from '../../../scripts/dd2vtt-importer/dd2vtt-parser';
import { createSampleDD2VTT, createTempDir, writeDD2VTTFile } from '../data/fixtures/dd2vtt-fixtures';

describe('DD2VTTParser', () => {
	it('parses a valid dd2vtt file and decodes the embedded image', () => {
		const tempDir = createTempDir();
		const filePath = path.join(tempDir, 'valid.dd2vtt');
		const expectedBytes = Buffer.from('image-bytes-for-test');
		const data = createSampleDD2VTT({ image: expectedBytes.toString('base64') });
		writeDD2VTTFile(filePath, data);

		const parser = new DD2VTTParser();
		const parsed = parser.parseFile(filePath);

		expect(parsed.resolution.pixels_per_grid).toBe(100);
		expect(parsed.line_of_sight.length).toBe(1);

		const decoded = parser.decodeImageBase64(parsed.image);
		expect(decoded.equals(expectedBytes)).toBe(true);
	});

	it('throws a useful validation error for malformed payloads', () => {
		const tempDir = createTempDir();
		const filePath = path.join(tempDir, 'invalid.dd2vtt');
		const invalid = createSampleDD2VTT();
		fs.writeFileSync(
			filePath,
			JSON.stringify({
				...invalid,
				line_of_sight: 'invalid-shape',
			}),
		);

		const parser = new DD2VTTParser();
		expect(() => parser.parseFile(filePath)).toThrow('line_of_sight must be an array');
	});
});

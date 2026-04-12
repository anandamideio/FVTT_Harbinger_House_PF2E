import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type {
	DD2VTTFile,
	DD2VTTImporterConfig,
	SceneImportSpec,
} from '../../../scripts/dd2vtt-importer/types.ts';

export function createTempDir(prefix = 'dd2vtt-test-'): string {
	return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function createSampleDD2VTT(overrides: Partial<DD2VTTFile> = {}): DD2VTTFile {
	const base: DD2VTTFile = {
		format: 0.3,
		resolution: {
			map_origin: { x: 0, y: 0 },
			map_size: { x: 10, y: 5 },
			pixels_per_grid: 100,
		},
		line_of_sight: [
			[
				{ x: 0, y: 0 },
				{ x: 1, y: 0 },
			],
		],
		objects_line_of_sight: [],
		portals: [],
		lights: [],
		image: Buffer.from('fixture-image').toString('base64'),
	};

	const merged: DD2VTTFile = {
		...base,
		...overrides,
		resolution: {
			...base.resolution,
			...(overrides.resolution ?? {}),
			map_origin: {
				...base.resolution.map_origin,
				...(overrides.resolution?.map_origin ?? {}),
			},
			map_size: {
				...base.resolution.map_size,
				...(overrides.resolution?.map_size ?? {}),
			},
		},
	};

	return merged;
}

export function writeDD2VTTFile(filePath: string, data: DD2VTTFile): void {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, JSON.stringify(data));
}

export function createTestConfig(
	repoRoot: string,
	imports: SceneImportSpec[],
): DD2VTTImporterConfig {
	return {
		paths: {
			repoRoot,
			mapsDir: path.join(repoRoot, 'maps'),
			outputFile: path.join(repoRoot, 'out', 'scenes-imported.ts'),
			modulePrefix: 'modules/test-module/dist/assets/maps',
		},
		defaults: {
			scene: {
				gridDistance: 5,
				defaultFolder: 'Chapter 1',
				defaultSort: 0,
				defaultGlobalLight: true,
				defaultGlobalLightThreshold: 0.749,
			},
			wall: {
				light: 20,
				sight: 20,
				sound: 20,
				move: 20,
				doorType: 'swing',
				doorDirection: 1,
				doorDuration: 750,
				doorStrength: 1,
				doorSound: '',
			},
			light: {
				alphaScale: 0.05,
				attenuation: 0.5,
				luminosity: 0.5,
				coloration: 1,
				saturation: 0,
				contrast: 0,
				animationSpeed: 5,
				animationIntensity: 5,
			},
		},
		imports,
	};
}

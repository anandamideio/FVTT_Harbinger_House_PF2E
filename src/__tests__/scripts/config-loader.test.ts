import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { DD2VTTImportConfigLoader } from '../../../scripts/dd2vtt-importer/config-loader';
import { createTempDir } from '../data/fixtures/dd2vtt-fixtures';

function writeConfig(filePath: string, body: string): void {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, body);
}

describe('DD2VTTImportConfigLoader', () => {
	it('loads TypeScript config and resolves relative paths to absolute', async () => {
		const tempDir = createTempDir();
		const configPath = path.join(tempDir, 'importer.config.ts');
		writeConfig(
			configPath,
			`export default {
				paths: {
					repoRoot: '.',
					mapsDir: './maps',
					outputFile: './out/scenes-imported.ts',
					modulePrefix: 'modules/test-module/dist/assets/maps'
				},
				defaults: {
					scene: {
						gridDistance: 5,
						defaultFolder: 'Chapter 1',
						defaultSort: 0,
						defaultGlobalLight: true,
						defaultGlobalLightThreshold: 0.749
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
						doorSound: ''
					},
					light: {
						alphaScale: 0.05,
						attenuation: 0.5,
						luminosity: 0.5,
						coloration: 1,
						saturation: 0,
						contrast: 0,
						animationSpeed: 5,
						animationIntensity: 5
					}
				},
				imports: [
					{
						input: './inputs/map-a.dd2vtt',
						imageName: 'Map A.png',
						sceneId: 'scene-a',
						sceneName: 'Scene A',
						navOrder: 10
					}
				]
			};`,
		);

		const loader = new DD2VTTImportConfigLoader('scripts/dd2vtt.config.ts');
		const config = await loader.load(configPath);

		expect(config.paths.repoRoot).toBe(path.resolve(tempDir));
		expect(config.paths.mapsDir).toBe(path.resolve(tempDir, 'maps'));
		expect(config.paths.outputFile).toBe(path.resolve(tempDir, 'out/scenes-imported.ts'));
		expect(config.imports[0].input).toBe(path.resolve(tempDir, 'inputs/map-a.dd2vtt'));
	});

	it('fails validation when defaults.scene.defaultGlobalLight is not boolean', async () => {
		const tempDir = createTempDir();
		const configPath = path.join(tempDir, 'invalid.config.ts');
		writeConfig(
			configPath,
			`export default {
				paths: {
					repoRoot: '.',
					mapsDir: './maps',
					outputFile: './out/scenes-imported.ts',
					modulePrefix: 'modules/test-module/dist/assets/maps'
				},
				defaults: {
					scene: {
						gridDistance: 5,
						defaultFolder: 'Chapter 1',
						defaultSort: 0,
						defaultGlobalLight: 'yes',
						defaultGlobalLightThreshold: 0.749
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
						doorSound: ''
					},
					light: {
						alphaScale: 0.05,
						attenuation: 0.5,
						luminosity: 0.5,
						coloration: 1,
						saturation: 0,
						contrast: 0,
						animationSpeed: 5,
						animationIntensity: 5
					}
				},
				imports: []
			};`,
		);

		const loader = new DD2VTTImportConfigLoader('scripts/dd2vtt.config.ts');
		await expect(loader.load(configPath)).rejects.toThrow('defaults.scene.defaultGlobalLight');
	});

	it('throws when the config file does not exist', async () => {
		const loader = new DD2VTTImportConfigLoader('scripts/dd2vtt.config.ts');
		await expect(loader.load('/tmp/missing-dd2vtt-config.ts')).rejects.toThrow('Config file not found');
	});
});

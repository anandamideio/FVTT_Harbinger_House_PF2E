import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { DD2VTTImporterConfig, SceneImportSpec } from './types.ts';

function assertString(value: unknown, label: string, allowEmpty = false): string {
	if (typeof value !== 'string' || (!allowEmpty && value.length === 0)) {
		const expected = allowEmpty ? 'a string' : 'a non-empty string';
		throw new Error(`Expected ${label} to be ${expected}.`);
	}
	return value;
}

function assertNumber(value: unknown, label: string): number {
	if (typeof value !== 'number' || Number.isNaN(value)) {
		throw new Error(`Expected ${label} to be a valid number.`);
	}
	return value;
}

function assertBoolean(value: unknown, label: string): boolean {
	if (typeof value !== 'boolean') {
		throw new Error(`Expected ${label} to be a boolean.`);
	}
	return value;
}

function toAbsolutePath(baseDir: string, candidate: string): string {
	return path.isAbsolute(candidate) ? candidate : path.resolve(baseDir, candidate);
}

export class DD2VTTImportConfigLoader {
	constructor(private readonly defaultConfigPath: string) {}

	async load(configPath?: string): Promise<DD2VTTImporterConfig> {
		const resolvedConfigPath = path.resolve(process.cwd(), configPath ?? this.defaultConfigPath);
		if (!fs.existsSync(resolvedConfigPath)) {
			throw new Error(`Config file not found: ${resolvedConfigPath}`);
		}

		const loadedModule = await import(pathToFileURL(resolvedConfigPath).href);
		const rawConfig = (loadedModule.default ?? loadedModule.config ?? loadedModule) as unknown;
		return this.validate(rawConfig, path.dirname(resolvedConfigPath));
	}

	private validate(rawConfig: unknown, configDir: string): DD2VTTImporterConfig {
		if (!rawConfig || typeof rawConfig !== 'object') {
			throw new Error('Importer config must be an object.');
		}

		const config = rawConfig as Partial<DD2VTTImporterConfig>;
		if (!config.paths || !config.defaults || !Array.isArray(config.imports)) {
			throw new Error('Importer config requires paths, defaults, and imports fields.');
		}

		const repoRoot = toAbsolutePath(configDir, assertString(config.paths.repoRoot, 'paths.repoRoot'));
		const mapsDir = toAbsolutePath(configDir, assertString(config.paths.mapsDir, 'paths.mapsDir'));
		const outputFile = toAbsolutePath(configDir, assertString(config.paths.outputFile, 'paths.outputFile'));
		const modulePrefix = assertString(config.paths.modulePrefix, 'paths.modulePrefix');

		if (!config.defaults.scene || !config.defaults.wall || !config.defaults.light) {
			throw new Error('Importer defaults must include scene, wall, and light sections.');
		}

		const validatedImports = config.imports.map((spec, index) => {
			return this.validateImportSpec(spec, index, repoRoot);
		});

		return {
			paths: {
				repoRoot,
				mapsDir,
				outputFile,
				modulePrefix,
			},
			defaults: {
				scene: {
					gridDistance: assertNumber(config.defaults.scene.gridDistance, 'defaults.scene.gridDistance'),
					defaultFolder: assertString(config.defaults.scene.defaultFolder, 'defaults.scene.defaultFolder'),
					defaultSort: assertNumber(config.defaults.scene.defaultSort, 'defaults.scene.defaultSort'),
						defaultGlobalLight: assertBoolean(
							config.defaults.scene.defaultGlobalLight,
							'defaults.scene.defaultGlobalLight',
						),
					defaultGlobalLightThreshold:
						config.defaults.scene.defaultGlobalLightThreshold == null
							? null
							: assertNumber(
									config.defaults.scene.defaultGlobalLightThreshold,
									'defaults.scene.defaultGlobalLightThreshold',
							),
				},
				wall: {
					light: assertNumber(config.defaults.wall.light, 'defaults.wall.light'),
					sight: assertNumber(config.defaults.wall.sight, 'defaults.wall.sight'),
					sound: assertNumber(config.defaults.wall.sound, 'defaults.wall.sound'),
					move: assertNumber(config.defaults.wall.move, 'defaults.wall.move'),
					doorType: assertString(config.defaults.wall.doorType, 'defaults.wall.doorType'),
					doorDirection: assertNumber(config.defaults.wall.doorDirection, 'defaults.wall.doorDirection'),
					doorDuration: assertNumber(config.defaults.wall.doorDuration, 'defaults.wall.doorDuration'),
					doorStrength: assertNumber(config.defaults.wall.doorStrength, 'defaults.wall.doorStrength'),
					doorSound: assertString(
						config.defaults.wall.doorSound,
						'defaults.wall.doorSound',
						true,
					),
				},
				light: {
					alphaScale: assertNumber(config.defaults.light.alphaScale, 'defaults.light.alphaScale'),
					attenuation: assertNumber(config.defaults.light.attenuation, 'defaults.light.attenuation'),
					luminosity: assertNumber(config.defaults.light.luminosity, 'defaults.light.luminosity'),
					coloration: assertNumber(config.defaults.light.coloration, 'defaults.light.coloration'),
					saturation: assertNumber(config.defaults.light.saturation, 'defaults.light.saturation'),
					contrast: assertNumber(config.defaults.light.contrast, 'defaults.light.contrast'),
					animationSpeed: assertNumber(
						config.defaults.light.animationSpeed,
						'defaults.light.animationSpeed',
					),
					animationIntensity: assertNumber(
						config.defaults.light.animationIntensity,
						'defaults.light.animationIntensity',
					),
				},
			},
			imports: validatedImports,
		};
	}

	private validateImportSpec(spec: unknown, index: number, repoRoot: string): SceneImportSpec {
		if (!spec || typeof spec !== 'object') {
			throw new Error(`Import entry ${index} must be an object.`);
		}
		const rawSpec = spec as Partial<SceneImportSpec>;
		const inputValue = assertString(rawSpec.input, `imports[${index}].input`);

		return {
			input: path.isAbsolute(inputValue) ? inputValue : path.resolve(repoRoot, inputValue),
			imageName: assertString(rawSpec.imageName, `imports[${index}].imageName`),
			sceneId: assertString(rawSpec.sceneId, `imports[${index}].sceneId`),
			sceneName: assertString(rawSpec.sceneName, `imports[${index}].sceneName`),
			navOrder: assertNumber(rawSpec.navOrder, `imports[${index}].navOrder`),
			folder: rawSpec.folder,
			sort: rawSpec.sort,
			darkness: rawSpec.darkness,
			globalLight: rawSpec.globalLight,
			globalLightThreshold: rawSpec.globalLightThreshold,
			environment: rawSpec.environment,
		};
	}
}

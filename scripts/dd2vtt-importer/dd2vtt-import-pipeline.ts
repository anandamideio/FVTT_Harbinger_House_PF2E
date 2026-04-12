import fs from 'node:fs';
import path from 'node:path';

import { DD2VTTParser } from './dd2vtt-parser.ts';
import { SceneAssetWriter } from './scene-asset-writer.ts';
import { ScenePlaceableConverter } from './scene-placeable-converter.ts';
import { ScenesModuleEmitter } from './scenes-module-emitter.ts';
import type {
	DD2VTTImportPipelineOptions,
	DD2VTTImportReport,
	GeneratedScene,
	ImportSceneResult,
	SceneImportSpec,
} from './types.ts';

export class DD2VTTImportPipeline {
	private readonly parser = new DD2VTTParser();
	private readonly converter: ScenePlaceableConverter;
	private readonly assetWriter: SceneAssetWriter;
	private readonly emitter: ScenesModuleEmitter;

	constructor(private readonly options: DD2VTTImportPipelineOptions) {
		this.converter = new ScenePlaceableConverter(
			options.config.defaults.scene,
			options.config.defaults.wall,
			options.config.defaults.light,
		);
		this.assetWriter = new SceneAssetWriter(options.config.paths.mapsDir);
		this.emitter = new ScenesModuleEmitter(
			options.config.paths.modulePrefix,
			options.config.defaults.scene,
		);
	}

	run(): DD2VTTImportReport {
		this.options.logger.info('Importing .dd2vtt files:');
		if (!this.options.allowMissingInputs) {
			const missingInputs = this.getMissingInputs();
			if (missingInputs.length > 0) {
				const message = [
					`Missing ${missingInputs.length} configured input file(s):`,
					...missingInputs.map((input) => `  - ${input}`),
					'Fix the config paths or pass --allow-missing to continue with partial imports.',
				].join('\n');
				throw new Error(message);
			}
		}

		const generatedScenes: GeneratedScene[] = [];
		const skippedInputs: string[] = [];

		for (const spec of this.options.config.imports) {
			const result = this.runOne(spec);
			if (result.scene) {
				generatedScenes.push(result.scene);
			} else {
				skippedInputs.push(result.resolvedInput);
			}
		}

		if (generatedScenes.length === 0) {
			this.options.logger.warn('No .dd2vtt files were imported.');
			return {
				totalImports: this.options.config.imports.length,
				importedCount: 0,
				skippedCount: skippedInputs.length,
				skippedInputs,
				outputFile: this.options.config.paths.outputFile,
				wroteModule: false,
			};
		}

		if (this.options.dryRun) {
			this.options.logger.info(`Dry run complete. ${generatedScenes.length} scenes would be emitted.`);
			return {
				totalImports: this.options.config.imports.length,
				importedCount: generatedScenes.length,
				skippedCount: skippedInputs.length,
				skippedInputs,
				outputFile: this.options.config.paths.outputFile,
				wroteModule: false,
			};
		}

		const source = this.emitter.renderModule(generatedScenes);
		const outputDir = path.dirname(this.options.config.paths.outputFile);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}
		this.emitter.writeModule(this.options.config.paths.outputFile, source);
		this.options.logger.info(
			`  wrote ${path.relative(this.options.config.paths.repoRoot, this.options.config.paths.outputFile)}`,
		);

		return {
			totalImports: this.options.config.imports.length,
			importedCount: generatedScenes.length,
			skippedCount: skippedInputs.length,
			skippedInputs,
			outputFile: this.options.config.paths.outputFile,
			wroteModule: true,
		};
	}

	runOne(spec: SceneImportSpec): ImportSceneResult {
		const resolvedInput = path.isAbsolute(spec.input)
			? spec.input
			: path.resolve(this.options.config.paths.repoRoot, spec.input);
		if (!fs.existsSync(resolvedInput)) {
			this.options.logger.warn(`  SKIP ${path.basename(resolvedInput)} (source file missing)`);
			return {
				scene: null,
				reason: 'missing-input',
				resolvedInput,
			};
		}

		this.options.logger.info(`  Reading ${path.basename(resolvedInput)}`);
		const data = this.parser.parseFile(resolvedInput);
		const imageBuffer = this.parser.decodeImageBase64(data.image);
		if (!this.options.dryRun) {
			const imagePath = this.assetWriter.writeSceneImage(spec.imageName, imageBuffer);
			this.options.logger.info(
				`    wrote image -> ${path.relative(this.options.config.paths.repoRoot, imagePath)} (${imageBuffer.length} bytes)`,
			);
		} else {
			this.options.logger.info(
				`    dry-run image write -> ${path.join('src/assets/maps', spec.imageName)} (${imageBuffer.length} bytes)`,
			);
		}

		const scene = this.converter.buildGeneratedScene(spec, data);
		this.options.logger.info(
			`    ${scene.walls.length} walls (${(data.line_of_sight ?? []).length} polylines, ${(data.portals ?? []).length} doors), ${scene.lights.length} lights`,
		);

		return {
			scene,
			resolvedInput,
		};
	}

	private getMissingInputs(): string[] {
		const missing: string[] = [];
		for (const spec of this.options.config.imports) {
			const resolvedInput = path.isAbsolute(spec.input)
				? spec.input
				: path.resolve(this.options.config.paths.repoRoot, spec.input);
			if (!fs.existsSync(resolvedInput)) {
				missing.push(resolvedInput);
			}
		}
		return missing;
	}
}

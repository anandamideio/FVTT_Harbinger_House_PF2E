import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { DD2VTTImportPipeline } from '../../../scripts/dd2vtt-importer/dd2vtt-import-pipeline';
import type { ImporterLogger, SceneImportSpec } from '../../../scripts/dd2vtt-importer/types';
import {
	createSampleDD2VTT,
	createTempDir,
	createTestConfig,
	writeDD2VTTFile,
} from '../helpers/dd2vtt-fixtures';

function createLoggerCapture(): {
	logger: ImporterLogger;
	info: string[];
	warn: string[];
	error: string[];
} {
	const info: string[] = [];
	const warn: string[] = [];
	const error: string[] = [];
	return {
		logger: {
			info: (message) => info.push(message),
			warn: (message) => warn.push(message),
			error: (message) => error.push(message),
		},
		info,
		warn,
		error,
	};
}

function makeImportSpec(input: string, sceneId: string, sceneName: string, imageName: string): SceneImportSpec {
	return {
		input,
		imageName,
		sceneId,
		sceneName,
		navOrder: 10,
		folder: 'Chapter 1',
		sort: 100,
		darkness: 0,
	};
}

describe('DD2VTTImportPipeline', () => {
	it('fails fast by default when any configured input file is missing', () => {
		const tempDir = createTempDir();
		const existingInput = path.join(tempDir, 'inputs', 'scene-a.dd2vtt');
		const missingInput = path.join(tempDir, 'inputs', 'scene-b.dd2vtt');
		writeDD2VTTFile(existingInput, createSampleDD2VTT());

		const config = createTestConfig(tempDir, [
			makeImportSpec(existingInput, 'scene-a', 'Scene A', 'Scene A.png'),
			makeImportSpec(missingInput, 'scene-b', 'Scene B', 'Scene B.png'),
		]);
		const { logger } = createLoggerCapture();
		const pipeline = new DD2VTTImportPipeline({
			config,
			dryRun: false,
			allowMissingInputs: false,
			logger,
		});

		expect(() => pipeline.run()).toThrow('Missing 1 configured input file(s)');
		expect(fs.existsSync(config.paths.outputFile)).toBe(false);
	});

	it('supports partial imports when allowMissingInputs is enabled', () => {
		const tempDir = createTempDir();
		const existingInput = path.join(tempDir, 'inputs', 'scene-a.dd2vtt');
		const missingInput = path.join(tempDir, 'inputs', 'scene-b.dd2vtt');
		writeDD2VTTFile(existingInput, createSampleDD2VTT());

		const config = createTestConfig(tempDir, [
			makeImportSpec(existingInput, 'scene-a', 'Scene A', 'Scene A.png'),
			makeImportSpec(missingInput, 'scene-b', 'Scene B', 'Scene B.png'),
		]);
		const { logger, warn } = createLoggerCapture();
		const pipeline = new DD2VTTImportPipeline({
			config,
			dryRun: true,
			allowMissingInputs: true,
			logger,
		});

		const report = pipeline.run();
		expect(report.importedCount).toBe(1);
		expect(report.skippedCount).toBe(1);
		expect(report.wroteModule).toBe(false);
		expect(warn.some((line) => line.includes('source file missing'))).toBe(true);
	});

	it('writes images and generated module when all inputs exist', () => {
		const tempDir = createTempDir();
		const inputA = path.join(tempDir, 'inputs', 'scene-a.dd2vtt');
		const inputB = path.join(tempDir, 'inputs', 'scene-b.dd2vtt');

		writeDD2VTTFile(inputA, createSampleDD2VTT());
		writeDD2VTTFile(
			inputB,
			createSampleDD2VTT({
				lights: [
					{
						position: { x: 1, y: 1 },
						range: 4,
						intensity: 2,
						color: 'ffff8800',
						shadows: false,
					},
				],
			}),
		);

		const config = createTestConfig(tempDir, [
			makeImportSpec(inputA, 'scene-a', 'Scene A', 'Scene A.png'),
			makeImportSpec(inputB, 'scene-b', 'Scene B', 'Scene B.png'),
		]);
		const { logger } = createLoggerCapture();
		const pipeline = new DD2VTTImportPipeline({
			config,
			dryRun: false,
			allowMissingInputs: false,
			logger,
		});

		const report = pipeline.run();
		expect(report.importedCount).toBe(2);
		expect(report.skippedCount).toBe(0);
		expect(report.wroteModule).toBe(true);

		const imageA = path.join(config.paths.mapsDir, 'Scene A.png');
		const imageB = path.join(config.paths.mapsDir, 'Scene B.png');
		expect(fs.existsSync(imageA)).toBe(true);
		expect(fs.existsSync(imageB)).toBe(true);

		const source = fs.readFileSync(config.paths.outputFile, 'utf8');
		expect(source).toContain('scene-a');
		expect(source).toContain('scene-b');
		expect(source).toContain('Scene A.png');
		expect(source).toContain('Scene B.png');
	});
});

import { describe, expect, it } from 'vitest';

import { ScenePlaceableConverter } from '../../../scripts/dd2vtt-importer/scene-placeable-converter';
import type {
	LightDefaults,
	SceneDefaults,
	SceneImportSpec,
	WallDefaults,
} from '../../../scripts/dd2vtt-importer/types';
import { createSampleDD2VTT } from '../helpers/dd2vtt-fixtures';

const sceneDefaults: SceneDefaults = {
	gridDistance: 5,
	defaultFolder: 'Chapter 1',
	defaultSort: 0,
	defaultGlobalLight: true,
	defaultGlobalLightThreshold: 0.749,
};

const wallDefaults: WallDefaults = {
	light: 20,
	sight: 20,
	sound: 20,
	move: 20,
	doorType: 'swing',
	doorDirection: 1,
	doorDuration: 750,
	doorStrength: 1,
	doorSound: '',
};

const lightDefaults: LightDefaults = {
	alphaScale: 0.05,
	attenuation: 0.5,
	luminosity: 0.5,
	coloration: 1,
	saturation: 0,
	contrast: 0,
	animationSpeed: 5,
	animationIntensity: 5,
};

const baseSpec: SceneImportSpec = {
	input: '/tmp/example.dd2vtt',
	imageName: 'Example.png',
	sceneId: 'scene-example',
	sceneName: 'Example Scene',
	navOrder: 10,
};

describe('ScenePlaceableConverter', () => {
	it('converts walls, doors, and lights into Foundry-ready scene data', () => {
		const converter = new ScenePlaceableConverter(sceneDefaults, wallDefaults, lightDefaults);
		const data = createSampleDD2VTT({
			resolution: {
				map_origin: { x: 0, y: 0 },
				map_size: { x: 20, y: 10 },
				pixels_per_grid: 50,
			},
			line_of_sight: [
				[
					{ x: 0, y: 0 },
					{ x: 2, y: 0 },
					{ x: 2, y: 2 },
				],
			],
			objects_line_of_sight: [
				[
					{ x: 2, y: 2 },
					{ x: 3, y: 2 },
				],
			],
			portals: [
				{
					position: { x: 4, y: 2 },
					bounds: [
						{ x: 4, y: 2 },
						{ x: 4, y: 3 },
					],
					rotation: 0,
					closed: false,
					freestanding: false,
				},
			],
			lights: [
				{
					position: { x: 1, y: 2 },
					range: 4,
					intensity: 4,
					color: 'ffff0000',
					shadows: true,
				},
			],
		});

		const scene = converter.buildGeneratedScene(baseSpec, data);
		expect(scene.width).toBe(1000);
		expect(scene.height).toBe(500);
		expect(scene.walls).toHaveLength(4);
		expect(scene.walls[3].door).toBe(1);
		expect(scene.walls[3].ds).toBe(1);
		expect(scene.walls[3].animation?.type).toBe('swing');

		expect(scene.lights).toHaveLength(1);
		expect(scene.lights[0].x).toBe(50);
		expect(scene.lights[0].y).toBe(100);
		expect(scene.lights[0].config.dim).toBe(20);
		expect(scene.lights[0].config.bright).toBe(10);
		expect(scene.lights[0].config.alpha).toBe(0.2);
		expect(scene.lights[0].config.color).toBe('#ff0000');

		expect(scene.globalLight).toBe(true);
		expect(scene.globalLightThreshold).toBe(0.749);
	});

	it('clamps computed light alpha to 1.0 for very high intensity values', () => {
		const converter = new ScenePlaceableConverter(sceneDefaults, wallDefaults, lightDefaults);
		const data = createSampleDD2VTT({
			lights: [
				{
					position: { x: 1, y: 1 },
					range: 3,
					intensity: 100,
					color: 'ffffffff',
					shadows: false,
				},
			],
		});

		const scene = converter.buildGeneratedScene(baseSpec, data);
		expect(scene.lights[0].config.alpha).toBe(1);
	});

	it('honors explicit scene overrides for darkness and global light', () => {
		const converter = new ScenePlaceableConverter(sceneDefaults, wallDefaults, lightDefaults);
		const data = createSampleDD2VTT();

		const scene = converter.buildGeneratedScene(
			{
				...baseSpec,
				darkness: 0.6,
				globalLight: false,
				globalLightThreshold: 0.2,
			},
			data,
		);

		expect(scene.darkness).toBe(0.6);
		expect(scene.globalLight).toBe(false);
		expect(scene.globalLightThreshold).toBe(0.2);
	});
});

import { describe, expect, it } from 'vitest';
import { MODULE_ID } from '../../config';
import type { HarbingerScene } from '../../data/scenes/types';
import { sceneToDocumentData } from '../../data/to-foundry-data';

const BASE_SCENE: HarbingerScene = {
	id: 'scene-test',
	name: 'Test Scene',
	img: 'modules/harbinger-house-pf2e/dist/assets/maps/Test.jpg',
	background: {
		src: 'modules/harbinger-house-pf2e/dist/assets/maps/Test.jpg',
	},
	grid: {
		type: 1,
		size: 70,
		distance: 5,
		units: 'ft',
	},
	initial: {
		x: null,
		y: null,
		scale: 1,
	},
	width: 1000,
	height: 1000,
	navigation: true,
	navOrder: 1,
};

describe('sceneToDocumentData', () => {
	it('emits V13 fog and environment defaults', () => {
		const doc = sceneToDocumentData(BASE_SCENE);

		expect(doc.tokenVision).toBe(true);
		expect(doc.fogExploration).toBe(true);
		expect(doc.fog.exploration).toBe(true);
		expect(doc.fog.colors).toEqual({ explored: null, unexplored: null });
		expect(doc.fog.overlay).toBeNull();
		expect(typeof doc.fog.reset).toBe('number');

		expect(doc.environment.darknessLevel).toBe(0);
		expect(doc.environment.darknessLevelLock).toBe(false);
		expect(doc.environment.cycle).toBe(false);
		expect(doc.environment.globalLight.enabled).toBe(0);
		expect(doc.environment.globalLight.bright).toBe(false);
		expect(doc.globalLight).toBe(false);
		expect(doc.globalLightThreshold).toBeNull();
		expect(doc.foreground).toBeNull();
		expect(doc.darkness).toBe(0);
		expect(doc.grid?.style).toBe('solidLines');
		expect(doc.grid?.thickness).toBe(1);
		expect(doc.grid?.color).toBe('#000000');
		expect(doc.grid?.alpha).toBe(0.2);
	});

	it('passes through explicit scene foreground image path', () => {
		const doc = sceneToDocumentData({
			...BASE_SCENE,
			foreground: 'modules/harbinger-house-pf2e/dist/assets/maps/Test-foreground.webp',
		});

		expect(doc.foreground).toBe('modules/harbinger-house-pf2e/dist/assets/maps/Test-foreground.webp');
	});

	it('passes through explicit grid style overrides', () => {
		const doc = sceneToDocumentData({
			...BASE_SCENE,
			grid: {
				...BASE_SCENE.grid,
				style: 'pointyHexes',
				thickness: 3,
				color: '#fef08a',
				alpha: 0.45,
			},
		});

		expect(doc.grid?.style).toBe('pointyHexes');
		expect(doc.grid?.thickness).toBe(3);
		expect(doc.grid?.color).toBe('#fef08a');
		expect(doc.grid?.alpha).toBe(0.45);
	});

	it('applies scene darkness to environment and legacy fields', () => {
		const doc = sceneToDocumentData({ ...BASE_SCENE, darkness: 0.75 });

		expect(doc.environment.darknessLevel).toBe(0.75);
		expect(doc.darkness).toBe(0.75);
	});

	it('enables global light with threshold when configured', () => {
		const doc = sceneToDocumentData({
			...BASE_SCENE,
			darkness: 0.6,
			globalLight: true,
			globalLightThreshold: 0.749,
		});

		expect(doc.globalLight).toBe(true);
		expect(doc.globalLightThreshold).toBe(0.749);
		expect(doc.environment.globalLight.enabled).toBe(1);
		expect(doc.environment.globalLight.darkness).toEqual({ min: 0, max: 0.749 });
	});

	it('clamps out-of-range darkness values', () => {
		const dark = sceneToDocumentData({ ...BASE_SCENE, darkness: 5 });
		const light = sceneToDocumentData({ ...BASE_SCENE, darkness: -1 });

		expect(dark.darkness).toBe(1);
		expect(dark.environment.darknessLevel).toBe(1);
		expect(light.darkness).toBe(0);
		expect(light.environment.darknessLevel).toBe(0);
	});

	it('respects per-scene vision and fog exploration overrides', () => {
		const doc = sceneToDocumentData({
			...BASE_SCENE,
			tokenVision: false,
			fogExploration: false,
		});

		expect(doc.tokenVision).toBe(false);
		expect(doc.fogExploration).toBe(false);
		expect(doc.fog.exploration).toBe(false);
	});

	it('does not auto-generate Sigil scene notes', () => {
		const doc = sceneToDocumentData({
			...BASE_SCENE,
			id: 'scene-sigil',
			name: 'Sigil',
		});

		expect(doc.notes).toEqual([]);
	});

	it('applies default background offsets', () => {
		const doc = sceneToDocumentData(BASE_SCENE);

		expect(doc.background?.offsetX).toBe(6);
		expect(doc.background?.offsetY).toBe(2);
		expect(doc.background?.scaleX).toBe(1);
		expect(doc.background?.scaleY).toBe(1);
	});

	it('respects explicit background offset overrides', () => {
		const doc = sceneToDocumentData({
			...BASE_SCENE,
			background: {
				...BASE_SCENE.background,
				offsetX: 14,
				offsetY: 9,
			},
		});

		expect(doc.background?.offsetX).toBe(14);
		expect(doc.background?.offsetY).toBe(9);
	});

	it('respects explicit background scale overrides', () => {
		const doc = sceneToDocumentData({
			...BASE_SCENE,
			background: {
				...BASE_SCENE.background,
				scaleX: 2,
				scaleY: 2,
			},
		});

		expect(doc.background?.scaleX).toBe(2);
		expect(doc.background?.scaleY).toBe(2);
	});

	it('passes through explicit embedded placeables', () => {
		const walls = [{ c: [0, 0, 100, 0], move: 1, sense: 1, sound: 1, door: 0, ds: 0, dir: 0 }];
		const lights = [{ x: 240, y: 320, config: { dim: 20, bright: 10, color: '#ffd680' } }];
		const sounds = [{ x: 120, y: 80, path: 'modules/harbinger-house-pf2e/dist/assets/sounds/wind.ogg' }];
		const tokens = [{ x: 140, y: 220, name: 'Test Token' }];
		const drawings = [{ shape: { type: 'r', width: 120, height: 80 }, x: 30, y: 40 }];
		const templates = [{ x: 300, y: 180, t: 'circle', distance: 15 }];
		const tiles = [{ x: 0, y: 0, width: 256, height: 256, img: 'modules/test/tile.webp' }];
		const notes = [{ x: 400, y: 200, text: 'Clue marker' }];

		const doc = sceneToDocumentData({
			...BASE_SCENE,
			walls,
			lights,
			sounds,
			tokens,
			drawings,
			templates,
			tiles,
			notes,
		});

		expect(doc.walls).toEqual(walls);
		expect(doc.lights).toEqual(lights);
		expect(doc.sounds).toEqual(sounds);
		expect(doc.tokens).toEqual(tokens);
		expect(doc.drawings).toEqual(drawings);
		expect(doc.templates).toEqual(templates);
		expect(doc.tiles).toEqual(tiles);
		expect(doc.notes).toEqual(notes);
	});

	it('emits default map folder hint when no chapter is set', () => {
		const doc = sceneToDocumentData(BASE_SCENE);
		const moduleFlags = (doc.flags?.[MODULE_ID] ?? {}) as { folder?: string };

		expect(moduleFlags.folder).toBe('Maps');
	});

	it('emits chapter folder hint when provided by scene data', () => {
		const doc = sceneToDocumentData({
			...BASE_SCENE,
			folder: 'Chapter 3',
		});
		const moduleFlags = (doc.flags?.[MODULE_ID] ?? {}) as { folder?: string };

		expect(moduleFlags.folder).toBe('Chapter 3');
	});
});

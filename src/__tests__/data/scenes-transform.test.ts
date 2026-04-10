import { describe, expect, it } from 'vitest';
import type { HarbingerScene } from '../../data/scenes';
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
});

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
});

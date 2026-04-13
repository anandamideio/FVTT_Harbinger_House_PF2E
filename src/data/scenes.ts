import { CHAPTER_1_SCENES } from './scenes/chapter-1-scenes';
import { CHAPTER_2_SCENES } from './scenes/chapter-2-scenes';
import { CHAPTER_3_SCENES } from './scenes/chapter-3-scenes';
import { IMPORTED_DD2VTT_SCENES } from './scenes/scenes-imported';
import type { HarbingerScene } from './scenes/types';

/** All Harbinger House scenes organized by chapter */
export const ALL_SCENES: HarbingerScene[] = [
	...IMPORTED_DD2VTT_SCENES,
	...CHAPTER_1_SCENES,
	...CHAPTER_2_SCENES,
	...CHAPTER_3_SCENES,
];

export const SCENES_BY_FOLDER = ALL_SCENES.reduce(
	(acc, scene) => {
		const folder = scene.folder || 'Maps';
		if (!acc[folder]) {
			acc[folder] = [];
		}
		acc[folder].push(scene);
		return acc;
	},
	{} as Record<string, HarbingerScene[]>,
);

import type { HarbingerScene } from './types';

export const CHAPTER_1_SCENES: HarbingerScene[] = [
  {
		id: 'scene-sigil',
		name: 'Sigil',
		img: 'modules/harbinger-house-pf2e/dist/assets/maps/Sigil.webp',
		background: {
			src: 'modules/harbinger-house-pf2e/dist/assets/maps/Sigil.webp',
		},
		grid: {
			type: 1,
			size: 102,
			distance: 5,
			units: 'ft',
		},
		initial: {
			x: null,
			y: null,
			scale: 1,
		},
		width: 6400,
		height: 4400,
		navigation: true,
		navOrder: -1,
		tokenVision: false,
		fogExploration: false,
		folder: 'Chapter 1',
		sort: 0,
		playlistSourceId: 'playlist-sigil-ambiance',
	},
];

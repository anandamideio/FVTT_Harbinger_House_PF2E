export interface HarbingerScene {
	id: string;
	name: string;
	/** Path to the map image */
	img: string;
	/** Background image configuration */
	background: {
		src: string;
		offsetX?: number;
		offsetY?: number;
	};
	/** Grid configuration - PF2E uses 5ft squares */
	grid: {
		type: number; // 1 = Square
		size: number; // Pixels per grid square
		distance: number; // 5 feet for PF2E
		units: string; // 'ft'
	};
	/** Initial view positioning */
	initial: {
		x: number | null;
		y: number | null;
		scale: number;
	};
	/** Map dimensions in pixels - will be auto-detected by Foundry */
	width: number;
	height: number;
	/** Navigation order */
	navigation: boolean;
	navOrder: number;
	/** If false, players do not need a token with vision on this scene */
	tokenVision?: boolean;
	/** If false, scene fog exploration progress is not recorded */
	fogExploration?: boolean;
	/** Optional embedded scene placeables exported from Foundry */
	drawings?: object[];
	tokens?: object[];
	lights?: object[];
	notes?: object[];
	sounds?: object[];
	templates?: object[];
	tiles?: object[];
	walls?: object[];
	/** Folder for organization */
	folder?: string;
	sort?: number;
}

/**
 * All Harbinger House scenes
 * Organized by chapter
 */
export const ALL_SCENES: HarbingerScene[] = [
	{
		id: 'scene-sigil',
		name: 'Sigil',
		img: 'modules/harbinger-house-pf2e/dist/assets/maps/Sigil.jpg',
		background: {
			src: 'modules/harbinger-house-pf2e/dist/assets/maps/Sigil.jpg',
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
	},
	{
		id: 'scene-first-floor',
		name: 'Harbinger House - First Floor',
		img: 'modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House 01 - First Floor.png',
		background: {
			src: 'modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House 01 - First Floor.png',
		},
		grid: {
			type: 1, // Square grid
			size: 102,
			distance: 5,
			units: 'ft',
		},
		initial: {
			x: null,
			y: null,
			scale: 1,
		},
		width: 1546,
		height: 927,
		navigation: true,
		navOrder: 1,
		folder: 'Chapter 3',
		sort: 100,
	},
	{
		id: 'scene-common-area',
		name: 'Harbinger House - Common Area',
		img: 'modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Common Area.png',
		background: {
			src: 'modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Common Area.png',
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
		width: 1844,
		height: 1434,
		navigation: true,
		navOrder: 2,
		folder: 'Chapter 3',
		sort: 200,
	},
	{
		id: 'scene-doors-kaydis-room',
		name: "Harbinger House - Doors and Kaydi's Room",
		img: "modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Doors and Kaydi's Room.png",
		background: {
			src: "modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Doors and Kaydi's Room.png",
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
		width: 1639,
		height: 2356,
		navigation: true,
		navOrder: 3,
		folder: 'Chapter 3',
		sort: 300,
	},
	{
		id: 'scene-final-chamber-bigger',
		name: 'Harbinger House - Final Chamber (Bigger Ritual)',
		img: 'modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Final Chamber Bigger Ritual.jpeg',
		background: {
			src: 'modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Final Chamber Bigger Ritual.jpeg',
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
		width: 3776,
		height: 3553,
		navigation: true,
		navOrder: 4,
		folder: 'Chapter 3',
		sort: 400,
	},
	{
		id: 'scene-final-chamber',
		name: 'Harbinger House - Final Chamber',
		img: 'modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Final Chamber.jpeg',
		background: {
			src: 'modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Final Chamber.jpeg',
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
		width: 3776,
		height: 3553,
		navigation: true,
		navOrder: 5,
		folder: 'Chapter 3',
		sort: 500,
	},
	{
		id: 'scene-hall-of-mirrors',
		name: "Harbinger House - Hall of Mirrors & Chance's Room",
		img: "modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Hall of Mirrors & Chance's Room.png",
		background: {
			src: "modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Hall of Mirrors & Chance's Room.png",
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
		width: 2458,
		height: 1689,
		navigation: true,
		navOrder: 6,
		folder: 'Chapter 3',
		sort: 600,
	},
	{
		id: 'scene-mind-trap',
		name: 'Harbinger House - Inside Mind Trap',
		img: 'modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Inside Mind Trap.jpeg',
		background: {
			src: 'modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Inside Mind Trap.jpeg',
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
		width: 2420,
		height: 2420,
		navigation: true,
		navOrder: 7,
		folder: 'Chapter 3',
		sort: 700,
	},
	{
		id: 'scene-statues-gardens',
		name: 'Harbinger House - Statues and Gardens',
		img: 'modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Statues and Gardens.jpeg',
		background: {
			src: 'modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Statues and Gardens.jpeg',
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
		width: 3072,
		height: 1945,
		navigation: true,
		navOrder: 8,
		folder: 'Chapter 3',
		sort: 800,
	},
	{
		id: 'scene-vorina-teela',
		name: "Harbinger House - Vorina and Teela's Area",
		img: "modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Vorina and Teela's Area.jpeg",
		background: {
			src: "modules/harbinger-house-pf2e/dist/assets/maps/Harbinger House Vorina and Teela's Area.jpeg",
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
		width: 2560,
		height: 1843,
		navigation: true,
		navOrder: 0, // First in navigation
		folder: 'Chapter 3',
		sort: 50,
	},
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

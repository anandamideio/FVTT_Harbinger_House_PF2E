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
	/** Scene darkness level 0..1 (0 = full daylight, 1 = pitch black). Drives both `environment.darknessLevel` and the legacy `darkness` field. */
	darkness?: number;
	/** Whether the scene's global ambient illumination is enabled (lets the base map stay visible under darkness). */
	globalLight?: boolean;
	/** Darkness threshold above which the global light turns off. Pair with `darkness` for night scenes (e.g. darkness 0.6, threshold 0.749). */
	globalLightThreshold?: number | null;
	/**
	 * Partial override for Foundry v13's `environment` block.
	 * Anything provided here is merged over the computed defaults, so you can set
	 * a night cycle tint (`cycle: true`, `dark: { hue, luminosity }`) without
	 * having to restate the rest of the environment object.
	 */
	environment?: {
		cycle?: boolean;
		base?: {
			hue?: number;
			intensity?: number;
			luminosity?: number;
			saturation?: number;
			shadows?: number;
		};
		dark?: {
			hue?: number;
			intensity?: number;
			luminosity?: number;
			saturation?: number;
			shadows?: number;
		};
	};
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
	/**
	 * Source ID of a HarbingerPlaylist that should auto-play when this scene is viewed.
	 * Resolved to the deterministic compendium _id at build time.
	 */
	playlistSourceId?: string;
}

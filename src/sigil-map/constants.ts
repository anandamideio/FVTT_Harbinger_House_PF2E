import { MODULE_ID } from '../config';

// ============================================================================
// Category Colors (PIXI hex format)
// ============================================================================

export const CATEGORY_COLORS = {
	'murder-site': 0xff2222, // Blood red
	'faction-hq': 0x4488ff, // Blue
	'shop': 0xffaa22, // Amber/gold
	'landmark': 0xaa88ff, // Purple
	'encounter': 0x44dd44, // Green
	'hideout': 0x888888, // Gray
} as const;

/** CSS-friendly hex versions of category colors */
export const CATEGORY_COLORS_CSS = {
	'murder-site': '#ff2222',
	'faction-hq': '#4488ff',
	'shop': '#ffaa22',
	'landmark': '#aa88ff',
	'encounter': '#44dd44',
	'hideout': '#888888',
} as const;

// ============================================================================
// Marker Sizes
// ============================================================================

/** Base icon size in pixels (at 1x scene zoom) */
export const MARKER_ICON_SIZE = 48;

/** Hit area radius for mouse interaction */
export const MARKER_HIT_RADIUS = 32;

/** Background glow radius */
export const MARKER_GLOW_RADIUS = 40;

/** Pulse ring max radius */
export const MARKER_PULSE_MAX_RADIUS = 64;

/** Label font size */
export const MARKER_LABEL_FONT_SIZE = 14;

/** Label offset below icon */
export const MARKER_LABEL_OFFSET_Y = 36;

/**
 * How strongly markers resist shrinking when zooming out.
 * 0 = no compensation, 1 = full inverse zoom compensation,
 * values above 1 overshoot for extra readability when heavily zoomed out.
 */
export const MARKER_ZOOM_COMPENSATION_STRENGTH = 1.12;

/** Minimum marker scale multiplier from zoom compensation. */
export const MARKER_ZOOM_SCALE_MIN = 0.85;

/** Maximum marker scale multiplier from zoom compensation. */
export const MARKER_ZOOM_SCALE_MAX = 3.5;

// ============================================================================
// Animation Timing (milliseconds)
// ============================================================================

export const ANIM = {
	/** hidden -> discovered: light burst duration */
	DISCOVER_BURST_DURATION: 400,
	/** hidden -> discovered: icon fade-in start */
	DISCOVER_ICON_START: 200,
	/** hidden -> discovered: icon fade-in end */
	DISCOVER_ICON_END: 600,
	/** hidden -> discovered: total animation time */
	DISCOVER_TOTAL: 800,

	/** discovered -> investigated: glow intensify duration */
	INVESTIGATE_GLOW_DURATION: 200,
	/** discovered -> investigated: particle spiral duration */
	INVESTIGATE_PARTICLE_DURATION: 600,
	/** discovered -> investigated: icon saturation shift start */
	INVESTIGATE_ICON_START: 200,
	/** discovered -> investigated: icon saturation shift end */
	INVESTIGATE_ICON_END: 500,
	/** discovered -> investigated: completion flash start */
	INVESTIGATE_FLASH_START: 500,
	/** discovered -> investigated: completion flash end */
	INVESTIGATE_FLASH_END: 700,
	/** discovered -> investigated: label fade-in start */
	INVESTIGATE_LABEL_START: 500,
	/** discovered -> investigated: label fade-in end */
	INVESTIGATE_LABEL_END: 800,
	/** discovered -> investigated: total animation time */
	INVESTIGATE_TOTAL: 800,

	/** Ambient glow pulse period (ms per cycle) */
	AMBIENT_PULSE_PERIOD: 3000,
	/** Ambient glow pulse intensity range (min alpha) */
	AMBIENT_PULSE_MIN: 0.3,
	/** Ambient glow pulse intensity range (max alpha) */
	AMBIENT_PULSE_MAX: 0.7,
} as const;

// ============================================================================
// Visual Style
// ============================================================================

/** Alpha values for different marker states */
export const MARKER_ALPHA = {
	hidden: 0,
	discovered: 0.85,
	investigated: 1.0,
} as const;

/** Glow alpha for different marker states */
export const GLOW_ALPHA = {
	hidden: 0,
	discovered: 0.4,
	investigated: 0.7,
} as const;

/** Label text style defaults */
export const LABEL_STYLE = {
	fontFamily: 'Exocet Blizzard, Georgia, serif',
	fill: '#c9aa71',
	stroke: '#000000',
	strokeThickness: 3,
	dropShadow: true,
	dropShadowColor: '#000000',
	dropShadowDistance: 2,
	dropShadowBlur: 4,
} as const;

// ============================================================================
// Icon Paths
// ============================================================================

const ASSET_BASE = `modules/${MODULE_ID}/dist/assets`;

export const CATEGORY_ICONS = {
	'murder-site': `${ASSET_BASE}/icons/sword-brandish.svg`,
	'faction-hq': `${ASSET_BASE}/icons/marker-faction.svg`,
	'shop': `${ASSET_BASE}/icons/hanging-sign.svg`,
	'landmark': `${ASSET_BASE}/icons/marker-landmark.svg`,
	'encounter': `${ASSET_BASE}/icons/marker-encounter.svg`,
	'hideout': `${ASSET_BASE}/icons/marker-hideout.svg`,
} as const;

/** Per-location icon overrides for notable points of interest. */
export const LOCATION_ICONS: Record<string, string> = {
	'city-barracks': `${ASSET_BASE}/icons/medieval-barracks.svg`,
	'the-prison': `${ASSET_BASE}/icons/cage.svg`,
};

/** Fallback icon when SVG is missing */
export const FALLBACK_ICON = 'icons/svg/book.svg';

// ============================================================================
// Sound Paths
// ============================================================================

export const SOUNDS = {
	DISCOVER: `${ASSET_BASE}/sounds/reveal-discover.ogg`,
	INVESTIGATE: `${ASSET_BASE}/sounds/reveal-investigate.ogg`,
} as const;

export const SOUND_VOLUME = 0.5;

// ============================================================================
// Scene Identification
// ============================================================================

/** The source ID of the Sigil scene in the module data */
export const SIGIL_SCENE_ID = 'scene-sigil';

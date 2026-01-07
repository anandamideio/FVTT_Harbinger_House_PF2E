/**
 * Scene Data
 * Defines all map scenes for Harbinger House
 * 
 * Why scenes?
 * - Each floor/area of Harbinger House gets its own scene
 * - Scenes contain the map image as background
 * - GMs can add walls, lighting, tokens as needed
 * - Provides a ready-to-use battlemap setup
 */

export interface HarbingerScene {
  id: string;
  name: string;
  /** Path to the map image */
  img: string;
  /** Background image configuration */
  background: {
    src: string;
  };
  /** Grid configuration - PF2E uses 5ft squares, typically 70px */
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
  /** Folder for organization */
  folder?: string;
  sort?: number;
}

/**
 * All Harbinger House scenes
 * Organized by floor/area
 */
export const ALL_SCENES: HarbingerScene[] = [
  {
    id: 'scene-first-floor',
    name: 'Harbinger House - First Floor',
    img: 'modules/harbinger-house-pf2e/assets/Harbing House 01 - First Floor.png',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbing House 01 - First Floor.png'
    },
    grid: {
      type: 1, // Square grid
      size: 70, // Standard for PF2E
      distance: 5,
      units: 'ft'
    },
    initial: {
      x: null,
      y: null,
      scale: 1
    },
    width: 4200,
    height: 4200,
    navigation: true,
    navOrder: 1,
    folder: 'Harbinger House',
    sort: 100
  },
  {
    id: 'scene-second-floor',
    name: 'Harbinger House - Second Floor',
    img: 'modules/harbinger-house-pf2e/assets/Harbing House 02 - Second Floor.png',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbing House 02 - Second Floor.png'
    },
    grid: {
      type: 1,
      size: 70,
      distance: 5,
      units: 'ft'
    },
    initial: {
      x: null,
      y: null,
      scale: 1
    },
    width: 4200,
    height: 4200,
    navigation: true,
    navOrder: 2,
    folder: 'Harbinger House',
    sort: 200
  },
  {
    id: 'scene-third-floor',
    name: 'Harbinger House - Third Floor',
    img: 'modules/harbinger-house-pf2e/assets/Harbing House 03 - Third Floor.png',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbing House 03 - Third Floor.png'
    },
    grid: {
      type: 1,
      size: 70,
      distance: 5,
      units: 'ft'
    },
    initial: {
      x: null,
      y: null,
      scale: 1
    },
    width: 4200,
    height: 4200,
    navigation: true,
    navOrder: 3,
    folder: 'Harbinger House',
    sort: 300
  },
  {
    id: 'scene-attic',
    name: 'Harbinger House - Attic',
    img: 'modules/harbinger-house-pf2e/assets/Harbing House 04 - Attic.png',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbing House 04 - Attic.png'
    },
    grid: {
      type: 1,
      size: 70,
      distance: 5,
      units: 'ft'
    },
    initial: {
      x: null,
      y: null,
      scale: 1
    },
    width: 4200,
    height: 4200,
    navigation: true,
    navOrder: 4,
    folder: 'Harbinger House',
    sort: 400
  },
  {
    id: 'scene-basement',
    name: 'Harbinger House - Basement',
    img: 'modules/harbinger-house-pf2e/assets/Harbing House 05 - Basement.png',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbing House 05 - Basement.png'
    },
    grid: {
      type: 1,
      size: 70,
      distance: 5,
      units: 'ft'
    },
    initial: {
      x: null,
      y: null,
      scale: 1
    },
    width: 4200,
    height: 4200,
    navigation: true,
    navOrder: 5,
    folder: 'Harbinger House',
    sort: 500
  },
  {
    id: 'scene-tunnels',
    name: 'Harbinger House - Tunnels',
    img: 'modules/harbinger-house-pf2e/assets/Harbing House 06 - Tunnels.png',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbing House 06 - Tunnels.png'
    },
    grid: {
      type: 1,
      size: 70,
      distance: 5,
      units: 'ft'
    },
    initial: {
      x: null,
      y: null,
      scale: 1
    },
    width: 4200,
    height: 4200,
    navigation: true,
    navOrder: 6,
    folder: 'Harbinger House',
    sort: 600
  },
  {
    id: 'scene-sub-basement',
    name: 'Harbinger House - Sub-Basement',
    img: 'modules/harbinger-house-pf2e/assets/Harbing House 07 - Sub-Basement.png',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbing House 07 - Sub-Basement.png'
    },
    grid: {
      type: 1,
      size: 70,
      distance: 5,
      units: 'ft'
    },
    initial: {
      x: null,
      y: null,
      scale: 1
    },
    width: 4200,
    height: 4200,
    navigation: true,
    navOrder: 7,
    folder: 'Harbinger House',
    sort: 700
  },
  {
    id: 'scene-grounds',
    name: 'Harbinger House - Grounds',
    img: 'modules/harbinger-house-pf2e/assets/Harbing House 08 - Grounds.png',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbing House 08 - Grounds.png'
    },
    grid: {
      type: 1,
      size: 70,
      distance: 5,
      units: 'ft'
    },
    initial: {
      x: null,
      y: null,
      scale: 1
    },
    width: 4200,
    height: 4200,
    navigation: true,
    navOrder: 8,
    folder: 'Harbinger House',
    sort: 800
  },
  {
    id: 'scene-overview',
    name: 'Harbinger House - Overview Map',
    img: 'modules/harbinger-house-pf2e/assets/Harbing House 09 - Overview.png',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbing House 09 - Overview.png'
    },
    grid: {
      type: 1,
      size: 70,
      distance: 5,
      units: 'ft'
    },
    initial: {
      x: null,
      y: null,
      scale: 1
    },
    width: 4200,
    height: 4200,
    navigation: true,
    navOrder: 0, // First in navigation
    folder: 'Harbinger House',
    sort: 50
  }
];

export const SCENES_BY_FOLDER = ALL_SCENES.reduce((acc, scene) => {
  const folder = scene.folder || 'Maps';
  if (!acc[folder]) {
    acc[folder] = [];
  }
  acc[folder].push(scene);
  return acc;
}, {} as Record<string, HarbingerScene[]>);

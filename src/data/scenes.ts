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
    img: 'modules/harbinger-house-pf2e/assets/Harbinger House 01 - First Floor.png',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbinger House 01 - First Floor.png'
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
    id: 'scene-common-area',
    name: 'Harbinger House - Common Area',
    img: 'modules/harbinger-house-pf2e/assets/Harbinger House Common Area.png',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbinger House Common Area.png'
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
    id: 'scene-doors-kaydis-room',
    name: "Harbinger House - Doors and Kaydi's Room",
    img: 'modules/harbinger-house-pf2e/assets/Harbinger House Doors and Kaydi\'s Room.png',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbinger House Doors and Kaydi\'s Room.png'
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
    id: 'scene-final-chamber-bigger',
    name: 'Harbinger House - Final Chamber (Bigger Ritual)',
    img: 'modules/harbinger-house-pf2e/assets/Harbinger House Final Chamber Bigger Ritual.jpeg',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbinger House Final Chamber Bigger Ritual.jpeg'
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
    id: 'scene-final-chamber',
    name: 'Harbinger House - Final Chamber',
    img: 'modules/harbinger-house-pf2e/assets/Harbinger House Final Chamber.jpeg',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbinger House Final Chamber.jpeg'
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
    id: 'scene-hall-of-mirrors',
    name: "Harbinger House - Hall of Mirrors & Chance's Room",
    img: 'modules/harbinger-house-pf2e/assets/Harbinger House Hall of Mirrors & Chance\'s Room.png',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbinger House Hall of Mirrors & Chance\'s Room.png'
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
    id: 'scene-mind-trap',
    name: 'Harbinger House - Inside Mind Trap',
    img: 'modules/harbinger-house-pf2e/assets/Harbinger House Inside Mind Trap.jpeg',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbinger House Inside Mind Trap.jpeg'
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
    id: 'scene-statues-gardens',
    name: 'Harbinger House - Statues and Gardens',
    img: 'modules/harbinger-house-pf2e/assets/Harbinger House Statues and Gardens.jpeg',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbinger House Statues and Gardens.jpeg'
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
    id: 'scene-vorina-teela',
    name: "Harbinger House - Vorina and Teela's Area",
    img: 'modules/harbinger-house-pf2e/assets/Harbinger House Vorina and Teela\'s Area.jpeg',
    background: {
      src: 'modules/harbinger-house-pf2e/assets/Harbinger House Vorina and Teela\'s Area.jpeg'
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

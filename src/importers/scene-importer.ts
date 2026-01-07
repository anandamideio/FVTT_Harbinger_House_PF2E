/**
 * Scene Importer
 * Handles importing Harbinger House map scenes
 * 
 * This importer:
 * - Converts our HarbingerScene data structure to FoundryVTT Scene format
 * - Sets up proper grid configuration for PF2E (5ft squares, 70px)
 * - Organizes scenes into folders by location
 * - Provides ready-to-use battlemaps with proper backgrounds
 * 
 * Why Scenes?
 * - They're the standard way to present maps in FoundryVTT
 * - Allow GMs to add walls, lighting, tokens, and other elements
 * - Support grid alignment for precise tactical positioning
 * - Can be activated for player viewing during gameplay
 */

import { BaseImporter, ImportOptions, ImportResult } from './base-importer';
import { MODULE_ID, log, logError } from '../config';
import { 
  ALL_SCENES,
  SCENES_BY_FOLDER,
  type HarbingerScene 
} from '../data/scenes';

export interface SceneImportOptions extends ImportOptions {
  /** Import only specific folders */
  folders?: string[];
  /** Import only specific scene IDs */
  sceneIds?: string[];
  /** Activate first scene after import (default: false) */
  activateFirst?: boolean;
}

export class SceneImporter extends BaseImporter<HarbingerScene> {
  protected documentType = 'Scene' as const;
  protected documentClass = Scene;

  /**
   * Override to provide scene collection
   */
  protected getCollection(): any {
    return (game as any).scenes;
  }

  getImportableItems(): HarbingerScene[] {
    return ALL_SCENES;
  }

  getItemId(scene: HarbingerScene): string {
    return scene.id;
  }

  getItemName(scene: HarbingerScene): string {
    return scene.name;
  }

  /**
   * Convert a HarbingerScene to FoundryVTT Scene data
   *
   * Key aspects:
   * - Sets up background image from our assets
   * - Configures grid for PF2E (square, 70px, 5ft)
   * - Enables scene navigation
   * - Sets initial view position
   * - Marks with module flags for tracking
   */
  toDocumentData(scene: HarbingerScene): any {
    return {
      name: scene.name,
      img: scene.img,
      background: {
        src: scene.background.src
      },
      foreground: null,
      thumb: scene.img, // Use same image for thumbnail
      width: scene.width,
      height: scene.height,
      padding: 0,
      initial: {
        x: scene.initial.x,
        y: scene.initial.y,
        scale: scene.initial.scale
      },
      backgroundColor: '#000000',
      grid: {
        type: scene.grid.type,
        size: scene.grid.size,
        color: '#000000',
        alpha: 0.2,
        distance: scene.grid.distance,
        units: scene.grid.units
      },
      tokenVision: true,
      fogExploration: true,
      fogReset: Date.now(),
      globalLight: false,
      globalLightThreshold: null,
      darkness: 0,
      drawings: [],
      tokens: [],
      lights: [],
      notes: [],
      sounds: [],
      templates: [],
      tiles: [],
      walls: [],
      playlist: null,
      playlistSound: null,
      journal: null,
      journalEntryPage: null,
      weather: '',
      folder: null, // Will be set by folder creation
      sort: scene.sort || 0,
      ownership: {
        default: 0 // GM only by default
      },
      flags: {
        [MODULE_ID]: {
          sourceId: scene.id,
          imported: true
        }
      } as any,
      navigation: scene.navigation,
      navOrder: scene.navOrder,
      navName: ''
    };
  }

  /**
   * Import scenes with folder organization
   * 
   * Why organize by folder?
   * - Groups related maps together (all Harbinger House floors)
   * - Makes scene list navigation easier
   * - Follows standard FoundryVTT module conventions
   */
  async importAll(options: SceneImportOptions = {}): Promise<ImportResult> {
    // Filter scenes based on options
    let scenesToImport = ALL_SCENES;

    if (options.sceneIds && options.sceneIds.length > 0) {
      scenesToImport = scenesToImport.filter(s => 
        options.sceneIds!.includes(s.id)
      );
    }

    if (options.folders && options.folders.length > 0) {
      scenesToImport = scenesToImport.filter(s => 
        s.folder && options.folders!.includes(s.folder)
      );
    }

    // Group by folder for organized import
    const byFolder = scenesToImport.reduce((acc, scene) => {
      const folder = scene.folder || 'Maps';
      if (!acc[folder]) {
        acc[folder] = [];
      }
      acc[folder].push(scene);
      return acc;
    }, {} as Record<string, HarbingerScene[]>);

    // Import each folder's scenes
    const results: ImportResult[] = [];
    
    for (const [folderName, scenes] of Object.entries(byFolder)) {
      const folderOptions = {
        ...options,
        folderName: folderName
      };

      const result = await this.importItems(scenes, folderOptions);
      results.push(result);

      // Optionally activate first scene in first folder
      if (options.activateFirst && result.documents.length > 0 && results.length === 1) {
        const firstScene = result.documents[0] as any;
        await firstScene.activate();
        log(`Activated scene: ${firstScene.name}`);
      }
    }

    // Combine results
    return results.reduce((combined, result) => ({
      success: combined.success && result.success,
      imported: combined.imported + result.imported,
      failed: combined.failed + result.failed,
      errors: [...combined.errors, ...result.errors],
      documents: [...combined.documents, ...result.documents]
    }), {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
      documents: []
    });
  }

  /**
   * Get importable scenes organized by folder
   */
  getScenesByFolder(): Record<string, HarbingerScene[]> {
    return SCENES_BY_FOLDER;
  }

  /**
   * Get count of scenes available for import
   */
  getCount(): number {
    return ALL_SCENES.length;
  }
}

// Export singleton instance
export const sceneImporter = new SceneImporter();

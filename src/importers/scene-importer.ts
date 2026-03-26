import { log, MODULE_ID } from '../config';
import { ALL_SCENES, type HarbingerScene, SCENES_BY_FOLDER } from '../data/scenes';
import { sceneToDocumentData } from '../data/to-foundry-data';
import type { SceneData } from '../types/foundry';
import { BaseImporter, type ImportOptions, type ImportResult } from './base-importer';

export interface SceneImportOptions extends ImportOptions {
	/** Import only specific folders */
	folders?: string[];
	/** Import only specific scene IDs */
	sceneIds?: string[];
	/** Activate first scene after import (default: false) */
	activateFirst?: boolean;
}

export class SceneImporter extends BaseImporter<HarbingerScene, typeof SceneClass> {
	protected documentType = 'Scene' as const;
	protected documentClass = Scene;

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
	 */
	toDocumentData(scene: HarbingerScene): SceneData {
		return sceneToDocumentData(scene);
	}

	/**
	 * Import scenes from compendium, organized by folder
	 */
	async importFromCompendium(
		packId: string,
		options: ImportOptions = {},
		filter?: (doc: FoundryDocument) => boolean,
	): Promise<ImportResult> {
		const result: ImportResult = {
			success: true,
			imported: 0,
			failed: 0,
			errors: [],
			documents: [],
		};

		const pack = game.packs.get(packId);
		if (!pack) {
			result.errors.push(`Compendium pack not found: ${packId}`);
			result.success = false;
			return result;
		}

		const documents = await pack.getDocuments();
		const toImport = filter ? documents.filter(filter) : documents;
		if (toImport.length === 0) return result;

		// Group documents by folder flag
		const byFolder = new Map<string, FoundryDocument[]>();
		for (const doc of toImport) {
			const folder = (doc.flags?.[MODULE_ID]?.folder as string) || 'Maps';
			if (!byFolder.has(folder)) byFolder.set(folder, []);
			byFolder.get(folder)!.push(doc);
		}

		for (const [folderName, docs] of byFolder) {
			const folder = await this.getOrCreateFolder(folderName, 'Scene');

			for (const doc of docs) {
				const sourceId = doc.flags?.[MODULE_ID]?.sourceId as string | undefined;

				try {
					if (sourceId) {
						const existing = await this.findExistingDocument(sourceId);
						if (existing && !options.updateExisting) {
							result.documents.push(existing);
							result.imported++;
							continue;
						}
					}

					const docData = doc.toObject() as Record<string, unknown>;
					delete docData._id;
					if (folder) docData.folder = folder.id;

					const created = await (
						Scene as unknown as { create(data: SceneData): Promise<FoundryDocument> }
					).create(docData as unknown as SceneData);
					const newDoc = Array.isArray(created) ? created[0] : created;
					result.documents.push(newDoc);
					result.imported++;

					if (options.onProgress) {
						options.onProgress(result.imported, toImport.length, doc.name || 'Unknown');
					}
				} catch (error) {
					result.errors.push(`Failed to import ${doc.name}: ${error}`);
					result.failed++;
				}
			}
		}

		result.success = result.failed === 0;
		return result;
	}

	/**
	 * Import scenes with folder organization
	 */
	async importAll(options: SceneImportOptions = {}): Promise<ImportResult> {
		// Filter scenes based on options
		let scenesToImport = ALL_SCENES;

		if (options.sceneIds && options.sceneIds.length > 0) {
			scenesToImport = scenesToImport.filter((s) => options.sceneIds!.includes(s.id));
		}

		if (options.folders && options.folders.length > 0) {
			scenesToImport = scenesToImport.filter((s) => s.folder && options.folders!.includes(s.folder));
		}

		// Group by folder for organized import
		const byFolder = scenesToImport.reduce(
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

		// Import each folder's scenes
		const results: ImportResult[] = [];

		for (const [folderName, scenes] of Object.entries(byFolder)) {
			const folderOptions = {
				...options,
				folderName: folderName,
			};

			const result = await this.importItems(scenes, folderOptions);
			results.push(result);

			// Optionally activate first scene in first folder
			if (options.activateFirst && result.documents.length > 0 && results.length === 1) {
				const firstScene = result.documents[0] as unknown as SceneClass;
				await firstScene.activate();
				log(`Activated scene: ${firstScene.name}`);
			}
		}

		// Combine results
		return results.reduce(
			(combined, result) => ({
				success: combined.success && result.success,
				imported: combined.imported + result.imported,
				failed: combined.failed + result.failed,
				errors: [...combined.errors, ...result.errors],
				documents: [...combined.documents, ...result.documents],
			}),
			{
				success: true,
				imported: 0,
				failed: 0,
				errors: [],
				documents: [],
			},
		);
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

export const sceneImporter = new SceneImporter();

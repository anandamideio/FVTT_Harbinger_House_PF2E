/**
 * Base Importer Class
 * Provides common functionality for importing content into FoundryVTT
 * 
 * Why a base class?
 * - Standardizes the import process across different content types (NPCs, Items, Hazards)
 * - Handles folder creation, progress tracking, and error handling in one place
 * - Makes it easy to add new content types later (just extend this class)
 */

import { MODULE_ID, log, logError } from '../config';
import type { HarbingerHouseFlags } from '../types/module-flags';

export interface ImportResult {
    success: boolean;
    imported: number;
    failed: number;
    errors: string[];
    documents: any[];
}

export interface ImportOptions {
    /** Target folder name for imported content */
    folderName?: string;
    /** Whether to update existing documents or skip them */
    updateExisting?: boolean;
    /** Callback for progress updates */
    onProgress?: (current: number, total: number, name: string) => void;
}

export abstract class BaseImporter<T> {
    protected abstract documentType: string;
    protected abstract documentClass: any;

    /**
     * Get all items available for import
     */
    abstract getImportableItems(): T[];

    /**
     * Convert a source item to Foundry document data
     */
    abstract toDocumentData(item: T): any;

    /**
     * Get a unique identifier for the item (used for duplicate detection)
     */
    abstract getItemId(item: T): string;

    /**
     * Get a display name for the item
     */
    abstract getItemName(item: T): string;

    /**
     * Import all items of this type
     */
    async importAll(options: ImportOptions = {}): Promise<ImportResult> {
        const items = this.getImportableItems();
        return this.importItems(items, options);
    }

    /**
     * Import specific items
     */
    async importItems(items: T[], options: ImportOptions = {}): Promise<ImportResult> {
        const result: ImportResult = {
            success: true,
            imported: 0,
            failed: 0,
            errors: [],
            documents: []
        };

        const total = items.length;
        let folder: any = null;

        // Create folder if specified
        if (options.folderName) {
            folder = await this.getOrCreateFolder(options.folderName);
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const name = this.getItemName(item);

            try {
                // Report progress
                if (options.onProgress) {
                    options.onProgress(i + 1, total, name);
                }

                // Check for existing document
                const existingDoc = this.findExistingDocument(item);
                
                if (existingDoc && !options.updateExisting) {
                    log(`Skipping existing ${this.documentType}: ${name}`);
                    continue;
                }

                // Prepare document data
                const docData = this.toDocumentData(item);
                
                // Add folder reference if we have one
                if (folder) {
                    docData.folder = folder.id;
                }

                // Add module flag for tracking
                docData.flags = docData.flags || {};
                docData.flags[MODULE_ID] = {
                    sourceId: this.getItemId(item),
                    imported: true,
                    version: (game.modules.get(MODULE_ID) as any)?.version ?? '1.0.0'
                };

                let doc: any;
                if (existingDoc && options.updateExisting) {
                    // Update existing
                    doc = await existingDoc.update(docData);
                    log(`Updated ${this.documentType}: ${name}`);
                } else {
                    // Create new
                    doc = await this.documentClass.create(docData);
                    log(`Created ${this.documentType}: ${name}`);
                }

                result.imported++;
                result.documents.push(doc);

            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                logError(`Failed to import ${this.documentType} "${name}": ${errorMsg}`);
                result.errors.push(`${name}: ${errorMsg}`);
                result.failed++;
                result.success = false;
            }
        }

        return result;
    }

    /**
     * Find an existing document that matches the source item
     */
    protected findExistingDocument(item: T): any | null {
        const sourceId = this.getItemId(item);
        const collection = this.getCollection();
        
        // First, try to find by our module flag
        const byFlag = collection.find((doc: any) => 
            doc.getFlag(MODULE_ID, 'sourceId') === sourceId
        );
        if (byFlag) return byFlag;

        // Fallback: find by name
        const name = this.getItemName(item);
        return collection.find((doc: any) => doc.name === name) || null;
    }

    /**
     * Get the document collection for this type
     */
    protected getCollection(): any {
        switch (this.documentType) {
            case 'Actor':
                return game.actors;
            case 'Item':
                return game.items;
            default:
                throw new Error(`Unknown document type: ${this.documentType}`);
        }
    }

    /**
     * Get or create a folder for organizing imported content
     */
    protected async getOrCreateFolder(name: string): Promise<any> {
        // Determine folder type based on document type
        const folderType = this.documentType;
        
        // Look for existing folder
        let folder = (game as any).folders?.find(
            (f: any) => f.name === name && f.type === folderType
        );

        if (!folder) {
            // Create the folder
            const result = await Folder.create({
                name: name,
                type: folderType,
                color: '#6e0000', // Dark red for Planescape theme
                flags: {
                    [MODULE_ID]: { created: true }
                }
            });
            folder = (Array.isArray(result) ? result[0] : result) as any;
            log(`Created folder: ${name}`);
        }

        return folder;
    }

    /**
     * Delete all documents imported by this module
     */
    async deleteAllImported(): Promise<number> {
        const collection = this.getCollection();
        const toDelete = collection.filter((doc: any) => 
            doc.getFlag(MODULE_ID, 'imported') === true
        );

        let deleted = 0;
        for (const doc of toDelete) {
            try {
                await doc.delete();
                deleted++;
            } catch (error) {
                logError(`Failed to delete ${doc.name}: ${error}`);
            }
        }

        return deleted;
    }
}

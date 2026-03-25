import { log, logError, MODULE_ID } from '../config';

export interface ImportResult {
	success: boolean;
	imported: number;
	failed: number;
	errors: string[];
	documents: FoundryDocument[];
}

export interface ImportOptions {
	/** Target folder name for imported content */
	folderName?: string;
	/** Pre-created folder to place documents in (takes precedence over folderName) */
	folder?: FolderClass | null;
	/** Whether to update existing documents or skip them */
	updateExisting?: boolean;
	/** Callback for progress updates */
	onProgress?: (current: number, total: number, name: string) => void;
}

export abstract class BaseImporter<T, C extends DocumentClass = DocumentClass> {
	protected abstract documentType: DocumentTypeName;
	protected abstract documentClass: C;

	/**
	 * Get all items available for import
	 */
	abstract getImportableItems(): T[];

	/**
	 * Convert a source item to Foundry document data
	 */
	abstract toDocumentData(item: T): DocumentDataFor<C>;

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
			documents: [],
		};

		if (items.length === 0) {
			log(`No items to import`);
			return result;
		}

		log(`Starting import of ${items.length} ${this.documentType}(s)`);

		let folder: FolderClass | null = options.folder || null;
		if (!folder && options.folderName) {
			folder = await this.getOrCreateFolder(options.folderName, this.documentType);
		}

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const itemName = this.getItemName(item);
			const itemId = this.getItemId(item);

			try {
				const existing = await this.findExistingDocument(itemId);

				if (existing && !options.updateExisting) {
					log(`Skipping existing ${this.documentType}: ${itemName}`);
					result.documents.push(existing);
					result.imported++;
					continue;
				}

				// Prepare document data
				let documentData = this.toDocumentData(item);
				documentData = await this.preProcessDocumentData(item, documentData);

				// Add folder reference if we have one
				if (folder) {
					(documentData as unknown as Record<string, unknown>).folder = folder.id;
				}

				// Create or update the document
				let document: FoundryDocument;
				if (existing && options.updateExisting) {
					document = await existing.update(documentData);
					log(`Updated ${this.documentType}: ${itemName}`);
				} else {
					const created = await (
						this.documentClass as unknown as { create(data: DocumentDataFor<C>): Promise<FoundryDocument> }
					).create(documentData);
					document = Array.isArray(created) ? created[0] : created;
					log(`Created ${this.documentType}: ${itemName}`);
				}

				result.documents.push(document);
				result.imported++;

				// Progress callback
				if (options.onProgress) {
					options.onProgress(i + 1, items.length, itemName);
				}
			} catch (error) {
				const errorMsg = `Failed to import ${itemName}: ${error}`;
				logError(errorMsg);
				result.errors.push(errorMsg);
				result.failed++;
			}
		}

		result.success = result.failed === 0;
		log(`Import complete: ${result.imported} succeeded, ${result.failed} failed`);

		return result;
	}

	/**
	 * Hook for subclasses to perform async processing on document data
	 * before it is created. Called after toDocumentData().
	 */
	protected async preProcessDocumentData(_item: T, documentData: DocumentDataFor<C>): Promise<DocumentDataFor<C>> {
		return documentData;
	}

	/**
	 * Find an existing document by our module's source ID flag
	 */
	protected async findExistingDocument(sourceId: string): Promise<FoundryDocument | null> {
		// Get the appropriate collection based on document type
		const collection = this.getCollection();
		if (!collection) return null;

		// Find document with matching source ID in our module flags
		return collection.find((doc) => doc.flags?.[MODULE_ID]?.sourceId === sourceId) || null;
	}

	/**
	 * Get the appropriate collection for this document type
	 */
	protected getCollection(): Collection<FoundryDocument> | null {
		switch (this.documentType) {
			case 'Actor':
				return game.actors as unknown as Collection<FoundryDocument>;
			case 'Item':
				return game.items as unknown as Collection<FoundryDocument>;
			case 'JournalEntry':
				return (game.journal as unknown as Collection<FoundryDocument>) ?? null;
			case 'Scene':
				return (game.scenes as unknown as Collection<FoundryDocument>) ?? null;
			default:
				return null;
		}
	}

	/**
	 * Get or create a folder for organizing imported content
	 *
	 * @param name - The folder name
	 * @param type - The document type ('Actor', 'Item', etc.)
	 * @param parentId - Optional parent folder ID for nested folders
	 */
	async getOrCreateFolder(name: string, type: string, parentId?: string): Promise<FolderClass | null> {
		try {
			// Look for existing folder
			const existing = game.folders?.find(
				(f: FolderClass) => f.name === name && f.type === type && (parentId ? f.folder?.id === parentId : !f.folder),
			);

			if (existing) {
				return existing;
			}

			// Create new folder
			const folderData: FolderData = {
				name,
				type,
				color: '#4a3f5c', // Purple Burple
				flags: {
					[MODULE_ID]: {
						managed: true,
					},
				},
			};

			if (parentId) {
				folderData.folder = parentId;
			}

			const folder = (await Folder.create(folderData)) as FolderClass;
			log(`Created folder: ${name}`);
			return folder;
		} catch (error) {
			logError(`Failed to create folder ${name}: ${error}`);
			return null;
		}
	}

	/**
	 * Delete all documents imported by this importer
	 */
	async deleteAllImported(): Promise<number> {
		let deleted = 0;
		const collection = this.getCollection();

		if (!collection) return deleted;

		try {
			// Find all documents with our module's imported flag
			const imported = collection.filter((doc) => doc.flags?.[MODULE_ID]?.imported === true);

			for (const doc of imported) {
				try {
					await doc.delete();
					deleted++;
				} catch (error) {
					logError(`Failed to delete ${doc.name}: ${error}`);
				}
			}

			// Clean up empty folders
			await this.cleanupEmptyFolders(this.documentType);

			log(`Deleted ${deleted} ${this.documentType}(s)`);
		} catch (error) {
			logError(`Error during deletion: ${error}`);
		}

		return deleted;
	}

	/**
	 * Clean up empty folders created by this module
	 */
	async cleanupEmptyFolders(type: string): Promise<void> {
		try {
			// Find folders managed by this module
			const managedFolders =
				game.folders?.filter((f: FolderClass) => f.type === type && f.flags?.[MODULE_ID]?.managed === true) || [];

			// Sort by depth (deepest first) to handle nested folders
			const sortedFolders = [...managedFolders].sort((a: FolderClass, b: FolderClass) => {
				const depthA = this.getFolderDepth(a);
				const depthB = this.getFolderDepth(b);
				return depthB - depthA;
			});

			for (const folder of sortedFolders) {
				// Check if folder is empty
				const hasDocuments = this.getCollection()?.find((doc) => doc.folder?.id === folder.id) !== undefined;

				const hasSubfolders = game.folders?.find((f: FolderClass) => f.folder?.id === folder.id) !== undefined;

				if (!hasDocuments && !hasSubfolders) {
					await folder.delete();
					log(`Deleted empty folder: ${folder.name}`);
				}
			}
		} catch (error) {
			logError(`Error cleaning up folders: ${error}`);
		}
	}

	/**
	 * Get the depth of a folder in the hierarchy
	 */
	private getFolderDepth(folder: FolderClass): number {
		let depth = 0;
		let current: FolderClass | null | undefined = folder;
		while (current?.folder) {
			depth++;
			current = current.folder;
		}
		return depth;
	}
}

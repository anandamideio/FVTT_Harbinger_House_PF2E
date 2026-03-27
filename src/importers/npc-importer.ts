import { log, logError, MODULE_ID } from '../config';
import {
	ALL_NPCS,
	generateRuneWeaponName,
	getCategoryLabel,
	isSystemActionReference,
	isSystemActorReference,
	isSystemItemReference,
	isSystemSpellReference,
	isSystemWeaponReference,
	type NPCCategory,
	type NPCEntry,
	type NPCItemEntry,
	NPCS_BY_CATEGORY,
	type SystemActionReference,
	type SystemActorReference,
	type SystemEquipmentReference,
	type SystemSpellReference,
	type SystemWeaponReference,
} from '../data';
import { npcEntryToDocumentData } from '../data/to-foundry-data';
import type { ActorData, ItemData } from '../types/foundry';
import type { WeaponRune } from '../types/pf2e-runes';
import { BaseImporter, type ImportOptions, type ImportResult } from './base-importer';

export interface NPCImportOptions extends ImportOptions {
	/** Import only specific categories */
	categories?: NPCCategory[];
	/** Import only specific NPC IDs */
	npcIds?: string[];
}

export class NPCImporter extends BaseImporter<NPCEntry, typeof ActorClass> {
	protected documentType = 'Actor' as const;
	protected documentClass = Actor;

	/**
	 * Get all NPCs available for import
	 */
	getImportableItems(): NPCEntry[] {
		return ALL_NPCS;
	}

	/**
	 * Get NPCs filtered by options
	 */
	getFilteredItems(options: NPCImportOptions): NPCEntry[] {
		let npcs = this.getImportableItems();

		// Filter by category
		if (options.categories && options.categories.length > 0) {
			npcs = npcs.filter((npc) => options.categories!.includes(npc.category as NPCCategory));
		}

		// Filter by specific IDs
		if (options.npcIds && options.npcIds.length > 0) {
			npcs = npcs.filter((npc) => options.npcIds!.includes(npc.id));
		}

		return npcs;
	}

	/**
	 * Convert NPCEntry to Foundry Actor data.
	 * For SystemActorReferences, returns a placeholder — real data is fetched in preProcessDocumentData.
	 * For custom NPCs, includes inline items; system refs stored in flags for runtime resolution.
	 */
	toDocumentData(npc: NPCEntry): ActorData {
		return npcEntryToDocumentData(npc);
	}

	/**
	 * Resolve system actor references and item references before document creation.
	 * Inline items are already on documentData.items from toDocumentData().
	 * This resolves system references (stored in flags.unresolvedItems) and appends them.
	 */
	protected async preProcessDocumentData(npc: NPCEntry, documentData: ActorData): Promise<ActorData> {
		if (isSystemActorReference(npc)) {
			return this.resolveSystemActor(npc, documentData);
		}

		// Resolve system item references and merge with existing inline items
		const unresolvedItems = (documentData.flags?.[MODULE_ID]?.unresolvedItems || []) as NPCItemEntry[];
		if (unresolvedItems.length > 0) {
			const resolvedSystemItems = await this.resolveItems(unresolvedItems);
			documentData.items = [...(documentData.items || []), ...resolvedSystemItems];
			// Clean up the temporary flag
			if (documentData.flags?.[MODULE_ID]) {
				delete documentData.flags[MODULE_ID].unresolvedItems;
			}
		}

		return documentData;
	}

	/**
	 * Post-process NPCs imported from compendium packs.
	 * Resolves system actor references and unresolved item references
	 * that couldn't be baked into the LevelDB pack at build time.
	 */
	protected async postProcessCompendiumImport(
		_compendiumDoc: FoundryDocument,
		documentData: ActorData,
	): Promise<ActorData> {
		const flags = documentData.flags?.[MODULE_ID];

		// Handle system actor references (stubs that need full data from system compendiums)
		if (flags?.systemActorRef) {
			const uuid = flags.systemActorRef as string;
			try {
				const actor = await fromUuid(uuid);
				if (actor) {
					const actorData = actor.toObject() as ActorData;
					delete actorData._id;
					if (flags?.sourceId) {
						actorData.name = documentData.name || actorData.name;
					}
					actorData.flags = {
						...actorData.flags,
						[MODULE_ID]: { ...flags, systemActorRef: undefined },
					};
					return actorData;
				}
				logError(`Could not find system actor: ${uuid}`);
			} catch (error) {
				logError(`Failed to resolve system actor ${uuid}:`, error);
			}
			return documentData;
		}

		// Handle unresolved item references on custom NPCs
		const unresolvedItems = (flags?.unresolvedItems || []) as NPCItemEntry[];
		if (unresolvedItems.length > 0) {
			const resolvedSystemItems = await this.resolveItems(unresolvedItems);
			documentData.items = [...(documentData.items || []), ...resolvedSystemItems];
			if (documentData.flags?.[MODULE_ID]) {
				delete documentData.flags[MODULE_ID].unresolvedItems;
			}
		}

		return documentData;
	}

	/**
	 * Clone a system compendium actor, preserving our module tracking flags
	 */
	private async resolveSystemActor(ref: SystemActorReference, documentData: ActorData): Promise<ActorData> {
		try {
			const actor = await fromUuid(ref.uuid);
			if (!actor) {
				logError(`Could not find system actor with UUID: ${ref.uuid}`);
				return documentData;
			}

			const actorData = actor.toObject() as ActorData;
			delete actorData._id;

			// Override display name if provided
			if (ref.displayName) {
				actorData.name = ref.displayName;
			}

			// Preserve our module tracking flags
			actorData.flags = {
				...actorData.flags,
				[MODULE_ID]: documentData.flags?.[MODULE_ID] ?? {},
			};

			return actorData;
		} catch (error) {
			logError(`Failed to resolve system actor ${ref.uuid}:`, error);
			return documentData;
		}
	}

	/**
	 * Resolve items, converting system references to actual item data
	 */
	private async resolveItems(items: NPCItemEntry[]): Promise<ItemData[]> {
		const resolved: ItemData[] = [];

		for (const item of items) {
			try {
				if (isSystemItemReference(item)) {
					const resolvedItem = await this.resolveSystemItem(item);
					if (resolvedItem) {
						resolved.push(resolvedItem);
					}
				} else {
					const itemData = item;
					resolved.push({
						...(itemData._id ? { _id: itemData._id } : {}),
						name: itemData.name,
						type: itemData.type,
						img: itemData.img || this.getItemDefaultImage(itemData.type),
						system: itemData.system,
						flags: itemData.flags || {},
					});
				}
			} catch (error) {
				logError(`Failed to resolve item:`, error);
			}
		}

		return resolved;
	}

	/**
	 * Resolve a system item reference to actual item data
	 */
	private async resolveSystemItem(
		ref: SystemWeaponReference | SystemSpellReference | SystemActionReference | SystemEquipmentReference,
	): Promise<ItemData | null> {
		try {
			// Fetch the item from the compendium using fromUuid
			const item = await fromUuid(ref.uuid);
			if (!item) {
				logError(`Could not find item with UUID: ${ref.uuid}`);
				return null;
			}

			// Convert to plain object
			const itemData = item.toObject() as ItemData;

			// Apply customizations based on reference type
			if (isSystemWeaponReference(ref)) {
				return this.applyWeaponCustomizations(itemData, ref);
			} else if (isSystemSpellReference(ref)) {
				return this.applySpellCustomizations(itemData, ref);
			} else if (isSystemActionReference(ref)) {
				return this.applyActionCustomizations(itemData, ref);
			}

			return itemData;
		} catch (error) {
			logError(`Failed to resolve system item ${ref.uuid}:`, error);
			return null;
		}
	}

	/**
	 * Apply weapon customizations including runes
	 */
	private applyWeaponCustomizations(itemData: ItemData, ref: SystemWeaponReference): ItemData {
		// Apply custom name if provided
		if (ref.customName) {
			itemData.name = ref.customName;
		} else if (ref.runes) {
			// Generate name from runes
			itemData.name = generateRuneWeaponName(itemData.name, ref.runes);
		}

		// Apply custom description
		if (ref.customDescription) {
			const existingDesc = itemData.system?.description?.value || '';
			if (!itemData.system) itemData.system = { description: { value: '' } };
			itemData.system.description = {
				value: existingDesc ? `${existingDesc}<p>${ref.customDescription}</p>` : `<p>${ref.customDescription}</p>`,
			};
		}

		// Apply runes if configured
		if (ref.runes) {
			if (!itemData.system) itemData.system = { description: { value: '' } };
			if (!itemData.system.runes) itemData.system.runes = {};

			// Apply potency rune
			if (ref.runes.potency) {
				itemData.system.runes.potency = ref.runes.potency;
			}

			// Apply striking rune
			if (ref.runes.striking) {
				const strikingLevelMap: Record<string, number> = {
					striking: 1,
					greaterStriking: 2,
					majorStriking: 3,
				};
				const strikingLevel = strikingLevelMap[ref.runes.striking];
				itemData.system.runes.striking = strikingLevel;
			}

			// Apply property runes
			if (ref.runes.property && ref.runes.property.length > 0) {
				itemData.system.runes.property = ref.runes.property as WeaponRune[];
			}
		}

		// Remove the _id to allow Foundry to generate a new one
		delete itemData._id;

		return itemData;
	}

	/**
	 * Apply spell customizations
	 */
	private applySpellCustomizations(itemData: ItemData, ref: SystemSpellReference): ItemData {
		if (!itemData.system) itemData.system = { description: { value: '' } };
		if (!itemData.system.location) itemData.system.location = {};

		// Link spell to its spellcasting entry
		if (ref.entryId) {
			itemData.system.location.value = ref.entryId;
		}

		// Apply heightened level
		if (ref.heightenedLevel !== undefined) {
			itemData.system.location.heightenedLevel = ref.heightenedLevel;
		}

		// Apply tradition override
		if (ref.tradition) {
			itemData.system.traditions = { value: [ref.tradition] };
		}

		// Remove the _id to allow Foundry to generate a new one
		delete itemData._id;

		return itemData;
	}

	/**
	 * Apply action customizations
	 */
	private applyActionCustomizations(itemData: ItemData, ref: SystemActionReference): ItemData {
		// Apply custom description
		if (ref.customDescription) {
			if (!itemData.system) itemData.system = { description: { value: '' } };
			itemData.system.description = { value: `<p>${ref.customDescription}</p>` };
		}

		// Remove the _id to allow Foundry to generate a new one
		delete itemData._id;

		return itemData;
	}

	/**
	 * Get default image for item types
	 */
	private getItemDefaultImage(type: string): string {
		const defaults: Record<string, string> = {
			melee: 'icons/svg/sword.svg',
			ranged: 'icons/svg/target.svg',
			spell: 'icons/svg/explosion.svg',
			action: 'icons/svg/lightning.svg',
			equipment: 'icons/svg/chest.svg',
			weapon: 'icons/svg/sword.svg',
			armor: 'icons/svg/shield.svg',
		};
		return defaults[type] || 'icons/svg/item-bag.svg';
	}

	getItemId(npc: NPCEntry): string {
		return npc.id;
	}

	getItemName(npc: NPCEntry): string {
		if (isSystemActorReference(npc)) {
			return npc.displayName ?? npc.id;
		}
		return npc.data.name;
	}

	/**
	 * Import NPCs with category organization
	 */
	async importAll(options: NPCImportOptions = {}): Promise<ImportResult> {
		const items = this.getFilteredItems(options);
		return this.importItems(items, {
			...options,
			folderName: options.folderName || 'Harbinger House NPCs',
		});
	}

	/**
	 * Import NPCs from compendium, organized by category into subfolders
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

		// Create parent folder
		const parentFolder = await this.getOrCreateFolder('Harbinger House', 'Actor');

		// Group documents by category flag
		const byCategory = new Map<string, FoundryDocument[]>();
		for (const doc of toImport) {
			const category = (doc.flags?.[MODULE_ID]?.category as string) || 'generic-npc';
			if (!byCategory.has(category)) byCategory.set(category, []);
			byCategory.get(category)!.push(doc);
		}

		// Import each category into its subfolder
		for (const [category, docs] of byCategory) {
			const subfolder = await this.getOrCreateSubfolder(getCategoryLabel(category), parentFolder);

			for (let i = 0; i < docs.length; i++) {
				const doc = docs[i];
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
					if (subfolder) docData.folder = subfolder.id;

					let processedData = docData as unknown as ActorData;
					processedData = await this.postProcessCompendiumImport(doc, processedData);

					const created = await (Actor as unknown as { create(data: ActorData): Promise<FoundryDocument> }).create(processedData);
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
	 * Import NPCs organized by category into subfolders
	 */
	async importByCategory(options: NPCImportOptions = {}): Promise<ImportResult> {
		const result: ImportResult = {
			success: true,
			imported: 0,
			failed: 0,
			errors: [],
			documents: [],
		};

		// Get parent folder
		const parentFolder = await this.getOrCreateFolder('Harbinger House', 'Actor');

		// Import each category - use only categories that exist in NPCS_BY_CATEGORY
		const categories =
			options.categories || (['major-npc', 'fiend', 'generic-npc', 'cultist'] as NPCCategory[]);

		for (const category of categories) {
			const categoryNPCs = (NPCS_BY_CATEGORY as Record<string, NPCEntry[]>)[category] || [];
			if (categoryNPCs.length === 0) {
				log(`Skipping empty category: ${category}`);
				continue;
			}

			// Create subfolder for this category
			const subfolder = await this.getOrCreateSubfolder(getCategoryLabel(category), parentFolder);

			// Import NPCs in this category
			const categoryResult = await this.importItems(categoryNPCs, {
				...options,
				folderName: undefined,
				folder: subfolder,
			});

			// Merge results
			result.imported += categoryResult.imported;
			result.failed += categoryResult.failed;
			result.errors.push(...categoryResult.errors);
			result.documents.push(...categoryResult.documents);
			if (!categoryResult.success) result.success = false;
		}

		return result;
	}

	/**
	 * Create a subfolder under a parent
	 */
	private async getOrCreateSubfolder(name: string, parent: FolderClass | null): Promise<FolderClass | null> {
		if (!parent) return null;
		let folder = game.folders?.find(
			(f: FolderClass) => f.name === name && f.type === 'Actor' && f.folder?.id === parent.id,
		);

		if (!folder) {
			const result = (await Folder.create({
				name: name,
				type: 'Actor',
				folder: parent.id,
				color: '#4a0000',
				flags: {
					[MODULE_ID]: { managed: true },
				},
			})) as FolderClass;
			folder = Array.isArray(result) ? result[0] : result;
			log(`Created subfolder: ${name}`);
		}

		return folder ?? null;
	}

	/**
	 * Get summary of available NPCs by category
	 */
	getSummary(): Record<NPCCategory, { count: number; names: string[] }> {
		const summary: Record<string, { count: number; names: string[] }> = {};

		for (const [category, npcs] of Object.entries(NPCS_BY_CATEGORY)) {
			summary[category] = {
				count: npcs.length,
				names: npcs.map((n) => this.getItemName(n)),
			};
		}

		return summary as Record<NPCCategory, { count: number; names: string[] }>;
	}

	/**
	 * Get total NPC count
	 */
	getTotalCount(): number {
		return ALL_NPCS.length;
	}
}

export const npcImporter = new NPCImporter();

import { log, logError, MODULE_ID } from '../config';
import {
	ALL_NPCS,
	generateRuneWeaponName,
	getCategoryLabel,
	isSystemActionReference,
	isSystemItemReference,
	isSystemSpellReference,
	isSystemWeaponReference,
	type NPCCategory,
	type NPCItemEntry,
	NPCS_BY_CATEGORY,
	type SystemActionReference,
	type SystemSpellReference,
	type SystemWeaponReference,
} from '../data';
import type { ActorData, HarbingerNPC, ItemData } from '../types/foundry';
import type { WeaponRune } from '../types/pf2e-runes';
import { BaseImporter, type ImportOptions, type ImportResult } from './base-importer';

export interface NPCImportOptions extends ImportOptions {
	/** Import only specific categories */
	categories?: NPCCategory[];
	/** Import only specific NPC IDs */
	npcIds?: string[];
}

export class NPCImporter extends BaseImporter<HarbingerNPC, typeof ActorClass> {
	protected documentType = 'Actor' as const;
	protected documentClass = Actor;

	/**
	 * Get all NPCs available for import
	 */
	getImportableItems(): HarbingerNPC[] {
		return ALL_NPCS;
	}

	/**
	 * Get NPCs filtered by options
	 */
	getFilteredItems(options: NPCImportOptions): HarbingerNPC[] {
		let npcs = this.getImportableItems();

		// Filter by category
		if (options.categories && options.categories.length > 0) {
			npcs = npcs.filter((npc) => options.categories!.includes(npc.category));
		}

		// Filter by specific IDs
		if (options.npcIds && options.npcIds.length > 0) {
			npcs = npcs.filter((npc) => options.npcIds!.includes(npc.id));
		}

		return npcs;
	}

	/**
	 * Convert HarbingerNPC to Foundry Actor data
	 * Note: Items with system references will be resolved asynchronously in importItems so don't stress
	 */
	toDocumentData(npc: HarbingerNPC): ActorData {
		return {
			name: npc.data.name,
			type: npc.data.type,
			img: npc.data.img || this.getDefaultImage(npc),
			system: { ...npc.data.system },
			prototypeToken: this.getTokenData(npc),
			items: [], // Items resolved in preProcessDocumentData
			flags: {
				[MODULE_ID]: {
					imported: true,
					sourceId: npc.id,
					importedAt: Date.now(),
				},
			},
		};
	}

	/**
	 * Resolve system item references before document creation
	 */
	protected async preProcessDocumentData(npc: HarbingerNPC, documentData: ActorData): Promise<ActorData> {
		const resolvedItems = await this.resolveItems((npc.items || []) as NPCItemEntry[]);
		documentData.items = resolvedItems;
		return documentData;
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
					const itemData = item as ItemData;
					resolved.push({
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
		ref: SystemWeaponReference | SystemSpellReference | SystemActionReference,
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
		// Apply heightened level
		if (ref.heightenedLevel !== undefined) {
			if (!itemData.system) itemData.system = { description: { value: '' } };
			if (!itemData.system.location) itemData.system.location = {};
			itemData.system.location.heightenedLevel = ref.heightenedLevel;
		}

		// Apply tradition override
		if (ref.tradition) {
			if (!itemData.system) itemData.system = { description: { value: '' } };
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
	 * Get default token configuration for an NPC
	 */
	private getTokenData(npc: HarbingerNPC): Partial<TokenData> {
		const sys = npc.data.system as Partial<PF2eActorSystem> | undefined;
		const size = sys?.traits?.size?.value || 'med';
		const tokenSize = this.getTokenSize(size);

		return {
			name: npc.data.name,
			displayName: 20, // OWNER_HOVER
			displayBars: 20, // OWNER_HOVER
			bar1: { attribute: 'attributes.hp' },
			disposition: this.getDisposition(npc),
			width: tokenSize,
			height: tokenSize,
			texture: {
				src: npc.data.img || this.getDefaultImage(npc),
			},
			sight: {
				enabled: true,
				range: sys?.attributes?.perception?.spikedarvision ? 60 : 0,
			},
			actorLink: npc.category === 'major-npc', // Link major NPCs
		};
	}

	/**
	 * Get token size based on creature size
	 */
	private getTokenSize(size: string): number {
		const sizes: Record<string, number> = {
			tiny: 0.5,
			sm: 1,
			med: 1,
			lg: 2,
			huge: 3,
			grg: 4,
		};
		return sizes[size] || 1;
	}

	/**
	 * Get token disposition based on NPC data
	 */
	private getDisposition(npc: HarbingerNPC): number {
		const sys = npc.data.system as Partial<PF2eActorSystem> | undefined;
		const alignment = sys?.details?.alignment?.value || '';

		// PF2e typically uses traits instead of alignment, but we can infer from our data
		if (alignment.includes('G') || npc.category === 'major-npc') {
			// Good aligned or major NPCs might be neutral initially
			return 0; // NEUTRAL
		}
		if (alignment.includes('E') || npc.category === 'fiend') {
			return -1; // HOSTILE
		}
		return 0; // NEUTRAL
	}

	/**
	 * Get a default image based on NPC category/type
	 */
	private getDefaultImage(npc: HarbingerNPC): string {
		// Default images by category - these are placeholders
		// In a real module, you'd have custom art
		const defaults: Record<NPCCategory, string> = {
			'major-npc': 'icons/svg/mystery-man.svg',
			'harbinger-resident': 'icons/svg/mystery-man.svg',
			'generic-npc': 'icons/svg/mystery-man.svg',
			fiend: 'icons/svg/skull.svg',
			cultist: 'icons/svg/cowled.svg',
		};
		return defaults[npc.category as NPCCategory] || 'icons/svg/mystery-man.svg';
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

	getItemId(npc: HarbingerNPC): string {
		return npc.id;
	}

	getItemName(npc: HarbingerNPC): string {
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
			options.categories || (['harbinger-resident', 'fiend', 'generic-npc', 'cultist'] as NPCCategory[]);

		for (const category of categories) {
			const categoryNPCs = (NPCS_BY_CATEGORY as Record<string, HarbingerNPC[]>)[category] || [];
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
					[MODULE_ID]: { created: true },
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
				names: npcs.map((n) => n.data.name),
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

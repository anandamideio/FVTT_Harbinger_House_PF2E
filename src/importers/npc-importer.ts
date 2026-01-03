/**
 * NPC Importer
 * Handles importing Harbinger House NPCs as PF2e Actors
 * 
 * This importer:
 * - Converts our HarbingerNPC data structure to PF2e Actor format
 * - Creates embedded items (strikes, spells, actions) on the actors
 * - Resolves system compendium references for weapons, spells, and actions
 * - Applies runes to weapons at import time
 * - Organizes NPCs into folders by category
 */

import { BaseImporter, ImportOptions, ImportResult } from './base-importer';
import { MODULE_ID, PACKS, log, logError } from '../config';
import { 
    ALL_NPCS, 
    NPCS_BY_CATEGORY, 
    getCategoryLabel, 
    isSystemItemReference,
    isSystemWeaponReference,
    isSystemSpellReference,
    isSystemActionReference,
    generateRuneWeaponName,
    PROPERTY_RUNES,
    type NPCCategory,
    type NPCItemEntry,
    type SystemWeaponReference,
    type SystemSpellReference,
    type SystemActionReference,
    type WeaponRuneConfig,
} from '../data';
import type { HarbingerNPC, ActorData, ItemData } from '../types/foundry';

export interface NPCImportOptions extends ImportOptions {
    /** Import only specific categories */
    categories?: NPCCategory[];
    /** Import only specific NPC IDs */
    npcIds?: string[];
}

export class NPCImporter extends BaseImporter<HarbingerNPC> {
    protected documentType = 'Actor';
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
            npcs = npcs.filter(npc => options.categories!.includes(npc.category));
        }

        // Filter by specific IDs
        if (options.npcIds && options.npcIds.length > 0) {
            npcs = npcs.filter(npc => options.npcIds!.includes(npc.id));
        }

        return npcs;
    }

    /**
     * Convert HarbingerNPC to Foundry Actor data
     * Note: Items with system references will be resolved asynchronously in importItems
     */
    toDocumentData(npc: HarbingerNPC): any {
        // Start with the base actor data
        // Items will be processed separately in importItems to handle async UUID resolution
        const actorData: any = {
            name: npc.data.name,
            type: npc.data.type,
            img: npc.data.img || this.getDefaultImage(npc),
            system: { ...npc.data.system },
            prototypeToken: this.getTokenData(npc),
            items: [] // Items will be added after async resolution
        };

        return actorData;
    }

    /**
     * Override importItems to handle async system reference resolution
     */
    async importItems(items: HarbingerNPC[], options: NPCImportOptions = {}): Promise<ImportResult> {
        const result: ImportResult = {
            success: true,
            imported: 0,
            failed: 0,
            errors: [],
            documents: []
        };

        // Get or create folder
        const folder = options.folderName 
            ? await this.getOrCreateFolder(options.folderName)
            : null;

        for (const npc of items) {
            try {
                // Check for duplicates
                if (!options.updateExisting) {
                    const existing = game.actors?.find((a: any) => 
                        a.getFlag(MODULE_ID, 'sourceId') === npc.id
                    );
                    if (existing) {
                        log(`Skipping duplicate: ${npc.data.name}`);
                        continue;
                    }
                }

                // Convert to document data
                const docData = this.toDocumentData(npc);
                
                // Resolve items with system references
                const resolvedItems = await this.resolveItems((npc.items || []) as NPCItemEntry[]);
                docData.items = resolvedItems;

                // Add folder and flags
                if (folder) {
                    docData.folder = folder.id;
                }
                docData.flags = {
                    ...docData.flags,
                    [MODULE_ID]: {
                        imported: true,
                        sourceId: npc.id,
                        importedAt: Date.now()
                    }
                };

                // Create the actor
                const created = await Actor.create(docData);
                if (created) {
                    result.documents.push(Array.isArray(created) ? created[0] : created);
                    result.imported++;
                    log(`Imported: ${npc.data.name}`);
                }
            } catch (error) {
                result.failed++;
                result.errors.push(`Failed to import ${npc.data.name}: ${error}`);
                logError(`Failed to import ${npc.data.name}:`, error);
            }
        }

        result.success = result.failed === 0;
        return result;
    }

    /**
     * Resolve items, converting system references to actual item data
     */
    private async resolveItems(items: NPCItemEntry[]): Promise<any[]> {
        const resolved: any[] = [];

        for (const item of items) {
            try {
                if (isSystemItemReference(item)) {
                    const resolvedItem = await this.resolveSystemItem(item);
                    if (resolvedItem) {
                        resolved.push(resolvedItem);
                    }
                } else {
                    // Regular inline item
                    resolved.push({
                        name: item.name,
                        type: item.type,
                        img: item.img || this.getItemDefaultImage(item.type),
                        system: item.system,
                        flags: item.flags || {}
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
        ref: SystemWeaponReference | SystemSpellReference | SystemActionReference
    ): Promise<any | null> {
        try {
            // Fetch the item from the compendium using fromUuid
            const item = await fromUuid(ref.uuid) as any;
            if (!item) {
                logError(`Could not find item with UUID: ${ref.uuid}`);
                return null;
            }

            // Convert to plain object
            const itemData = item.toObject();

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
    private applyWeaponCustomizations(itemData: any, ref: SystemWeaponReference): any {
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
            itemData.system = itemData.system || {};
            itemData.system.description = itemData.system.description || {};
            itemData.system.description.value = existingDesc 
                ? `${existingDesc}<p>${ref.customDescription}</p>`
                : `<p>${ref.customDescription}</p>`;
        }

        // Apply runes if configured
        if (ref.runes) {
            itemData.system = itemData.system || {};
            itemData.system.runes = itemData.system.runes || {};
            
            // Apply potency rune
            if (ref.runes.potency) {
                itemData.system.runes.potency = ref.runes.potency;
            }

            // Apply striking rune
            if (ref.runes.striking) {
                const strikingLevel = {
                    striking: 1,
                    greaterStriking: 2,
                    majorStriking: 3
                }[ref.runes.striking];
                itemData.system.runes.striking = strikingLevel;
            }

            // Apply property runes
            if (ref.runes.property && ref.runes.property.length > 0) {
                itemData.system.runes.property = ref.runes.property;
            }
        }

        // Remove the _id to allow Foundry to generate a new one
        delete itemData._id;
        
        return itemData;
    }

    /**
     * Apply spell customizations
     */
    private applySpellCustomizations(itemData: any, ref: SystemSpellReference): any {
        // Apply heightened level
        if (ref.heightenedLevel !== undefined) {
            itemData.system = itemData.system || {};
            itemData.system.location = itemData.system.location || {};
            itemData.system.location.heightenedLevel = ref.heightenedLevel;
        }

        // Apply tradition override
        if (ref.tradition) {
            itemData.system = itemData.system || {};
            itemData.system.traditions = itemData.system.traditions || {};
            itemData.system.traditions.value = [ref.tradition];
        }

        // Remove the _id to allow Foundry to generate a new one
        delete itemData._id;

        return itemData;
    }

    /**
     * Apply action customizations
     */
    private applyActionCustomizations(itemData: any, ref: SystemActionReference): any {
        // Apply custom description
        if (ref.customDescription) {
            itemData.system = itemData.system || {};
            itemData.system.description = itemData.system.description || {};
            itemData.system.description.value = `<p>${ref.customDescription}</p>`;
        }

        // Remove the _id to allow Foundry to generate a new one
        delete itemData._id;

        return itemData;
    }

    /**
     * Prepare embedded items for the actor (legacy method for inline items only)
     * @deprecated Use resolveItems instead for full system reference support
     */
    private prepareItems(items: ItemData[]): any[] {
        return items.map(item => ({
            name: item.name,
            type: item.type,
            img: item.img || this.getItemDefaultImage(item.type),
            system: item.system,
            flags: item.flags || {}
        }));
    }

    /**
     * Get default token configuration for an NPC
     */
    private getTokenData(npc: HarbingerNPC): any {
        const size = npc.data.system?.traits?.size?.value || 'med';
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
                src: npc.data.img || this.getDefaultImage(npc)
            },
            sight: {
                enabled: true,
                range: npc.data.system?.attributes?.perception?.spikedarvision ? 60 : 0
            },
            actorLink: npc.category === 'major-npc' // Link major NPCs
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
            grg: 4
        };
        return sizes[size] || 1;
    }

    /**
     * Get token disposition based on NPC data
     */
    private getDisposition(npc: HarbingerNPC): number {
        const alignment = npc.data.system?.details?.alignment?.value || '';
        
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
            'fiend': 'icons/svg/skull.svg',
            'cultist': 'icons/svg/cowled.svg'
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
            armor: 'icons/svg/shield.svg'
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
            folderName: options.folderName || 'Harbinger House NPCs'
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
            documents: []
        };

        // Get parent folder
        const parentFolder = await this.getOrCreateFolder('Harbinger House');

        // Import each category
        const categories = options.categories || 
            (['major-npc', 'harbinger-resident', 'generic-npc', 'fiend', 'cultist'] as NPCCategory[]);

        for (const category of categories) {
            const categoryNPCs = (NPCS_BY_CATEGORY as Record<string, HarbingerNPC[]>)[category] || [];
            if (categoryNPCs.length === 0) continue;

            // Create subfolder for this category
            const subfolder = await this.getOrCreateSubfolder(
                getCategoryLabel(category),
                parentFolder
            );

            // Import NPCs in this category
            const categoryResult = await this.importItems(categoryNPCs, {
                ...options,
                folderName: undefined // We'll set folder manually
            });

            // Move to subfolder
            for (const doc of categoryResult.documents) {
                try {
                    await doc.update({ folder: subfolder.id });
                } catch (e) {
                    // Ignore folder move errors
                }
            }

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
    private async getOrCreateSubfolder(name: string, parent: any): Promise<any> {
        let folder = game.folders?.find(
            (f: any) => f.name === name && f.type === 'Actor' && f.folder?.id === parent.id
        );

        if (!folder) {
            const result = await Folder.create({
                name: name,
                type: 'Actor',
                folder: parent.id,
                color: '#4a0000',
                flags: {
                    [MODULE_ID]: { created: true }
                }
            });
            folder = Array.isArray(result) ? result[0] : result;
            log(`Created subfolder: ${name}`);
        }

        return folder;
    }

    /**
     * Get summary of available NPCs by category
     */
    getSummary(): Record<NPCCategory, { count: number; names: string[] }> {
        const summary: Record<string, { count: number; names: string[] }> = {};
        
        for (const [category, npcs] of Object.entries(NPCS_BY_CATEGORY)) {
            summary[category] = {
                count: npcs.length,
                names: npcs.map(n => n.data.name)
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

// Singleton instance for easy access
export const npcImporter = new NPCImporter();

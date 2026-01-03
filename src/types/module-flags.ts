/**
 * Type definitions for Harbinger House module flags
 */

/** Flags stored on imported actors */
export interface HarbingerHouseFlags {
    /** Whether this actor was imported by the module */
    imported: boolean;
    /** Source NPC ID from the module data */
    sourceId: string;
    /** Import timestamp */
    importedAt?: number;
}

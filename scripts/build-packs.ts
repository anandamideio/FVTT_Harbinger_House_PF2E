import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ClassicLevel } from 'classic-level';

// Import data arrays
import { ALL_NPCS } from '../src/data/index.ts';
import { ALL_ITEMS } from '../src/data/items.ts';
import { ALL_SPELLS } from '../src/data/spells.ts';
import { ALL_HAZARDS } from '../src/data/hazards.ts';
import { ALL_JOURNALS } from '../src/data/journals.ts';
import { ALL_MACROS } from '../src/data/macros.ts';
import { ALL_SCENES } from '../src/data/scenes.ts';

// Import pure transform functions
import {
	itemToDocumentData,
	spellToDocumentData,
	hazardToDocumentData,
	journalToDocumentData,
	macroToDocumentData,
	sceneToDocumentData,
	npcEntryToDocumentData,
} from '../src/data/to-foundry-data.ts';

const PACKS_DIR = path.resolve(import.meta.dirname, '..', 'packs');

// Foundry system/core versions for _stats metadata
const SYSTEM_VERSION = '6.0.0';
const CORE_VERSION = '13.0.0';

// Module ID used for compendium UUID construction
const MODULE_ID = 'harbinger-house-pf2e';

// Adventure pack name
const PACK_NAME = 'harbinger-house';

/**
 * PF2e schema version to stamp on actors/items.
 * Matches MigrationRunnerBase.LATEST_SCHEMA_VERSION in the PF2e system codebase.
 * This tells PF2e's ClientDatabaseBackend that our data is already at the current
 * schema, preventing redundant in-memory migrations on every compendium fetch.
 *
 * @NOTE Update this when bumping PF2e system compatibility
 */
const PF2E_SCHEMA_VERSION = 0.955;

/**
 * Generate a deterministic 16-character hex ID from a source identifier.
 * This ensures the same content always gets the same _id across builds,
 * which is critical for stable UUID linking.
 */
function generateId(sourceId: string): string {
	return createHash('md5').update(sourceId).digest('hex').substring(0, 16);
}

/**
 * Create _stats metadata that Foundry expects on documents.
 */
function createStats(compendiumSource?: string | null) {
	const now = Date.now();
	return {
		systemId: 'pf2e',
		systemVersion: SYSTEM_VERSION,
		coreVersion: CORE_VERSION,
		createdTime: now,
		modifiedTime: now,
		lastModifiedBy: null,
		compendiumSource: compendiumSource ?? null,
		duplicateSource: null,
		exportSource: null,
	};
}

// ============================================================================
// Folder Definitions
// ============================================================================

interface FolderDef {
	sourceId: string;
	name: string;
	type: string;
	color: string | null;
	sort: number;
	parent: string | null; // sourceId of parent folder, or null for root
}

const FOLDER_DEFS: FolderDef[] = [
	// Actor folders
	{ sourceId: 'folder-npcs', name: 'Harbinger House NPCs', type: 'Actor', color: '#6e0000', sort: 100, parent: null },
	{ sourceId: 'folder-hazards', name: 'Harbinger House Hazards', type: 'Actor', color: '#4a3f5c', sort: 200, parent: null },

	// Item folders
	{ sourceId: 'folder-items', name: 'Harbinger House Items', type: 'Item', color: '#c9a227', sort: 100, parent: null },
	{ sourceId: 'folder-spells', name: 'Harbinger House Spells', type: 'Item', color: '#4a3f5c', sort: 200, parent: null },

	// Journal folders
	{ sourceId: 'folder-journals', name: 'Harbinger House Adventure', type: 'JournalEntry', color: '#6e0000', sort: 100, parent: null },
	{ sourceId: 'folder-journals-chapters', name: 'Chapters', type: 'JournalEntry', color: null, sort: 100, parent: 'folder-journals' },
	{ sourceId: 'folder-journals-reference', name: 'Reference', type: 'JournalEntry', color: null, sort: 200, parent: 'folder-journals' },

	// Scene folders
	{ sourceId: 'folder-scenes', name: 'Harbinger House Maps', type: 'Scene', color: '#2a2a2a', sort: 100, parent: null },

	// Macro folders
	{ sourceId: 'folder-macros', name: 'Harbinger House Macros', type: 'Macro', color: '#6e0000', sort: 100, parent: null },
];

/**
 * Build folder documents for the Adventure.
 */
function buildFolders(): Record<string, unknown>[] {
	// Pre-compute folder ID map for parent references
	const folderIdMap = new Map<string, string>();
	for (const def of FOLDER_DEFS) {
		folderIdMap.set(def.sourceId, generateId(def.sourceId));
	}

	return FOLDER_DEFS.map((def) => ({
		_id: folderIdMap.get(def.sourceId)!,
		name: def.name,
		type: def.type,
		sorting: 'a',
		sort: def.sort,
		color: def.color,
		flags: {},
		folder: def.parent ? (folderIdMap.get(def.parent) ?? null) : null,
		description: '',
		_stats: createStats(),
	}));
}

/**
 * Get the folder _id for a given folder sourceId.
 */
function getFolderId(sourceId: string): string {
	return generateId(sourceId);
}

/**
 * Map journal folder names to folder sourceIds.
 */
function getJournalFolderId(folder?: string): string {
	switch (folder) {
		case 'Chapters':
			return getFolderId('folder-journals-chapters');
		case 'Reference':
			return getFolderId('folder-journals-reference');
		case 'Introduction':
			return getFolderId('folder-journals-chapters');
		default:
			return getFolderId('folder-journals-reference');
	}
}

// ============================================================================
// Document Augmentation
// ============================================================================

/**
 * Augment a document with fields required by the Adventure format
 * that may be missing from the *ToDocumentData() output.
 */
function augmentDocument(
	doc: object,
	docId: string,
	folderId: string | null,
	sortIndex: number,
	compendiumSource?: string | null,
): Record<string, unknown> {
	const baseDoc = doc as Record<string, unknown>;
	return {
		...baseDoc,
		_id: docId,
		folder: folderId,
		sort: (baseDoc.sort as number) ?? sortIndex * 100,
		ownership: (baseDoc.ownership as Record<string, unknown>) ?? { default: 0 },
		_stats: createStats(compendiumSource),
	};
}

/**
 * Stamp PF2e migration version on actors and items so the system
 * knows data is current and skips redundant migrations.
 */
function stampMigrationVersion(doc: Record<string, unknown>): void {
	if (doc.system && typeof doc.system === 'object') {
		(doc.system as Record<string, unknown>)._migration = {
			version: PF2E_SCHEMA_VERSION,
			previous: null,
		};
	}
}

// ============================================================================
// Adventure Pack Builder
// ============================================================================

async function writeAdventurePack(): Promise<void> {
	const packPath = path.join(PACKS_DIR, PACK_NAME);

	// Remove existing pack directory if it exists
	if (fs.existsSync(packPath)) {
		fs.rmSync(packPath, { recursive: true });
	}
	fs.mkdirSync(packPath, { recursive: true });

	// Generate the deterministic Adventure document ID
	const adventureId = generateId('harbinger-house-adventure');

	// -- Build Actors (NPCs + Hazards) --
	console.log('  Building actors...');
	const actors: Record<string, unknown>[] = [];

	for (let i = 0; i < ALL_NPCS.length; i++) {
		const npc = ALL_NPCS[i];
		const docId = generateId(npc.id);
		const docData = npcEntryToDocumentData(npc);
		const doc = augmentDocument(docData, docId, getFolderId('folder-npcs'), i);

		// Stamp migration version on the actor
		stampMigrationVersion(doc);

		// Augment embedded items with all required fields
		if (Array.isArray(doc.items)) {
			for (let idx = 0; idx < (doc.items as Record<string, unknown>[]).length; idx++) {
				const item = (doc.items as Record<string, unknown>[])[idx];
				stampMigrationVersion(item);
				if (!item._id) {
					item._id = generateId(`${npc.id}-${(item as { name?: string }).name || idx}`);
				}
				if (!item._stats) item._stats = createStats();
				if (!item.effects) item.effects = [];
				if (item.folder === undefined) item.folder = null;
				if (!item.ownership) item.ownership = { default: 0 };
				if (item.sort === undefined) item.sort = idx * 100;
			}
		}

		// Ensure stub actors (system references) have minimal valid system data
		// so PF2e validation doesn't reject them during import.
		// _preImport will replace this with canonical system data.
		if (!doc.system || Object.keys(doc.system as object).length === 0) {
			doc.system = {
				attributes: {
					hp: { value: 1, max: 1, temp: 0, details: '' },
					ac: { value: 10, details: '' },
					speed: { value: 25, otherSpeeds: [] },
				},
				details: {
					level: { value: 1 },
					publicNotes: '',
					privateNotes: '',
				},
				traits: {
					value: [],
					rarity: 'common',
					size: { value: 'med' },
				},
				saves: {
					fortitude: { value: 0 },
					reflex: { value: 0 },
					will: { value: 0 },
				},
				_migration: { version: PF2E_SCHEMA_VERSION, previous: null },
			};
		}

		// Add effects array if missing
		if (!doc.effects) doc.effects = [];

		actors.push(doc);
	}

	for (let i = 0; i < ALL_HAZARDS.length; i++) {
		const hazard = ALL_HAZARDS[i];
		const docId = generateId(hazard.id);
		const docData = hazardToDocumentData(hazard);
		const doc = augmentDocument(docData, docId, getFolderId('folder-hazards'), ALL_NPCS.length + i);

		stampMigrationVersion(doc);
		if (!doc.effects) doc.effects = [];
		if (!doc.items) doc.items = [];

		actors.push(doc);
	}
	console.log(`    ${actors.length} actors (${ALL_NPCS.length} NPCs + ${ALL_HAZARDS.length} hazards)`);

	// -- Build Items --
	console.log('  Building items...');
	const items: Record<string, unknown>[] = [];

	for (let i = 0; i < ALL_ITEMS.length; i++) {
		const item = ALL_ITEMS[i];
		const docId = generateId(item.id);
		const docData = itemToDocumentData(item);
		const doc = augmentDocument(docData, docId, getFolderId('folder-items'), i);

		stampMigrationVersion(doc);
		if (!doc.effects) doc.effects = [];

		items.push(doc);
	}

	for (let i = 0; i < ALL_SPELLS.length; i++) {
		const spell = ALL_SPELLS[i];
		const docId = generateId(spell.id);
		const docData = spellToDocumentData(spell);
		const doc = augmentDocument(docData, docId, getFolderId('folder-spells'), ALL_ITEMS.length + i);

		stampMigrationVersion(doc);
		if (!doc.effects) doc.effects = [];

		items.push(doc);
	}
	console.log(`    ${items.length} items (${ALL_ITEMS.length} items + ${ALL_SPELLS.length} spells)`);

	// -- Build Journals --
	console.log('  Building journals...');
	const journal: Record<string, unknown>[] = [];

	for (let i = 0; i < ALL_JOURNALS.length; i++) {
		const j = ALL_JOURNALS[i];
		const docId = generateId(j.id);
		const docData = journalToDocumentData(j);
		const folderId = getJournalFolderId(j.folder);
		const doc = augmentDocument(docData, docId, folderId, i);

		// Augment pages with required fields
		if (Array.isArray(doc.pages)) {
			for (const page of doc.pages as Record<string, unknown>[]) {
				if (!page._id) {
					page._id = generateId(`${j.id}-page-${(page as { name?: string }).name || journal.length}`);
				}
				if (!page._stats) {
					page._stats = createStats();
				}
				if (!page.image) page.image = {};
				if (!page.video) page.video = {};
				if (page.src === undefined) page.src = null;
				if (!page.system) page.system = {};
				if (page.category === undefined) page.category = '';
				if (!page.ownership) page.ownership = { default: -1 };
				if (!page.flags) page.flags = {};
			}
		}

		if (!doc.categories) doc.categories = [];

		journal.push(doc);
	}
	console.log(`    ${journal.length} journal entries`);

	// -- Build Scenes --
	console.log('  Building scenes...');
	const scenes: Record<string, unknown>[] = [];

	for (let i = 0; i < ALL_SCENES.length; i++) {
		const scene = ALL_SCENES[i];
		const docId = generateId(scene.id);
		const docData = sceneToDocumentData(scene);
		const doc = augmentDocument(docData, docId, getFolderId('folder-scenes'), i);

		// Add fields required by Adventure format
		if (doc.active === undefined) doc.active = false;
		if (!doc.fog) doc.fog = {};
		if (!doc.environment) doc.environment = {};
		if (!doc.regions) doc.regions = [];
		if (doc.foregroundElevation === undefined) doc.foregroundElevation = null;

		// Remove deprecated fields that Foundry V13 no longer uses
		delete doc.darkness;
		delete doc.fogExploration;
		delete doc.fogReset;
		delete doc.globalLight;
		delete doc.globalLightThreshold;
		delete doc.img;

		scenes.push(doc);
	}
	console.log(`    ${scenes.length} scenes`);

	// -- Build Macros --
	console.log('  Building macros...');
	const macros: Record<string, unknown>[] = [];

	for (let i = 0; i < ALL_MACROS.length; i++) {
		const macro = ALL_MACROS[i];
		const docId = generateId(macro.id);
		const docData = macroToDocumentData(macro);
		const doc = augmentDocument(docData, docId, getFolderId('folder-macros'), i);

		// Add fields required by Adventure format
		if (!doc.author) doc.author = '';
		if (!doc.scope) doc.scope = 'global';

		macros.push(doc);
	}
	console.log(`    ${macros.length} macros`);

	// -- Build Folders --
	console.log('  Building folders...');
	const folders = buildFolders();
	console.log(`    ${folders.length} folders`);

	// -- Assemble Adventure Document --
	const adventureDoc: Record<string, unknown> = {
		_id: adventureId,
		name: 'Harbinger House',
		img: `modules/${MODULE_ID}/dist/assets/art/Harbinger_House_Exterior.jpg`,
		description:
			"<p>A conversion of the classic Planescape adventure 'Harbinger House' for Pathfinder 2nd Edition. Includes NPCs, items, hazards, journals, scenes, and macros for the complete adventure.</p>",
		caption: 'In the Cage, berks whisper of a house where the mad become gods...',
		actors,
		combats: [],
		items,
		scenes,
		journal,
		tables: [],
		macros,
		cards: [],
		playlists: [],
		folders,
		sort: 0,
		flags: {
			[MODULE_ID]: {
				isHarbingerHouse: true,
			},
		},
		folder: null,
		_stats: createStats(),
	};

	// -- Write to LevelDB --
	// Adventure packs use a single flat document in the "adventures" sublevel
	const dbOptions = { keyEncoding: 'utf8' as const, valueEncoding: 'json' as const };
	const db = new ClassicLevel<string, Record<string, unknown>>(packPath, dbOptions);
	await db.open();

	const adventureDb = db.sublevel<string, Record<string, unknown>>('adventures', dbOptions);
	await adventureDb.open();

	try {
		await adventureDb.put(adventureId, adventureDoc);
		const totalDocs = actors.length + items.length + journal.length + scenes.length + macros.length + folders.length;
		console.log(`\n  Adventure pack written: 1 Adventure document containing ${totalDocs} embedded documents`);
	} finally {
		await db.close();
	}
}

async function main() {
	console.log('Building Adventure compendium pack...\n');

	// Clean and recreate packs directory
	if (fs.existsSync(PACKS_DIR)) {
		fs.rmSync(PACKS_DIR, { recursive: true });
	}
	fs.mkdirSync(PACKS_DIR, { recursive: true });

	await writeAdventurePack();

	console.log('\nDone!');
}

main().catch((err) => {
	console.error('Failed to build packs:', err);
	process.exit(1);
});

// Export the Adventure ID for use in other build scripts or config
export const ADVENTURE_ID = generateId('harbinger-house-adventure');

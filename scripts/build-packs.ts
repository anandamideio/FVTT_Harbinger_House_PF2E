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

/**
 * PF2e schema version to stamp on actors/items.
 * Matches MigrationRunnerBase.LATEST_SCHEMA_VERSION in the PF2e system codebase.
 * This tells PF2e's ClientDatabaseBackend that our data is already at the current
 * schema, preventing redundant in-memory migrations on every compendium fetch.
 *
 * Update this when bumping PF2e system compatibility.
 */
const PF2E_SCHEMA_VERSION = 0.955;

/**
 * Generate a deterministic 16-character hex ID from a source identifier.
 * This ensures the same content always gets the same _id across builds,
 * which is critical for stable UUID linking (e.g., @UUID[Compendium.harbinger-house-pf2e.harbinger-house-npcs.Actor.abc123...]).
 */
function generateId(sourceId: string): string {
	return createHash('md5').update(sourceId).digest('hex').substring(0, 16);
}

/**
 * Create _stats metadata that Foundry expects on compendium documents.
 * @param compendiumSource - Canonical compendium UUID for this document (e.g., Compendium.harbinger-house-pf2e.harbinger-house-npcs.Actor.abc123)
 */
function createStats(compendiumSource?: string) {
	const now = Date.now();
	return {
		systemId: 'pf2e',
		systemVersion: SYSTEM_VERSION,
		coreVersion: CORE_VERSION,
		createdTime: now,
		modifiedTime: now,
		lastModifiedBy: 'harbinger-house-build',
		compendiumSource: compendiumSource ?? null,
		duplicateSource: null,
	};
}

/** Foundry document types mapped to LevelDB sublevel keys and embedded doc keys. */
type FoundryDocType = 'Actor' | 'Item' | 'JournalEntry' | 'Scene' | 'Macro';

interface DBKeys {
	dbKey: string;
	embeddedKey: string | null;
}

function getDBKeys(docType: FoundryDocType): DBKeys {
	switch (docType) {
		case 'Actor':
			return { dbKey: 'actors', embeddedKey: 'items' };
		case 'Item':
			return { dbKey: 'items', embeddedKey: null };
		case 'JournalEntry':
			return { dbKey: 'journal', embeddedKey: 'pages' };
		case 'Scene':
			return { dbKey: 'scenes', embeddedKey: null };
		case 'Macro':
			return { dbKey: 'macros', embeddedKey: null };
	}
}

interface PackDefinition {
	name: string;
	docType: FoundryDocType;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	entries: Array<{ id: string; data: any }>;
}

/**
 * Write a single compendium pack to a LevelDB database using sublevels,
 * matching Foundry's expected format.
 */
async function writePack(packDef: PackDefinition): Promise<void> {
	const packPath = path.join(PACKS_DIR, packDef.name);

	// Remove existing pack directory if it exists
	if (fs.existsSync(packPath)) {
		fs.rmSync(packPath, { recursive: true });
	}
	fs.mkdirSync(packPath, { recursive: true });

	const dbOptions = { keyEncoding: 'utf8' as const, valueEncoding: 'json' as const };
	const db = new ClassicLevel<string, Record<string, unknown>>(packPath, dbOptions);
	await db.open();

	const { dbKey, embeddedKey } = getDBKeys(packDef.docType);
	const documentDb = db.sublevel<string, Record<string, unknown>>(dbKey, dbOptions);
	await documentDb.open();
	const embeddedDb = embeddedKey
		? db.sublevel<string, Record<string, unknown>>(`${dbKey}.${embeddedKey}`, dbOptions)
		: null;
	if (embeddedDb) await embeddedDb.open();

	try {
		const docBatch = documentDb.batch();
		const embeddedBatch = embeddedDb?.batch();

		/** Build the canonical compendium UUID for a document */
		const compendiumUUID = (docType: string, docId: string) =>
			`Compendium.${MODULE_ID}.${packDef.name}.${docType}.${docId}`;

		/** Whether this pack type should have _migration.version stamped */
		const needsMigrationStamp = packDef.docType === 'Actor' || packDef.docType === 'Item';

		for (const entry of packDef.entries) {
			const docId = generateId(entry.id);
			const docCompendiumSource = compendiumUUID(packDef.docType, docId);
			const doc: Record<string, unknown> = {
				...entry.data,
				_id: docId,
				_stats: createStats(docCompendiumSource),
			};

			// Stamp _migration.version on actors and items so PF2e's migration runner
			// knows this data is already at the current schema
			if (needsMigrationStamp && doc.system && typeof doc.system === 'object') {
				(doc.system as Record<string, unknown>)._migration = {
					version: PF2E_SCHEMA_VERSION,
					previous: null,
				};
			}

			// Extract embedded documents (items on actors, pages on journals)
			// into their own sublevel, replacing the array with ID references
			if (embeddedKey && embeddedBatch && Array.isArray(doc[embeddedKey])) {
				const embeddedDocs = doc[embeddedKey] as Record<string, unknown>[];
				const embeddedIds: string[] = [];

				for (const embDoc of embeddedDocs) {
					const embId =
						(embDoc._id as string) || generateId(`${entry.id}-${embDoc.name || embeddedIds.length}`);
					embDoc._id = embId;
					embDoc._stats = createStats();
					// Stamp _migration.version on embedded items (items on actors)
					if (packDef.docType === 'Actor' && embeddedKey === 'items' && embDoc.system && typeof embDoc.system === 'object') {
						(embDoc.system as Record<string, unknown>)._migration = {
							version: PF2E_SCHEMA_VERSION,
							previous: null,
						};
					}
					embeddedBatch.put(`${docId}.${embId}`, embDoc);
					embeddedIds.push(embId);
				}

				doc[embeddedKey] = embeddedIds;
			}

			docBatch.put(docId, doc);
		}

		await docBatch.write();
		if (embeddedBatch?.length) {
			await embeddedBatch.write();
		}
		console.log(`  ✓ ${packDef.name}: ${packDef.entries.length} documents`);
	} finally {
		await db.close();
	}
}

async function main() {
	console.log('Building compendium packs...\n');

	// Clean and recreate packs directory
	if (fs.existsSync(PACKS_DIR)) {
		fs.rmSync(PACKS_DIR, { recursive: true });
	}
	fs.mkdirSync(PACKS_DIR, { recursive: true });

	// Build NPC pack
	const npcEntries = ALL_NPCS.map((npc) => ({
		id: npc.id,
		data: npcEntryToDocumentData(npc),
	}));

	// Build Item pack
	const itemEntries = ALL_ITEMS.map((item) => ({
		id: item.id,
		data: itemToDocumentData(item),
	}));

	// Build Spell pack
	const spellEntries = ALL_SPELLS.map((spell) => ({
		id: spell.id,
		data: spellToDocumentData(spell),
	}));

	// Build Hazard pack
	const hazardEntries = ALL_HAZARDS.map((hazard) => ({
		id: hazard.id,
		data: hazardToDocumentData(hazard),
	}));

	// Build Journal pack
	const journalEntries = ALL_JOURNALS.map((journal) => ({
		id: journal.id,
		data: journalToDocumentData(journal),
	}));

	// Build Scene pack
	const sceneEntries = ALL_SCENES.map((scene) => ({
		id: scene.id,
		data: sceneToDocumentData(scene),
	}));

	// Build Macro pack
	const macroEntries = ALL_MACROS.map((macro) => ({
		id: macro.id,
		data: macroToDocumentData(macro),
	}));

	const packs: PackDefinition[] = [
		{ name: 'harbinger-house-npcs', docType: 'Actor', entries: npcEntries },
		{ name: 'harbinger-house-items', docType: 'Item', entries: itemEntries },
		{ name: 'harbinger-house-spells', docType: 'Item', entries: spellEntries },
		{ name: 'harbinger-house-hazards', docType: 'Actor', entries: hazardEntries },
		{ name: 'harbinger-house-journals', docType: 'JournalEntry', entries: journalEntries },
		{ name: 'harbinger-house-scenes', docType: 'Scene', entries: sceneEntries },
		{ name: 'harbinger-house-macros', docType: 'Macro', entries: macroEntries },
	];

	for (const pack of packs) {
		await writePack(pack);
	}

	const total = packs.reduce((sum, p) => sum + p.entries.length, 0);
	console.log(`\nDone! Built ${packs.length} packs with ${total} total documents.`);
}

main().catch((err) => {
	console.error('Failed to build packs:', err);
	process.exit(1);
});

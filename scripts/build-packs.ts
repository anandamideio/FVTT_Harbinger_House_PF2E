/**
 * Build Compendium Packs
 *
 * Generates LevelDB compendium packs from the module's TypeScript data sources.
 * Run via: tsx scripts/build-packs.ts
 *
 * This script runs in Node.js (not Foundry), so it uses only the pure data
 * transformation functions from src/data/to-foundry-data.ts which have no
 * Foundry runtime dependencies.
 */

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
import { ALL_SCENES } from '../src/data/scenes.ts';

// Import pure transform functions
import {
	itemToDocumentData,
	spellToDocumentData,
	hazardToDocumentData,
	journalToDocumentData,
	sceneToDocumentData,
	npcEntryToDocumentData,
} from '../src/data/to-foundry-data.ts';

const PACKS_DIR = path.resolve(import.meta.dirname, '..', 'packs');

// Foundry system/core versions for _stats metadata
const SYSTEM_VERSION = '6.0.0';
const CORE_VERSION = '13.0.0';

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
 */
function createStats() {
	const now = Date.now();
	return {
		systemId: 'pf2e',
		systemVersion: SYSTEM_VERSION,
		coreVersion: CORE_VERSION,
		createdTime: now,
		modifiedTime: now,
		lastModifiedBy: 'harbinger-house-build',
		compendiumSource: null,
		duplicateSource: null,
	};
}

interface PackDefinition {
	name: string;
	entries: Array<{ id: string; data: Record<string, unknown> }>;
}

/**
 * Write a single compendium pack to a LevelDB database.
 */
async function writePack(packDef: PackDefinition): Promise<void> {
	const packPath = path.join(PACKS_DIR, packDef.name);

	// Remove existing pack directory if it exists
	if (fs.existsSync(packPath)) {
		fs.rmSync(packPath, { recursive: true });
	}
	fs.mkdirSync(packPath, { recursive: true });

	const db = new ClassicLevel<string, string>(packPath, {
		keyEncoding: 'utf8',
		valueEncoding: 'utf8',
	});

	await db.open();

	try {
		const batch = db.batch();

		for (const entry of packDef.entries) {
			const docId = generateId(entry.id);
			const doc = {
				...entry.data,
				_id: docId,
				_stats: createStats(),
			};

			const key = `!items!${docId}`;
			batch.put(key, JSON.stringify(doc));
		}

		await batch.write();
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
		data: npcEntryToDocumentData(npc) as Record<string, unknown>,
	}));

	// Build Item pack
	const itemEntries = ALL_ITEMS.map((item) => ({
		id: item.id,
		data: itemToDocumentData(item) as Record<string, unknown>,
	}));

	// Build Spell pack
	const spellEntries = ALL_SPELLS.map((spell) => ({
		id: spell.id,
		data: spellToDocumentData(spell) as Record<string, unknown>,
	}));

	// Build Hazard pack
	const hazardEntries = ALL_HAZARDS.map((hazard) => ({
		id: hazard.id,
		data: hazardToDocumentData(hazard) as Record<string, unknown>,
	}));

	// Build Journal pack
	const journalEntries = ALL_JOURNALS.map((journal) => ({
		id: journal.id,
		data: journalToDocumentData(journal) as Record<string, unknown>,
	}));

	// Build Scene pack
	const sceneEntries = ALL_SCENES.map((scene) => ({
		id: scene.id,
		data: sceneToDocumentData(scene) as Record<string, unknown>,
	}));

	const packs: PackDefinition[] = [
		{ name: 'harbinger-house-npcs', entries: npcEntries },
		{ name: 'harbinger-house-items', entries: itemEntries },
		{ name: 'harbinger-house-spells', entries: spellEntries },
		{ name: 'harbinger-house-hazards', entries: hazardEntries },
		{ name: 'harbinger-house-journals', entries: journalEntries },
		{ name: 'harbinger-house-scenes', entries: sceneEntries },
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

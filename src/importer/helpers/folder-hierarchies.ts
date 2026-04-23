import { HARBINGER_JOURNAL_SHEET_CLASS, MODULE_ID } from '../../config';
import type { ImportDebug } from '../types';
import {
	ensureFolder,
	MAP_CHAPTER_FOLDERS,
	MAP_FOLDER_ROOT,
	MAP_ROOT_HINT_ALIASES,
} from './folder-primitive';

/**
 * Ensure imported journals are organized under the Harbinger House root with
 * Chapters/Reference subfolders, and carry the Harbinger journal sheet class.
 */
export async function ensureJournalFolderHierarchy(debug: ImportDebug): Promise<void> {
	if (!game.folders || !game.journal) return;

	const journals = game.journal.filter(
		(j: FoundryDocument) => j.flags?.[MODULE_ID]?.sourceId !== undefined,
	);
	if (journals.length === 0) return;

	debug('Ensuring journal folder hierarchy', { journalCount: journals.length });

	const root = await ensureFolder('JournalEntry', 'Harbinger House Adventure', null, '#6e0000', debug);
	const chapters = await ensureFolder('JournalEntry', 'Chapters', root.id, undefined, debug);
	const reference = await ensureFolder('JournalEntry', 'Reference', root.id, undefined, debug);

	for (const journal of journals) {
		const folderHint = journal.flags?.[MODULE_ID]?.folder;
		const target = folderHint === 'Reference' ? reference : chapters;
		const currentSheetClass = journal.flags?.core?.sheetClass;
		const needsFolderUpdate = journal.folder?.id !== target.id;
		const needsSheetUpdate = currentSheetClass !== HARBINGER_JOURNAL_SHEET_CLASS;

		if (!needsFolderUpdate && !needsSheetUpdate) continue;

		const updateData: Record<string, unknown> = {};
		if (needsFolderUpdate) updateData.folder = target.id;
		if (needsSheetUpdate) updateData['flags.core.sheetClass'] = HARBINGER_JOURNAL_SHEET_CLASS;

		debug('Updating imported journal configuration', {
			journal: journal.name,
			fromFolder: journal.folder?.id ?? null,
			toFolder: needsFolderUpdate ? target.id : journal.folder?.id ?? null,
			currentSheetClass: typeof currentSheetClass === 'string' ? currentSheetClass : null,
			targetSheetClass: HARBINGER_JOURNAL_SHEET_CLASS,
			folderHint: typeof folderHint === 'string' ? folderHint : 'Chapters',
		});

		await journal.update(updateData as Partial<JournalEntryData>);
	}

	debug('Ensured Harbinger House journal folder hierarchy', {
		journalCount: journals.length,
		rootId: root.id,
		chaptersId: chapters.id,
		referenceId: reference.id,
	});
}

/**
 * Ensure actors and hazards are routed to category subfolders.
 * Returns `false` if canvas isn't ready yet (caller should defer), `true` otherwise.
 */
export async function ensureActorFolderHierarchy(debug: ImportDebug): Promise<boolean> {
	if (!game.actors || !game.folders) return true;
	const hasCanvasGrid = Boolean(canvas?.scene?.toObject()?.grid);
	if (!hasCanvasGrid) return false;

	const actors = game.actors.filter(
		(a: ActorClass) => a.flags?.[MODULE_ID]?.sourceId !== undefined,
	);
	if (actors.length === 0) return true;

	const npcRoot = await ensureFolder('Actor', 'Harbinger House NPCs', null, '#6e0000', debug);
	const hazardRoot = await ensureFolder('Actor', 'Harbinger House Hazards', null, '#4a3f5c', debug);

	const fiends = await ensureFolder('Actor', 'Fiends & Monsters', npcRoot.id, undefined, debug);
	const cultists = await ensureFolder('Actor', 'Cultist & Common NPCs', npcRoot.id, undefined, debug);
	const generic = await ensureFolder('Actor', "Generic NPC's", npcRoot.id, undefined, debug);
	const residents = await ensureFolder('Actor', 'Harbinger House Residents', npcRoot.id, undefined, debug);
	const treasure = await ensureFolder('Actor', 'Treasure', npcRoot.id, undefined, debug);

	const environmentalHazards = await ensureFolder(
		'Actor',
		'Environmental Hazards',
		hazardRoot.id,
		undefined,
		debug,
	);
	const magicalTraps = await ensureFolder('Actor', 'Magical Traps', hazardRoot.id, undefined, debug);
	const hasAuraActors = actors.some((actor) => actor.flags?.[MODULE_ID]?.category === 'aura');
	const npcAuras = hasAuraActors
		? await ensureFolder('Actor', 'NPC Auras', hazardRoot.id, undefined, debug)
		: undefined;

	let reassigned = 0;

	for (const actor of actors) {
		const category = actor.flags?.[MODULE_ID]?.category;
		const actorType = actor.type;

		let target: FolderClass;

		if (
			actorType === 'hazard' ||
			category === 'trap' ||
			category === 'environmental' ||
			category === 'aura' ||
			category === 'haunt'
		) {
			target =
				category === 'environmental'
					? environmentalHazards
					: category === 'aura' && npcAuras
						? npcAuras
						: magicalTraps;
		} else {
			target =
				category === 'fiend'
					? fiends
					: category === 'cultist'
						? cultists
						: category === 'generic-npc' || category === 'generic-npcs'
							? generic
							: category === 'major-npc' || category === 'harbinger-resident' || category === 'figment'
								? residents
								: category === 'loot' || actorType === 'loot'
									? treasure
									: npcRoot;
		}

		if (actor.folder?.id !== target.id) {
			await (actor as unknown as { update: (data: Record<string, unknown>) => Promise<unknown> }).update({
				folder: target.id,
			});
			reassigned += 1;
			debug('Reassigned actor folder', {
				actor: actor.name,
				category: typeof category === 'string' ? category : 'unknown',
				from: actor.folder?.id ?? null,
				to: target.id,
			});
		}
	}

	if (!hasAuraActors) {
		const existingNpcAuras = game.folders.find(
			(f: FoundryDocument) =>
				f.type === 'Actor' && f.name === 'NPC Auras' && f.folder?.id === hazardRoot.id,
		) as FolderClass | undefined;

		if (existingNpcAuras) {
			const assignedActorCount = actors.filter((actor) => actor.folder?.id === existingNpcAuras.id).length;
			if (assignedActorCount === 0) {
				await existingNpcAuras.delete();
				debug('Removed empty deprecated hazard subfolder', {
					folder: 'NPC Auras',
					parent: hazardRoot.id,
					id: existingNpcAuras.id,
				});
			}
		}
	}

	debug('Ensured actor/hazard folder hierarchy', { actorCount: actors.length, reassigned });
	return true;
}

/** Ensure items are routed to category subfolders; spells live under the Spells root. */
export async function ensureItemFolderHierarchy(debug: ImportDebug): Promise<void> {
	if (!game.items || !game.folders) return;

	const items = game.items.filter(
		(i: ItemClass) => i.flags?.[MODULE_ID]?.sourceId !== undefined,
	);
	if (items.length === 0) return;

	const itemRoot = await ensureFolder('Item', 'Harbinger House Items', null, '#c9a227', debug);
	const spellRoot = await ensureFolder('Item', 'Harbinger House Spells', null, '#4a3f5c', debug);

	const armor = await ensureFolder('Item', 'Armor & Protective Items', itemRoot.id, undefined, debug);
	const artifacts = await ensureFolder('Item', 'Artifacts', itemRoot.id, undefined, debug);
	const consumables = await ensureFolder('Item', 'Consumables', itemRoot.id, undefined, debug);
	const weapons = await ensureFolder('Item', 'Weapons', itemRoot.id, undefined, debug);
	const equipment = await ensureFolder('Item', 'Wonderous Items & Equipment', itemRoot.id, undefined, debug);

	let reassigned = 0;

	for (const item of items) {
		const category = item.flags?.[MODULE_ID]?.category;

		let target: FolderClass;
		if (item.type === 'spell') {
			target = spellRoot;
		} else {
			target =
				category === 'armor'
					? armor
					: category === 'artifact'
						? artifacts
						: category === 'consumable'
							? consumables
							: category === 'weapon'
								? weapons
								: category === 'equipment'
									? equipment
									: itemRoot;
		}

		if (item.folder?.id !== target.id) {
			await (item as unknown as { update: (data: Record<string, unknown>) => Promise<unknown> }).update({
				folder: target.id,
			});
			reassigned += 1;
			debug('Reassigned item folder', {
				item: item.name,
				itemType: item.type,
				category: typeof category === 'string' ? category : 'unknown',
				from: item.folder?.id ?? null,
				to: target.id,
			});
		}
	}

	debug('Ensured item folder hierarchy', { itemCount: items.length, reassigned });
}

/** Ensure scenes are grouped under Harbinger House Maps with chapter subfolders. */
export async function ensureSceneFolderHierarchy(debug: ImportDebug): Promise<void> {
	if (!game.scenes || !game.folders) return;

	const scenes = game.scenes.filter(
		(s: SceneClass) => s.flags?.[MODULE_ID]?.sourceId !== undefined,
	);
	if (scenes.length === 0) return;

	const mapsRoot = await ensureFolder('Scene', MAP_FOLDER_ROOT, null, '#2f4f6f', debug);
	const chapterFolders = new Map<string, FolderClass>();

	for (const chapterName of MAP_CHAPTER_FOLDERS) {
		chapterFolders.set(chapterName, await ensureFolder('Scene', chapterName, mapsRoot.id, undefined, debug));
	}

	let reassigned = 0;

	for (const scene of scenes) {
		const rawFolderHint = scene.flags?.[MODULE_ID]?.folder;
		const folderHint = typeof rawFolderHint === 'string' ? rawFolderHint.trim() : '';

		let target = mapsRoot;
		if (folderHint.length > 0 && !MAP_ROOT_HINT_ALIASES.has(folderHint)) {
			let chapterFolder = chapterFolders.get(folderHint);
			if (!chapterFolder) {
				chapterFolder = await ensureFolder('Scene', folderHint, mapsRoot.id, undefined, debug);
				chapterFolders.set(folderHint, chapterFolder);
			}
			target = chapterFolder;
		}

		if (scene.folder?.id !== target.id) {
			await (scene as unknown as { update: (data: Record<string, unknown>) => Promise<unknown> }).update({
				folder: target.id,
			});
			reassigned += 1;
			debug('Reassigned scene folder', {
				scene: scene.name,
				folderHint: folderHint || MAP_FOLDER_ROOT,
				from: scene.folder?.id ?? null,
				to: target.id,
			});
		}
	}

	debug('Ensured scene folder hierarchy', {
		sceneCount: scenes.length,
		reassigned,
		chapterFolders: Array.from(chapterFolders.keys()),
	});
}

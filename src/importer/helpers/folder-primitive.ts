import { MODULE_ID } from '../../config';
import type { ImportDebug } from '../types';

export const MAP_FOLDER_ROOT = 'Harbinger House Maps';
export const MAP_ROOT_HINT_ALIASES = new Set(['Maps', MAP_FOLDER_ROOT]);
export const MAP_CHAPTER_FOLDERS = ['Chapter 1', 'Chapter 2', 'Chapter 3'] as const;

/**
 * Find or create a folder with a specific type/name/parent.
 *
 * Match is scored: exact (type+name+parent) wins; otherwise we match by
 * type+name and reparent if needed; otherwise we create.
 */
export async function ensureFolder(
	type: string,
	name: string,
	parentId: string | null,
	color?: string,
	debug?: ImportDebug,
): Promise<FolderClass> {
	if (!game.folders) {
		throw new Error('game.folders is unavailable');
	}

	const parentMatches = (folder: FoundryDocument): boolean =>
		(parentId === null && !folder.folder) || folder.folder?.id === parentId;

	let folder = game.folders.find(
		(f: FoundryDocument) => f.type === type && f.name === name && parentMatches(f),
	) as FolderClass | undefined;

	if (!folder) {
		folder = game.folders.find(
			(f: FoundryDocument) => f.type === type && f.name === name,
		) as FolderClass | undefined;
	}

	if (!folder) {
		folder = await (Folder.create({
			name,
			type,
			folder: parentId,
			...(color ? { color } : {}),
			flags: {
				[MODULE_ID]: {
					isHarbingerHouse: true,
				},
			},
		}) as Promise<FolderClass>);

		debug?.('Created folder', { type, name, parentId, id: folder.id });
		return folder;
	}

	if (!parentMatches(folder)) {
		await folder.update({ folder: parentId });
		debug?.('Moved folder to expected parent', { type, name, parentId, id: folder.id });
	}

	return folder;
}

import { MODULE_ID } from '../config';
import type { HarbingerHouseMacroName } from '../macros';

export interface HarbingerMacro {
	id: string;
	name: string;
	type: 'script';
	command: string;
	img: string;
}

function createMacroCommand(macroName: HarbingerHouseMacroName): string {
	return `game.modules.get('${MODULE_ID}')?.macros?.${macroName}?.();`;
}

export const ALL_MACROS: HarbingerMacro[] = [
	{
		id: 'set-landing-page',
		name: 'Set Landing Page',
		type: 'script',
		command: createMacroCommand('setLandingPage'),
		img: 'icons/svg/book.svg',
	},
	{
		id: 'open-import-dialog',
		name: 'Open Adventure Importer',
		type: 'script',
		command: createMacroCommand('openImportDialog'),
		img: 'icons/svg/direction.svg',
	},
	{
		id: 'export-scene-data',
		name: 'Export Scene Data',
		type: 'script',
		command: createMacroCommand('exportSceneData'),
		img: 'icons/svg/dice-target.svg',
	},
	{
		id: 'export-scene-ambience',
		name: 'Export Scene Ambience',
		type: 'script',
		command: createMacroCommand('exportSceneAmbienceData'),
		img: 'icons/svg/sound.svg',
	},
	{
		id: 'calibrate-sigil-location',
		name: 'Calibrate Sigil Location',
		type: 'script',
		command: createMacroCommand('calibrateSigilLocation'),
		img: 'icons/svg/target.svg',
	},
	{
		id: 'assign-player-alignments',
		name: 'Assign Player Alignments',
		type: 'script',
		command: createMacroCommand('assignPlayerAlignments'),
		img: 'icons/svg/sun.svg',
	},
];

export function getMacroById(id: string): HarbingerMacro | undefined {
	return ALL_MACROS.find((m) => m.id === id);
}

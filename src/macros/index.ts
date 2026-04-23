import type { HarbingerHouseMacroAPI, LegacyHarbingerHouseMacroAPI } from './Macro';

export function withLegacyMacroAliases(
	runtimeMacros: HarbingerHouseMacroAPI,
): HarbingerHouseMacroAPI & Partial<LegacyHarbingerHouseMacroAPI> {
	async function exportSceneAmbienceDataLegacy(): Promise<void> {
		ui.notifications.info('Scene ambience export has been merged into Export Scene Data.');
		await runtimeMacros.exportSceneData();
	}

	return {
		...runtimeMacros,
		exportSceneAmbienceData: exportSceneAmbienceDataLegacy,
	};
}

export type { HarbingerHouseMacroAPI, HarbingerHouseMacroName } from './Macro';
export { HarbingerMacro } from './Macro';
export { MacroRegistry } from './MacroRegistry';
export { AssignPlayerAlignments } from './impl/AssignPlayerAlignments';
export { CalibrateSigilLocation } from './impl/CalibrateSigilLocation';
export { ExportSceneData } from './impl/ExportSceneData';
export { OpenImportDialog } from './impl/OpenImportDialog';
export { SetLandingPage } from './impl/SetLandingPage';

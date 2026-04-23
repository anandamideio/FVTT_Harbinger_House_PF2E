export interface HarbingerHouseMacroAPI {
	setLandingPage: () => Promise<void>;
	openImportDialog: () => Promise<void>;
	exportSceneData: () => Promise<void>;
	calibrateSigilLocation: () => Promise<void>;
	assignPlayerAlignments: () => Promise<void>;
}

export type HarbingerHouseMacroName = keyof HarbingerHouseMacroAPI;

export interface LegacyHarbingerHouseMacroAPI {
	exportSceneAmbienceData: () => Promise<void>;
}

export abstract class HarbingerMacro {
	abstract readonly name: HarbingerHouseMacroName;
	abstract readonly label: string;
	abstract run(): Promise<void>;
}

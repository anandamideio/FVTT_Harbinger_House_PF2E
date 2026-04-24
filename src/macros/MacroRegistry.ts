import { HarbingerMacro, type HarbingerHouseMacroAPI, type HarbingerHouseMacroName } from './Macro';

const REQUIRED_MACRO_NAMES: HarbingerHouseMacroName[] = [
	'setLandingPage',
	'openImportDialog',
	'exportSceneData',
	'calibrateSigilLocation',
	'assignPlayerAlignments',
	'revealNarcovisNotebook',
];

export class MacroRegistry {
	private readonly macros = new Map<HarbingerHouseMacroName, HarbingerMacro>();

	register(macro: HarbingerMacro): this {
		this.macros.set(macro.name, macro);
		return this;
	}

	toAPI(): HarbingerHouseMacroAPI {
		this.assertRequiredMacros();

		return {
			setLandingPage: this.createRunner('setLandingPage'),
			openImportDialog: this.createRunner('openImportDialog'),
			exportSceneData: this.createRunner('exportSceneData'),
			calibrateSigilLocation: this.createRunner('calibrateSigilLocation'),
			assignPlayerAlignments: this.createRunner('assignPlayerAlignments'),
			revealNarcovisNotebook: this.createRunner('revealNarcovisNotebook'),
		};
	}

	private createRunner(name: HarbingerHouseMacroName): () => Promise<void> {
		return async () => {
			const macro = this.macros.get(name);
			if (!macro) {
				throw new Error(`Harbinger House macro '${name}' is not registered.`);
			}

			await macro.run();
		};
	}

	private assertRequiredMacros(): void {
		const missing = REQUIRED_MACRO_NAMES.filter((name) => !this.macros.has(name));
		if (missing.length === 0) return;

		throw new Error(`Missing required Harbinger House macro registrations: ${missing.join(', ')}`);
	}
}

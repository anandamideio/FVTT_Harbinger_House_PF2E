import { HarbingerMacro } from '../Macro';
import { exportActiveSceneDataMacro } from '../helpers/scene-export';

export class ExportSceneData extends HarbingerMacro {
	readonly name = 'exportSceneData' as const;
	readonly label = 'Export Scene Data';

	async run(): Promise<void> {
		await exportActiveSceneDataMacro();
	}
}

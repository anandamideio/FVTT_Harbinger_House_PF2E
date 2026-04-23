import { MODULE_ID, log, logError, logWarn } from '../../config';
import type { ImportContext, ImportOptionKey } from '../types';
import { ImportAction } from './ImportAction';

/** Activate the starting scene (Sigil) after import. */
export class ActivateInitialScene extends ImportAction {
	readonly key: ImportOptionKey = 'activateScene';

	async apply({ bootstrap, debug }: ImportContext): Promise<void> {
		try {
			let lookupStrategy:
				| 'deterministic-id'
				| 'module-source-id'
				| 'scene-name'
				| 'module-flag'
				| 'none' = 'none';

			let scene = game.scenes?.find(
				(s: FoundryDocument) => s.id === bootstrap.initialSceneId,
			);
			if (scene) lookupStrategy = 'deterministic-id';

			// Prefer a stable sourceId lookup in case imported world IDs differ.
			if (!scene) {
				scene = game.scenes?.find(
					(s: FoundryDocument) => s.flags?.[MODULE_ID]?.sourceId === bootstrap.initialSceneSourceId,
				);
				if (scene) lookupStrategy = 'module-source-id';
			}

			// Fallback for legacy worlds or migrated imports.
			if (!scene) {
				scene = game.scenes?.find(
					(s: FoundryDocument) =>
						s.flags?.[MODULE_ID] !== undefined && s.name === bootstrap.initialSceneName,
				);
				if (scene) lookupStrategy = 'scene-name';
			}

			if (!scene) {
				scene = game.scenes?.find(
					(s: FoundryDocument) => s.flags?.[MODULE_ID] !== undefined,
				);
				if (scene) lookupStrategy = 'module-flag';
			}

			if (scene) {
				await (scene as SceneClass).activate();
				debug('activateStartingScene found scene', {
					lookupStrategy,
					sceneId: scene.id,
					sceneName: scene.name,
				});
				log(`Activated starting scene: ${scene.name}`);
			} else {
				logWarn('No Harbinger House scene found to activate after import');
			}
		} catch (err) {
			logError('Failed to activate starting scene:', err);
		}
	}
}

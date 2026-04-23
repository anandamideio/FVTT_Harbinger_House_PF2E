import { MODULE_ID, log, logError } from '../../config';
import type { ImportContext, ImportOptionKey } from '../types';
import { ImportAction } from './ImportAction';

/**
 * Customize the world login screen with Harbinger House artwork.
 * Posts to Foundry's setup endpoint to update world background and description.
 */
export class CustomizeLoginScreen extends ImportAction {
	readonly key: ImportOptionKey = 'customizeLogin';

	async apply({ document, bootstrap, debug }: ImportContext): Promise<void> {
		try {
			const module = game.modules.get(MODULE_ID);
			if (!module) return;

			const adventureDescription =
				typeof document?.description === 'string' && document.description.trim().length > 0
					? document.description
					: null;
			const loginDescription = adventureDescription ?? module.description;

			const worldData = {
				action: 'editWorld',
				id: game.world.id,
				description: loginDescription,
				background: bootstrap.initialLoginScreenBackground,
			};

			debug('customizeLoginScreen description source', {
				source: adventureDescription ? 'adventure-document' : 'module-manifest',
				descriptionLength: loginDescription.length,
			});

			const response = await foundry.utils.fetchJsonWithTimeout(foundry.utils.getRoute('setup'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(worldData),
			});

			debug('customizeLoginScreen response', {
				status: response.status,
				ok: response.ok,
			});

			game.world.updateSource(worldData);
			log('Login screen customized with Harbinger House artwork');
		} catch (err) {
			logError('Failed to customize login screen:', err);
		}
	}
}

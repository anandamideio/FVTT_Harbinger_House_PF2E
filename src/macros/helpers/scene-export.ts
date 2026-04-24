import { log } from '../../config';
import { copyToClipboard } from './clipboard';
import { escapeHtml, formatTypeScriptLiteral } from './literal-formatter';
import { buildHarbingerSceneAmbienceExport, buildHarbingerSceneExport } from './scene-export-builder';

export { buildHarbingerSceneAmbienceExport, buildHarbingerSceneExport, type SceneAmbienceExportContext } from './scene-export-builder';

export async function exportActiveSceneDataMacro(): Promise<void> {
	if (!game.user?.isGM) {
		ui.notifications.warn('Only a GM can export scene data.');
		return;
	}

	const scene = canvas.scene;
	if (!scene) {
		ui.notifications.warn('No active scene to export.');
		return;
	}

	const ambience = buildHarbingerSceneAmbienceExport(scene);
	const exportData = buildHarbingerSceneExport(scene, ambience);
	const snippet = `${formatTypeScriptLiteral(exportData)},`;
	const copied = await copyToClipboard(snippet, 'Unable to copy scene export to clipboard.');

	log(`[Scene Export] ${exportData.id} (${exportData.name})`, {
		export: exportData,
		playlistId: ambience.playlistId ?? null,
		playlistSourceId: ambience.exportData.playlistSourceId ?? null,
	});

	const playlistDetails = [
		...(ambience.playlistId
			? [
				`<li><strong>Playlist:</strong> ${escapeHtml(ambience.playlistName ?? ambience.playlistId)}${
					ambience.playlistName ? ` <code>(${escapeHtml(ambience.playlistId)})</code>` : ''
				}</li>`,
			]
			: []),
		...(ambience.playlistSoundId
			? [
				`<li><strong>Sound:</strong> ${escapeHtml(ambience.playlistSoundName ?? ambience.playlistSoundId)}${
					ambience.playlistSoundName ? ` <code>(${escapeHtml(ambience.playlistSoundId)})</code>` : ''
				}</li>`,
			]
			: []),
		...(ambience.exportData.playlistSourceId
			? [
				`<li><strong>Scene data field:</strong> <code>playlistSourceId: '${escapeHtml(ambience.exportData.playlistSourceId)}'</code></li>`,
			]
			: []),
	];

	new Dialog(
		{
			title: `Scene Export: ${exportData.name}`,
			content: `
							<p>Paste this object into the appropriate scene array in <code>src/data/content/scenes/*.ts</code>.</p>
				<p>This export includes ambience overrides and complete grid settings when present.</p>
				${
					playlistDetails.length > 0
						? `<ul>${playlistDetails.join('')}</ul>`
						: '<p>No playlist selected in Scene Ambience.</p>'
				}
				${
					ambience.hasUnmappedPlaylist
						? '<p><strong>Playlist mapping note:</strong> The selected playlist is missing this module\'s <code>sourceId</code> flag, so <code>playlistSourceId</code> could not be generated automatically.</p>'
						: ''
				}
				<p>${copied ? 'Copied to clipboard.' : 'Clipboard copy failed. Copy from the box below.'}</p>
				<textarea style="width: 100%; min-height: 360px; font-family: monospace;">${escapeHtml(snippet)}</textarea>
			`,
			buttons: {
				ok: {
					icon: '<i class="fas fa-check"></i>',
					label: 'Done',
				},
			},
			default: 'ok',
		},
		{
			width: 780,
			classes: ['harbinger-house'],
		},
	).render(true);

	ui.notifications.info(`Exported scene data for ${exportData.name}.`);
}

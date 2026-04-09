import { MODULE_ID, log, logWarn } from './config';
import { ALL_SIGIL_LOCATIONS, getLocationById, type SigilLocation } from './data/sigil-locations';
import { isSigilScene } from './sigil-map/sigil-map-state';

type JournalWithShareSheet = JournalEntryClass & {
	sheet: {
		render(force?: boolean, options?: { sharedWithPlayers?: boolean }): void;
	};
};

interface SceneWithLighting extends SceneClass {
	globalLight?: boolean;
}

interface AmbientSoundLike {
	id: string;
	hidden?: boolean;
}

interface SceneWithAmbientSounds extends SceneClass {
	sounds?: {
		contents: AmbientSoundLike[];
	};
	updateEmbeddedDocuments?: (
		type: string,
		updates: Array<Record<string, unknown>>,
	) => Promise<unknown>;
}

interface TokenDocumentLike {
	texture?: {
		src?: string;
	};
	update(data: Record<string, unknown>): Promise<unknown>;
}

interface ControlledTokenLike {
	document: TokenDocumentLike;
}

interface TokenLayerLike {
	controlled: ControlledTokenLike[];
}

interface PointerLikeEvent {
	global?: {
		x: number;
		y: number;
	};
	stopPropagation?: () => void;
	preventDefault?: () => void;
}

export interface HarbingerHouseMacroAPI {
	setLandingPage: () => Promise<void>;
	toggleSceneLighting: () => Promise<void>;
	toggleAmbientSounds: () => Promise<void>;
	openImportDialog: () => Promise<void>;
	applyTokenRingStyling: () => Promise<void>;
	calibrateSigilLocation: () => Promise<void>;
}

export type HarbingerHouseMacroName = keyof HarbingerHouseMacroAPI;

function getDialogRoot(html: HTMLElement | JQuery): HTMLElement {
	return html instanceof HTMLElement ? html : ((html as unknown as HTMLElement[])[0] ?? document.body);
}

async function setLandingPage(): Promise<void> {
	const journal = game.journal?.find((entry: JournalEntryClass) => entry.flags?.[MODULE_ID]?.imported === true);
	if (!journal) {
		ui.notifications.warn('No Harbinger House journal found. Please import journals first.');
		return;
	}

	(journal as JournalWithShareSheet).sheet.render(true, { sharedWithPlayers: true });
	ui.notifications.info('Displaying Harbinger House journal to all players.');
}

async function toggleSceneLighting(): Promise<void> {
	const scene = canvas.scene as SceneWithLighting | null;
	if (!scene) {
		ui.notifications.warn('No active scene.');
		return;
	}

	const newState = !scene.globalLight;
	await scene.update({ globalLight: newState });
	ui.notifications.info(`Global illumination ${newState ? 'enabled' : 'disabled'}.`);
}

async function toggleAmbientSounds(): Promise<void> {
	const scene = canvas.scene as SceneWithAmbientSounds | null;
	if (!scene) {
		ui.notifications.warn('No active scene.');
		return;
	}

	const sounds = scene.sounds?.contents ?? [];
	if (sounds.length === 0) {
		ui.notifications.warn('No ambient sounds on this scene.');
		return;
	}

	if (!scene.updateEmbeddedDocuments) {
		ui.notifications.warn('Ambient sound updates are not available on this Foundry version.');
		return;
	}

	const updates = sounds.map((sound) => ({
		_id: sound.id,
		hidden: !sound.hidden,
	}));

	await scene.updateEmbeddedDocuments('AmbientSound', updates);
	ui.notifications.info(`Toggled ${sounds.length} ambient sound(s).`);
}

async function openImportDialog(): Promise<void> {
	if (!game.user?.isGM) {
		ui.notifications.warn('Only a GM can import content.');
		return;
	}

	if (!game.harbingerHouse?.openImporter) {
		ui.notifications.error('Harbinger House module is not active.');
		return;
	}

	await game.harbingerHouse.openImporter();
}

async function applyTokenRingStyling(): Promise<void> {
	const tokens = (canvas as unknown as { tokens?: TokenLayerLike }).tokens?.controlled ?? [];
	if (tokens.length === 0) {
		ui.notifications.warn('No tokens selected. Please select one or more tokens first.');
		return;
	}

	for (const token of tokens) {
		const textureSrc = token.document.texture?.src;
		await token.document.update({
			'ring.enabled': true,
			...(textureSrc ? { 'ring.subject.texture': textureSrc } : {}),
		});
	}

	ui.notifications.info(`Applied token ring styling to ${tokens.length} token(s).`);
}

function chooseCalibrationLocation(): Promise<string | null> {
	return new Promise((resolve) => {
		let settled = false;
		const finish = (value: string | null) => {
			if (settled) return;
			settled = true;
			resolve(value);
		};

		const options = ALL_SIGIL_LOCATIONS
			.map(
				(location) =>
					`<option value="${location.id}">${location.name} (${location.category.replace(/-/g, ' ')})</option>`,
			)
			.join('');

		new Dialog(
			{
				title: 'Sigil Marker Calibration',
				content: `
					<form class="sigil-calibration-form">
						<p>Select a location, then click <strong>Start Calibration</strong>.</p>
						<p>After the dialog closes, click once on the Sigil map to capture coordinates.</p>
						<p>Press <strong>Escape</strong> to cancel click capture.</p>
						<div class="form-group">
							<label for="hh-sigil-location">Location</label>
							<select id="hh-sigil-location" name="location">${options}</select>
						</div>
					</form>
				`,
				buttons: {
					start: {
						icon: '<i class="fas fa-crosshairs"></i>',
						label: 'Start Calibration',
						callback: (html: HTMLElement | JQuery) => {
							const root = getDialogRoot(html);
							const select = root.querySelector<HTMLSelectElement>('#hh-sigil-location');
							finish(select?.value ?? null);
						},
					},
					cancel: {
						icon: '<i class="fas fa-times"></i>',
						label: 'Cancel',
						callback: () => finish(null),
					},
				},
				default: 'start',
				close: () => finish(null),
			},
			{
				width: 520,
				classes: ['harbinger-house'],
			},
		).render(true);
	});
}

function captureNextMapClick(): Promise<{ x: number; y: number } | null> {
	return new Promise((resolve) => {
		const stage = canvas.stage;
		const interactiveStage = stage as PIXI.Container & {
			eventMode?: string;
			on: (event: string, fn: (event: unknown) => void) => unknown;
			off: (event: string, fn: (event: unknown) => void) => unknown;
		};

		const previousEventMode = interactiveStage.eventMode;
		interactiveStage.eventMode = 'static';

		let settled = false;
		const finish = (coords: { x: number; y: number } | null): void => {
			if (settled) return;
			settled = true;
			interactiveStage.off('pointerdown', onPointerDown);
			window.removeEventListener('keydown', onKeyDown);
			if (previousEventMode !== undefined) {
				interactiveStage.eventMode = previousEventMode;
			}
			resolve(coords);
		};

		const onKeyDown = (event: KeyboardEvent): void => {
			if (event.key !== 'Escape') return;
			ui.notifications.info('Sigil calibration cancelled.');
			finish(null);
		};

		const onPointerDown = (event: unknown): void => {
			const pointer = event as PointerLikeEvent;
			const globalPoint = pointer.global;
			if (!globalPoint) {
				logWarn('Sigil calibration pointer event was missing global coordinates.');
				finish(null);
				return;
			}

			pointer.preventDefault?.();
			pointer.stopPropagation?.();

			const stageWithToLocal = stage as unknown as {
				toLocal: (point: { x: number; y: number }) => { x: number; y: number };
			};
			const localPoint = stageWithToLocal.toLocal(globalPoint);
			finish({
				x: Math.round(localPoint.x),
				y: Math.round(localPoint.y),
			});
		};

		interactiveStage.on('pointerdown', onPointerDown);
		window.addEventListener('keydown', onKeyDown);
	});
}

async function showCalibrationResult(location: SigilLocation, x: number, y: number): Promise<void> {
	const snippet = `id: '${location.id}',\n\tx: ${x},\n\ty: ${y},`;

	let copied = false;
	if (navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(snippet);
			copied = true;
		} catch (err) {
			logWarn('Unable to copy calibration snippet to clipboard.', err);
		}
	}

	new Dialog(
		{
			title: `Captured Coordinates: ${location.name}`,
			content: `
				<p><strong>${location.name}</strong> captured at <strong>x: ${x}</strong>, <strong>y: ${y}</strong>.</p>
				<p>Paste this snippet into <code>src/data/sigil-locations.ts</code>:</p>
				<textarea style="width: 100%; min-height: 120px; font-family: monospace;">${snippet}</textarea>
				<p>${copied ? 'Snippet copied to clipboard.' : 'Clipboard copy failed; snippet is ready above.'}</p>
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
			width: 560,
			classes: ['harbinger-house'],
		},
	).render(true);
}

async function calibrateSigilLocation(): Promise<void> {
	if (!game.user?.isGM) {
		ui.notifications.warn('Only a GM can calibrate Sigil coordinates.');
		return;
	}

	const scene = canvas.scene;
	if (!scene || !isSigilScene(scene)) {
		ui.notifications.warn('Open the Sigil scene before starting calibration.');
		return;
	}

	const locationId = await chooseCalibrationLocation();
	if (!locationId) return;

	const location = getLocationById(locationId);
	if (!location) {
		ui.notifications.error(`Unknown location ID: ${locationId}`);
		return;
	}

	ui.notifications.info(`Calibration active for ${location.name}. Click once on the map.`);
	const coordinates = await captureNextMapClick();
	if (!coordinates) return;

	const { x, y } = coordinates;
	log(`[Sigil Calibration] ${location.id} (${location.name}) -> x: ${x}, y: ${y}`);
	await showCalibrationResult(location, x, y);
}

export const MACROS: HarbingerHouseMacroAPI = {
	setLandingPage,
	toggleSceneLighting,
	toggleAmbientSounds,
	openImportDialog,
	applyTokenRingStyling,
	calibrateSigilLocation,
};

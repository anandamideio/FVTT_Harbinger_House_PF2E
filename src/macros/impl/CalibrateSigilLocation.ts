import { log, logWarn } from '../../config';
import { ALL_SIGIL_LOCATIONS, getLocationById, type SigilLocation } from '../../data/sigil-locations';
import { isSigilScene } from '../../sigil-map/sigil-map-state';
import { HarbingerMacro } from '../Macro';
import { copyToClipboard } from '../helpers/clipboard';

interface PointerLikeEvent {
	global?: {
		x: number;
		y: number;
	};
	stopPropagation?: () => void;
	preventDefault?: () => void;
}

function getDialogRoot(html: HTMLElement | JQuery): HTMLElement {
	return html instanceof HTMLElement ? html : ((html as unknown as HTMLElement[])[0] ?? document.body);
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

	const copied = await copyToClipboard(snippet, 'Unable to copy calibration snippet to clipboard.');

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

export class CalibrateSigilLocation extends HarbingerMacro {
	readonly name = 'calibrateSigilLocation' as const;
	readonly label = 'Calibrate Sigil Location';

	async run(): Promise<void> {
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
}

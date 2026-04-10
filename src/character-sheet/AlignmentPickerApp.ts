import { mount, unmount } from 'svelte';
import { localize } from '../config';
import AlignmentPickerDialog from './AlignmentPickerDialog.svelte';
import type { AlignmentId } from './alignment';

/**
 * Open the Alignment picker dialog.
 *
 * Renders a Planescape-themed 3×3 alignment grid as a Svelte component
 * inside a Foundry Dialog shell. Resolves to the selected AlignmentId
 * or `null` if the dialog was dismissed.
 */
export function openAlignmentPicker(
	currentAlignment: AlignmentId | '',
	actorName: string,
): Promise<AlignmentId | null> {
	return new Promise((resolve) => {
		let svelteInstance: ReturnType<typeof mount> | null = null;
		let resolved = false;

		function settle(value: AlignmentId | null) {
			if (resolved) return;
			resolved = true;

			if (svelteInstance) {
				unmount(svelteInstance);
				svelteInstance = null;
			}

			dialog.close();
			resolve(value);
		}

		const dialog = new Dialog(
			{
				title: localize('alignment.pickerTitle'),
				content: '<div class="harbinger-alignment-picker-mount"></div>',
				buttons: {},
				default: '',
				render: (html: HTMLElement | JQuery) => {
					const el =
						html instanceof HTMLElement ? html : (html as unknown as HTMLElement[])[0];
					const mountPoint = el?.querySelector?.('.harbinger-alignment-picker-mount') ?? el;

					if (mountPoint) {
						svelteInstance = mount(AlignmentPickerDialog, {
							target: mountPoint as HTMLElement,
							props: {
								currentAlignment,
								actorName,
								onSelect: (alignmentId: AlignmentId) => settle(alignmentId),
							},
						});
					}
				},
				close: () => {
					if (!resolved) {
						resolved = true;
						if (svelteInstance) {
							unmount(svelteInstance);
							svelteInstance = null;
						}
						resolve(null);
					}
				},
			},
			{
				classes: ['harbinger-house', 'harbinger-alignment-picker'],
				width: 480,
				height: 620,
				resizable: false,
				minimizable: false,
				id: 'harbinger-alignment-picker',
			},
		);

		dialog.render(true);
	});
}

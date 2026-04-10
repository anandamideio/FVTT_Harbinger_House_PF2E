import { mount, unmount } from 'svelte';
import { localize } from '../config';
import FactionPickerDialog from './FactionPickerDialog.svelte';

/**
 * Open the Sigil Faction picker dialog.
 *
 * Matches the PF2e deity picker UX: a small dialog with a search bar and
 * a scrollable list of factions. Resolves to the selected faction ID (empty
 * string = Unaffiliated), or `null` if the dialog was dismissed without a
 * selection.
 */
export function openFactionPicker(currentFaction: string): Promise<string | null> {
	return new Promise((resolve) => {
		let svelteInstance: ReturnType<typeof mount> | null = null;
		let resolved = false;

		function settle(value: string | null) {
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
				title: localize('faction.pickerTitle'),
				content: '<div class="harbinger-faction-picker-mount"></div>',
				buttons: {},
				default: '',
				render: (html: HTMLElement | JQuery) => {
					const el =
						html instanceof HTMLElement ? html : (html as unknown as HTMLElement[])[0];
					const mountPoint = el?.querySelector?.('.harbinger-faction-picker-mount') ?? el;

					if (mountPoint) {
						svelteInstance = mount(FactionPickerDialog, {
							target: mountPoint as HTMLElement,
							props: {
								currentFaction,
								onSelect: (factionId: string) => settle(factionId),
							},
						});
					}
				},
				close: () => {
					// Dismissed without selecting — clean up and resolve null
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
				classes: ['harbinger-house', 'sigil-faction-picker'],
				width: 500,
				height: 560,
				resizable: false,
				minimizable: false,
				id: 'sigil-faction-picker',
			},
		);

		dialog.render(true);
	});
}

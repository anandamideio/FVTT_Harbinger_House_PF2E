import type { Component } from 'svelte';
import FactionPickerDialog from './FactionPickerDialog.svelte';
import { DialogPickerApp, type DialogPickerConfig } from './DialogPickerApp';

/**
 * Faction picker — renders the Sigil faction grid inside a Foundry Dialog.
 *
 * Resolves to the selected faction id (empty string means "unaffiliated"),
 * or `null` if the dialog was dismissed.
 */
export class FactionPickerApp extends DialogPickerApp<string> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected readonly component: Component<any, any> = FactionPickerDialog;
	protected readonly config: DialogPickerConfig = {
		titleKey: 'faction.pickerTitle',
		dialogId: 'sigil-faction-picker',
		dialogClasses: ['harbinger-house', 'sigil-faction-picker'],
		mountClass: 'harbinger-faction-picker-mount',
		width: 500,
		height: 560,
	};

	constructor(private readonly currentFaction: string) {
		super();
	}

	protected buildProps(onSelect: (value: string) => void) {
		return {
			currentFaction: this.currentFaction,
			onSelect,
		};
	}
}

import type { Component } from 'svelte';
import type { AlignmentId } from '../alignment';
import AlignmentPickerDialog from './AlignmentPickerDialog.svelte';
import { DialogPickerApp, type DialogPickerConfig } from './DialogPickerApp';

/**
 * Alignment picker — renders a 3×3 alignment grid inside a Foundry Dialog.
 *
 * Resolves to the selected AlignmentId, or `null` if the dialog was dismissed.
 */
export class AlignmentPickerApp extends DialogPickerApp<AlignmentId> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected readonly component: Component<any, any> = AlignmentPickerDialog;
	protected readonly config: DialogPickerConfig = {
		titleKey: 'alignment.pickerTitle',
		dialogId: 'harbinger-alignment-picker',
		dialogClasses: ['harbinger-house', 'harbinger-alignment-picker'],
		mountClass: 'harbinger-alignment-picker-mount',
		width: 480,
		height: 620,
	};

	constructor(
		private readonly currentAlignment: AlignmentId | '',
		private readonly actorName: string,
	) {
		super();
	}

	protected buildProps(onSelect: (value: AlignmentId) => void) {
		return {
			currentAlignment: this.currentAlignment,
			actorName: this.actorName,
			onSelect,
		};
	}
}

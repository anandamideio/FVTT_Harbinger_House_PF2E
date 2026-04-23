import { mount, unmount, type Component } from 'svelte';
import { localize } from '../../config';

export interface DialogPickerConfig {
	/** Localization key for the dialog title. */
	titleKey: string;
	/** DOM id assigned to the Dialog. */
	dialogId: string;
	/** CSS classes applied to the Dialog's outer element. */
	dialogClasses: string[];
	/** Class name of the mount-point <div> rendered inside the dialog body. */
	mountClass: string;
	width: number;
	height: number;
}

/**
 * Abstract base for Foundry Dialogs that host a Svelte component.
 *
 * Encapsulates the mount/unmount/settle lifecycle shared by every "picker"
 * dialog in the module. Concrete subclasses declare the component, the Dialog
 * config, and how to build props (given a settle callback).
 */
export abstract class DialogPickerApp<TResult> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected abstract readonly component: Component<any, any>;
	protected abstract readonly config: DialogPickerConfig;
	protected abstract buildProps(
		onSelect: (value: TResult) => void,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Record<string, any>;

	open(): Promise<TResult | null> {
		return new Promise((resolve) => {
			let svelteInstance: ReturnType<typeof mount> | null = null;
			let resolved = false;

			const cleanup = () => {
				if (svelteInstance) {
					unmount(svelteInstance);
					svelteInstance = null;
				}
			};

			const settle = (value: TResult | null) => {
				if (resolved) return;
				resolved = true;
				cleanup();
				dialog.close();
				resolve(value);
			};

			const { titleKey, dialogId, dialogClasses, mountClass, width, height } = this.config;

			const dialog = new Dialog(
				{
					title: localize(titleKey),
					content: `<div class="${mountClass}"></div>`,
					buttons: {},
					default: '',
					render: (html: HTMLElement | JQuery) => {
						const el =
							html instanceof HTMLElement ? html : (html as unknown as HTMLElement[])[0];
						const mountPoint = el?.querySelector?.(`.${mountClass}`) ?? el;
						if (!mountPoint) return;

						svelteInstance = mount(this.component, {
							target: mountPoint as HTMLElement,
							props: this.buildProps((value) => settle(value)),
						});
					},
					close: () => {
						if (resolved) return;
						resolved = true;
						cleanup();
						resolve(null);
					},
				},
				{
					classes: dialogClasses,
					width,
					height,
					resizable: false,
					minimizable: false,
					id: dialogId,
				},
			);

			dialog.render(true);
		});
	}
}

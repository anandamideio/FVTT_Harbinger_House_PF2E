import { mount, unmount } from 'svelte';
import { MODULE_NAME } from '../config';
import DeleteContent from './components/DeleteContent.svelte';
import ImportContent from './components/ImportContent.svelte';
import WelcomeContent from './components/WelcomeContent.svelte';

function mountInDialog(
	title: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getProps: (dialog: DialogClass) => Record<string, any>,
	options: DialogOptions,
): void {
	let app: ReturnType<typeof mount> | undefined;

	const dialog = new Dialog(
		{
			title,
			content: '<div class="svelte-mount"></div>',
			buttons: {},
			render: (html: JQuery) => {
				const target = html.find('.svelte-mount')[0];
				if (target) {
					app = mount(component, {
						target,
						props: getProps(dialog),
					});
				}
			},
			close: () => {
				if (app) {
					unmount(app);
					app = undefined;
				}
			},
		},
		options,
	);

	dialog.render(true);
}

export function showWelcomeDialog(): void {
	mountInDialog(
		MODULE_NAME,
		WelcomeContent,
		(dialog) => ({
			onImport: () => {
				dialog.close();
				showImportDialog();
			},
			onClose: () => dialog.close(),
		}),
		{ width: 450, classes: ['harbinger-house-welcome'] },
	);
}

export function showImportDialog(): void {
	mountInDialog(
		`${MODULE_NAME} - Import`,
		ImportContent,
		(dialog) => ({
			onClose: () => dialog.close(),
			onDelete: () => {
				dialog.close();
				showDeleteConfirmDialog();
			},
		}),
		{ width: 500, height: 'auto', classes: ['harbinger-house-import'] },
	);
}

export function showDeleteConfirmDialog(): void {
	mountInDialog(
		`${MODULE_NAME} - Delete Content`,
		DeleteContent,
		(dialog) => ({
			onClose: () => dialog.close(),
		}),
		{ width: 400, classes: ['harbinger-house-delete'] },
	);
}

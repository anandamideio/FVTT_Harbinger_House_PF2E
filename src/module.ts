import { MODULE_ID } from './config';
import { harbingerHouseModule, openImporter } from './module/index';

Hooks.once('init', () => {
	harbingerHouseModule.init();
});

Hooks.once('ready', () => {
	void harbingerHouseModule.ready();
});

export { MODULE_ID, openImporter };

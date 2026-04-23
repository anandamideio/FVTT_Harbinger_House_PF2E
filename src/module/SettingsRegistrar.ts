import { registerSettings } from '../config';

export class SettingsRegistrar {
	register(): void {
		registerSettings();
	}
}

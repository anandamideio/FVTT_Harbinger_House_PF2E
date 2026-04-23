import { logWarn } from '../../config';

export async function copyToClipboard(text: string, warningMessage: string): Promise<boolean> {
	if (!navigator.clipboard?.writeText) {
		return false;
	}

	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		logWarn(warningMessage, err);
		return false;
	}
}

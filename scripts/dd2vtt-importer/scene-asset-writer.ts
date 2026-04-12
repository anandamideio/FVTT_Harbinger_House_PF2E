import fs from 'node:fs';
import path from 'node:path';

export class SceneAssetWriter {
	constructor(private readonly mapsDir: string) {}

	ensureMapsDir(): void {
		if (!fs.existsSync(this.mapsDir)) {
			fs.mkdirSync(this.mapsDir, { recursive: true });
		}
	}

	writeSceneImage(imageName: string, imageBuffer: Buffer): string {
		this.ensureMapsDir();
		const imagePath = path.resolve(this.mapsDir, imageName);
		fs.writeFileSync(imagePath, imageBuffer);
		return imagePath;
	}
}

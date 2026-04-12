import type {
	DD2VTTFile,
	DDLight,
	DDPoint,
	GeneratedScene,
	LightData,
	LightDefaults,
	SceneDefaults,
	SceneImportSpec,
	WallData,
	WallDefaults,
} from './types.ts';

function argbToHex(argb: string): string {
	const hex = argb.length === 8 ? argb.slice(2) : argb;
	return `#${hex}`;
}

function clamp01(value: number): number {
	if (Number.isNaN(value)) return 0.5;
	return Math.max(0, Math.min(1, value));
}

export class ScenePlaceableConverter {
	constructor(
		private readonly sceneDefaults: SceneDefaults,
		private readonly wallDefaults: WallDefaults,
		private readonly lightDefaults: LightDefaults,
	) {}

	buildGeneratedScene(spec: SceneImportSpec, data: DD2VTTFile): GeneratedScene {
		const ppg = data.resolution.pixels_per_grid;
		const width = data.resolution.map_size.x * ppg;
		const height = data.resolution.map_size.y * ppg;

		return {
			spec,
			width,
			height,
			gridSize: ppg,
			walls: this.convertWalls(data),
			lights: this.convertLights(data),
			darkness: spec.darkness ?? 0,
			globalLight: spec.globalLight ?? this.sceneDefaults.defaultGlobalLight,
			globalLightThreshold:
				spec.globalLightThreshold ?? this.sceneDefaults.defaultGlobalLightThreshold,
		};
	}

	convertWalls(data: DD2VTTFile): WallData[] {
		const ppg = data.resolution.pixels_per_grid;
		const walls: WallData[] = [];

		const addPolyline = (polyline: DDPoint[]) => {
			for (let i = 0; i < polyline.length - 1; i++) {
				const start = polyline[i];
				const end = polyline[i + 1];
				walls.push(
					this.makeWall(
						Math.round(start.x * ppg),
						Math.round(start.y * ppg),
						Math.round(end.x * ppg),
						Math.round(end.y * ppg),
						false,
					),
				);
			}
		};

		for (const polyline of data.line_of_sight ?? []) addPolyline(polyline);
		for (const polyline of data.objects_line_of_sight ?? []) addPolyline(polyline);

		for (const portal of data.portals ?? []) {
			const start = portal.bounds[0];
			const end = portal.bounds[1];
			walls.push(
				this.makeWall(
					Math.round(start.x * ppg),
					Math.round(start.y * ppg),
					Math.round(end.x * ppg),
					Math.round(end.y * ppg),
					true,
					portal.closed ? 0 : 1,
				),
			);
		}

		return walls;
	}

	convertLights(data: DD2VTTFile): LightData[] {
		const ppg = data.resolution.pixels_per_grid;
		return (data.lights ?? []).map((light) => this.convertLight(light, ppg));
	}

	private makeWall(
		ax: number,
		ay: number,
		bx: number,
		by: number,
		isDoor: boolean,
		doorState = 0,
	): WallData {
		const wall: WallData = {
			light: this.wallDefaults.light,
			sight: this.wallDefaults.sight,
			sound: this.wallDefaults.sound,
			move: this.wallDefaults.move,
			c: [ax, ay, bx, by],
			dir: 0,
			door: isDoor ? 1 : 0,
			ds: doorState,
			threshold: {
				light: null,
				sight: null,
				sound: null,
				attenuation: false,
			},
			animation: isDoor
				? {
						type: this.wallDefaults.doorType,
						texture: null,
						flip: false,
						double: false,
						direction: this.wallDefaults.doorDirection,
						duration: this.wallDefaults.doorDuration,
						strength: this.wallDefaults.doorStrength,
				  }
				: null,
			flags: {},
		};
		if (isDoor) {
			wall.doorSound = this.wallDefaults.doorSound;
		}
		return wall;
	}

	private convertLight(light: DDLight, ppg: number): LightData {
		const dimFeet = light.range * this.sceneDefaults.gridDistance;
		const alpha = clamp01(this.lightDefaults.alphaScale * (light.intensity ?? 1));

		return {
			x: Math.round(light.position.x * ppg),
			y: Math.round(light.position.y * ppg),
			rotation: 0,
			walls: true,
			vision: false,
			elevation: 0,
			config: {
				negative: false,
				priority: 0,
				alpha,
				angle: 360,
				bright: Math.round((dimFeet / 2) * 100) / 100,
				color: argbToHex(light.color),
				coloration: this.lightDefaults.coloration,
				dim: Math.round(dimFeet * 100) / 100,
				attenuation: this.lightDefaults.attenuation,
				luminosity: this.lightDefaults.luminosity,
				saturation: this.lightDefaults.saturation,
				contrast: this.lightDefaults.contrast,
				shadows: light.shadows ? 1 : 0,
				darkness: { min: 0, max: 1 },
				animation: {
					type: null,
					speed: this.lightDefaults.animationSpeed,
					intensity: this.lightDefaults.animationIntensity,
					reverse: false,
				},
			},
			hidden: false,
			flags: {},
		};
	}
}

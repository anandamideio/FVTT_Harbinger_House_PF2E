export interface DDPoint {
	x: number;
	y: number;
}

export interface DDPortal {
	position: DDPoint;
	bounds: [DDPoint, DDPoint];
	rotation: number;
	closed: boolean;
	freestanding: boolean;
}

export interface DDLight {
	position: DDPoint;
	range: number;
	intensity: number;
	color: string;
	shadows: boolean;
}

export interface DD2VTTFile {
	format: number;
	resolution: {
		map_origin: DDPoint;
		map_size: DDPoint;
		pixels_per_grid: number;
	};
	environment?: {
		ambient_light?: string;
		baked_lighting?: boolean;
	};
	line_of_sight: DDPoint[][];
	objects_line_of_sight?: DDPoint[][];
	portals: DDPortal[];
	lights: DDLight[];
	image: string;
}

export interface SceneEnvironmentValues {
	hue?: number;
	intensity?: number;
	luminosity?: number;
	saturation?: number;
	shadows?: number;
}

export interface SceneEnvironmentOverride {
	cycle?: boolean;
	base?: SceneEnvironmentValues;
	dark?: SceneEnvironmentValues;
}

export interface SceneImportSpec {
	input: string;
	imageName: string;
	sceneId: string;
	sceneName: string;
	navOrder: number;
	folder?: string;
	sort?: number;
	darkness?: number;
	globalLight?: boolean;
	globalLightThreshold?: number | null;
	environment?: SceneEnvironmentOverride;
}

export interface WallData {
	light: number;
	sight: number;
	sound: number;
	move: number;
	c: [number, number, number, number];
	dir: number;
	door: number;
	ds: number;
	threshold: {
		light: null;
		sight: null;
		sound: null;
		attenuation: boolean;
	};
	animation: null | {
		type: string;
		texture: null;
		flip: boolean;
		double: boolean;
		direction: number;
		duration: number;
		strength: number;
	};
	flags: Record<string, unknown>;
	doorSound?: string;
}

export interface LightData {
	x: number;
	y: number;
	rotation: number;
	walls: boolean;
	vision: boolean;
	elevation: number;
	config: {
		negative: boolean;
		priority: number;
		alpha: number;
		angle: number;
		bright: number;
		color: string;
		coloration: number;
		dim: number;
		attenuation: number;
		luminosity: number;
		saturation: number;
		contrast: number;
		shadows: number;
		darkness: {
			min: number;
			max: number;
		};
		animation: {
			type: null;
			speed: number;
			intensity: number;
			reverse: boolean;
		};
	};
	hidden: boolean;
	flags: Record<string, unknown>;
}

export interface GeneratedScene {
	spec: SceneImportSpec;
	width: number;
	height: number;
	gridSize: number;
	walls: WallData[];
	lights: LightData[];
	darkness: number;
	globalLight: boolean;
	globalLightThreshold: number | null;
}

export interface SceneDefaults {
	gridDistance: number;
	defaultFolder: string;
	defaultSort: number;
	defaultGlobalLight: boolean;
	defaultGlobalLightThreshold: number | null;
}

export interface WallDefaults {
	light: number;
	sight: number;
	sound: number;
	move: number;
	doorType: string;
	doorDirection: number;
	doorDuration: number;
	doorStrength: number;
	doorSound: string;
}

export interface LightDefaults {
	alphaScale: number;
	attenuation: number;
	luminosity: number;
	coloration: number;
	saturation: number;
	contrast: number;
	animationSpeed: number;
	animationIntensity: number;
}

export interface DD2VTTImporterConfig {
	paths: {
		repoRoot: string;
		mapsDir: string;
		outputFile: string;
		modulePrefix: string;
	};
	defaults: {
		scene: SceneDefaults;
		wall: WallDefaults;
		light: LightDefaults;
	};
	imports: SceneImportSpec[];
}

export interface ImporterLogger {
	info: (message: string) => void;
	warn: (message: string) => void;
	error: (message: string) => void;
}

export interface ImportSceneResult {
	scene: GeneratedScene | null;
	reason?: 'missing-input';
	resolvedInput: string;
}

export interface DD2VTTImportReport {
	totalImports: number;
	importedCount: number;
	skippedCount: number;
	skippedInputs: string[];
	outputFile: string;
	wroteModule: boolean;
}

export interface DD2VTTImportPipelineOptions {
	config: DD2VTTImporterConfig;
	dryRun: boolean;
	allowMissingInputs: boolean;
	logger: ImporterLogger;
}

export function defineDD2VTTImporterConfig(
	config: DD2VTTImporterConfig,
): DD2VTTImporterConfig {
	return config;
}

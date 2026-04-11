/**
 * Import one or more .dd2vtt (Dungeondraft Universal VTT) files into the project.
 *
 * For each input file this script:
 *   1. Decodes the embedded base64 PNG and writes it to `src/assets/maps/`.
 *   2. Converts walls (`line_of_sight`), doors (`portals`) and point lights
 *      to FoundryVTT scene placeable data.
 *   3. Collects the resulting scenes and writes them to
 *      `src/data/scenes-rooftop-chase.ts` so they can be imported from
 *      `scenes.ts` and picked up by the pack build pipeline.
 *
 * Usage:
 *   pnpm tsx scripts/import-dd2vtt.ts
 *
 * The set of files to import is configured in the `IMPORTS` constant at the
 * bottom of this file. Re-run the script to regenerate outputs after updating
 * that list or the source `.dd2vtt` files.
 */

import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Types describing the Universal VTT format (dd2vtt)
// ---------------------------------------------------------------------------

interface DDPoint {
	x: number;
	y: number;
}

interface DDPortal {
	position: DDPoint;
	bounds: [DDPoint, DDPoint];
	rotation: number;
	closed: boolean;
	freestanding: boolean;
}

interface DDLight {
	position: DDPoint;
	range: number;
	intensity: number;
	color: string; // AARRGGBB
	shadows: boolean;
}

interface DD2VTTFile {
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

// ---------------------------------------------------------------------------
// Import specification — what to import and where to put it
// ---------------------------------------------------------------------------

interface ImportSpec {
	/** Absolute path (or path relative to repo root) of the .dd2vtt file. */
	input: string;
	/** Output PNG filename inside `src/assets/maps/`. */
	imageName: string;
	/** Unique scene id used by the build pipeline. */
	sceneId: string;
	/** Display name shown in Foundry. */
	sceneName: string;
	/** Navigation order inside the folder. */
	navOrder: number;
	/** Folder name in the Scenes directory. Defaults to `Chapter 1`. */
	folder?: string;
	/** Sort index inside the folder. */
	sort?: number;
	/** Scene darkness level (0 = day, 1 = pitch black). */
	darkness?: number;
	/** Whether to enable the scene's global ambient illumination. Defaults to `true` so the base map stays visible. */
	globalLight?: boolean;
	/** Darkness threshold above which global light cuts out. Defaults to `0.749` (matches DD-Import night scenes). */
	globalLightThreshold?: number | null;
	/**
	 * Partial override for the Foundry v13 environment block. The dd2vtt format
	 * doesn't carry hue/luminosity data (only a flat `ambient_light` color), so
	 * nighttime tint has to be configured here explicitly. Matches
	 * `HarbingerScene.environment`.
	 */
	environment?: {
		cycle?: boolean;
		base?: {
			hue?: number;
			intensity?: number;
			luminosity?: number;
			saturation?: number;
			shadows?: number;
		};
		dark?: {
			hue?: number;
			intensity?: number;
			luminosity?: number;
			saturation?: number;
			shadows?: number;
		};
	};
}

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const MAPS_DIR = path.resolve(REPO_ROOT, 'src/assets/maps');
const MODULE_PREFIX = 'modules/harbinger-house-pf2e/dist/assets/maps';

/** Convert an AARRGGBB string (e.g. `ffeccd8b`) to a CSS `#rrggbb` color. */
function argbToHex(argb: string): string {
	const hex = argb.length === 8 ? argb.slice(2) : argb;
	return `#${hex}`;
}

/** Clamp a number to [0, 1]. */
function clamp01(n: number): number {
	if (Number.isNaN(n)) return 0.5;
	return Math.max(0, Math.min(1, n));
}

type WallData = {
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
};

function makeWall(
	ax: number,
	ay: number,
	bx: number,
	by: number,
	isDoor: boolean,
	doorState = 0,
): WallData {
	const wall: WallData = {
		light: 20,
		sight: 20,
		sound: 20,
		move: 20,
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
					type: 'swing',
					texture: null,
					flip: false,
					double: false,
					direction: 1,
					duration: 750,
					strength: 1,
				}
			: null,
		flags: {},
	};
	if (isDoor) wall.doorSound = '';
	return wall;
}

function convertLight(light: DDLight, ppg: number, gridDistance: number) {
	const dimFeet = light.range * gridDistance;
	// DD-Import maps dd2vtt `intensity` to the Foundry light's `alpha` via
	// `0.05 * intensity` (not to `luminosity`). `luminosity` stays at its 0.5
	// default so the light remains additive rather than emissive-only.
	const alpha = clamp01(0.05 * (light.intensity ?? 1));
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
			coloration: 1,
			dim: Math.round(dimFeet * 100) / 100,
			attenuation: 0.5,
			luminosity: 0.5,
			saturation: 0,
			contrast: 0,
			shadows: light.shadows ? 1 : 0,
			darkness: { min: 0, max: 1 },
			animation: {
				type: null,
				speed: 5,
				intensity: 5,
				reverse: false,
			},
		},
		hidden: false,
		flags: {},
	};
}

// ---------------------------------------------------------------------------
// Main conversion routine
// ---------------------------------------------------------------------------

interface GeneratedScene {
	spec: ImportSpec;
	width: number;
	height: number;
	gridSize: number;
	walls: WallData[];
	lights: ReturnType<typeof convertLight>[];
	darkness: number;
	globalLight: boolean;
	globalLightThreshold: number | null;
}

function importScene(spec: ImportSpec): GeneratedScene | null {
	const inputPath = path.isAbsolute(spec.input)
		? spec.input
		: path.resolve(REPO_ROOT, spec.input);

	if (!fs.existsSync(inputPath)) {
		console.warn(`  SKIP ${path.basename(inputPath)} (source file missing)`);
		return null;
	}

	console.log(`  Reading ${path.basename(inputPath)}`);
	const raw = fs.readFileSync(inputPath, 'utf8');
	const data = JSON.parse(raw) as DD2VTTFile;

	const ppg = data.resolution.pixels_per_grid;
	const width = data.resolution.map_size.x * ppg;
	const height = data.resolution.map_size.y * ppg;

	// 1. Extract & save the PNG
	if (!fs.existsSync(MAPS_DIR)) fs.mkdirSync(MAPS_DIR, { recursive: true });
	const imgPath = path.resolve(MAPS_DIR, spec.imageName);
	const imgBuffer = Buffer.from(data.image, 'base64');
	fs.writeFileSync(imgPath, imgBuffer);
	console.log(`    wrote image -> src/assets/maps/${spec.imageName} (${imgBuffer.length} bytes)`);

	// 2. Convert walls (line_of_sight polylines)
	const walls: WallData[] = [];
	const addPolyline = (poly: DDPoint[]) => {
		for (let i = 0; i < poly.length - 1; i++) {
			const a = poly[i];
			const b = poly[i + 1];
			walls.push(
				makeWall(
					Math.round(a.x * ppg),
					Math.round(a.y * ppg),
					Math.round(b.x * ppg),
					Math.round(b.y * ppg),
					false,
				),
			);
		}
	};
	for (const poly of data.line_of_sight ?? []) addPolyline(poly);
	for (const poly of data.objects_line_of_sight ?? []) addPolyline(poly);

	// 3. Convert portals to door walls
	for (const p of data.portals ?? []) {
		const a = p.bounds[0];
		const b = p.bounds[1];
		walls.push(
			makeWall(
				Math.round(a.x * ppg),
				Math.round(a.y * ppg),
				Math.round(b.x * ppg),
				Math.round(b.y * ppg),
				true,
				p.closed ? 0 : 1,
			),
		);
	}

	// 4. Convert lights
	const lights = (data.lights ?? []).map((l) => convertLight(l, ppg, 5));

	console.log(
		`    ${walls.length} walls (${(data.line_of_sight ?? []).length} polylines, ${
			(data.portals ?? []).length
		} doors), ${lights.length} lights`,
	);

	return {
		spec,
		width,
		height,
		gridSize: ppg,
		walls,
		lights,
		darkness: spec.darkness ?? 0,
		globalLight: spec.globalLight ?? true,
		globalLightThreshold: spec.globalLightThreshold ?? 0.749,
	};
}

// ---------------------------------------------------------------------------
// Emit generated scenes as TypeScript
// ---------------------------------------------------------------------------

function renderScene(gen: GeneratedScene): string {
	const { spec, width, height, gridSize, walls, lights, darkness, globalLight, globalLightThreshold } = gen;
	const imgRef = `${MODULE_PREFIX}/${spec.imageName}`;
	const body: string[] = [];
	body.push('\t{');
	body.push(`\t\tid: ${JSON.stringify(spec.sceneId)},`);
	body.push(`\t\tname: ${JSON.stringify(spec.sceneName)},`);
	body.push(`\t\timg: ${JSON.stringify(imgRef)},`);
	body.push('\t\tbackground: {');
	body.push(`\t\t\tsrc: ${JSON.stringify(imgRef)},`);
	body.push('\t\t},');
	body.push('\t\tgrid: {');
	body.push('\t\t\ttype: 1,');
	body.push(`\t\t\tsize: ${gridSize},`);
	body.push('\t\t\tdistance: 5,');
	body.push("\t\t\tunits: 'ft',");
	body.push('\t\t},');
	body.push('\t\tinitial: {');
	body.push('\t\t\tx: null,');
	body.push('\t\t\ty: null,');
	body.push('\t\t\tscale: 1,');
	body.push('\t\t},');
	body.push(`\t\twidth: ${width},`);
	body.push(`\t\theight: ${height},`);
	body.push('\t\tnavigation: true,');
	body.push(`\t\tnavOrder: ${spec.navOrder},`);
	body.push(`\t\tfolder: ${JSON.stringify(spec.folder ?? 'Chapter 1')},`);
	body.push(`\t\tsort: ${spec.sort ?? 0},`);
	if (darkness > 0) body.push(`\t\tdarkness: ${darkness},`);
	body.push(`\t\tglobalLight: ${globalLight},`);
	if (globalLightThreshold != null)
		body.push(`\t\tglobalLightThreshold: ${globalLightThreshold},`);
	if (spec.environment) {
		const env = JSON.stringify(spec.environment, null, '\t').replace(/\n/g, '\n\t\t');
		body.push(`\t\tenvironment: ${env},`);
	}
	body.push(`\t\twalls: ${JSON.stringify(walls, null, '\t').replace(/\n/g, '\n\t\t')},`);
	body.push(`\t\tlights: ${JSON.stringify(lights, null, '\t').replace(/\n/g, '\n\t\t')},`);
	body.push('\t},');
	return body.join('\n');
}

function writeGeneratedModule(outputPath: string, scenes: GeneratedScene[]) {
	const header = [
		'/**',
		' * AUTO-GENERATED by scripts/import-dd2vtt.ts',
		' *',
		' * Scenes imported from Dungeondraft Universal VTT (.dd2vtt) exports.',
		' * Edit the source .dd2vtt files and re-run the importer instead of',
		' * hand-editing this file.',
		' */',
		'',
		"import type { HarbingerScene } from './scenes';",
		'',
		'export const IMPORTED_DD2VTT_SCENES: HarbingerScene[] = [',
	].join('\n');

	const body = scenes.map(renderScene).join('\n');
	const footer = '\n];\n';

	fs.writeFileSync(outputPath, `${header}\n${body}${footer}`);
	console.log(`  wrote ${path.relative(REPO_ROOT, outputPath)}`);
}

// ---------------------------------------------------------------------------
// Configuration — add more entries here to import additional .dd2vtt files
// ---------------------------------------------------------------------------

const DD_SOURCE_DIR =
	'/home/navi/Downloads/RooftopChase_05_SummerAutumn_FoundryVTT/FoundryVTT';

const IMPORTS: ImportSpec[] = [
	{
		input: path.join(DD_SOURCE_DIR, 'RooftopChase_05_SummerAutumn_120x30_Day_FVTT.dd2vtt'),
		imageName: 'Rooftop Chase - Day.png',
		sceneId: 'scene-rooftop-chase-day',
		sceneName: 'Rooftop Chase (Day)',
		navOrder: 10,
		folder: 'Chapter 1',
		sort: 300,
		darkness: 0,
	},
	{
		input: path.join(DD_SOURCE_DIR, 'RooftopChase_05_SummerAutumn_120x30_Night_FVTT.dd2vtt'),
		imageName: 'Rooftop Chase - Night.png',
		sceneId: 'scene-rooftop-chase-night',
		sceneName: 'Rooftop Chase (Night)',
		navOrder: 11,
		folder: 'Chapter 1',
		sort: 310,
		darkness: 0.6,
		globalLight: true,
		globalLightThreshold: 0.749,
		// Night-tint preset: cold indigo cast during the dark half of the cycle.
		// The dd2vtt format only gives us a flat ambient color, so these values
		// are a hand-tuned preset rather than something we can read from the file.
		environment: {
			cycle: true,
			dark: {
				hue: 0.7138888888888889,
				luminosity: -0.25,
			},
		},
	},
];

const OUTPUT_FILE = path.resolve(REPO_ROOT, 'src/data/scenes-imported.ts');

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function main() {
	console.log('Importing .dd2vtt files:');
	const generated = IMPORTS.map(importScene).filter((g): g is GeneratedScene => g !== null);
	if (generated.length === 0) {
		console.warn('No .dd2vtt files were imported — leaving existing output untouched.');
		return;
	}
	writeGeneratedModule(OUTPUT_FILE, generated);
	console.log('Done.');
	console.log('');
	console.log('Next steps:');
	console.log("  - Import IMPORTED_DD2VTT_SCENES from './scenes-imported' in src/data/scenes.ts");
	console.log('  - Spread it into ALL_SCENES');
	console.log('  - Run `pnpm build:packs` to rebuild compendium packs');
}

main();

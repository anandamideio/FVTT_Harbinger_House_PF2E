import path from 'node:path';
import { defineDD2VTTImporterConfig } from './dd2vtt-importer/types';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

const DD_SOURCE_DIR =
	process.env.DD2VTT_SOURCE_DIR ??
	'/home/navi/Downloads/RooftopChase_05_SummerAutumn_FoundryVTT/FoundryVTT';

export default defineDD2VTTImporterConfig({
	paths: {
		repoRoot: REPO_ROOT,
		mapsDir: path.resolve(REPO_ROOT, 'src/assets/maps'),
			 outputFile: path.resolve(REPO_ROOT, 'src/data/content/scenes/scenes-imported.ts'),
		modulePrefix: 'modules/harbinger-house-pf2e/dist/assets/maps',
	},
	defaults: {
		scene: {
			gridDistance: 5,
			defaultFolder: 'Chapter 1',
			defaultSort: 0,
			defaultGlobalLight: true,
			defaultGlobalLightThreshold: 0.749,
		},
		wall: {
			light: 20,
			sight: 20,
			sound: 20,
			move: 20,
			doorType: 'swing',
			doorDirection: 1,
			doorDuration: 750,
			doorStrength: 1,
			doorSound: '',
		},
		light: {
			alphaScale: 0.05,
			attenuation: 0.5,
			luminosity: 0.5,
			coloration: 1,
			saturation: 0,
			contrast: 0,
			animationSpeed: 5,
			animationIntensity: 5,
		},
	},
	imports: [
		{
			input: path.join(DD_SOURCE_DIR, 'RooftopChase_05_SummerAutumn_120x30_Day_FVTT.dd2vtt'),
			imageName: 'Rooftop Chase - Day.webp',
			sceneId: 'scene-rooftop-chase-day',
			sceneName: 'Rooftop Chase (Day)',
			navOrder: 10,
			folder: 'Chapter 1',
			sort: 300,
			darkness: 0,
		},
		{
			input: path.join(DD_SOURCE_DIR, 'RooftopChase_05_SummerAutumn_120x30_Night_FVTT.dd2vtt'),
			imageName: 'Rooftop Chase - Night.webp',
			sceneId: 'scene-rooftop-chase-night',
			sceneName: 'Rooftop Chase (Night)',
			navOrder: 11,
			folder: 'Chapter 1',
			sort: 310,
			darkness: 0.6,
			globalLight: true,
			globalLightThreshold: 0.749,
			environment: {
				cycle: true,
				dark: {
					hue: 0.7138888888888889,
					luminosity: -0.25,
				},
			},
		},
	],
});

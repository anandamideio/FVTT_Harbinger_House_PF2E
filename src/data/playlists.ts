import { MODULE_ID } from '../config';

export interface HarbingerPlaylistSound {
	id: string;
	name: string;
	path: string;
	repeat?: boolean;
	channel?: 'music' | 'environment' | 'interface';
	volume?: number;
	description?: string;
}

export interface HarbingerPlaylist {
	id: string;
	name: string;
	description?: string;
	mode?: -1 | 0 | 1 | 2 | 3;
	channel?: 'music' | 'environment' | 'interface';
	fade?: number;
	sounds: HarbingerPlaylistSound[];
}

const SOUND_ROOT = `modules/${MODULE_ID}/dist/assets/sounds`;

/**
 * Playlists mirror the folder layout under `src/assets/sounds/`.
 * The GM can re-organize or wire them into scenes after import.
 */
export const ALL_PLAYLISTS: HarbingerPlaylist[] = [
	{
		id: 'playlist-ivan-duch',
		name: 'Ivan Duch - Loops',
		description: 'Looping battle and ambient themes by Ivan Duch.',
		mode: 1,
		channel: 'music',
		fade: 2000,
		sounds: [
			{
				id: 'ivan-duch-skeleton-battle',
				name: 'The Skeleton Battle',
				path: `${SOUND_ROOT}/ivan-duch/the-skeleton-battle-loop.ogg`,
				repeat: true,
			},
			{
				id: 'ivan-duch-void-dragon',
				name: 'The Void Dragon',
				path: `${SOUND_ROOT}/ivan-duch/the-void-dragon-loop.ogg`,
				repeat: true,
			},
			{
				id: 'ivan-duch-crush-enemies',
				name: 'To Crush Your Enemies',
				path: `${SOUND_ROOT}/ivan-duch/to-crush-your-enemies-loop.ogg`,
				repeat: true,
			},
			{
				id: 'ivan-duch-town-night',
				name: 'Town Night Ambiance',
				path: `${SOUND_ROOT}/ivan-duch/town-night-ambiance.ogg`,
				repeat: true,
				channel: 'environment',
			},
			{
				id: 'ivan-duch-troubles',
				name: "Trouble's Theme",
				path: `${SOUND_ROOT}/ivan-duch/troubles-theme-loop.ogg`,
				repeat: true,
			},
		],
	},
	{
		id: 'playlist-michael-ghelfi',
		name: 'Michael Ghelfi - Ambiences',
		description: 'Scene ambiences by Michael Ghelfi.',
		mode: 0,
		channel: 'environment',
		fade: 3000,
		sounds: [
			{
				id: 'ghelfi-darkest-forest',
				name: 'Darkest Forest',
				path: `${SOUND_ROOT}/michael-ghelfi/DarkestForest.ogg`,
				repeat: true,
			},
			{
				id: 'ghelfi-dimension-gate',
				name: 'Dimension Gate',
				path: `${SOUND_ROOT}/michael-ghelfi/DimensionGate.ogg`,
				repeat: true,
			},
			{
				id: 'ghelfi-hall-of-nightmares',
				name: 'Hall of Nightmares',
				path: `${SOUND_ROOT}/michael-ghelfi/HallofNightmares.ogg`,
				repeat: true,
			},
			{
				id: 'ghelfi-medieval-city',
				name: 'Medieval City',
				path: `${SOUND_ROOT}/michael-ghelfi/MedievalCity.ogg`,
				repeat: true,
			},
			{
				id: 'ghelfi-village-marketplace',
				name: 'Village Marketplace',
				path: `${SOUND_ROOT}/michael-ghelfi/VillageMarketplace.ogg`,
				repeat: true,
			},
		],
	},
	{
		id: 'playlist-tabletop-rpg-music',
		name: 'Tabletop RPG Music',
		description: 'Tracks from Tabletop RPG Music.',
		mode: 0,
		channel: 'music',
		fade: 2000,
		sounds: [
			{
				id: 'trm-secret-steps',
				name: 'Secret Steps',
				path: `${SOUND_ROOT}/tabletop-rpg-music/SecretSteps.mp3`,
				repeat: true,
			},
		],
	},
	{
		id: 'playlist-sfx',
		name: 'Harbinger House SFX',
		description: 'One-shot sound effects and stingers.',
		mode: 3,
		channel: 'interface',
		sounds: [
			{
				id: 'sfx-magic-reveal',
				name: 'Magic Reveal',
				path: `${SOUND_ROOT}/752275__ienba__magic-reveal.wav`,
				repeat: false,
			},
		],
	},
];

export function getPlaylistById(id: string): HarbingerPlaylist | undefined {
	return ALL_PLAYLISTS.find((p) => p.id === id);
}

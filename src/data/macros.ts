import { MODULE_ID } from '../config';

export interface HarbingerMacro {
	id: string;
	name: string;
	type: 'script';
	command: string;
	img: string;
}

export const ALL_MACROS: HarbingerMacro[] = [
	{
		id: 'set-landing-page',
		name: 'Set Landing Page',
		type: 'script',
		command: `// Show the Harbinger House adventure journal to all connected players
const MODULE_ID = '${MODULE_ID}';
const journal = game.journal?.find(j => j.flags?.[MODULE_ID]?.imported === true);
if (journal) {
  journal.sheet.render(true, { sharedWithPlayers: true });
  ui.notifications.info('Displaying Harbinger House journal to all players.');
} else {
  ui.notifications.warn('No Harbinger House journal found. Please import journals first.');
}`,
		img: 'icons/svg/book.svg',
	},
	{
		id: 'toggle-scene-lighting',
		name: 'Toggle Scene Lighting',
		type: 'script',
		command: `// Toggle global illumination on the active scene
const scene = canvas.scene;
if (!scene) {
  ui.notifications.warn('No active scene.');
} else {
  const newState = !scene.globalLight;
  await scene.update({ globalLight: newState });
  ui.notifications.info(\`Global illumination \${newState ? 'enabled' : 'disabled'}.\`);
}`,
		img: 'icons/svg/light.svg',
	},
	{
		id: 'toggle-ambient-sounds',
		name: 'Toggle Ambient Sounds',
		type: 'script',
		command: `// Toggle all ambient sounds on the active scene
const scene = canvas.scene;
if (!scene) {
  ui.notifications.warn('No active scene.');
} else {
  const sounds = scene.sounds.contents;
  if (sounds.length === 0) {
    ui.notifications.warn('No ambient sounds on this scene.');
  } else {
    const updates = sounds.map(s => ({ _id: s.id, hidden: !s.hidden }));
    await scene.updateEmbeddedDocuments('AmbientSound', updates);
    ui.notifications.info(\`Toggled \${sounds.length} ambient sound(s).\`);
  }
}`,
		img: 'icons/svg/sound.svg',
	},
	{
		id: 'token-ring-styling',
		name: 'Token Ring Styling',
		type: 'script',
		command: `// Apply PF2e token ring styling to selected tokens
const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn('No tokens selected. Please select one or more tokens first.');
} else {
  for (const token of tokens) {
    await token.document.update({
      'ring.enabled': true,
      'ring.subject.texture': token.document.texture.src,
    });
  }
  ui.notifications.info(\`Applied token ring styling to \${tokens.length} token(s).\`);
}`,
		img: 'icons/svg/target.svg',
	},
];

export function getMacroById(id: string): HarbingerMacro | undefined {
	return ALL_MACROS.find((m) => m.id === id);
}

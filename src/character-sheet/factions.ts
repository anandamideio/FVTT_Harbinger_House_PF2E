export interface SigilFaction {
	id: string;
	name: string;
	image: string;
}

const FACTION_IMG = 'modules/harbinger-house-pf2e/dist/assets/icons/factions';

export const SIGIL_FACTIONS: SigilFaction[] = [
	{ id: 'athar', name: 'Athar', image: `${FACTION_IMG}/athar.png` },
	{ id: 'believers', name: 'Believers of the Source', image: `${FACTION_IMG}/believers_of_the_source.png` },
	{ id: 'bleak-cabal', name: 'Bleak Cabal', image: `${FACTION_IMG}/bleak_cabal.png` },
	{ id: 'doomguard', name: 'Doomguard', image: `${FACTION_IMG}/doomguard.png` },
	{ id: 'dustmen', name: 'Dustmen', image: `${FACTION_IMG}/FactionDustmen2e.webp` },
	{ id: 'fated', name: 'Fated', image: `${FACTION_IMG}/FactionFated2e.webp` },
	{ id: 'fraternity-of-order', name: 'Fraternity of Order', image: `${FACTION_IMG}/the_fraternity_of_order.png` },
	{ id: 'free-league', name: 'Free League', image: `${FACTION_IMG}/FactionFreeLeague2e.webp` },
	{ id: 'harmonium', name: 'Harmonium', image: `${FACTION_IMG}/FactionHarmonium2e.webp` },
	{ id: 'mercykillers', name: 'Mercykillers', image: `${FACTION_IMG}/the_mercykillers.png` },
	{ id: 'revolutionary-league', name: 'Revolutionary League', image: `${FACTION_IMG}/the_revolutionary_league.png` },
	{ id: 'sign-of-one', name: 'Sign of One', image: `${FACTION_IMG}/the_sign_of_one.png` },
	{ id: 'society-of-sensation', name: 'Society of Sensation', image: `${FACTION_IMG}/the_society_of_sensation.png` },
	{ id: 'transcendent-order', name: 'Transcendent Order', image: `${FACTION_IMG}/the_transcendent_order.png` },
	{ id: 'xaositects', name: 'Xaositects', image: `${FACTION_IMG}/xaositects.png` },
];

export const FACTION_FLAG = 'sigilFaction';

export function getSigilFactionName(id: string): string {
	return SIGIL_FACTIONS.find((faction) => faction.id === id)?.name ?? '';
}

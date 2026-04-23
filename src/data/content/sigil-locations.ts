// ============================================================================
// Types
// ============================================================================

export type RevealState = 'hidden' | 'discovered' | 'investigated';

export type LocationCategory = 'murder-site' | 'faction-hq' | 'shop' | 'landmark' | 'encounter' | 'hideout';

export interface LocationClue {
	/** Unique ID for this clue */
	id: string;
	/** Clue text shown to players */
	text: string;
	/** If true, this is an optional/bonus clue with a checkbox */
	optional: boolean;
	/** Hint for the GM about how players learn this */
	gmNote?: string;
}

export interface SigilLocation {
	/** Unique location ID */
	id: string;
	/** Display name */
	name: string;
	/** Category for icon styling */
	category: LocationCategory;
	/** Pixel coordinates on the Sigil map image (6400x4400) */
	x: number;
	y: number;
	/** Short flavor text shown on discover */
	description: string;
	/** Clues available at this location */
	clues: LocationClue[];
	/** ID of the linked journal entry (if any) */
	journalId?: string;
	/** Adventure chapter this location is relevant to */
	chapter: 1 | 2 | 3;
	/** Murder victim name (for murder sites) */
	victim?: string;
	/** Murder order number, 1-6 for the pre-adventure kills */
	murderOrder?: number;
}

// ============================================================================
// Murder Sites (Chapter 1)
// ============================================================================

const MURDER_SITES: SigilLocation[] = [
	{
		id: 'murder-hovel-blood-boil',
		name: 'The Hovel on Blood Boil',
		category: 'murder-site',
		x: 3264,
		y: 2447,
		description: 'A squalid dwelling in the Hive where Old Favur met his end. The first of six ritual murders.',
		chapter: 1,
		victim: 'Old Favur',
		murderOrder: 1,
		clues: [
			{
				id: 'blood-boil-message',
				text: 'A bloody message scrawled on the wall read: "Now it begins."',
				optional: false,
			},
			{
				id: 'blood-boil-components',
				text: 'Jammed halfway into a crack in the wall was a singed bronze disc and a partially disintegrated iron rod.',
				gmNote: 'Spell components for the Chaos spell',
				optional: true,
			},
			{
				id: 'blood-boil-eltiva',
				text: 'Eltiva, the housekeeper, discovered Old Favur\'s body.',
				optional: true,
				gmNote: 'Eltiva is terrified but did manage to see the message on the wall before it was removed',
			},
		],
	},
	{
		id: 'murder-bunkhouse-powers-row',
		name: 'The Bunkhouse on Powers Row',
		category: 'murder-site',
		x: 4925,
		y: 2095,
		description: 'An Athar bunkhouse where the bariaur Vienna was found dead in her straw-filled sleeping stall.',
		chapter: 1,
		victim: 'Vienna',
		murderOrder: 2,
		clues: [
			{
				id: 'powers-row-pearl',
				text: 'We found black pearl dust scattered under the straw near the body.',
				optional: true,
			},
			{
				id: 'powers-row-feather',
				text: 'We found a vrock feather stained with blood hidden in the bedding.',
				optional: true,
			},
			{
				id: 'powers-row-kuarri',
				text: 'Kuarri, a fellow resident, found the body.',
				optional: true,
				gmNote: 'Kuarri is a bariaur who was close to Vienna and can describe the scene.',
			},
			{
				id: 'powers-row-munrot',
				text: 'The bubber Munrot gave us false testimony about the murder.',
				optional: true,
				gmNote: 'Munrot is lying -- a DC 20 Perception or Sense Motive check reveals inconsistencies.',
			},
		],
	},
	{
		id: 'murder-ascension',
		name: 'The Ascension Drinking Hall',
		category: 'murder-site',
		x: 3815,
		y: 1829,
		description: 'A rowdy Godsmen drinking hall where the tiefling Lini was killed in plain sight.',
		chapter: 1,
		victim: 'Lini',
		murderOrder: 3,
		clues: [
			{
				id: 'ascension-nutshells',
				text: 'Julius of the Ninth Test (the owner) remember finding three nutshells beneath the smashed table where they found Lini.',
				optional: true,
			},
			{
				id: 'ascension-urchend',
				text: 'Urchend, an unhomed eyewitness, saw the killing: describes a wild man with fiery eyes, grabbing the victim with a bright flash and the stabbing here, whereupon a bright red light slid up his sword and into him.',
				optional: false,
			}
		],
	},
	{
		id: 'murder-city-court',
		name: 'City Court Library',
		category: 'murder-site',
		x: 1448,
		y: 2013,
		description: 'The Fraternity of Order\'s library where Fassa the Guvner was slain, staining the scrolls he was studying.',
		chapter: 1,
		victim: 'Fassa',
		murderOrder: 4,
		clues: [
			{
				id: 'city-court-dabus',
				text: 'Unfortunately, by the time we arrived a dabus was obsessively cleaning the murder scene...',
				optional: true,
			},
			{
				id: 'city-court-book',
				text: 'The book "Powers and Demipowers" had fresh bloodstains on the chapter about Divine Ascension.',
				optional: true,
			},
			{
				id: 'city-court-hashkar',
				text: 'Factol Hashkar of the Fraternity of Order was present and deeply troubled by the murder in his jurisdiction.',
				optional: true,
				gmNote: 'Hashkar can provide context about Fassa and the Fraternity\'s resources for investigation.',
			},
		],
	},
	{
		id: 'murder-harmonium-street',
		name: 'Harmonium Street',
		category: 'murder-site',
		x: 943,
		y: 1491,
		description: 'Near the City Barracks where Tenskor the Harmonium officer was struck down.',
		chapter: 1,
		victim: 'Tenskor',
		murderOrder: 5,
		clues: [
			{
				id: 'harmonium-disc',
				text: 'A bronze disc was found by a bubber in the gutter nearby.',
				optional: true,
			},
			{
				id: 'harmonium-rod',
				text: 'An iron rod was recovered by Narcovi from the scene.',
				optional: true,
			},
			{
				id: 'harmonium-talc',
				text: 'A trail of white talc powder led away from the murder site.',
				optional: true,
				gmNote: 'The talc trail connects to Grossif\'s Paints Warehouse if followed carefully.',
			},
		],
	},
	{
		id: 'murder-parted-veil',
		name: 'The Parted Veil Bookshop',
		category: 'murder-site',
		x: 4137,
		y: 2248,
		description: 'Kesto\'s bookshop near the Shattered Temple where Keluk the Gray, an Athar, was the sixth victim.',
		chapter: 1,
		victim: 'Keluk the Gray',
		murderOrder: 6,
		clues: [
			{
				id: 'parted-veil-kesto-witness',
				text: 'Kesto Brighteyes witnessed the red glow transfer from victim to killer but was nearly scared into not saying anything',
				optional: true,
			},
			{
				id: 'parted-veil-talc',
				text: 'We found white talc-dust footprints at the scene.',
				optional: true,
			},
			{
				id: 'parted-veil-talc-sources',
				text: 'Kesto narrowed the sources of talc in Sigil to three locations: Grossif\'s Paints, Penbrum\'s Parchments, and Logu\'s Bath Powder.',
				optional: true,
				gmNote: 'Kesto knows of Grossif\'s Paints, Penbrum\'s Parchments, and Logu\'s Bath Powder.',
			},
		],
	},
];

// ============================================================================
// Faction & Landmark Locations
// ============================================================================

const FACTION_LANDMARKS: SigilLocation[] = [
	{
		id: 'harbinger-house',
		name: 'Harbinger House',
		category: 'landmark',
		x: 3126,
		y: 2509,
		description: 'A mysterious building on a dead-end street in the Lower Ward.',
		chapter: 2,
		clues: [
			{
				id: 'harbinger-planar-energy',
				text: 'The house sits at a nexus of planar energy -- those with magical sensitivity can feel it.',
				optional: true,
			}
		],
	},
	{
		id: 'great-foundry',
		name: 'The Great Foundry',
		category: 'faction-hq',
		x: 3723,
		y: 2094,
		description: 'Headquarters of the Believers of the Source.',
		chapter: 1,
		clues: [
			{
				id: 'foundry-patrols',
				text: 'Godsmen patrols have doubled since the murders began. They\'re nervous about threats to their members.',
				optional: true,
			},
		],
	},
	{
		id: 'shattered-temple',
		name: 'The Shattered Temple',
		category: 'landmark',
		x: 4605,
		y: 2188,
		description: 'Ruins sacred to the Athar.',
		chapter: 1,
		clues: [],
	},
	{
		id: 'city-barracks',
		name: 'City Barracks',
		category: 'faction-hq',
		x: 1304,
		y: 1508,
		description: 'Harmonium headquarters. Narcovi operates from here, running the official murder investigation.',
		chapter: 1,
		clues: [],
	},
	{
		id: 'city-court',
		name: 'City Court',
		category: 'faction-hq',
		x: 1570,
		y: 1982,
		description: 'Seat of the Fraternity of Order. Factol Hashkar rules here with rigid adherence to law.',
		chapter: 1,
		clues: [],
	},
	{
		id: 'the-prison',
		name: 'The Prison',
		category: 'faction-hq',
		x: 2042,
		y: 2165,
		description: 'Mercykiller stronghold.',
		chapter: 1,
		clues: [
			{
				id: 'prison-seventh-murder',
				text: 'The 7th murder took place at Geldab\'s Bakery across the street, targeting Kolz the Mercykiller.',
				optional: true,
			},
		],
	},
	{
		id: 'bloodgem-park',
		name: 'Bloodgem Park',
		category: 'landmark',
		x: 3014,
		y: 2185,
		description: 'A once charming public space.',
		chapter: 1,
		clues: [
			{
				id: 'bloodgem-cult',
				text: 'Cult gatherings have been spotted here at night. The park is avoided by most sensible Cagers.',
				optional: true,
			},
		],
	},
];

// ============================================================================
// Shops & Encounter Locations
// ============================================================================

const SHOPS_ENCOUNTERS: SigilLocation[] = [
	{
		id: 'friendly-fiend',
		name: 'The Friendly Fiend',
		category: 'shop',
		x: 2775,
		y: 2335,
		description: 'A\'kin\'s curiosity shop.',
		chapter: 1,
		clues: [],
	},
	{
		id: 'grossifs-paints',
		name: 'Grossif\'s Paints Warehouse',
		category: 'hideout',
		x: 3125,
		y: 2226,
		description: 'A paint warehouse across from Bloodgem Park.',
		chapter: 1,
		clues: [
			{
				id: 'grossifs-lair',
				text: 'This is Sougad\'s base of operations. Evidence of ritual preparation is everywhere.',
				optional: true,
			},
			{
				id: 'grossifs-talc',
				text: 'Mountains of white talc powder -- the source of the footprints found at murder scenes.',
				optional: true,
			},
		],
	},
	{
		id: 'penbrums-parchments',
		name: 'Penbrum\'s Parchments & Papers',
		category: 'encounter',
		x: 1828,
		y: 2031,
		description: 'A talc warehouse in the Lady\'s Ward.',
		chapter: 1,
		clues: [
			{
				id: 'penbrums-cranium-rats',
				text: 'A nest of cranium rats lurked inside',
				optional: true,
			},
		],
	},
	{
		id: 'logus-bath-powder',
		name: 'Logu\'s Bath Powder',
		category: 'encounter',
		x: 3144,
		y: 1671,
		description: 'A talc warehouse near the Armory.',
		chapter: 1,
		clues: [
			{
				id: 'logus-baskix',
				text: 'Baskix Three-Fingers was squatting here with Lini\'s stolen purse and a vrock feather.',
				optional: true,
			},
		],
	},
	{
		id: 'happy-candies',
		name: 'Happy Candies',
		category: 'hideout',
		x: 2796,
		y: 2500,
		description: 'A candy shop with some extremely chaotic clientele.',
		chapter: 2,
		clues: [
			{
				id: 'happy-xaositects',
				text: 'Xaositects use this basement as a meeting place.',
				optional: true,
				gmNote: 'The Xaositects may know about Harbinger House\'s true nature, but their information is scrambled and unreliable.',
			},
		],
	},
	{
		id: 'sod-dirks-forge',
		name: 'Sod Dirk\'s Forge',
		category: 'encounter',
		x: 3538,
		y: 2062,
		description: 'A blacksmith\'s forge where the smith recently died under mysterious circumstances.',
		chapter: 1,
		clues: [
		],
	},
	{
		id: 'untras-arcana',
		name: 'Untra\'s Arcana',
		category: 'shop',
		x: 1627,
		y: 2258,
		description: 'An arcane supplies shop, supplier of various magical components.',
		chapter: 1,
		clues: [
			{
				id: 'untras-parchment',
				text: 'Sougad bought exactly 13 sheets of fine parchment -- one for each planned victim.',
				optional: true,
			},
		],
	},
	{
		id: 'the-wizards-mark',
		name: 'The Wizard\'s Mark',
		category: 'shop',
		x: 4444,
		y: 2049,
		description: 'An arcane shop robbed of spell components recently',
		chapter: 1,
		clues: [
			{
				id: 'wizards-mark-robbery',
				text: 'Robbed of 12 vrock feathers, 12 nutshells, 5 bronze discs, and 5 iron rods -- all chaos spell components.',
				optional: true,
			},
		],
	},
	{
		id: 'sleepy-dwarf',
		name: 'The Sleepy Dwarf Gem Exchange',
		category: 'shop',
		x: 3432,
		y: 2335,
		description: 'A gem shop on the edge of the Lower Ward',
		chapter: 1,
		clues: [
			{
				id: 'sleepy-dwarf-robbery',
				text: 'Four black pearls worth 1000gp each were stolen recently',
				optional: true,
			},
			{
				id: 'sleepy-dwarf-description',
				text: 'The dwarf shopkeeper remembered the murdered and gave us a detailed description.',
				optional: true,
				gmNote: 'The dwarf is angry and eager to help catch the thief.',
			},
		],
	},
	{
		id: 'geldabs-bakery',
		name: 'Geldab\'s Bakery',
		category: 'encounter',
		x: 1785,
		y: 2172,
		description: 'A bakery across from the Prison.',
		chapter: 1,
		clues: [
			{
				id: 'geldabs-ambush',
				text: 'This is where the 7th ritual murder took place -- targeting Kolz, a Mercykiller patrol officer.',
				optional: true,
				gmNote: 'If the PCs follow the clue in time, they can potentially prevent the murder.',
			},
		],
	},
];

// ============================================================================
// Combined Export
// ============================================================================

export const ALL_SIGIL_LOCATIONS: SigilLocation[] = [
	...MURDER_SITES,
	...FACTION_LANDMARKS,
	...SHOPS_ENCOUNTERS,
];

/** Lookup a location by ID */
export function getLocationById(id: string): SigilLocation | undefined {
	return ALL_SIGIL_LOCATIONS.find((loc) => loc.id === id);
}

/** Get all locations for a specific chapter */
export function getLocationsByChapter(chapter: 1 | 2 | 3): SigilLocation[] {
	return ALL_SIGIL_LOCATIONS.filter((loc) => loc.chapter === chapter);
}

/** Get all murder sites in order */
export function getMurderSites(): SigilLocation[] {
	return MURDER_SITES.sort((a, b) => (a.murderOrder ?? 0) - (b.murderOrder ?? 0));
}

/** Get all locations of a given category */
export function getLocationsByCategory(category: LocationCategory): SigilLocation[] {
	return ALL_SIGIL_LOCATIONS.filter((loc) => loc.category === category);
}

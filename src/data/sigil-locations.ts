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
		description: 'A mysterious building on a dead-end street in the Lower Ward. Nexus of planar energy and central to the adventure.',
		chapter: 2,
		clues: [
			{
				id: 'harbinger-planar-energy',
				text: 'The house sits at a nexus of planar energy -- those with magical sensitivity can feel it.',
				optional: false,
			},
			{
				id: 'harbinger-residents-info',
				text: 'The residents are all individuals touched by the planes in unusual ways.',
				optional: false,
			},
		],
	},
	{
		id: 'great-foundry',
		name: 'The Great Foundry',
		category: 'faction-hq',
		x: 3723,
		y: 2094,
		description: 'Headquarters of the Believers of the Source. Godsmen patrols have increased since the murders began.',
		chapter: 1,
		clues: [
			{
				id: 'foundry-patrols',
				text: 'Godsmen patrols have doubled since the murders began. They\'re nervous about threats to their members.',
				optional: false,
			},
			{
				id: 'foundry-harbinger-connection',
				text: 'The Godsmen have a connection to Harbinger House -- some residents are former Godsmen candidates.',
				optional: true,
				gmNote: 'This connection becomes important in Chapter 2.',
			},
		],
	},
	{
		id: 'shattered-temple',
		name: 'The Shattered Temple',
		category: 'landmark',
		x: 4605,
		y: 2188,
		description: 'Ruins sacred to the Athar. Two murders occurred in its vicinity.',
		chapter: 1,
		clues: [
			{
				id: 'shattered-athar-territory',
				text: 'Athar territory -- they\'re suspicious of outsiders investigating near their sanctum.',
				optional: false,
			},
			{
				id: 'shattered-two-murders',
				text: 'Two of the six murders happened nearby, suggesting the killer is comfortable in this area.',
				optional: true,
				gmNote: 'The proximity to Keluk\'s murder at the Parted Veil is significant.',
			},
		],
	},
	{
		id: 'city-barracks',
		name: 'City Barracks',
		category: 'faction-hq',
		x: 1304,
		y: 1508,
		description: 'Harmonium headquarters. Narcovi operates from here, running the official murder investigation.',
		chapter: 1,
		clues: [
			{
				id: 'barracks-narcovi',
				text: 'Narcovi is the lead investigator and can share (or withhold) official findings.',
				optional: false,
			},
			{
				id: 'barracks-tenskor-colleague',
				text: 'Tenskor was a well-liked Harmonium officer -- his murder has the barracks on edge.',
				optional: true,
				gmNote: 'Narcovi may be more forthcoming if the PCs share their own findings first.',
			},
		],
	},
	{
		id: 'city-court',
		name: 'City Court',
		category: 'faction-hq',
		x: 1570,
		y: 1982,
		description: 'Seat of the Fraternity of Order. Factol Hashkar rules here with rigid adherence to law.',
		chapter: 1,
		clues: [
			{
				id: 'court-guvner-resources',
				text: 'The Guvners\' records may contain information about divine ascension rituals.',
				optional: true,
				gmNote: 'Requires a favor or successful Diplomacy check to access restricted materials.',
			},
		],
	},
	{
		id: 'the-prison',
		name: 'The Prison',
		category: 'faction-hq',
		x: 2042,
		y: 2165,
		description: 'Mercykiller stronghold. Geldab\'s Bakery sits across the street -- site of the 7th murder attempt.',
		chapter: 1,
		clues: [
			{
				id: 'prison-seventh-murder',
				text: 'The 7th murder (attempted) takes place at Geldab\'s Bakery across the street, targeting Kolz the Mercykiller.',
				optional: false,
			},
		],
	},
	{
		id: 'bloodgem-park',
		name: 'Bloodgem Park',
		category: 'landmark',
		x: 3014,
		y: 2185,
		description: 'A dangerous public space near Grossif\'s warehouse. Site of cult gatherings and the Lady of Pain ceremony.',
		chapter: 1,
		clues: [
			{
				id: 'bloodgem-cult',
				text: 'Cult gatherings have been spotted here at night. The park is avoided by most sensible Cagers.',
				optional: false,
			},
			{
				id: 'bloodgem-warehouse-proximity',
				text: 'Grossif\'s Paints warehouse is very close -- the cult may have a connection.',
				optional: true,
				gmNote: 'This proximity is the key link to finding Sougad\'s lair.',
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
		description: 'A\'kin\'s curiosity shop. The fiend merchant sells spell components and knows more than he lets on.',
		chapter: 1,
		clues: [
			{
				id: 'fiend-akin-info',
				text: 'A\'kin can identify unusual spell components and may know who has been buying them in bulk.',
				optional: false,
			},
			{
				id: 'fiend-quick-start',
				text: 'This is a possible opening location for Quick Start III -- A\'kin can direct the party toward the investigation.',
				optional: true,
				gmNote: 'A\'kin is always helpful... suspiciously so.',
			},
		],
	},
	{
		id: 'grossifs-paints',
		name: 'Grossif\'s Paints Warehouse',
		category: 'hideout',
		x: 3125,
		y: 2226,
		description: 'Sougad\'s hidden lair in a talc warehouse near Bloodgem Park. The climax of Chapter 1\'s investigation.',
		chapter: 1,
		clues: [
			{
				id: 'grossifs-lair',
				text: 'This is Sougad\'s base of operations. Evidence of ritual preparation is everywhere.',
				optional: false,
			},
			{
				id: 'grossifs-talc',
				text: 'Mountains of white talc powder -- the source of the footprints found at murder scenes.',
				optional: false,
			},
			{
				id: 'grossifs-ritual-notes',
				text: 'Sougad\'s notes on the divine ascension ritual, written on fine parchment.',
				optional: true,
				gmNote: 'These notes reveal the full scope of the murder plan and the connection to Harbinger House.',
			},
		],
	},
	{
		id: 'penbrums-parchments',
		name: 'Penbrum\'s Parchments & Papers',
		category: 'encounter',
		x: 1828,
		y: 2031,
		description: 'A talc warehouse in the Lady\'s Ward. Infested with cranium rats.',
		chapter: 1,
		clues: [
			{
				id: 'penbrums-cranium-rats',
				text: 'A nest of cranium rats lurks inside -- they attack intruders with psychic blasts.',
				optional: false,
			},
			{
				id: 'penbrums-dead-end',
				text: 'No direct connection to the murders, but the cranium rats may have observed suspicious activity nearby.',
				optional: true,
				gmNote: 'This is a red herring / combat encounter. The rats know nothing useful.',
			},
		],
	},
	{
		id: 'logus-bath-powder',
		name: 'Logu\'s Bath Powder',
		category: 'encounter',
		x: 3144,
		y: 1671,
		description: 'A talc warehouse near the Armory. Baskix Three-Fingers squats here with stolen evidence.',
		chapter: 1,
		clues: [
			{
				id: 'logus-baskix',
				text: 'Baskix Three-Fingers is squatting here with Lini\'s stolen purse and a vrock feather.',
				optional: false,
			},
			{
				id: 'logus-stolen-evidence',
				text: 'The stolen items connect to the Ascension Hall murder -- Baskix is a thief, not the killer.',
				optional: true,
				gmNote: 'Baskix picked Lini\'s pocket before or after the murder. He saw Sougad but is too scared to talk freely.',
			},
		],
	},
	{
		id: 'happy-candies',
		name: 'Happy Candies',
		category: 'hideout',
		x: 2796,
		y: 2500,
		description: 'A candy shop with a Xaositect hideout in the basement. Near Harbinger House.',
		chapter: 2,
		clues: [
			{
				id: 'happy-xaositects',
				text: 'Xaositects use the basement as a meeting place. They have unpredictable information about local events.',
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
		description: 'A blacksmith\'s forge where Sougad had his killing sword prepared.',
		chapter: 1,
		clues: [
			{
				id: 'dirks-sword',
				text: 'Sougad commissioned special work on a sword here -- the weapon used in the first non-ritual kill.',
				optional: false,
			},
			{
				id: 'dirks-description',
				text: 'Sod Dirk can describe Sougad\'s appearance and demeanor.',
				optional: true,
				gmNote: 'Dirk remembers Sougad as intense and focused -- paid well and didn\'t haggle.',
			},
		],
	},
	{
		id: 'untras-arcana',
		name: 'Untra\'s Arcana',
		category: 'shop',
		x: 1627,
		y: 2258,
		description: 'An arcane supplies shop where Sougad purchased 13 sheets of fine parchment.',
		chapter: 1,
		clues: [
			{
				id: 'untras-parchment',
				text: 'Sougad bought exactly 13 sheets of fine parchment -- one for each planned victim.',
				optional: false,
			},
			{
				id: 'untras-description',
				text: 'The shopkeeper remembers Sougad and can provide a physical description.',
				optional: true,
				gmNote: 'The number 13 is significant -- it matches the total number of planned murders.',
			},
		],
	},
	{
		id: 'the-wizards-mark',
		name: 'The Wizard\'s Mark',
		category: 'shop',
		x: 4444,
		y: 2049,
		description: 'An arcane shop robbed of ritual components: vrock feathers, nutshells, bronze discs, and iron rods.',
		chapter: 1,
		clues: [
			{
				id: 'wizards-mark-robbery',
				text: 'Robbed of 12 vrock feathers, 12 nutshells, 5 bronze discs, and 5 iron rods -- all chaos spell components.',
				optional: false,
			},
			{
				id: 'wizards-mark-connection',
				text: 'The stolen components match those found at the murder scenes exactly.',
				optional: true,
				gmNote: 'Connecting the robbery to the murders is a key investigative breakthrough.',
			},
		],
	},
	{
		id: 'sleepy-dwarf',
		name: 'The Sleepy Dwarf Gem Exchange',
		category: 'shop',
		x: 3432,
		y: 2335,
		description: 'A gem shop robbed of four black pearls worth 1000gp each.',
		chapter: 1,
		clues: [
			{
				id: 'sleepy-dwarf-robbery',
				text: 'Four black pearls worth 1000gp each were stolen. Black pearl dust was found at the Powers Row murder.',
				optional: false,
			},
			{
				id: 'sleepy-dwarf-description',
				text: 'The dwarf shopkeeper remembers Sougad and gives a detailed description.',
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
				text: 'This is where Sougad attempts the 7th ritual murder -- targeting Kolz, a Mercykiller patrol officer.',
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

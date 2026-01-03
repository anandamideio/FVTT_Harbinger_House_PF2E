/**
 * PF2e System Traits
 * Auto-generated from the PF2e system configuration
 * These are the valid traits that can be used for actions, spells, weapons, etc.
 */

// =============================================================================
// ACTION TRAITS
// =============================================================================

export const ACTION_TRAITS = [
  // Ancestry traits
  'aiuvarin', 'anadi', 'android', 'aphorite', 'ardande', 'athamaru', 'automaton',
  'awakened-animal', 'azarketi', 'beastkin', 'bugbear', 'catfolk', 'centaur',
  'changeling', 'conrasu', 'dhampir', 'dragonblood', 'dragonet', 'dromaar',
  'duskwalker', 'dwarf', 'elf', 'fetchling', 'fleshwarp', 'ganzi', 'geniekin',
  'ghoran', 'gnoll', 'gnome', 'goblin', 'goloma', 'grippli', 'halfling',
  'hobgoblin', 'human', 'hungerseed', 'jotunborn', 'kashrishi', 'kitsune',
  'kobold', 'leshy', 'lizardfolk', 'merfolk', 'minotaur', 'nagaji', 'naari',
  'nephilim', 'orc', 'oread', 'poppet', 'ratfolk', 'reflection', 'samsaran',
  'sarangay', 'shisk', 'shoony', 'skeleton', 'sprite', 'strix', 'suli', 'surki',
  'sylph', 'tanuki', 'talos', 'tengu', 'undine', 'vanara', 'vishkanya', 'wayang',
  'yaksha', 'yaoguai',
  // Class traits
  'alchemist', 'animist', 'barbarian', 'bard', 'champion', 'cleric', 'commander',
  'druid', 'exemplar', 'fighter', 'guardian', 'gunslinger', 'inventor',
  'investigator', 'kineticist', 'magus', 'monk', 'oracle', 'psychic', 'ranger',
  'rogue', 'sorcerer', 'summoner', 'swashbuckler', 'thaumaturge', 'witch', 'wizard',
  // Element traits
  'air', 'earth', 'fire', 'metal', 'water', 'wood',
  // Damage/Energy traits
  'acid', 'cold', 'electricity', 'force', 'sonic', 'vitality', 'void',
  'holy', 'unholy', 'light', 'magical', 'mental', 'nonlethal', 'plant',
  'radiation', 'spirit',
  // Magic tradition traits
  'arcane', 'divine', 'occult', 'primal',
  // Common action traits
  'amp', 'attack', 'auditory', 'aura', 'beast', 'cantrip', 'composition',
  'concentrate', 'consecration', 'contingency', 'curse', 'cursebound', 'darkness',
  'death', 'detection', 'disease', 'dream', 'eidolon', 'emotion', 'exploration',
  'extradimensional', 'fear', 'focus', 'fortune', 'fungus', 'healing', 'hex',
  'illusion', 'incapacitation', 'incarnate', 'incorporeal', 'inhaled', 'linguistic',
  'litany', 'manipulate', 'misfortune', 'morph', 'move', 'mythic', 'olfactory',
  'poison', 'polymorph', 'possession', 'prediction', 'psyche', 'rage', 'revelation',
  'sanctified', 'scrying', 'shadow', 'sleep', 'spellshape', 'stance', 'structure',
  'subtle', 'summon', 'summoned', 'teleportation', 'trial', 'true-name', 'visual',
  // Feat/ability traits
  'additive', 'additive1', 'additive2', 'additive3', 'aftermath', 'alchemical',
  'apparition', 'archetype', 'artifact', 'brandish', 'bravado', 'calling', 'circus',
  'class', 'coagulant', 'composite', 'dedication', 'destiny', 'deviant', 'downtime',
  'evolution', 'esoterica', 'finisher', 'flourish', 'general', 'ikon', 'impulse',
  'infusion', 'injury', 'lineage', 'mindshift', 'modification', 'multiclass', 'oath',
  'overflow', 'pervasive-magic', 'press', 'reckless', 'reincarnated', 'secret',
  'skill', 'social', 'spellshot', 'stamina', 'tactic', 'talisman', 'tandem', 'time',
  'transcendence', 'unstable', 'vigilante', 'virulent', 'wandering',
  // Item traits
  'bottled-breath', 'catalyst', 'clockwork', 'consumable', 'contact', 'cursed',
  'drug', 'elixir', 'expandable', 'fey', 'fulu', 'gadget', 'infused', 'ingested',
  'lozenge', 'mechanical', 'missive', 'mutagen', 'oil', 'potion', 'precious',
  'processed', 'scroll', 'snare', 'spellgun', 'splash', 'tea', 'trap', 'wand',
  'whetstone',
  // Weapon traits
  'agile', 'propulsive', 'backswing', 'forceful', 'reach', 'sweep', 'thrown',
  'volley-20', 'volley-30', 'volley-50', 'volley-60',
  // Special
  'certain-kill',
] as const;

export type ActionTrait = typeof ACTION_TRAITS[number];

// =============================================================================
// SPELL TRAITS
// =============================================================================

export const SPELL_TRAITS = [
  // Class traits
  'alchemist', 'animist', 'barbarian', 'bard', 'champion', 'cleric', 'commander',
  'druid', 'exemplar', 'fighter', 'guardian', 'gunslinger', 'inventor',
  'investigator', 'kineticist', 'magus', 'monk', 'oracle', 'psychic', 'ranger',
  'rogue', 'sorcerer', 'summoner', 'swashbuckler', 'thaumaturge', 'witch', 'wizard',
  // Element traits
  'air', 'earth', 'fire', 'metal', 'water', 'wood',
  // Damage/Energy traits
  'acid', 'cold', 'electricity', 'force', 'sonic', 'vitality', 'void',
  'holy', 'unholy', 'light', 'magical', 'mental', 'nonlethal', 'plant',
  'radiation', 'spirit',
  // Magic tradition traits
  'arcane', 'divine', 'occult', 'primal',
  // Common spell traits
  'amp', 'attack', 'auditory', 'aura', 'beast', 'cantrip', 'composition',
  'concentrate', 'consecration', 'contingency', 'curse', 'cursebound', 'darkness',
  'death', 'detection', 'disease', 'dream', 'eidolon', 'emotion', 'exploration',
  'extradimensional', 'fear', 'focus', 'fortune', 'fungus', 'healing', 'hex',
  'illusion', 'incapacitation', 'incarnate', 'incorporeal', 'inhaled', 'linguistic',
  'litany', 'manipulate', 'misfortune', 'morph', 'move', 'mythic', 'olfactory',
  'poison', 'polymorph', 'possession', 'prediction', 'psyche', 'rage', 'revelation',
  'sanctified', 'scrying', 'shadow', 'sleep', 'spellshape', 'stance', 'structure',
  'subtle', 'summon', 'summoned', 'teleportation', 'trial', 'true-name', 'visual',
] as const;

export type SpellTrait = typeof SPELL_TRAITS[number];

// =============================================================================
// WEAPON TRAITS
// =============================================================================

export const WEAPON_TRAITS = [
  // Ancestry traits
  'aiuvarin', 'anadi', 'android', 'aphorite', 'ardande', 'athamaru', 'automaton',
  'awakened-animal', 'azarketi', 'beastkin', 'bugbear', 'catfolk', 'centaur',
  'changeling', 'conrasu', 'dhampir', 'dragonblood', 'dragonet', 'dromaar',
  'duskwalker', 'dwarf', 'elf', 'fetchling', 'fleshwarp', 'ganzi', 'geniekin',
  'ghoran', 'gnoll', 'gnome', 'goblin', 'goloma', 'grippli', 'halfling',
  'hobgoblin', 'human', 'hungerseed', 'jotunborn', 'kashrishi', 'kitsune',
  'kobold', 'leshy', 'lizardfolk', 'merfolk', 'minotaur', 'nagaji', 'naari',
  'nephilim', 'orc', 'oread', 'poppet', 'ratfolk', 'reflection', 'samsaran',
  'sarangay', 'shisk', 'shoony', 'skeleton', 'sprite', 'strix', 'suli', 'surki',
  'sylph', 'tanuki', 'talos', 'tengu', 'undine', 'vanara', 'vishkanya', 'wayang',
  'yaksha', 'yaoguai',
  // Element traits
  'air', 'earth', 'fire', 'metal', 'water', 'wood',
  // Damage/Energy traits
  'acid', 'cold', 'electricity', 'force', 'sonic', 'vitality', 'void',
  // Magic tradition traits
  'arcane', 'divine', 'occult', 'primal',
  'holy', 'unholy',
  // Weapon-specific traits
  'adjusted', 'agile', 'alchemical', 'analog', 'apex', 'artifact', 'attached',
  'attached-to-shield', 'attached-to-crossbow-or-firearm', 'auditory', 'automatic',
  'backstabber', 'backswing', 'bomb', 'brace', 'brutal',
  'capacity-2', 'capacity-3', 'capacity-4', 'capacity-5',
  'climbing', 'clockwork', 'cobbled', 'combination', 'concealable', 'concussive',
  'consumable', 'critical-fusion', 'cursed',
  'deadly-d4', 'deadly-d6', 'deadly-d8', 'deadly-d10', 'deadly-d12',
  'death', 'disarm', 'disease', 'double-barrel', 'emotion', 'extradimensional',
  'fatal-aim-d10', 'fatal-aim-d12', 'fatal-d8', 'fatal-d10', 'fatal-d12',
  'fear', 'finesse', 'forceful', 'fortune', 'free-hand', 'fungus', 'grapple',
  'hampering', 'healing', 'illusion', 'infused', 'inhaled', 'injection',
  'intelligent', 'invested',
  'jousting-d4', 'jousting-d6', 'jousting-d8', 'jousting-d10',
  'kickback', 'light', 'magical', 'mental', 'modular', 'monk', 'mythic',
  'nonlethal', 'olfactory', 'parry', 'plant', 'poison', 'propulsive',
  'ranged-trip', 'razing', 'reach', 'recovery', 'relic', 'repeating', 'resonant',
  'saggorak',
  'scatter-5', 'scatter-10', 'scatter-15', 'scatter-20',
  'scrying', 'shadow', 'shove', 'spirit', 'splash', 'staff', 'sweep', 'tearing',
  'tech', 'teleportation', 'tethered', 'thrown',
  'thrown-10', 'thrown-15', 'thrown-20', 'thrown-30', 'thrown-40', 'thrown-50',
  'thrown-60', 'thrown-80', 'thrown-100', 'thrown-200',
  'time', 'training',
  'tracking-1', 'tracking-2', 'tracking-3',
  'trip', 'twin',
  'two-hand-d6', 'two-hand-d8', 'two-hand-d10', 'two-hand-d12',
  'unarmed', 'vehicular', 'venomous',
  'versatile-acid', 'versatile-b', 'versatile-cold', 'versatile-electricity',
  'versatile-fire', 'versatile-force', 'versatile-mental', 'versatile-p',
  'versatile-poison', 'versatile-s', 'versatile-sonic', 'versatile-spirit',
  'versatile-vitality', 'versatile-void',
  'visual',
  'volley-20', 'volley-30', 'volley-50', 'volley-60',
  'wand',
] as const;

export type WeaponTrait = typeof WEAPON_TRAITS[number];

// =============================================================================
// NPC ATTACK TRAITS (extends weapon traits)
// =============================================================================

export const NPC_ATTACK_TRAITS = [
  ...WEAPON_TRAITS,
  // Precious materials
  'abysium', 'adamantine', 'cold-iron', 'dawnsilver', 'duskwood', 'djezet',
  'dragonhide', 'dreamweb', 'grisantian-pelt', 'inubrix', 'keep-stone', 'noqual',
  'orichalcum', 'peachwood', 'siccatite', 'silver', 'sisterstone', 'sisterstone-dusk',
  'sisterstone-scarlet', 'sloughstone', 'sovereign-steel', 'warpglass',
  // NPC-specific traits
  'area', 'concentrate', 'curse',
  'deadly-2d8', 'deadly-3d8', 'deadly-4d8',
  'deadly-2d10', 'deadly-3d10', 'deadly-4d10',
  'deadly-2d12', 'deadly-3d12', 'deadly-4d12',
  'impulse', 'incorporeal', 'radiation',
  'reach-0', 'reach-10', 'reach-15', 'reach-20', 'reach-25', 'reach-30',
  'reach-40', 'reach-50', 'reach-60', 'reach-100', 'reach-120', 'reach-200', 'reach-1000',
  'reload-0', 'reload-1', 'reload-2', 'reload-1-min',
  'sanctified',
] as const;

export type NPCAttackTrait = typeof NPC_ATTACK_TRAITS[number];

// =============================================================================
// CREATURE TRAITS
// =============================================================================

export const CREATURE_TRAITS = [
  // Ancestry traits
  'aiuvarin', 'anadi', 'android', 'aphorite', 'ardande', 'athamaru', 'automaton',
  'awakened-animal', 'azarketi', 'beastkin', 'bugbear', 'catfolk', 'centaur',
  'changeling', 'conrasu', 'dhampir', 'dragonblood', 'dragonet', 'dromaar',
  'duskwalker', 'dwarf', 'elf', 'fetchling', 'fleshwarp', 'ganzi', 'geniekin',
  'ghoran', 'gnoll', 'gnome', 'goblin', 'goloma', 'grippli', 'halfling',
  'hobgoblin', 'human', 'hungerseed', 'jotunborn', 'kashrishi', 'kitsune',
  'kobold', 'leshy', 'lizardfolk', 'merfolk', 'minotaur', 'nagaji', 'naari',
  'nephilim', 'orc', 'oread', 'poppet', 'ratfolk', 'reflection', 'samsaran',
  'sarangay', 'shisk', 'shoony', 'skeleton', 'sprite', 'strix', 'suli', 'surki',
  'sylph', 'tanuki', 'talos', 'tengu', 'undine', 'vanara', 'vishkanya', 'wayang',
  'yaksha', 'yaoguai',
  // Element traits
  'air', 'earth', 'fire', 'metal', 'water', 'wood',
  // Damage/Energy traits
  'acid', 'cold', 'electricity', 'force', 'sonic', 'vitality', 'void',
  // Magic tradition traits
  'arcane', 'divine', 'occult', 'primal',
  'holy', 'unholy',
  // Creature type traits
  'aberration', 'aeon', 'aesir', 'agathion', 'alchemical', 'amphibious', 'angel',
  'animal', 'anugobu', 'aquatic', 'archon', 'astral', 'asura', 'azata', 'beast',
  'blight', 'boggard', 'caligni', 'celestial', 'charau-ka', 'clockwork', 'construct',
  'couatl', 'daemon', 'darvakka', 'demon', 'dero', 'devil', 'dinosaur', 'div',
  'dragon', 'dream', 'drow', 'duergar', 'eidolon', 'elemental', 'ethereal',
  'experiment', 'fey', 'fiend', 'formian', 'fungus', 'genie', 'ghost', 'ghoul',
  'ghul', 'giant', 'gigas', 'girtablilu', 'golem', 'graveknight', 'gremlin',
  'grioth', 'hag', 'hantu', 'herald', 'hryngar', 'humanoid', 'ikeshti', 'illusion',
  'incorporeal', 'inevitable', 'kami', 'kaiju', 'kovintus', 'light', 'lilu',
  'locathah', 'maftet', 'mental', 'mindless', 'minion', 'monitor', 'morlock',
  'mortic', 'mummy', 'munavri', 'mutant', 'mythic', 'nindoru', 'nymph', 'oni',
  'ooze', 'paaridar', 'palinthanos',
  'persona-flirt', 'persona-guardian', 'persona-leader', 'persona-scholar',
  'persona-scoundrel', 'persona-underdog', 'persona-warrior', 'persona-wildcard',
  'petitioner', 'phantom', 'plant', 'poison', 'protean', 'psychopomp', 'qlippoth',
  'rakshasa', 'sahkil', 'sea-devil', 'sedacthy', 'serpentfolk', 'seugathi', 'shabti',
  'shade', 'shadow', 'shobhad', 'siktempora', 'skelm', 'skulk', 'soulbound', 'spirit',
  'sporeborn', 'spriggan', 'stheno', 'summoned', 'swarm', 'tane', 'tanggal', 'time',
  'titan', 'troll', 'troop', 'undead', 'urdefhan', 'vampire', 'velstrac',
  'werecreature', 'wight', 'wild-hunt', 'wraith', 'wraithvine', 'wyrwood', 'xulgath',
  'zombie',
] as const;

export type CreatureTrait = typeof CREATURE_TRAITS[number];

// =============================================================================
// DAMAGE TYPES
// =============================================================================

export const DAMAGE_TYPES = [
  'acid', 'cold', 'electricity', 'fire', 'force', 'sonic', 'vitality', 'void',
  'bleed', 'bludgeoning', 'piercing', 'slashing', 'mental', 'poison', 'spirit',
  'untyped',
] as const;

export type DamageType = typeof DAMAGE_TYPES[number];

// =============================================================================
// MAGIC TRADITIONS
// =============================================================================

export const MAGIC_TRADITIONS = ['arcane', 'divine', 'occult', 'primal'] as const;

export type MagicTradition = typeof MAGIC_TRADITIONS[number];

// =============================================================================
// COMBINED TRAITS (all unique traits)
// =============================================================================

export const ALL_TRAITS = [
  'aberration', 'abysium', 'acid', 'adamantine', 'additive', 'additive0',
  'additive1', 'additive2', 'additive3', 'adjusted', 'adjustment', 'aeon',
  'aesir', 'aftermath', 'agathion', 'agile', 'air', 'aiuvarin', 'alchemical',
  'alchemist', 'amp', 'amphibious', 'anadi', 'analog', 'android', 'angel',
  'animal', 'animist', 'anugobu', 'apex', 'aphorite', 'apparition', 'aquadynamic',
  'aquatic', 'arcane', 'archetype', 'archon', 'ardande', 'area', 'artifact',
  'astral', 'asura', 'athamaru', 'attached', 'attached-to-crossbow-or-firearm',
  'attached-to-shield', 'attack', 'auditory', 'aura', 'automatic', 'automaton',
  'awakened-animal', 'azarketi', 'azata', 'backstabber', 'backswing', 'barbarian',
  'bard', 'barding', 'beast', 'beastkin', 'bleed', 'blight', 'bludgeoning',
  'boggard', 'bomb', 'bottled-breath', 'brace', 'brandish', 'bravado', 'brutal',
  'bugbear', 'bulwark', 'caligni', 'calling', 'cantrip', 'capacity-2', 'capacity-3',
  'capacity-4', 'capacity-5', 'catalyst', 'catfolk', 'celestial', 'censer',
  'centaur', 'certain-kill', 'champion', 'changeling', 'charau-ka', 'circus',
  'class', 'cleric', 'climbing', 'clockwork', 'coagulant', 'cobbled', 'coda',
  'cold', 'cold-iron', 'combination', 'comfort', 'commander', 'companion',
  'composite', 'composition', 'concealable', 'concentrate', 'concussive',
  'conrasu', 'consecration', 'construct', 'consumable', 'contact', 'contingency',
  'contract', 'couatl', 'critical-fusion', 'curse', 'cursebound', 'cursed',
  'daemon', 'darkness', 'darvakka', 'dawnsilver', 'deadly-2d10', 'deadly-2d12',
  'deadly-2d8', 'deadly-3d10', 'deadly-3d12', 'deadly-3d8', 'deadly-4d10',
  'deadly-4d12', 'deadly-4d8', 'deadly-d10', 'deadly-d12', 'deadly-d4', 'deadly-d6',
  'deadly-d8', 'death', 'dedication', 'demon', 'dero', 'destiny', 'detection',
  'deviant', 'devil', 'dhampir', 'dinosaur', 'disarm', 'disease', 'div', 'divine',
  'djezet', 'double-barrel', 'downtime', 'dragon', 'dragonblood', 'dragonet',
  'dragonhide', 'dream', 'dreamweb', 'dromaar', 'drow', 'drug', 'druid', 'duergar',
  'duskwalker', 'duskwood', 'dwarf', 'earth', 'eidolon', 'electricity', 'elemental',
  'elf', 'elixir', 'emotion', 'entrench-melee', 'entrench-ranged', 'esoterica',
  'ethereal', 'evolution', 'exemplar', 'expandable', 'experiment', 'exploration',
  'extradimensional', 'fatal-aim-d10', 'fatal-aim-d12', 'fatal-d10', 'fatal-d12',
  'fatal-d8', 'fear', 'fetchling', 'fey', 'fiend', 'fighter', 'figurehead',
  'finesse', 'finisher', 'fire', 'fleshwarp', 'flexible', 'flourish', 'focus',
  'focused', 'force', 'forceful', 'formian', 'fortune', 'free-hand', 'fulu',
  'fungus', 'gadget', 'ganzi', 'general', 'genie', 'geniekin', 'ghoran', 'ghost',
  'ghoul', 'ghul', 'giant', 'gigas', 'girtablilu', 'gnoll', 'gnome', 'goblin',
  'golem', 'goloma', 'graft', 'grapple', 'graveknight', 'gremlin', 'grimoire',
  'grioth', 'grippli', 'grisantian-pelt', 'guardian', 'gunslinger', 'hag',
  'halfling', 'hampering', 'hantu', 'harrow-court', 'healing', 'herald', 'hex',
  'hindering', 'hobgoblin', 'holy', 'hryngar', 'human', 'humanoid', 'hungerseed',
  'ikeshti', 'ikon', 'illusion', 'impulse', 'incapacitation', 'incarnate',
  'incorporeal', 'inevitable', 'infused', 'infusion', 'ingested', 'inhaled',
  'injection', 'injury', 'inscribed', 'intelligent', 'inubrix', 'inventor',
  'invested', 'investigator', 'jotunborn', 'jousting-d10', 'jousting-d4',
  'jousting-d6', 'jousting-d8', 'kaiju', 'kami', 'kashrishi', 'keep-stone',
  'kickback', 'kineticist', 'kitsune', 'kobold', 'kovintus', 'laminar', 'leshy',
  'light', 'lilu', 'lineage', 'linguistic', 'litany', 'lizardfolk', 'locathah',
  'lozenge', 'maftet', 'magical', 'magus', 'manipulate', 'mechanical', 'mental',
  'merfolk', 'metal', 'mindless', 'mindshift', 'minion', 'minotaur', 'misfortune',
  'missive', 'modification', 'modular', 'monitor', 'monk', 'morlock', 'morph',
  'mortic', 'mounted', 'move', 'multiclass', 'mummy', 'munavri', 'mutagen',
  'mutant', 'mythic', 'naari', 'nagaji', 'nephilim', 'nindoru', 'noisy',
  'nonlethal', 'noqual', 'nymph', 'oath', 'occult', 'oil', 'olfactory', 'oni',
  'ooze', 'oracle', 'orc', 'oread', 'orichalcum', 'overflow', 'paaridar',
  'palinthanos', 'parry', 'peachwood', 'persona-flirt', 'persona-guardian',
  'persona-leader', 'persona-scholar', 'persona-scoundrel', 'persona-underdog',
  'persona-warrior', 'persona-wildcard', 'pervasive-magic', 'petitioner',
  'phantom', 'piercing', 'plant', 'poison', 'polymorph', 'ponderous', 'poppet',
  'portable', 'possession', 'potion', 'precious', 'prediction', 'press', 'primal',
  'processed', 'propulsive', 'protean', 'psyche', 'psychic', 'psychopomp',
  'qlippoth', 'radiation', 'rage', 'rakshasa', 'ranged-trip', 'ranger', 'ratfolk',
  'razing', 'reach', 'reach-0', 'reach-10', 'reach-100', 'reach-1000', 'reach-120',
  'reach-15', 'reach-20', 'reach-200', 'reach-25', 'reach-30', 'reach-40',
  'reach-50', 'reach-60', 'reckless', 'recovery', 'reflection', 'reincarnated',
  'relic', 'reload-0', 'reload-1', 'reload-1-min', 'reload-2', 'repeating',
  'resilient-1', 'resilient-2', 'resilient-3', 'resonant', 'revelation', 'rogue',
  'saggorak', 'sahkil', 'samsaran', 'sanctified', 'sarangay', 'scatter-10',
  'scatter-15', 'scatter-20', 'scatter-5', 'scroll', 'scrying', 'sea-devil',
  'secret', 'sedacthy', 'serpentfolk', 'seugathi', 'shabti', 'shade', 'shadow',
  'shisk', 'shobhad', 'shoony', 'shove', 'siccatite', 'siktempora', 'silver',
  'sisterstone', 'sisterstone-dusk', 'sisterstone-scarlet', 'skeleton', 'skelm',
  'skill', 'skulk', 'slashing', 'sleep', 'sloughstone', 'snare', 'social', 'sonic',
  'sorcerer', 'soulbound', 'sovereign-steel', 'spellgun', 'spellheart', 'spellshape',
  'spellshot', 'spirit', 'splash', 'sporeborn', 'spriggan', 'sprite', 'staff',
  'stamina', 'stance', 'steam', 'stheno', 'strix', 'structure', 'subtle', 'suli',
  'summon', 'summoned', 'summoner', 'surki', 'swarm', 'swashbuckler', 'sweep',
  'sylph', 'tactic', 'talisman', 'talos', 'tandem', 'tane', 'tanggal', 'tanuki',
  'tattoo', 'tea', 'tearing', 'tech', 'teleportation', 'tengu', 'tethered',
  'thaumaturge', 'thrown', 'thrown-10', 'thrown-100', 'thrown-15', 'thrown-20',
  'thrown-200', 'thrown-30', 'thrown-40', 'thrown-50', 'thrown-60', 'thrown-80',
  'time', 'titan', 'tracking-1', 'tracking-2', 'tracking-3', 'training',
  'transcendence', 'trap', 'trial', 'trip', 'troll', 'troop', 'true-name', 'twin',
  'two-hand-d10', 'two-hand-d12', 'two-hand-d6', 'two-hand-d8', 'unarmed', 'undead',
  'undine', 'unholy', 'unstable', 'untyped', 'urdefhan', 'vampire', 'vanara',
  'vehicular', 'velstrac', 'venomous', 'versatile-acid', 'versatile-b',
  'versatile-cold', 'versatile-electricity', 'versatile-fire', 'versatile-force',
  'versatile-mental', 'versatile-p', 'versatile-poison', 'versatile-s',
  'versatile-sonic', 'versatile-spirit', 'versatile-vitality', 'versatile-void',
  'vigilante', 'virulent', 'vishkanya', 'visual', 'vitality', 'void', 'volley-20',
  'volley-30', 'volley-50', 'volley-60', 'wand', 'wandering', 'warpglass', 'water',
  'wayang', 'werecreature', 'whetstone', 'wight', 'wild-hunt', 'witch', 'wizard',
  'wood', 'wraith', 'wraithvine', 'wyrwood', 'xulgath', 'yaksha', 'yaoguai', 'zombie',
] as const;

export type PF2eTrait = typeof ALL_TRAITS[number];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a string is a valid action trait
 */
export function isValidActionTrait(trait: string): trait is ActionTrait {
  return (ACTION_TRAITS as readonly string[]).includes(trait);
}

/**
 * Check if a string is a valid spell trait
 */
export function isValidSpellTrait(trait: string): trait is SpellTrait {
  return (SPELL_TRAITS as readonly string[]).includes(trait);
}

/**
 * Check if a string is a valid weapon trait
 */
export function isValidWeaponTrait(trait: string): trait is WeaponTrait {
  return (WEAPON_TRAITS as readonly string[]).includes(trait);
}

/**
 * Check if a string is a valid NPC attack trait
 */
export function isValidNPCAttackTrait(trait: string): trait is NPCAttackTrait {
  return (NPC_ATTACK_TRAITS as readonly string[]).includes(trait);
}

/**
 * Check if a string is a valid creature trait
 */
export function isValidCreatureTrait(trait: string): trait is CreatureTrait {
  return (CREATURE_TRAITS as readonly string[]).includes(trait);
}

/**
 * Check if a string is a valid PF2e trait (any category)
 */
export function isValidTrait(trait: string): trait is PF2eTrait {
  return (ALL_TRAITS as readonly string[]).includes(trait);
}

/**
 * Filter an array of strings to only include valid action traits
 */
export function filterValidActionTraits(traits: string[]): ActionTrait[] {
  return traits.filter(isValidActionTrait);
}

/**
 * Filter an array of strings to only include valid weapon traits
 */
export function filterValidWeaponTraits(traits: string[]): WeaponTrait[] {
  return traits.filter(isValidWeaponTrait);
}

/**
 * Filter an array of strings to only include valid NPC attack traits
 */
export function filterValidNPCAttackTraits(traits: string[]): NPCAttackTrait[] {
  return traits.filter(isValidNPCAttackTrait);
}

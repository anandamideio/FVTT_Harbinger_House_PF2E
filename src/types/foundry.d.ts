/**
 * Type declarations for FoundryVTT V13 and PF2e System
 * This is a subset of types needed for this module
 */

import type { PF2eTrait } from "./pf2e-traits";
import type { WeaponTrait } from "./pf2e-traits";
import type { WeaponRune } from "./pf2e-runes";

// Foundry Global Types
declare global {
  const game: Game;
  const ui: UI;
  const CONFIG: Config;
  const Hooks: HooksClass;
  const Dialog: typeof DialogClass;
  const Actor: typeof ActorClass;
  const Item: typeof ItemClass;
  const Folder: typeof FolderClass;
  const Actors: Collection<ActorClass>;
  const Items: Collection<ItemClass>;
  const foundry: FoundryUtils;

  interface Game {
    system: {
      id: string;
      version: string;
    };
    user: User | null;
    modules: Map<string, Module>;
    settings: ClientSettings;
    i18n: Localization;
    packs: Collection<CompendiumCollection>;
    actors: Collection<ActorClass>;
    items: Collection<ItemClass>;
    folders?: Collection<FolderClass>;
    ready: boolean;
  }

  interface User {
    isGM: boolean;
    id: string;
    name: string;
  }

  interface Module {
    id: string;
    active: boolean;
    version: string;
    flags: Record<string, unknown>;
  }

  interface UI {
    notifications: Notifications;
  }

  interface Notifications {
    info(message: string, options?: NotificationOptions): void;
    warn(message: string, options?: NotificationOptions): void;
    error(message: string, options?: NotificationOptions): void;
  }

  interface NotificationOptions {
    permanent?: boolean;
    localize?: boolean;
  }

  interface Config {
    debug: {
      hooks: boolean;
    };
  }

  interface HooksClass {
    on(hook: string, callback: (...args: unknown[]) => void): number;
    once(hook: string, callback: (...args: unknown[]) => void): number;
    off(hook: string, id: number): void;
    call(hook: string, ...args: unknown[]): boolean;
    callAll(hook: string, ...args: unknown[]): boolean;
  }

  interface ClientSettings {
    register(module: string, key: string, data: SettingRegistration): void;
    registerMenu(module: string, key: string, data: SettingMenuRegistration): void;
    get(module: string, key: string): unknown;
    set(module: string, key: string, value: unknown): Promise<unknown>;
  }

  interface SettingRegistration {
    name?: string;
    hint?: string;
    scope: 'world' | 'client';
    config: boolean;
    type: typeof Boolean | typeof Number | typeof String | typeof Object;
    default?: unknown;
    onChange?: (value: unknown) => void;
  }

  interface SettingMenuRegistration {
    name: string;
    label: string;
    hint: string;
    icon: string;
    type: typeof FormApplication;
    restricted: boolean;
  }

  // Legacy alias for compatibility
  type SettingConfig = SettingRegistration;

  interface Localization {
    localize(stringId: string): string;
    format(stringId: string, data?: Record<string, unknown>): string;
  }

  interface Collection<T> extends Map<string, T> {
    get(key: string): T | undefined;
    getName(name: string): T | undefined;
    filter(predicate: (value: T) => boolean): T[];
    find(predicate: (value: T) => boolean): T | undefined;
    contents: T[];
  }

  interface CompendiumCollection {
    metadata: CompendiumMetadata;
    documentName: string;
    index: Collection<CompendiumIndexEntry>;
    getDocuments(): Promise<Document[]>;
    getDocument(id: string): Promise<Document | null>;
    importDocument(document: Document): Promise<Document>;
    createDocument(data: object): Promise<Document>;
  }

  interface CompendiumMetadata {
    id: string;
    name: string;
    label: string;
    type: string;
    system: string;
    packageType: string;
  }

  interface CompendiumIndexEntry {
    _id: string;
    name: string;
    type?: string;
    img?: string;
  }

  interface Document {
    _id: string;
    id: string;
    name: string;
    type: string;
    img?: string;
    system: Record<string, unknown>;
    items?: Collection<ItemClass>;
    flags: Record<string, unknown>;
    toObject(): object;
  }

  interface FoundryUtils {
    utils: {
      randomID(length?: number): string;
      mergeObject<T extends object>(
        original: T,
        other: Partial<T>,
        options?: { insertKeys?: boolean; insertValues?: boolean; overwrite?: boolean }
      ): T;
    };
  }

  // Dialog
  class DialogClass {
    constructor(data: DialogData, options?: DialogOptions);
    static confirm(config: ConfirmDialogConfig): Promise<boolean>;
    static prompt<T>(config: PromptDialogConfig<T>): Promise<T>;
    render(force?: boolean): this;
    close(): Promise<void>;
  }

  interface DialogData {
    title: string;
    content: string;
    buttons: Record<string, DialogButton>;
    default?: string;
    render?: (html: JQuery) => void;
    close?: () => void;
  }

  interface DialogButton {
    icon?: string;
    label: string;
    callback?: (html: JQuery) => void;
  }

  interface DialogOptions {
    width?: number;
    height?: number | 'auto';
    classes?: string[];
    resizable?: boolean;
  }

  interface ConfirmDialogConfig {
    title: string;
    content: string;
    yes?: () => void;
    no?: () => void;
    defaultYes?: boolean;
  }

  interface PromptDialogConfig<T> {
    title: string;
    content: string;
    callback: (html: JQuery) => T;
    rejectClose?: boolean;
  }

  // Actor
  class ActorClass implements Document {
    _id: string;
    id: string;
    name: string;
    type: string;
    img?: string;
    system: PF2eActorSystem;
    items: Collection<ItemClass>;
    flags: Record<string, unknown>;

    constructor(data: ActorData, context?: object);
    static create(data: ActorData | ActorData[], context?: object): Promise<ActorClass | ActorClass[]>;
    update(data: Partial<ActorData>): Promise<this>;
    delete(): Promise<this>;
    toObject(): ActorData;
    createEmbeddedDocuments(
      type: 'Item',
      data: ItemData[],
      options?: object
    ): Promise<ItemClass[]>;
    getFlag(scope: string, key: string): unknown;
    setFlag(scope: string, key: string, value: unknown): Promise<this>;
  }

  // Flag configuration for type-safe flag access
  interface FlagConfig {
    Actor: Record<string, unknown>;
  }

  interface ActorData {
    _id?: string;
    name: string;
    type: string;
    img?: string;
    system?: Partial<PF2eActorSystem>;
    items?: ItemData[];
    flags?: Record<string, unknown>;
    prototypeToken?: Partial<TokenData>;
  }

  interface TokenData {
    name: string;
    displayName: number;
    actorLink: boolean;
    texture: {
      src: string;
    };
    disposition: number;
    sight: {
      enabled: boolean;
    };
  }

  // Item
  class ItemClass implements Document {
    _id: string;
    id: string;
    name: string;
    type: string;
    img?: string;
    system: PF2eItemSystem;
    flags: Record<string, unknown>;

    constructor(data: ItemData, context?: object);
    static create(data: ItemData | ItemData[], context?: object): Promise<ItemClass | ItemClass[]>;
    update(data: Partial<ItemData>): Promise<this>;
    delete(): Promise<this>;
    toObject(): ItemData;
  }

  // Folder
  class FolderClass implements Document {
    _id: string;
    id: string;
    name: string;
    type: string;
    img?: string;
    system: Record<string, unknown>;
    flags: Record<string, unknown>;
    folder?: FolderClass | null;
    color?: string;

    constructor(data: FolderData, context?: object);
    static create(data: FolderData | FolderData[], context?: object): Promise<FolderClass | FolderClass[]>;
    update(data: Partial<FolderData>): Promise<this>;
    delete(): Promise<this>;
    toObject(): FolderData;
  }

  interface FolderData {
    _id?: string;
    name: string;
    type: string;
    color?: string;
    folder?: string | null;
    flags?: Record<string, unknown>;
  }

  interface ItemData {
    _id?: string;
    name: string;
    type: string;
    img?: string;
    system?: Partial<PF2eItemSystem>;
    flags?: Record<string, unknown>;
  }

  // PF2e Specific Types
  interface PF2eActorSystem {
    abilities?: Record<string, AbilityData>;
    attributes: AttributesData;
    details: DetailsData;
    saves: SavesData;
    skills?: Record<string, SkillData>;
    traits?: TraitsData;
    resources?: ResourcesData;
  }

  interface AbilityData {
    mod: number;
  }

  interface AttributesData {
    hp: {
      value: number;
      max: number;
      temp: number;
      details: string;
    };
    ac: {
      value: number;
      details: string;
    };
    speed: {
      value: number;
      otherSpeeds: SpeedData[];
    };
    perception?: {
      value: number;
      details: string;
      senses?: SenseData[];
      spikedarvision?: boolean;
    };
    immunities?: ImmunityData[];
    weaknesses?: WeaknessData[];
    resistances?: ResistanceData[];
  }

  interface SpeedData {
    type: string;
    value: number;
  }

  interface ImmunityData {
    type: string;
    exceptions?: string[];
  }

  interface WeaknessData {
    type: string;
    value: number;
    exceptions?: string[];
  }

  interface ResistanceData {
    type: string;
    value: number;
    exceptions?: string[];
  }

  interface DetailsData {
    level: {
      value: number;
    };
    alignment?: {
      value: string;
    };
    creatureType?: string;
    source?: {
      value: string;
    };
    blurb?: string;
    publicNotes?: string;
    privateNotes?: string;
  }

  interface SavesData {
    fortitude: SaveData;
    reflex: SaveData;
    will: SaveData;
  }

  interface SaveData {
    value: number;
    saveDetail?: string;
  }

  interface SkillData {
    base: number;
    value: number;
    label: string;
    visible: boolean;
    lore?: boolean;
  }

  interface TraitsData {
    value: string[];
    rarity: 'common' | 'uncommon' | 'rare' | 'unique';
    size: {
      value: string;
    };
    languages?: {
      value: string[];
      details: string;
    };
    senses?: SenseData[];
  }

  interface SenseData {
    type: string;
    acuity?: string;
    value?: string;
    source?: string;
  }

  interface ResourcesData {
    focus?: {
      value: number;
      max: number;
    };
  }

  // ==========================================================================
  // PF2e Hazard System
  // ==========================================================================

  /** IWR (Immunity/Weakness/Resistance) Type Labels */
  type IWRType = 
    // Materials
    | 'abysium' | 'adamantine' | 'cold-iron' | 'dawnsilver' | 'djezet' | 'duskwood'
    | 'inubrix' | 'noqual' | 'orichalcum' | 'peachwood' | 'siccatite' | 'silver'
    // Alignment
    | 'holy' | 'unholy'
    // Traditions
    | 'arcane' | 'divine' | 'occult' | 'primal'
    // Damage types
    | 'acid' | 'aging' | 'air' | 'alchemical' | 'area-damage' | 'auditory' | 'bleed'
    | 'blinded' | 'bludgeoning' | 'clumsy' | 'cold' | 'confused' | 'controlled'
    | 'critical-hits' | 'curse' | 'dazzled' | 'deafened' | 'death-effects'
    | 'detection' | 'disease' | 'doomed' | 'drained' | 'earth' | 'electricity'
    | 'emotion' | 'energy' | 'enfeebled' | 'fascinated' | 'fatigued' | 'fear-effects'
    | 'fire' | 'fleeing' | 'force' | 'fortune-effects' | 'frightened' | 'grabbed'
    | 'healing' | 'illusion' | 'immobilized' | 'inhaled' | 'light' | 'magic'
    | 'mental' | 'metal' | 'misfortune-effects' | 'non-magical' | 'nonlethal-attacks'
    | 'object-immunities' | 'off-guard' | 'olfactory' | 'paralyzed' | 'persistent-damage'
    | 'petrified' | 'physical' | 'piercing' | 'plant' | 'poison' | 'polymorph'
    | 'possession' | 'precision' | 'prediction' | 'prone' | 'radiation' | 'restrained'
    | 'salt-water' | 'scrying' | 'sickened' | 'slashing' | 'sleep' | 'slowed'
    | 'sonic' | 'spell-deflection' | 'spirit' | 'stunned' | 'stupefied'
    | 'swarm-attacks' | 'swarm-mind' | 'time' | 'trip' | 'unarmed-attacks'
    | 'unconscious' | 'visual' | 'vitality' | 'void' | 'water' | 'wood' | 'wounded'
    | 'custom';

  /** Extended immunity data with type labels - simplified for flexibility */
  interface ImmunityDataExtended {
    type: IWRType;
    exceptions?: string[];
    definition?: unknown | null;
    source?: unknown | null;
    typeLabels?: Record<string, string>;
  }

  /** Extended weakness data with type labels - simplified for flexibility */
  interface WeaknessDataExtended {
    type: string; // More flexible to allow any string
    value: number;
    exceptions?: string[];
    definition?: unknown | null;
    source?: unknown | null;
    typeLabels?: Record<string, string>;
  }

  /** Extended resistance data with type labels - simplified for flexibility */
  interface ResistanceDataExtended {
    type: string; // More flexible to allow any string
    value: number;
    exceptions?: string[];
    definition?: unknown | null;
    source?: unknown | null;
    doubleVs?: string[];
    typeLabels?: Record<string, string>;
  }

  /** Statistic modifiers used in hazards */
  interface StatisticModifier {
    slug: string;
    label: string;
    domains: string[];
    modifier: number;
    type: string;
    ability: string | null;
    adjustments: unknown[];
    force: boolean;
    enabled: boolean;
    ignored: boolean;
    source: string | null;
    custom: boolean;
    damageType: string | null;
    damageCategory: string | null;
    critical: unknown | null;
    tags: string[];
    hideIfDisabled: boolean;
    kind: 'modifier';
    predicate: unknown[];
  }

  /** Hazard statistic (AC, Stealth, etc.) - can be simple or complex */
  interface HazardStatistic {
    slug?: string;
    label?: string;
    value: number;
    totalModifier?: number;
    dc: number;
    attribute?: string | null;
    breakdown?: string;
    modifiers?: StatisticModifier[];
    details: string;
  }

  /** Hazard HP data - all fields optional except value and max */
  interface HazardHP {
    value: number;
    max: number;
    temp?: number;
    details?: string;
    negativeHealing?: boolean;
    unrecoverable?: number;
    brokenThreshold?: number;
  }

  /** Hazard flanking properties */
  interface HazardFlanking {
    canFlank: boolean;
    canGangUp: unknown[];
    flankable: boolean;
    offGuardable: boolean;
  }

  /** PF2e Hazard System Data */
  interface PF2eHazardSystem {
    description: {
      value: string;
      gm?: string;
    };
    rules?: unknown[];
    slug: string;
    traits: {
      value: string[];
      rarity?: 'common' | 'uncommon' | 'rare' | 'unique';
    };
    details: {
      level: { value: number };
      disable?: string;
      reset?: string;
      routine?: string;
      isComplex: boolean;
      publication?: {
        title: string;
        authors: string;
        license: string;
        remaster: boolean;
      };
    };
    attributes: {
      hp?: HazardHP | { value: number; max: number };
      ac?: HazardStatistic | { value: number };
      hardness?: number | { value: number };
      stealth?: HazardStatistic | { value: number; dc: number; details: string };
      emitsSound?: 'encounter' | 'always' | 'never';
      flanking?: HazardFlanking;
      hasHealth?: boolean;
    };
    saves?: {
      fortitude?: { value: number; saveDetail?: string };
      reflex?: { value: number; saveDetail?: string };
      will?: { value: number; saveDetail?: string };
    };
    immunities?: ImmunityDataExtended[] | { value: string[] };
    weaknesses?: WeaknessDataExtended[] | Array<{ type: string; value: number }>;
    resistances?: ResistanceDataExtended[] | Array<{ type: string; value: number }>;
  }

  // PF2e Item System Types
  // ==========================================================================
  // Base interface shared by all item types
  // ==========================================================================

  interface PF2eItemSystemBase {
    description: {
      value: string;
    };
    rules?: object[];
    slug?: string;
    level?: {
      value: number;
    };
    traits?: {
      value: PF2eTrait[];
      rarity?: 'common' | 'uncommon' | 'rare' | 'unique';
    };
    quantity?: number;
    price?: {
      per?: number;
      sizeSensitive?: boolean;
      value: {
        cp?: number;
        sp?: number;
        gp?: number;
        pp?: number;
      }
    }
    publication?: {
      authors?: string;
      title?: string;
    }
    identification?: {
      status: 'identified' | 'unidentified' | 'partiallyIdentified';
      unidentified?: {
        name: string;
        img: string;
        data: {
          description: {
            value: string;
          };
        };
      };
      identified?: {
        name: string;
        img: string;
        data: {
          description: {
            value: string;
          };
        };
      };
    };
  }

  // ==========================================================================
  // Action/Ability System
  // ==========================================================================

  interface PF2eActionSystem extends PF2eItemSystemBase {
    actionType?: {
      value: string;
    };
    actions?: {
      value: number | null;
    };
  }

  // ==========================================================================
  // Weapon/Attack System
  // ==========================================================================

  interface PF2eWeaponSystem extends PF2eItemSystemBase {
    usage?: { value: string };
    bulk?: { value: number | string };
    baseItem?: string;
    size?: string;
    damage?: {
      dice: number;
      die: string;
      damageType: string;
      modifier?: number;
      persistent?: {
        dice: number;
        die: string;
        damageType: string;
      };
    };
    damageRolls?: {
      [key: string]: {
        damage: string;
        damageType: string;
      };
    };
    attackEffects?: {
      value: string[];
    };
    bonus?: {
      value: number;
    };
    bonusDamage?: {
      value: number;
    };
    range?: number;
    group?: string;
    hardness?: number;
    hp?: { value: number; max: number; brokenThreshold: number };
    material?: {
      type: 'adamantine' | 'cold-iron' | 'silver' | 'mithral' | 'orichalcum' | 'peachwood' | 'duskwood' | 'djezet' | 'inubrix' | 'noqual' | 'abysium' | 'dawnsilver' | 'siccatite' | 'warpglass' | 'other';
      grade?: 'low' | 'standard' | 'high';
      effects?: string[];
    }
    category?: string;
    runes?: {
      effects?: string[];
      potency?: number;
      property?: Array<WeaponRune>;
      striking?: number;
    }
    equipped?: {
      carryType: 'held' | 'worn' | 'stowed';
      handsHeld?: number;
      invested?: boolean;
    };
  }

  // ==========================================================================
  // Armor System
  // ==========================================================================

  interface PF2eArmorSystem extends PF2eItemSystemBase {
    usage?: { value: string };
    bulk?: { value: number | string };
    baseItem?: string;
    acBonus?: number;
    dexCap?: number;
    checkPenalty?: number;
    speedPenalty?: number;
    strength?: number;
    runes?: {
      effects?: string[];
      potency?: number;
      resiliency?: string;
      property?: Array<WeaponRune>;
    };
    group?: string;
    category?: string;
    equipped?: {
      carryType: 'held' | 'worn' | 'stowed';
      handsHeld?: number;
      invested?: boolean;
    };
    price?: {
      value: {
        pp?: number;
        gp?: number;
        sp?: number;
        cp?: number;
      };
    };
  }

  // ==========================================================================
  // Equipment System (Wondrous items, artifacts, etc.)
  // ==========================================================================

  interface PF2eEquipmentSystem extends PF2eItemSystemBase {
    usage?: { value: string };
    bulk?: { value: number | string };
    equipped?: {
      carryType: 'held' | 'worn' | 'stowed';
      handsHeld?: number;
      invested?: boolean;
    };
    price?: {
      value: {
        pp?: number;
        gp?: number;
        sp?: number;
        cp?: number;
      };
    };
    quantity?: number;
  }

  // ==========================================================================
  // Consumable System (Potions, scrolls, elixirs, etc.)
  // ==========================================================================

  interface PF2eConsumableSystem extends PF2eItemSystemBase {
    usage?: { value: string };
    bulk?: { value: number | string };
    consumableType?: { value: string };
    uses?: { value: number; max: number; autoDestroy: boolean };
    quantity?: number;
    spell?: { name: string; level: number };
    price?: {
      value: {
        pp?: number;
        gp?: number;
        sp?: number;
        cp?: number;
      };
    };
  }

  // ==========================================================================
  // Spell System
  // ==========================================================================

  interface PF2eSpellSystem extends PF2eItemSystemBase {
    traditions?: {
      value: string[];
    };
    time?: {
      value: string;
    };
    components?: {
      value: string[];
    };
    area?: {
      value: number;
      type: 'emanation' | 'burst' | 'cone' | 'line' | 'cylinder';
    };
    range?: {
      value: string;
    };
    target?: {
      value: string;
    };
    defense?: {
      save?: {
        statistic: 'fortitude' | 'reflex' | 'will';
        basic: boolean;
      };
    };
    duration?: {
      value: string;
      sustained?: boolean;
    };
    damage?: {
      formula?: string;
      type?: string;
      dice?: number;
      die?: string;
      damageType?: string;
    };
    heightening?: {
      type: 'interval' | 'fixed';
      interval?: number;
      damage?: {
        formula: string;
        type: string;
      };
      levels?: Record<number, object>;
    };
    spellType?: {
      value: string;
    };
    cost?: {
      value: string;
    };
  }

  // ==========================================================================
  // Union Type for All Item Systems
  // ==========================================================================

  type PF2eItemSystem = 
    | PF2eItemSystemBase
    | PF2eActionSystem
    | PF2eWeaponSystem
    | PF2eArmorSystem
    | PF2eEquipmentSystem
    | PF2eConsumableSystem
    | PF2eSpellSystem;

  // jQuery (minimal subset used by Foundry)
  interface JQuery {
    find(selector: string): JQuery;
    val(): string | number | string[] | undefined;
    val(value: string | number | string[]): JQuery;
    prop(property: string): unknown;
    prop(property: string, value: unknown): JQuery;
    html(): string;
    html(content: string): JQuery;
    on(event: string, handler: (e: Event) => void): JQuery;
    [index: number]: HTMLElement;
  }

  // NPC Categories for organization
  type NPCCategory = 
    | 'major-npc'
    | 'harbinger-resident'
    | 'generic-npc'
    | 'fiend'
    | 'cultist';

  // Note: SystemWeaponReference, SystemSpellReference, SystemActionReference types 
  // are defined in src/data/system-items.ts as the canonical source
  // They are re-exported from src/data/harbinger-residents.ts as NPCItemEntry

  interface HarbingerNPC {
    id: string;
    category: NPCCategory;
    data: ActorData;
    /** Items can be inline ItemData or references to system compendium items */
    items: unknown[]; // Use unknown[] here - actual type is NPCItemEntry from harbinger-residents.ts
  }

    // JournalEntry (V13 structure with pages)
  class JournalEntryClass implements Document {
    _id: string;
    id: string;
    name: string;
    type: 'JournalEntry';
    img?: string;
    pages: JournalEntryPageData[];
    folder?: string;
    sort?: number;
    ownership?: Record<string, number>;
    flags: Record<string, unknown>;
    
    static create(data: JournalEntryData): Promise<JournalEntryClass>;
    static createDocuments(data: JournalEntryData[]): Promise<JournalEntryClass[]>;
    update(data: Partial<JournalEntryData>): Promise<this>;
    delete(): Promise<this>;
    toObject(): object;
    get system(): Record<string, unknown>;
    get items(): undefined;
  }

  interface JournalEntryData {
    _id?: string;
    name: string;
    pages?: JournalEntryPageData[];
    folder?: string;
    sort?: number;
    ownership?: Record<string, number>;
    flags?: Record<string, unknown>;
  }

  interface JournalEntryPageData {
    _id?: string;
    name: string;
    type: 'text' | 'image' | 'pdf' | 'video';
    title?: {
      show: boolean;
      level: number;
    };
    text?: {
      content: string;
      format: number; // 1 = HTML, 2 = Markdown
      markdown?: string;
    };
    src?: string;
    video?: {
      controls: boolean;
      loop: boolean;
      autoplay: boolean;
      volume: number;
    };
    sort?: number;
    ownership?: Record<string, number>;
    flags?: Record<string, unknown>;
  }
}



// Re-export types for use in other modules
export type { 
  ActorData, 
  ItemData, 
  HarbingerNPC, 
  NPCCategory,
  // Item system types
  PF2eItemSystemBase,
  PF2eActionSystem,
  PF2eWeaponSystem,
  PF2eArmorSystem,
  PF2eEquipmentSystem,
  PF2eConsumableSystem,
  PF2eSpellSystem,
  PF2eItemSystem,
  // Hazard system types
  PF2eHazardSystem,
  HazardHP,
  HazardStatistic,
  HazardFlanking,
  IWRType,
  ImmunityDataExtended,
  WeaknessDataExtended,
  ResistanceDataExtended,
  StatisticModifier,
};

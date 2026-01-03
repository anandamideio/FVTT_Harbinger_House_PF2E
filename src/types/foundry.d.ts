/**
 * Type declarations for FoundryVTT V13 and PF2e System
 * This is a subset of types needed for this module
 */

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
      value: string[];
      rarity?: 'common' | 'uncommon' | 'rare' | 'unique';
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
    damage?: {
      dice: number;
      die: string;
      damageType: string;
      modifier?: number;
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
    range?: number;
    group?: string;
    category?: string;
    potencyRune?: { value: number };
    strikingRune?: { value: string };
    propertyRune1?: { value: string };
    propertyRune2?: { value: string };
    propertyRune3?: { value: string };
    propertyRune4?: { value: string };
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
    potencyRune?: { value: number };
    resiliencyRune?: { value: string };
    propertyRune1?: { value: string };
    propertyRune2?: { value: string };
    propertyRune3?: { value: string };
    propertyRune4?: { value: string };
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
};

export type ScreenMode = 'TITLE' | 'MAP' | 'FISHING' | 'BUNKER';

export type WaterType = 'river' | 'lake' | 'swamp' | 'anomaly_lake';

export type WeatherType = 'clear' | 'fog' | 'rain' | 'anomaly_surge';

export type LocationId =
  | 'rokitne_bunker'
  | 'rokitne'
  | 'tomashgorod'
  | 'blazhove'
  | 'bilovizh'
  | 'snovydovychi'
  | 'masevychi'
  | 'kysorychi'
  | 'karpylivka'
  | 'borove'
  | 'rivnensky_reserve';

export type CharacterId = 'taras' | 'baryga' | 'oleg' | 'velychko';

export type RodType = 'float' | 'feeder' | 'spinning';

export type FaunaKind = 'fish' | 'crayfish' | 'beetle' | 'insect' | 'wildlife' | 'mutant';

export type FishSizeClass = 'small' | 'medium' | 'large' | 'trophy';

export type Fauna3DBodyShape =
  | 'fusiform'
  | 'deep'
  | 'eel'
  | 'catfish'
  | 'sturgeon'
  | 'crayfish'
  | 'beetle'
  | 'insect'
  | 'frog'
  | 'turtle'
  | 'leech'
  | 'snake';

export interface Fauna3DModelSpec {
  bodyShape: Fauna3DBodyShape;
  primaryHex: string;
  secondaryHex: string;
  finHex: string;
  eyeCount?: number;
  hasClaws?: boolean;
  glowHex?: string;
  electricArcs?: boolean;
  armorPlates?: boolean;
  scaleFactor?: number;
}

export interface LocationDef {
  id: LocationId;
  name: string;
  regionLabel: string;
  isBunker?: boolean;
  backdropPhotoUrl?: string;
  depthRangeM: [number, number];
  waterType: WaterType;
  waterLabel: string;
  mapX: number; // percentage 0..100 on the Polissia map
  mapY: number; // percentage 0..100 on the Polissia map
  pinTheme: 'bunker' | 'river' | 'anomaly' | 'swamp';
  radiationLevel: number; // 0..3 (required radSuit tier to avoid rad damage)
  anomalyActivity: number; // 0..100
  dangerRating: string;
  maxCastDistanceM: number;
  currentSpeed: number; // 0 for still lake, >0 for river current
  waterColorDeep: string;
  waterColorShallow: string;
  fogColor: string;
  glowColor: string;
  description: string;
  bestTimeHint: string;
  speciesIds: string[];
}

export interface FishSpeciesDef {
  id: string;
  name: string;
  latinName: string;
  faunaKind?: FaunaKind;
  isMutant: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  sizeClass?: FishSizeClass;
  preferredBaits: string[];
  preferredTime: 'day' | 'night' | 'dusk' | 'any';
  minWeightKg: number;
  maxWeightKg: number;
  basePricePerKg: number;
  fightPower: number; // 1..10 affects line tension and stamina
  stamina: number; // 1..10
  accentColor: string;
  silhouetteKey: string;
  preferredDepth?: 'surface' | 'mid' | 'bottom' | 'any';
  habitat?: string;
  behavior?: string;
  uniqueTrait?: string;
  model3d?: Fauna3DModelSpec;
  description: string;
  anomalyNote?: string;
}

export interface CaughtFish {
  uid: string;
  speciesId: string;
  faunaKind?: FaunaKind;
  weightKg: number;
  lengthCm: number;
  value: number;
  isTrophy: boolean;
  isMutant: boolean;
  locationId: LocationId;
  caughtDay: number;
}

export interface FishingJournalEntry {
  uid: string;
  speciesId: string;
  name: string;
  faunaKind: FaunaKind;
  weightKg: number;
  lengthCm: number;
  caughtDay: number;
  clockTime: string;
  realTimestamp: number;
  locationId: LocationId;
  locationName: string;
  baitId: string;
  baitName: string;
  rodId: string;
  rodName: string;
  isRecord: boolean;
  isMutant: boolean;
  isTrophy: boolean;
}

export type LootItemCategory = 'relic' | 'artifact' | 'consumable';

export type MarketGroup = 'scrap' | 'jewelry' | 'relics' | 'artifacts';

export interface LootItemDef {
  id: string;
  name: string;
  category: LootItemCategory;
  marketGroup?: MarketGroup;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  sellValue: number;
  buyPrice?: number;
  minAnomalyReq: number;
  weightKg: number;
  accentColor: string;
  iconKey: string;
  description: string;
  effectLabel?: string;
  sanityRestore?: number;
  staminaRestore?: boolean;
  isFood?: boolean;
}

export interface MarketBundleDef {
  id: string;
  name: string;
  price: number;
  tag: string;
  description: string;
  baits?: Record<string, number>;
  groundbaits?: Record<string, number>;
  consumables?: Record<string, number>;
}

export interface FoundLootEntry {
  uid: string;
  itemId: string;
  locationId: LocationId;
  foundDay: number;
  value: number;
}

export interface RodDef {
  id: string;
  name: string;
  type: RodType;
  typeLabel: string;
  lengthM: number;
  weightG: number;
  testRangeLabel: string;
  maxLoadKg: number;
  castBonusM: number;
  sensitivity: number;
  maxDurability: number;
  price: number;
  description: string;
}

export interface ReelDef {
  id: string;
  name: string;
  dragPowerKg: number;
  retrieveSpeed: number;
  lineCapacityM: number;
  gearRatio: string;
  maxDurability: number;
  price: number;
  description: string;
}

export interface LineDef {
  id: string;
  name: string;
  lineType: 'thin' | 'medium' | 'thick' | 'mono' | 'fluoro' | 'braid' | 'anomaly';
  thicknessMm: number;
  lengthM: number;
  maxTensionKg: number;
  visibilityPenalty: number;
  maxDurability: number;
  price: number;
  description: string;
}

export interface FloatDef {
  id: string;
  name: string;
  style:
    | 'wood'
    | 'goose'
    | 'foam'
    | 'plastic'
    | 'balsa'
    | 'pencil'
    | 'ball'
    | 'waggler'
    | 'current'
    | 'livebait'
    | 'catfish'
    | 'night_glow'
    | 'electronic';
  visibilityBonus: number;
  currentStability: number;
  biteSensitivityBonus: number;
  nightGlow: boolean;
  electronic: boolean;
  colorHex: string;
  tipHex: string;
  price: number;
  description: string;
}

export interface HookDef {
  id: string;
  name: string;
  hookSize: 'small' | 'medium' | 'large';
  hookKind: 'single' | 'double' | 'treble' | 'offset';
  biteRateBonus: number;
  hookRetentionBonus: number;
  snagRiskMod: number;
  price: number;
  description: string;
}

export interface SinkerDef {
  id: string;
  name: string;
  weightG: number;
  castBonusM: number;
  bottomStability: number;
  price: number;
  description: string;
}

export interface FeederDef {
  id: string;
  name: string;
  feederKind: 'spring' | 'mesh' | 'closed' | 'feeder' | 'carp';
  capacityG: number;
  biteRateBoost: number;
  weightBoost: number;
  price: number;
  description: string;
}

export interface AccessoryDef {
  id: string;
  name: string;
  accessoryKind:
    | 'swivel'
    | 'snap'
    | 'leader'
    | 'stopper'
    | 'ring'
    | 'antitangle'
    | 'alarm'
    | 'bell';
  biteSpeedBonus: number;
  snagResistBonus: number;
  lineBreakResist: number;
  hasAcousticAlarm?: boolean;
  price: number;
  description: string;
}

export interface BottomRigDef {
  id: string;
  name: string;
  maxLoadKg: number;
  castBonusM: number;
  biteRateBonus: number;
  snagRiskMod: number;
  hasElectronicAlarm?: boolean;
  isNightRig?: boolean;
  maxDurability: number;
  price: number;
  description: string;
}

export interface BaitDef {
  id: string;
  name: string;
  category: 'natural' | 'plant' | 'lure' | 'anomaly';
  pricePerPack: number;
  packSize: number;
  biteSpeedBonus: number;
  mutantBonus: number;
  predatorBonus?: number;
  depthLayer?: 'surface' | 'mid' | 'bottom' | 'any';
  description: string;
}

export interface FlavoringDef {
  id: string;
  name: string;
  scentKey: string;
  pricePerPack: number;
  packSize: number;
  biteRateBoost: number;
  weightBoost: number;
  targetNote: string;
  description: string;
}

export interface GroundbaitDef {
  id: string;
  name: string;
  pricePerPack: number;
  packSize: number;
  biteRateBoost: number;
  weightBoost: number;
  mutantBoost: number;
  targetNote: string;
  description: string;
}

export interface GearItemDef {
  id: string;
  name: string;
  gearGroup: 'net' | 'storage' | 'tool' | 'camp' | 'boots' | 'light' | 'tech' | 'boat';
  price: number;
  maxDurability: number;
  keepnetBonusKg?: number;
  snagEscapeBonus?: number;
  landingBonus?: number;
  radResistBonus?: number;
  sanityShieldBonus?: number;
  castBonusM?: number;
  biteSpeedBonus?: number;
  fightPowerBonus?: number;
  description: string;
  effectLabel: string;
  /** Premium-market prices; these items cannot be bought with ordinary hryvnias. */
  goldPrice?: number;
  amberPrice?: number;
}

export interface GearUpgradeDef {
  level: number;
  name: string;
  capacityKg?: number;
  radResist?: number;
  price: number;
  description: string;
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  callsign: string;
  role: string;
  roomName: string;
  greeting: string;
  bio: string;
  accentHex: string;
}

export interface QuestDef {
  id: string;
  giver: CharacterId;
  title: string;
  description: string;
  dialoguePrompt: string;
  dialogueComplete: string;
  type: 'catch_species' | 'catch_weight' | 'catch_mutants' | 'catch_at_location' | 'find_loot';
  targetSpeciesId?: string;
  targetLocationId?: LocationId;
  targetCount: number;
  rewardCredits: number;
  rewardXp: number;
  rewardGoldCoins?: number;
  rewardAmberShards?: number;
  rewardBaitId?: string;
  rewardBaitQty?: number;
}

export interface DiscoveryEntry {
  caughtCount: number;
  maxWeightKg: number;
  firstLocationId: LocationId;
}

export interface PersonalRecordEntry {
  maxWeightKg: number;
  maxLengthCm: number;
  caughtDay: number;
  locationId: LocationId;
}

export interface SaveState {
  day: number;
  timeOfDay: number; // 0..24
  weather: WeatherType;
  credits: number; // ordinary hryvnias (UAH)
  goldCoins: number;
  amberShards: number;
  xp: number;
  level: number;
  radiation: number; // 0..100
  sanity: number; // 0..100
  stamina: number; // 0..100
  energyBoostUntilMs: number;
  currentLocationId: LocationId;
  equippedRodId: string;
  equippedReelId: string;
  equippedLineId: string;
  equippedBaitId: string;
  equippedFloatId: string;
  equippedHookId: string;
  equippedSinkerId: string;
  equippedFeederId: string;
  equippedBottomRigId: string;
  equippedFlavoringId: string;
  equippedAccessoryIds: string[];
  equippedGearIds: string[];
  keepnetLevel: number;
  radSuitLevel: number;
  ownedRodIds: string[];
  ownedReelIds: string[];
  ownedLineIds: string[];
  ownedFloatIds: string[];
  ownedHookIds: string[];
  ownedSinkerIds: string[];
  ownedFeederIds: string[];
  ownedAccessoryIds: string[];
  ownedBottomRigIds: string[];
  ownedGearIds: string[];
  baitInventory: Record<string, number>;
  flavoringInventory: Record<string, number>;
  groundbaitInventory: Record<string, number>;
  consumableInventory: Record<string, number>;
  itemDurability: Record<string, number>; // 0..100 (%)
  foundLoot: FoundLootEntry[];
  activeGroundbaitByLoc: Partial<Record<LocationId, { groundbaitId: string; castsLeft: number }>>;
  keepnet: CaughtFish[];
  discovered: Record<string, DiscoveryEntry>;
  personalRecords: Record<string, PersonalRecordEntry>;
  fishingJournal: FishingJournalEntry[];
  questProgress: Record<string, number>;
  completedQuestIds: string[];
  visitedLocationIds: LocationId[];
  totalCaughtCount: number;
  totalEarnedCredits: number;
  haggleDay?: number;
  haggleBonusPct?: number;
}

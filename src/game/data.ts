import { BAITS_CATALOG, FLAVORINGS_CATALOG } from './catalogBaitsLures';
import {
  ALL_FAUNA_CATALOG,
  CRAYFISH_SPECIES as CRAYFISH_CAT,
  NAMED_MUTANTS,
  WILDLIFE_SPECIES as WILDLIFE_CAT,
  getExtraSpeciesIdsForLocation,
} from './catalogFauna';
import { LOOT_ITEMS_CATALOG } from './catalogLoot';
import {
  ACCESSORIES_CATALOG,
  BOTTOM_RIGS_CATALOG,
  FEEDERS_CATALOG,
  FLOATS_CATALOG,
  GEAR_ITEMS_CATALOG,
  HOOKS_CATALOG,
  LINES_CATALOG,
  REELS_CATALOG,
  RODS_CATALOG,
  SINKERS_CATALOG,
} from './catalogTackle';
import {
  AccessoryDef,
  BaitDef,
  BottomRigDef,
  CharacterDef,
  CharacterId,
  FeederDef,
  FishSpeciesDef,
  FlavoringDef,
  FloatDef,
  GearItemDef,
  GearUpgradeDef,
  GroundbaitDef,
  HookDef,
  LineDef,
  LocationDef,
  LocationId,
  LootItemDef,
  MarketBundleDef,
  MarketGroup,
  QuestDef,
  ReelDef,
  RodDef,
  SinkerDef,
} from './types';

export const MAP_IMAGE_URL =
  `${import.meta.env.BASE_URL}assets/aistudio/Creating_anomalous_Polissia_fish…_127c1c69_2K.jpg`;

export const TOMASHGOROD_PHOTO_URL =
  `${import.meta.env.BASE_URL}assets/aistudio/FB_IMG_1795501144474_c3dcf921.jpg`;

export const ROKITNE_PHOTO_URL =
  `${import.meta.env.BASE_URL}assets/aistudio/Make_second_location_similar_37788a2b_2K_f2d6511e.jpg`;

export const BUNKER_PHOTO_URL =
  `${import.meta.env.BASE_URL}Improve_gaming_graphics_quality_fd249ac9_2K.jpg`;

const RAW_LOCATIONS: Record<LocationId, LocationDef> = {
  rokitne_bunker: {
    id: 'rokitne_bunker',
    name: 'Бункер «Щит-04» · Рокитне',
    regionLabel: 'Центральна база сталкерів і рибалок',
    isBunker: true,
    backdropPhotoUrl: BUNKER_PHOTO_URL,
    depthRangeM: [0, 0],
    waterType: 'lake',
    waterLabel: 'Підземне сховище',
    mapX: 46.9,
    mapY: 44.8,
    pinTheme: 'bunker',
    radiationLevel: 0,
    anomalyActivity: 12,
    dangerRating: 'Безпечна зона',
    maxCastDistanceM: 0,
    currentSpeed: 0,
    waterColorDeep: '#102418',
    waterColorShallow: '#1f3f2c',
    fogColor: '#0e1713',
    glowColor: '#22c55e',
    description:
      'Укріплений радянський бункер під околицею Рокитного. Тут продають улов, купують професійні снасті, наживки й прикормки, ремонтують вудилища та беруть контракти у місцевих персонажів.',
    bestTimeHint: 'Відкрито цілодобово',
    speciesIds: [],
  },
  rokitne: {
    id: 'rokitne',
    name: 'Рокитне · Річка Льва під мостом',
    regionLabel: 'Лісова річка з гравійним берегом, корінням сосен і містком',
    backdropPhotoUrl: ROKITNE_PHOTO_URL,
    depthRangeM: [1.4, 6.4],
    waterType: 'river',
    waterLabel: 'Лісова річка (течія)',
    mapX: 41.7,
    mapY: 45.5,
    pinTheme: 'river',
    radiationLevel: 0,
    anomalyActivity: 28,
    dangerRating: 'Низька (Безпечно)',
    maxCastDistanceM: 38,
    currentSpeed: 0.36,
    waterColorDeep: '#0a191e',
    waterColorShallow: '#21444a',
    fogColor: '#161f22',
    glowColor: '#38bdf8',
    description:
      'Мальовничий вигин річки на околиці Рокитного: дзеркальне плесо під рожевим небом, дерев’яний місток у лісі та кам’яниста галька на мілководді. Під корінням сосен і біля опор мосту тримаються головень, язь, щука, лящ, вусач, раки та рідкісні аномальні види.',
    bestTimeHint: 'Світанок і вечір · Черв’як, мотиль, блешня, живець, фідер під місток',
    speciesIds: [
      'crucian',
      'silver_crucian',
      'roach',
      'rudd',
      'bleak',
      'gudgeon',
      'ruffe',
      'monkey_goby',
      'chub',
      'ide',
      'perch_river',
      'pike_river',
      'asp',
      'zander',
      'bream',
      'silver_bream',
      'nase',
      'vimba',
      'barbel',
      'burbot',
      'catfish',
      'crucian_glow',
      'pike_ghost',
    ],
  },
  masevychi: {
    id: 'masevychi',
    name: 'Масевичі · Тихий потік',
    regionLabel: 'Лісова річечка біля дерев’яного мосту',
    depthRangeM: [1.1, 3.6],
    waterType: 'river',
    waterLabel: 'Річка (помірна течія)',
    mapX: 47.6,
    mapY: 52.8,
    pinTheme: 'river',
    radiationLevel: 0,
    anomalyActivity: 18,
    dangerRating: 'Низька (Безпечно)',
    maxCastDistanceM: 28,
    currentSpeed: 0.45,
    waterColorDeep: '#0f2421',
    waterColorShallow: '#254a40',
    fogColor: '#182520',
    glowColor: '#34d399',
    description:
      'Спокійне русло серед вільх і сосен неподалік від бункера. Ідеальне місце для старту: чисті карасі, плітка, річковий окунь, раки та неглибокі щучі засідки.',
    bestTimeHint: 'Світанок і день · Черв’як, мотиль, опариш',
    speciesIds: [
      'crucian',
      'silver_crucian',
      'roach',
      'rudd',
      'bleak',
      'gudgeon',
      'ruffe',
      'monkey_goby',
      'chub',
      'perch_river',
      'pike_river',
      'crucian_glow',
    ],
  },
  karpylivka: {
    id: 'karpylivka',
    name: 'Карпилівка · Очеретяне озеро',
    regionLabel: 'Заросле тихе плесо з лататтям',
    depthRangeM: [1.6, 5.4],
    waterType: 'lake',
    waterLabel: 'Озеро (стояча вода)',
    mapX: 46.1,
    mapY: 66.2,
    pinTheme: 'river',
    radiationLevel: 0,
    anomalyActivity: 24,
    dangerRating: 'Низька',
    maxCastDistanceM: 36,
    currentSpeed: 0.06,
    waterColorDeep: '#0d2029',
    waterColorShallow: '#1f4954',
    fogColor: '#152229',
    glowColor: '#38bdf8',
    description:
      'Глибоке лісове озеро з широкими смугами латаття та комишу. Сюди приходять по великих лящів, золотавих линів, білого амура і дзеркального коропа.',
    bestTimeHint: 'Ранок і вечір · Кукурудза, бойли, прикормка на коропа',
    speciesIds: [
      'crucian',
      'silver_crucian',
      'bream',
      'silver_bream',
      'blue_bream',
      'rudd',
      'ruffe',
      'tench',
      'carp_mirror',
      'grass_carp',
      'silver_carp',
      'amur_sleeper',
      'roach',
      'tench_moss',
    ],
  },
  tomashgorod: {
    id: 'tomashgorod',
    name: 'Томашгород · Польський кар’єрчик',
    regionLabel: 'Дзеркальне кар’єрне плесо біля соснового берега й містка',
    backdropPhotoUrl: TOMASHGOROD_PHOTO_URL,
    depthRangeM: [2.4, 9.2],
    waterType: 'lake',
    waterLabel: 'Гранітний кар’єр',
    mapX: 37.5,
    mapY: 31.2,
    pinTheme: 'river',
    radiationLevel: 0,
    anomalyActivity: 30,
    dangerRating: 'Середня',
    maxCastDistanceM: 44,
    currentSpeed: 0.14,
    waterColorDeep: '#0c1f2c',
    waterColorShallow: '#214c61',
    fogColor: '#16242d',
    glowColor: '#38bdf8',
    description:
      'Глибоке дзеркальне плесо серед гранітних уступів, сосен і старої альтанки на протилежному березі. З дерев’яного пірсу зручно закидати під скелі на судака, жереха, форель, трофейну щуку та рідкісні донні знахідки.',
    bestTimeHint: 'День і вечір · Блешня, воблер, живець, фідер під гранітну стінку',
    speciesIds: [
      'asp',
      'zander',
      'volga_zander',
      'pike_river',
      'perch_river',
      'bream',
      'silver_bream',
      'chub',
      'ide',
      'bleak',
      'sabrefish',
      'nase',
      'vimba',
      'gudgeon',
      'barbel',
      'brown_trout',
      'grass_carp',
      'silver_carp',
      'monkey_goby',
      'zander_crystal',
    ],
  },
  snovydovychi: {
    id: 'snovydovychi',
    name: 'Сновидовичі · Затоплена заплава',
    regionLabel: 'Старі опори й глибокі річкові ями',
    depthRangeM: [2.8, 10.5],
    waterType: 'river',
    waterLabel: 'Річкова заплава',
    mapX: 59.1,
    mapY: 41.6,
    pinTheme: 'river',
    radiationLevel: 1,
    anomalyActivity: 42,
    dangerRating: 'Підвищена (Радіація I)',
    maxCastDistanceM: 46,
    currentSpeed: 0.55,
    waterColorDeep: '#0d1c24',
    waterColorShallow: '#223d45',
    fogColor: '#162024',
    glowColor: '#2dd4bf',
    description:
      'Широка заплава зі старими бетонними палями. У донних ямах полюють важкі соми, мині, судаки-мутанти й небезпечні аномальні раки.',
    bestTimeHint: 'Вечір і ніч · Фідер, донка, живець, виповзок',
    speciesIds: [
      'catfish',
      'burbot',
      'bream',
      'silver_bream',
      'blue_bream',
      'zander',
      'volga_zander',
      'wild_carp',
      'sabrefish',
      'nase',
      'vimba',
      'chub',
      'ide',
      'barbel',
      'bleak',
      'ruffe',
      'monkey_goby',
      'european_eel',
      'sterlet',
      'pike_ghost',
      'catfish_glow',
    ],
  },
  kysorychi: {
    id: 'kysorychi',
    name: 'Кисоричі · Торф’яне болото',
    regionLabel: 'Туманні торф’яники на межі аномалії',
    depthRangeM: [1.4, 4.8],
    waterType: 'swamp',
    waterLabel: 'Торф’яне болото',
    mapX: 50.1,
    mapY: 59.6,
    pinTheme: 'swamp',
    radiationLevel: 1,
    anomalyActivity: 58,
    dangerRating: 'Небезпечна (Радіація I)',
    maxCastDistanceM: 32,
    currentSpeed: 0.02,
    waterColorDeep: '#12190c',
    waterColorShallow: '#2f3a1b',
    fogColor: '#1f2314',
    glowColor: '#a3e635',
    description:
      'Темні торф’яні кар’єри, вкриті зеленуватим туманом. Тут живуть давні болотяні лини, в’юни, торф’яні раки, п’явки та слизькі мутанти з фосфоресцентною лускою.',
    bestTimeHint: 'Будь-який час · Черв’як, п’явка, личинка, болотна прикормка',
    speciesIds: [
      'tench',
      'loach',
      'silver_crucian',
      'amur_sleeper',
      'european_eel',
      'crucian_glow',
      'tench_moss',
      'swamp_eel',
    ],
  },
  bilovizh: {
    id: 'bilovizh',
    name: 'Біловіж · Глухий вир',
    regionLabel: 'Північно-східне лісове болото і стариця',
    depthRangeM: [2.2, 7.8],
    waterType: 'swamp',
    waterLabel: 'Лісове болото',
    mapX: 64.6,
    mapY: 28.5,
    pinTheme: 'swamp',
    radiationLevel: 2,
    anomalyActivity: 68,
    dangerRating: 'Висока (Радіація II)',
    maxCastDistanceM: 38,
    currentSpeed: 0.18,
    waterColorDeep: '#101421',
    waterColorShallow: '#242e47',
    fogColor: '#151926',
    glowColor: '#818cf8',
    description:
      'Похмура стариця посеред старого бору. Вода тут густа й темна, а в глибині ночами світяться контури хижих мутантів та гігантських болотяних жаб.',
    bestTimeHint: 'Сутінки і ніч · Живець, жаба, аномальний реагент',
    speciesIds: [
      'catfish',
      'burbot',
      'amur_sleeper',
      'european_eel',
      'pike_ghost',
      'swamp_eel',
      'carp_mutant',
    ],
  },
  borove: {
    id: 'borove',
    name: 'Борове · Смарагдові плавні',
    regionLabel: 'Радіоактивні розливи на півдні',
    depthRangeM: [3.2, 12.4],
    waterType: 'anomaly_lake',
    waterLabel: 'Аномальні плавні',
    mapX: 48.2,
    mapY: 76.8,
    pinTheme: 'anomaly',
    radiationLevel: 2,
    anomalyActivity: 82,
    dangerRating: 'Критична (Радіація II)',
    maxCastDistanceM: 48,
    currentSpeed: 0.25,
    waterColorDeep: '#091f16',
    waterColorShallow: '#145335',
    fogColor: '#112219',
    glowColor: '#10b981',
    description:
      'Затоплені південні луки, де з дна піднімаються смарагдові бульбашки газу. Риба тут виростає до гігантських розмірів, а в мулі ховаються панцирні мутанти.',
    bestTimeHint: 'Вечір і ніч · Потрібен костюм хімзахисту рів. 2+',
    speciesIds: [
      'carp_mirror',
      'wild_carp',
      'grass_carp',
      'silver_carp',
      'carp_mutant',
      'catfish_glow',
      'tench_moss',
      'leviathan_polissia',
    ],
  },
  blazhove: {
    id: 'blazhove',
    name: 'Блажове · Блакитний розлом',
    regionLabel: 'Північне аномальне озеро',
    depthRangeM: [4.5, 16.5],
    waterType: 'anomaly_lake',
    waterLabel: 'Аномальне озеро',
    mapX: 56.1,
    mapY: 22.8,
    pinTheme: 'anomaly',
    radiationLevel: 3,
    anomalyActivity: 94,
    dangerRating: 'Екстремальна (Радіація III)',
    maxCastDistanceM: 55,
    currentSpeed: 0.12,
    waterColorDeep: '#071c2e',
    waterColorShallow: '#0e587a',
    fogColor: '#0c1c29',
    glowColor: '#22d3ee',
    description:
      'Найбільш загадкова водойма Полісся: вода світиться холодним блакитним сяйвом, компас тремтить, а з дна виринають рідкісні кристалічні мутанти та «ЙОБНУТИЙ РАК».',
    bestTimeHint: 'Ніч і викид · Потрібен захисний костюм рів. 3',
    speciesIds: [
      'sterlet',
      'zander_crystal',
      'catfish_glow',
      'pike_ghost',
      'swamp_eel',
      'leviathan_polissia',
    ],
  },
  rivnensky_reserve: {
    id: 'rivnensky_reserve',
    name: 'Заповідник «Рівненський»',
    regionLabel: 'Первісні лісові озера й сфагнові болота',
    depthRangeM: [2.0, 8.2],
    waterType: 'lake',
    waterLabel: 'Заповідне озеро',
    mapX: 28.5,
    mapY: 36.0,
    pinTheme: 'river',
    radiationLevel: 1,
    anomalyActivity: 48,
    dangerRating: 'Помірна (Радіація I)',
    maxCastDistanceM: 44,
    currentSpeed: 0.08,
    waterColorDeep: '#09221d',
    waterColorShallow: '#1b5446',
    fogColor: '#13241f',
    glowColor: '#34d399',
    description:
      'Незаймані болота й кришталеві вікна води серед прадавніх сосен. Сюди пускають лише за спецзавданням, але тут мешкають рекордні трофеї, білуги й осетри.',
    bestTimeHint: 'Світанок · Кукурудза, блешня, воблер, аномальний реагент',
    speciesIds: [
      'carp_mirror',
      'wild_carp',
      'tench',
      'rudd',
      'ide',
      'asp',
      'brown_trout',
      'sterlet',
      'zander_crystal',
      'carp_mutant',
      'crucian_glow',
    ],
  },
};

export const LOCATIONS: Record<LocationId, LocationDef> = Object.fromEntries(
  Object.entries(RAW_LOCATIONS).map(([id, loc]) => {
    if (loc.isBunker) return [id, loc];
    const extras = getExtraSpeciesIdsForLocation(
      loc.id,
      loc.waterType,
      loc.anomalyActivity
    );
    const mergedIds = Array.from(new Set([...loc.speciesIds, ...extras]));
    return [id, { ...loc, speciesIds: mergedIds }];
  })
) as Record<LocationId, LocationDef>;

// ПОВНА ФАУНА (риби, раки, жуки, комахи, водяна живність і мутанти)
export const FISH_SPECIES: FishSpeciesDef[] = ALL_FAUNA_CATALOG;

export const FISH_ONLY_SPECIES: FishSpeciesDef[] = FISH_SPECIES.filter(
  (s) => !s.faunaKind || s.faunaKind === 'fish'
);
export const CRAYFISH_SPECIES: FishSpeciesDef[] = CRAYFISH_CAT;
export const WILDLIFE_SPECIES: FishSpeciesDef[] = WILDLIFE_CAT;
export const MUTANT_SPECIES: FishSpeciesDef[] = FISH_SPECIES.filter((s) => s.isMutant);
export const NAMED_MUTANT_SPECIES: FishSpeciesDef[] = NAMED_MUTANTS;

export const FISH_MAP: Record<string, FishSpeciesDef> = Object.fromEntries(
  FISH_SPECIES.map((f) => [f.id, f])
);
export const FAUNA_MAP = FISH_MAP;

// СНАСТІ ТА СПОРЯДЖЕННЯ
export const RODS: RodDef[] = RODS_CATALOG;
export const REELS: ReelDef[] = REELS_CATALOG;
export const FLOATS: FloatDef[] = FLOATS_CATALOG;
export const LINES: LineDef[] = LINES_CATALOG;
export const HOOKS: HookDef[] = HOOKS_CATALOG;
export const SINKERS: SinkerDef[] = SINKERS_CATALOG;
export const FEEDERS: FeederDef[] = FEEDERS_CATALOG;
export const ACCESSORIES: AccessoryDef[] = ACCESSORIES_CATALOG;
export const BOTTOM_RIGS: BottomRigDef[] = BOTTOM_RIGS_CATALOG;
export const GEAR_ITEMS: GearItemDef[] = GEAR_ITEMS_CATALOG;

export const ROD_MAP: Record<string, RodDef> = Object.fromEntries(RODS.map((r) => [r.id, r]));
export const REEL_MAP: Record<string, ReelDef> = Object.fromEntries(REELS.map((r) => [r.id, r]));
export const FLOAT_MAP: Record<string, FloatDef> = Object.fromEntries(FLOATS.map((f) => [f.id, f]));
export const LINE_MAP: Record<string, LineDef> = Object.fromEntries(LINES.map((l) => [l.id, l]));
export const HOOK_MAP: Record<string, HookDef> = Object.fromEntries(HOOKS.map((h) => [h.id, h]));
export const SINKER_MAP: Record<string, SinkerDef> = Object.fromEntries(SINKERS.map((s) => [s.id, s]));
export const FEEDER_MAP: Record<string, FeederDef> = Object.fromEntries(FEEDERS.map((f) => [f.id, f]));
export const ACCESSORY_MAP: Record<string, AccessoryDef> = Object.fromEntries(ACCESSORIES.map((a) => [a.id, a]));
export const BOTTOM_RIG_MAP: Record<string, BottomRigDef> = Object.fromEntries(BOTTOM_RIGS.map((b) => [b.id, b]));
export const GEAR_MAP: Record<string, GearItemDef> = Object.fromEntries(GEAR_ITEMS.map((g) => [g.id, g]));

// НАЖИВКИ, ШТУЧНІ ПРИМАНКИ ТА АРОМАТИЗАТОРИ
export const BAITS: BaitDef[] = BAITS_CATALOG;
export const FLAVORINGS: FlavoringDef[] = FLAVORINGS_CATALOG;

export const BAIT_MAP: Record<string, BaitDef> = Object.fromEntries(BAITS.map((b) => [b.id, b]));
export const FLAVORING_MAP: Record<string, FlavoringDef> = Object.fromEntries(
  FLAVORINGS.map((f) => [f.id, f])
);

export const GROUNDBAITS: GroundbaitDef[] = [
  {
    id: 'gb_universal',
    name: 'Прикормка «Поліський мікс»',
    pricePerPack: 55,
    packSize: 3,
    biteRateBoost: 0.35,
    weightBoost: 0.1,
    mutantBoost: 0,
    targetNote: 'Річкова та озерна риба',
    description: 'Швидко стягує мирну рибу до точки закидання на 5 закидів.',
  },
  {
    id: 'gb_carp',
    name: 'Прикормка «Короп-Ваніль»',
    pricePerPack: 95,
    packSize: 3,
    biteRateBoost: 0.45,
    weightBoost: 0.25,
    mutantBoost: 0.05,
    targetNote: 'Короп, Лящ, Линь',
    description: 'Густа макуха з коноплею й ваніллю: помітно збільшує середню вагу трофеїв.',
  },
  {
    id: 'gb_predator',
    name: 'Кров’яний атрактант «Хижак»',
    pricePerPack: 120,
    packSize: 3,
    biteRateBoost: 0.4,
    weightBoost: 0.22,
    mutantBoost: 0.14,
    targetNote: 'Щука, Судак, Сом',
    description: 'Хмара запаху у воді провокує навіть пасивних хижаків.',
  },
  {
    id: 'gb_anomaly',
    name: 'Ізотопна прикормка «Маяк-9»',
    pricePerPack: 195,
    packSize: 3,
    biteRateBoost: 0.5,
    weightBoost: 0.3,
    mutantBoost: 0.4,
    targetNote: 'Мутанти та легендарні види',
    description: 'Випромінює імпульси в товщі води, приманюючи аномальних гігантів.',
  },
];

export const KEEPNET_UPGRADES: GearUpgradeDef[] = [
  { level: 1, name: 'Брезентовий садок (15 кг)', capacityKg: 15, price: 0, description: 'Базовий садок для перших виходів.' },
  { level: 2, name: 'Прогумований садок (35 кг)', capacityKg: 35, price: 290, description: 'Вміщує солідний улов на кілька годин лову.' },
  { level: 3, name: 'Титанова сітка (70 кг)', capacityKg: 70, price: 780, description: 'Витримує важких сомів і коропів без поривів.' },
  { level: 4, name: 'Кріо-контейнер бункера (140 кг)', capacityKg: 140, price: 1650, description: 'Екранований контейнер із максимальною місткістю.' },
];

export const RADSUIT_UPGRADES: GearUpgradeDef[] = [
  { level: 0, name: 'Рибальський брезент (Захист 0)', radResist: 0, price: 0, description: 'Захищає від дощу, але не від радіації.' },
  { level: 1, name: 'Костюм ОЗК-Полісся (Рівень 1)', radResist: 1, price: 320, description: 'Дозволяє безпечно рибалити у Сновидовичах, Кисоричах та Заповіднику.' },
  { level: 2, name: 'Комбінезон «Сталкер-М» (Рівень 2)', radResist: 2, price: 890, description: 'Відкриває безпечний лов у Біловіжі та Боровому.' },
  { level: 3, name: 'Замкнутий скафандр «Булат-Р» (Рівень 3)', radResist: 3, price: 1850, description: 'Повний захист навіть у Блажовому на Блакитному розломі.' },
];

// ПЕРСОНАЖІ БУНКЕРА (4 сталкери на локації «Бункер «Щит-04» · Рокитне»)
export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  taras: {
    id: 'taras',
    name: 'Тарас Гнатович',
    callsign: 'Комірник · Постачальник',
    role: 'Комірник бункера: приймає улов, видає провізію, допомагає з відпочинком і польовими контрактами',
    roomName: 'Комора №1 · Привал і приймання улову',
    greeting:
      'Заходь, рибаче, обтруси чоботи! Свіжа риба й раки в нашому краї на вагу золота — здавай улов, бери гарячий пайок або перепочинь біля спальника перед виходом.',
    bio: 'Колишній єгер із Рокитного та слідопит Полісся, який перетворив старе укриття на надійний притулок для рибалок.',
    accentHex: '#f59e0b',
  },
  velychko: {
    id: 'velychko',
    name: 'Віктор Величко',
    callsign: 'Науковець · Дослідник',
    role: 'Науковець бункера: досліджує аномалії, видає дослідницькі завдання та веде бестіарій',
    roomName: 'Гідробіологічний сектор бункера',
    greeting:
      'Показники в Блажовому й Боровому знову підскочили. Поглянь на цей зразок — мені потрібні свіжі поліські мутанти, раки та рідкісна живність для аналізу.',
    bio: 'Науковець-іхтіолог, який вивчає вплив підземних розломів на фауну Полісся та досліджує біолюмінесцентні приманки.',
    accentHex: '#2dd4bf',
  },
  oleg: {
    id: 'oleg',
    name: 'Олег Кравчук',
    callsign: 'Майстер снастей · Ремонтник',
    role: 'Майстерня: продаж і ремонт вудок, котушок, снастей, наживок та спорядження',
    roomName: 'Майстерня спорядження й ремонту',
    greeting:
      'Хороша котушка, правильний поплавок і вчасно відремонтований бланк рятують від поломки, коли на гачку сидить десятикилограмовий сом або йобнутий рак.',
    bio: 'Інженер-механік, що збирає та лагодить титанові вудилища, карпові донки, фідерні монтажі й польове спорядження прямо в бункері.',
    accentHex: '#38bdf8',
  },
  baryga: {
    id: 'baryga',
    name: 'Єльцин',
    callsign: 'Торговець · Скупник',
    role: 'Торговець бункера: скуповує знахідки, артефакти й цінності та продає рідкісні товари',
    roomName: 'Підпільний ринок · Скриня Єльцина',
    greeting:
      'Тихіше, сталкере! Витягнув із дна сейф, скриньку, золоту каблучку, копійку чи радіоприймач? Викладай на скриню — оцінимо по-чесному, ще й поторгуємось!',
    bio: 'Хитрий ділок у протигазі, який скуповує все витягнуте з дна річок і кар’єрів та постачає на підпільний ринок рідкісні набори.',
    accentHex: '#fbbf24',
  },
};

export const QUESTS: QuestDef[] = [
  {
    id: 'q_masevychi_start',
    giver: 'taras',
    title: 'Перший вихід на Тихий потік',
    description: 'Впіймайте 3 риби у локації «Масевичі · Тихий потік» для кухні бункера.',
    dialoguePrompt:
      'Спускайся до річечки біля Масевичів — там безпечно й спокійно. Принеси перші три хвости, щоб ми перевірили активність води.',
    dialogueComplete:
      'Гарний улов! Вода тут чиста, але нижче за течією вже відчувається дивний фон.',
    type: 'catch_at_location',
    targetLocationId: 'masevychi',
    targetCount: 3,
    rewardCredits: 220,
    rewardXp: 80,
    rewardBaitId: 'corn',
    rewardBaitQty: 10,
  },
  {
    id: 'q_bogdan_rokitne',
    giver: 'taras',
    title: 'Розвідка під Старим мостом',
    description: 'Впіймайте 4 риби у локації «Рокитне · Річка Льва під мостом».',
    dialoguePrompt:
      'Вийди на вигин річки під самим Рокитним біля старого мосту. Там під підмитим сосновим корінням і на гальці завжди стоїть сильний головень та щука.',
    dialogueComplete:
      'Чудовий улов із-під мосту! Тепер ця ділянка річки позначена як перевірена.',
    type: 'catch_at_location',
    targetLocationId: 'rokitne',
    targetCount: 4,
    rewardCredits: 380,
    rewardXp: 150,
    rewardBaitId: 'bloodworm',
    rewardBaitQty: 12,
  },
  {
    id: 'q_olena_spark',
    giver: 'velychko',
    title: 'Смарагдова луска',
    description: 'Виловте 1 «Радіо-карася «Іскра»» (Масевичі, Кисоричі або Заповідник).',
    dialoguePrompt:
      'Мені потрібен зразок світіння з прибережних вод. Злови бодай одного радіо-карася «Іскра» — я заплачу подвійну премію й дам аномального реагенту.',
    dialogueComplete:
      'Фантастика! Спектр світіння стабільний. Бери біо-реагент — він допоможе приманити складніших мутантів.',
    type: 'catch_species',
    targetSpeciesId: 'crucian_glow',
    targetCount: 1,
    rewardCredits: 360,
    rewardXp: 140,
    rewardBaitId: 'anomaly_paste',
    rewardBaitQty: 6,
  },
  {
    id: 'q_bogdan_carp',
    giver: 'taras',
    title: 'Трофеї Карпилівки',
    description: 'Зловіть «Коропа дзеркального» або наберіть 12 кг сумарного улову на озерах.',
    dialoguePrompt:
      'У Карпилівці під лататтям ходить жирний короп. Підгодуй точку кукурудзяною прикормкою і принеси загалом 12 кг риби.',
    dialogueComplete:
      'Оце майстерність! Твої снасті вже готові до серйознішої води в Томашгороді й Сновидовичах.',
    type: 'catch_weight',
    targetCount: 12,
    rewardCredits: 480,
    rewardXp: 180,
    rewardBaitId: 'minnow',
    rewardBaitQty: 8,
  },
  {
    id: 'q_oleg_pike',
    giver: 'oleg',
    title: 'Іспит перекатів',
    description: 'Впіймайте 3 риби на швидкій річці «Томашгород · Польський кар’єрчик».',
    dialoguePrompt:
      'Побачимо, чи витримає твоя волосінь глибини Томашгорода! Закинь блешню або живця на кар’єр і витягни 3 рибини.',
    dialogueComplete:
      'Снасті відпрацювали на совість! Якщо збереш гроші — заходь по фідер чи плетений шнур.',
    type: 'catch_at_location',
    targetLocationId: 'tomashgorod',
    targetCount: 3,
    rewardCredits: 550,
    rewardXp: 220,
    rewardBaitId: 'spinner',
    rewardBaitQty: 12,
  },
  {
    id: 'q_olena_mutants',
    giver: 'velychko',
    title: 'Польова мутагенетика',
    description: 'Зареєструйте й виловте 4 будь-які аномальні мутанти Полісся.',
    dialoguePrompt:
      'Щоб зрозуміти природу Блакитного розлому, мені потрібна статистика по 4 мутованим особинам із боліт чи заплав.',
    dialogueComplete:
      'Дані підтверджують: епіцентр сходиться під Блажовим та Боровим. Готуй захисний костюм!',
    type: 'catch_mutants',
    targetCount: 4,
    rewardCredits: 950,
    rewardXp: 360,
    rewardBaitId: 'anomaly_paste',
    rewardBaitQty: 10,
  },
  {
    id: 'q_taras_catfish',
    giver: 'taras',
    title: 'Нічний сом зі Сновидовичів',
    description: 'Виловте «Сома поліського» або «Світящого сома-ізотопа».',
    dialoguePrompt:
      'У Сновидовичах біля затоплених паль завелася справжня махина. Вийди ввечері або вночі з міцним шнуром і принеси сома!',
    dialogueComplete:
      'Оце здобич! Весь бункер буде ситий тиждень, а твій гаманець — повний.',
    type: 'catch_species',
    targetSpeciesId: 'catfish',
    targetCount: 1,
    rewardCredits: 1100,
    rewardXp: 400,
  },
  {
    id: 'q_olena_leviathan',
    giver: 'velychko',
    title: 'Хозяїн Блакитного розлому',
    description: 'Впіймайте легендарного «Хозяїна Розлому» у Блажовому або Боровому.',
    dialoguePrompt:
      'Це головна мета нашої експедиції. Одягай захисний костюм рівня 2–3, бери найкращий титановий спінінг, ізотопну прикормку та реагент — і витягни прадавнього велетня!',
    dialogueComplete:
      'Неймовірно! Ти приборкав легенду Полісся. Тепер твоє ім’я знатиме кожен рибалка Зони!',
    type: 'catch_species',
    targetSpeciesId: 'leviathan_polissia',
    targetCount: 1,
    rewardCredits: 3200,
    rewardXp: 1200,
  },
  {
    id: 'q_baryga_scrap',
    giver: 'baryga',
    title: 'Трофеї з дна для Єльцина',
    description: 'Витягніть із дна водойм 3 предмети (монети, метал, зброю, золото, сейфи або різне).',
    dialoguePrompt:
      'Опускай поплавок або годівницю на саме дно — там повно заліза, монет і загубленої зброї. Принесеш 3 знахідки — додам премію зверху!',
    dialogueComplete:
      'Оце товар! Люблю, коли клієнт знає, де лежить справжнє добро. Тримай гонорар і заходь на ринок.',
    type: 'find_loot',
    targetCount: 3,
    rewardCredits: 420,
    rewardXp: 190,
    rewardBaitId: 'worm',
    rewardBaitQty: 15,
  },
  {
    id: 'q_baryga_collector',
    giver: 'baryga',
    title: 'Скарби кар’єрів та заплав',
    description: 'Знайдіть на глибині загалом 8 донних предметів або аномальних артефактів.',
    dialoguePrompt:
      'У Томашгороді на дні й у глибоких ямах Сновидовичів лежать золоті каблучки, ланцюжки й старі детектори. Лови на дні — витягнеш 8 штук, станеш своїм на ринку!',
    dialogueComplete:
      'З такими поставками мій прилавок не зачинятиметься! Тримай солідну виплату.',
    type: 'find_loot',
    targetCount: 8,
    rewardCredits: 1250,
    rewardXp: 480,
    rewardBaitId: 'anomaly_paste',
    rewardBaitQty: 6,
  },
];

export const LOOT_ITEMS: LootItemDef[] = LOOT_ITEMS_CATALOG;

export const LOOT_MAP: Record<string, LootItemDef> = Object.fromEntries(
  LOOT_ITEMS.map((item) => [item.id, item])
);

export const MARKET_BUNDLES: MarketBundleDef[] = [
  {
    id: 'bundle_poacher',
    name: 'Набір «Мішечок рибака»',
    price: 130,
    tag: 'Вигідна закупівля (-20%)',
    description: '12 шт. Живця + 15 шт. Гнойового черв’яка + 10 шт. Мотиля.',
    baits: { minnow: 12, worm: 15, bloodworm: 10 },
  },
  {
    id: 'bundle_carp_pro',
    name: 'Короповий набір «Солодке дно»',
    price: 165,
    tag: 'Для великої мирної риби',
    description: '12 шт. Бойлів + 12 шт. Пелетсу + 15 шт. Вареного гороху + 2 пачки «Короп-Ваніль».',
    baits: { boilies: 12, pellets: 12, boiled_peas: 15 },
    groundbaits: { gb_carp: 2 },
  },
  {
    id: 'bundle_groundbait',
    name: 'Прикормковий мікс «Три стихії»',
    price: 125,
    tag: 'Підкормка для точок',
    description: '2 пачки «Поліського міксу» + 2 пачки «Короп-Ваніль».',
    groundbaits: { gb_universal: 2, gb_carp: 2 },
  },
  {
    id: 'bundle_anomaly',
    name: 'Контрабанда «Зона-Профі»',
    price: 215,
    tag: 'Рідкісний товар',
    description: '6 шт. Аномального біо-реагенту + 1 пачка ізотопної прикормки «Маяк-9».',
    baits: { anomaly_paste: 6 },
    groundbaits: { gb_anomaly: 1 },
  },
  {
    id: 'bundle_survival',
    name: 'Польовий пайок сталкера',
    price: 135,
    tag: 'Здоров’я та розсудливість',
    description: '1 Аптечка АІ-2 «Антирад» + 1 Енергетик «Сталкер» + 1 Термос чаю «Полісся» зі знижкою.',
    consumables: { antirad_ai2: 1, energy_stalker: 1, herbal_tea: 1 },
  },
];

const MARKET_DEMAND_CYCLE: { group: MarketGroup; label: string; bonusPct: number }[] = [
  { group: 'scrap', label: 'Металобрухт, інструменти, велосипеди та стара зброя', bonusPct: 35 },
  { group: 'jewelry', label: 'Золоті ланцюжки, каблучки, монети та годинники', bonusPct: 30 },
  { group: 'relics', label: 'Сейфи, скриньки, документи, жетони й компаси', bonusPct: 32 },
  { group: 'artifacts', label: 'Аномальні артефакти, детектори та капсули', bonusPct: 35 },
];

export function getDailyMarketDemand(day: number) {
  return MARKET_DEMAND_CYCLE[Math.max(0, day - 1) % MARKET_DEMAND_CYCLE.length];
}

export function getBarygaOfferPrice(
  item: LootItemDef | undefined,
  baseValue: number,
  day: number,
  haggleDay?: number,
  haggleBonusPct?: number
): { finalPrice: number; hasDemandBonus: boolean; totalBoostPct: number } {
  const demand = getDailyMarketDemand(day);
  const hasDemandBonus = Boolean(item?.marketGroup && item.marketGroup === demand.group);
  const demandPct = hasDemandBonus ? demand.bonusPct : 0;
  const activeHagglePct = haggleDay === day && haggleBonusPct ? haggleBonusPct : 0;
  const totalBoostPct = demandPct + activeHagglePct;
  const finalPrice = Math.round(baseValue * (1 + totalBoostPct / 100));
  return { finalPrice, hasDemandBonus, totalBoostPct };
}

export function formatClock(timeOfDay: number): { clock: string; phaseLabel: string } {
  const h = Math.floor(timeOfDay) % 24;
  const m = Math.floor((timeOfDay - Math.floor(timeOfDay)) * 60);
  const clock = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  let phaseLabel = 'День';
  if (h >= 5 && h < 8) phaseLabel = 'Світанок';
  else if (h >= 8 && h < 17) phaseLabel = 'День';
  else if (h >= 17 && h < 21) phaseLabel = 'Сутінки';
  else phaseLabel = 'Ніч';
  return { clock, phaseLabel };
}

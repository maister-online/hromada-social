import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Anchor,
  BookMarked,
  Check,
  CloudFog,
  CloudRain,
  Compass,
  Droplets,
  Package,
  Radar,
  Scissors,
  ScrollText,
  Shield,
  Sun,
  Warehouse,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { audioEngine } from '../game/audio';
import {
  ACCESSORIES,
  ACCESSORY_MAP,
  BAITS,
  BOTTOM_RIGS,
  BOTTOM_RIG_MAP,
  FEEDERS,
  FEEDER_MAP,
  FISH_MAP,
  FISH_SPECIES,
  FLAVORINGS,
  FLAVORING_MAP,
  FLOATS,
  FLOAT_MAP,
  GEAR_ITEMS,
  GEAR_MAP,
  GROUNDBAITS,
  HOOKS,
  HOOK_MAP,
  KEEPNET_UPGRADES,
  LINES,
  LINE_MAP,
  LOOT_ITEMS,
  REELS,
  REEL_MAP,
  RODS,
  ROD_MAP,
  SINKERS,
  SINKER_MAP,
  formatClock,
} from '../game/data';
import { getLocationCatchPool, getLocationFishPool, getWaterSpotInfo } from '../game/bathymetry';
import {
  clampCastToWaterBounds,
  getWaterDistBoundsForYaw,
} from '../game/waterBounds';
import { FishingVisualPhase, ShoreFishingScene } from '../game/ShoreFishingScene';
import {
  BaitDef,
  CaughtFish,
  FaunaKind,
  FishSpeciesDef,
  FoundLootEntry,
  LocationDef,
  LootItemDef,
  SaveState,
  WeatherType,
} from '../game/types';
import { FishIllustration } from './FishIllustration';
import { ItemIllustration } from './ItemIllustration';
import { CatalogPhoto } from './CatalogPhoto';
import { WeatherEffectsOverlay } from './WeatherEffectsOverlay';

const WEATHER_INFO: Record<
  WeatherType,
  { label: string; colorClass: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  clear: { label: 'Ясно', colorClass: 'text-amber-300', Icon: Sun },
  fog: { label: 'Густий туман', colorClass: 'text-teal-200', Icon: CloudFog },
  rain: { label: 'Дощ / Мряка', colorClass: 'text-sky-300', Icon: CloudRain },
  anomaly_surge: { label: 'Аномальний викид', colorClass: 'text-cyan-300', Icon: Zap },
};

const FAUNA_KIND_LABEL: Record<FaunaKind, string> = {
  fish: 'Риба',
  crayfish: 'Рак',
  beetle: 'Жук',
  insect: 'Комаха',
  wildlife: 'Живність',
  mutant: 'Мутант',
};

type RigTab =
  | 'rod'
  | 'reel'
  | 'line'
  | 'float'
  | 'hooks_sinkers'
  | 'rigs'
  | 'flavor_acc'
  | 'bait'
  | 'groundbait'
  | 'gear';

type BaitFilterTab = 'all' | BaitDef['category'];

interface FishingViewProps {
  location: LocationDef;
  gameState: SaveState;
  muted: boolean;
  musicEnabled: boolean;
  isModalOpen?: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onSelectBait: (baitId: string) => void;
  onConsumeBait: (baitId: string) => void;
  onLineSnap?: (baitId: string) => void;
  onThrowGroundbait: (groundbaitId: string) => void;
  onCatchFish: (fish: CaughtFish, released: boolean) => void;
  onFindLoot: (item: LootItemDef, entry: FoundLootEntry) => void;
  onUseConsumable: (itemId: string) => void;
  onClockAndRadTick: (deltaHours: number, radDelta: number) => void;
  onSelectRod: (rodId: string) => void;
  onSelectReel: (reelId: string) => void;
  onSelectLine: (lineId: string) => void;
  onSelectFloat: (floatId: string) => void;
  onSelectHook: (hookId: string) => void;
  onSelectSinker: (sinkerId: string) => void;
  onSelectFeeder: (feederId: string) => void;
  onSelectBottomRig: (rigId: string) => void;
  onToggleAccessory: (accId: string) => void;
  onToggleGearItem: (gearId: string) => void;
  onSelectFlavoring: (flavId: string) => void;
  onDamageTackle: (deltas: Record<string, number>) => void;
  onOpenInventory: () => void;
  onOpenJournal: () => void;
  onOpenQuests: () => void;
  onOpenMap: () => void;
  onGoToBunker: () => void;
}

export const FishingView: React.FC<FishingViewProps> = ({
  location,
  gameState,
  muted,
  musicEnabled,
  isModalOpen = false,
  onToggleMute,
  onToggleMusic,
  onSelectBait,
  onConsumeBait,
  onLineSnap,
  onThrowGroundbait,
  onCatchFish,
  onFindLoot,
  onUseConsumable,
  onClockAndRadTick,
  onSelectRod,
  onSelectReel,
  onSelectLine,
  onSelectFloat,
  onSelectHook,
  onSelectSinker,
  onSelectFeeder,
  onSelectBottomRig,
  onToggleAccessory,
  onToggleGearItem,
  onSelectFlavoring,
  onDamageTackle,
  onOpenInventory,
  onOpenJournal,
  onOpenQuests,
  onOpenMap,
  onGoToBunker,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<ShoreFishingScene | null>(null);

  const rod = useMemo(
    () => ROD_MAP[gameState.equippedRodId] ?? RODS[0],
    [gameState.equippedRodId]
  );
  const reel = useMemo(
    () => REEL_MAP[gameState.equippedReelId] ?? REELS[0],
    [gameState.equippedReelId]
  );
  const line = useMemo(
    () => LINE_MAP[gameState.equippedLineId] ?? LINES[0],
    [gameState.equippedLineId]
  );
  const bait = useMemo(
    () => BAITS.find((b) => b.id === gameState.equippedBaitId) ?? BAITS[0],
    [gameState.equippedBaitId]
  );
  const floatDef = useMemo(
    () => FLOAT_MAP[gameState.equippedFloatId] ?? FLOATS[0],
    [gameState.equippedFloatId]
  );
  const hookDef = useMemo(
    () => HOOK_MAP[gameState.equippedHookId] ?? HOOKS[0],
    [gameState.equippedHookId]
  );
  const sinkerDef = useMemo(
    () => SINKER_MAP[gameState.equippedSinkerId] ?? SINKERS[0],
    [gameState.equippedSinkerId]
  );
  const feederDef = useMemo(
    () => FEEDER_MAP[gameState.equippedFeederId] ?? FEEDERS[0],
    [gameState.equippedFeederId]
  );
  const bottomRigDef = useMemo(
    () => BOTTOM_RIG_MAP[gameState.equippedBottomRigId] ?? BOTTOM_RIGS[0],
    [gameState.equippedBottomRigId]
  );
  const flavoringDef = useMemo(
    () => FLAVORING_MAP[gameState.equippedFlavoringId] ?? FLAVORINGS[0],
    [gameState.equippedFlavoringId]
  );
  const equippedAccessories = useMemo(
    () =>
      gameState.equippedAccessoryIds
        .map((id) => ACCESSORY_MAP[id])
        .filter((a): a is NonNullable<typeof a> => Boolean(a)),
    [gameState.equippedAccessoryIds]
  );
  const equippedGearItems = useMemo(
    () =>
      gameState.equippedGearIds
        .map((id) => GEAR_MAP[id])
        .filter((g): g is NonNullable<typeof g> => Boolean(g)),
    [gameState.equippedGearIds]
  );

  // Aggregate tackle, accessory, flavoring, and gear modifiers
  const rigStats = useMemo(() => {
    const keepnetBonusKg = equippedGearItems.reduce(
      (sum, g) => sum + (g.keepnetBonusKg ?? 0),
      0
    );
    const gearCastBonusM = equippedGearItems.reduce(
      (sum, g) => sum + (g.castBonusM ?? 0),
      0
    );
    const gearBiteSpeedBonus = equippedGearItems.reduce(
      (sum, g) => sum + (g.biteSpeedBonus ?? 0),
      0
    );
    const gearFightPowerBonus = equippedGearItems.reduce(
      (sum, g) => sum + (g.fightPowerBonus ?? 0),
      0
    );
    const gearLandingBonus = equippedGearItems.reduce(
      (sum, g) => sum + (g.landingBonus ?? 0),
      0
    );
    const gearSnagEscapeBonus = equippedGearItems.reduce(
      (sum, g) => sum + (g.snagEscapeBonus ?? 0),
      0
    );
    const gearRadResistBonus = equippedGearItems.reduce(
      (sum, g) => sum + (g.radResistBonus ?? 0),
      0
    );
    const gearSanityShieldBonus = equippedGearItems.reduce(
      (sum, g) => sum + (g.sanityShieldBonus ?? 0),
      0
    );

    const accBiteSpeedBonus = equippedAccessories.reduce(
      (sum, a) => sum + a.biteSpeedBonus,
      0
    );
    const accSnagResistBonus = equippedAccessories.reduce(
      (sum, a) => sum + a.snagResistBonus,
      0
    );
    const accLineBreakResist = equippedAccessories.reduce(
      (sum, a) => sum + a.lineBreakResist,
      0
    );
    const accHasAlarm = equippedAccessories.some((a) => a.hasAcousticAlarm);

    const hasBottomRig = bottomRigDef.id !== 'brig_none';
    const hasFeeder = feederDef.id !== 'feeder_none';
    const flavQty =
      flavoringDef.id !== 'flav_none'
        ? gameState.flavoringInventory[flavoringDef.id] ?? 0
        : 0;
    const flavBiteBoost = flavQty > 0 ? flavoringDef.biteRateBoost : 0;
    const flavWeightBoost = flavQty > 0 ? flavoringDef.weightBoost : 0;

    const totalCastBonusM =
      rod.castBonusM +
      sinkerDef.castBonusM +
      (hasBottomRig ? bottomRigDef.castBonusM : 0) +
      gearCastBonusM;

    const rodLimit = rod.maxLoadKg * (1 + gearFightPowerBonus * 0.45);
    const lineLimit = line.maxTensionKg * (1 + Math.min(0.45, accLineBreakResist));
    const rigLimit = hasBottomRig ? bottomRigDef.maxLoadKg : 999;
    const maxGearLoadKg = Math.max(2.5, Math.min(rodLimit, lineLimit, rigLimit));

    const biteSpeedMult = Math.max(
      0.7,
      bait.biteSpeedBonus *
        rod.sensitivity *
        (1 +
          floatDef.biteSensitivityBonus +
          hookDef.biteRateBonus +
          (hasFeeder ? feederDef.biteRateBoost : 0) +
          (hasBottomRig ? bottomRigDef.biteRateBonus : 0) +
          accBiteSpeedBonus +
          gearBiteSpeedBonus +
          flavBiteBoost)
    );

    const weightBoostMult =
      (hasFeeder ? feederDef.weightBoost : 0) + flavWeightBoost;

    const snagRiskMult = Math.max(
      0.2,
      hookDef.snagRiskMod *
        (hasBottomRig ? bottomRigDef.snagRiskMod : 1) *
        Math.max(0.25, 1 - accSnagResistBonus - gearSnagEscapeBonus * 0.5)
    );

    const hasAcousticAlarm =
      floatDef.electronic ||
      (hasBottomRig && Boolean(bottomRigDef.hasElectronicAlarm)) ||
      accHasAlarm;

    const hasLandingNet = gearLandingBonus > 0;

    return {
      keepnetBonusKg,
      totalCastBonusM,
      maxGearLoadKg,
      biteSpeedMult,
      weightBoostMult,
      snagRiskMult,
      gearSnagEscapeBonus,
      gearLandingBonus,
      gearRadResistBonus,
      gearSanityShieldBonus,
      hookRetentionBonus: hookDef.hookRetentionBonus,
      hasBottomRig,
      hasFeeder,
      hasAcousticAlarm,
      hasLandingNet,
      flavQty,
    };
  }, [
    bait.biteSpeedBonus,
    bottomRigDef,
    equippedAccessories,
    equippedGearItems,
    feederDef,
    flavoringDef,
    floatDef.biteSensitivityBonus,
    floatDef.electronic,
    gameState.flavoringInventory,
    hookDef.biteRateBonus,
    hookDef.hookRetentionBonus,
    hookDef.snagRiskMod,
    line.maxTensionKg,
    rod.castBonusM,
    rod.maxLoadKg,
    rod.sensitivity,
    sinkerDef.castBonusM,
  ]);

  const rodDurability = gameState.itemDurability[rod.id] ?? 100;
  const reelDurability = gameState.itemDurability[reel.id] ?? 100;
  const lineDurability = gameState.itemDurability[line.id] ?? 100;
  const isRodBroken = rodDurability <= 0;
  const isReelBroken = reelDurability <= 0;
  const isLineBroken = lineDurability <= 0;
  const isTackleBroken = isRodBroken || isReelBroken || isLineBroken;

  const rodIdx = RODS.findIndex((r) => r.id === rod.id);
  // Float tackle is a short-range setup; feeder/donka and spinning use their actual gear limits.
  const gearCastLimitM = Math.min(location.maxCastDistanceM + rigStats.totalCastBonusM, reel.lineCapacityM, line.lengthM);
  const maxCastM = rod.type === 'float' ? Math.min(6, gearCastLimitM) : gearCastLimitM;
  const keepnetCap =
    (KEEPNET_UPGRADES[gameState.keepnetLevel - 1]?.capacityKg ?? 15) +
    rigStats.keepnetBonusKg;
  const keepnetWeight = useMemo(
    () => gameState.keepnet.reduce((s, f) => s + f.weightKg, 0),
    [gameState.keepnet]
  );
  const activeGb = gameState.activeGroundbaitByLoc[location.id];
  const activeGbDef = activeGb
    ? GROUNDBAITS.find((g) => g.id === activeGb.groundbaitId) || null
    : null;

  const isEnergyActive = gameState.energyBoostUntilMs > Date.now();
  const effectiveRetrieveSpeed = reel.retrieveSpeed * (isEnergyActive ? 1.3 : 1.0);

  // Real-time fishing state
  const [phase, setPhase] = useState<FishingVisualPhase>('IDLE');
  const [chargeRatio, setChargeRatio] = useState(0);
  const [aimYaw, setAimYaw] = useState(0);
  const [castDistM, setCastDistM] = useState(() => Math.min(6, maxCastM));
  const [activeCastSpot, setActiveCastSpot] = useState<{ yaw: number; distM: number }>(() => ({
    yaw: 0,
    distM: Math.min(6, maxCastM),
  }));
  const [fishingDepthM, setFishingDepthM] = useState(1.8);
  const [bottomLock, setBottomLock] = useState(false);
  const [isAimingRecast, setIsAimingRecast] = useState(false);
  const [aimBlockedByShore, setAimBlockedByShore] = useState(false);
  const [dragLevel, setDragLevel] = useState(5); // 1..10 friction brake
  const [tensionRatio, setTensionRatio] = useState(0);
  const [fishDistM, setFishDistM] = useState(() => Math.min(6, maxCastM));
  const [fishLateral, setFishLateral] = useState(0);
  const [isReeling, setIsReeling] = useState(false);
  const [snagProgress, setSnagProgress] = useState(0);
  const [hookedSpecies, setHookedSpecies] = useState<FishSpeciesDef | null>(null);
  const [statusMsg, setStatusMsg] = useState(
    'Торкніться будь-де на водоймі для закиду або утримуйте [ЗАКИНУТИ]'
  );
  const [caughtResult, setCaughtResult] = useState<CaughtFish | null>(null);
  const [caughtLoot, setCaughtLoot] = useState<{ def: LootItemDef; entry: FoundLootEntry } | null>(
    null
  );
  const [showKeepnet, setShowKeepnet] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showBaitDrawer, setShowBaitDrawer] = useState(false);
  const [baitFilter, setBaitFilter] = useState<BaitFilterTab>('all');
  const [showRigDrawer, setShowRigDrawer] = useState(false);
  const [rigTab, setRigTab] = useState<RigTab>('rod');
  const [showSonar, setShowSonar] = useState(true);
  const [showSonarAdjust, setShowSonarAdjust] = useState(false);
  const [sonarScreenWidth, setSonarScreenWidth] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('wilde-polissia-sonar-window') || '{}');
      return Number.isFinite(saved.width) ? Math.min(94, Math.max(45, saved.width)) : 76;
    } catch { return 76; }
  });
  const [sonarScreenHeight, setSonarScreenHeight] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('wilde-polissia-sonar-window') || '{}');
      return Number.isFinite(saved.height) ? Math.min(88, Math.max(30, saved.height)) : 58;
    } catch { return 58; }
  });
  const [sonarLeft, setSonarLeft] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('wilde-polissia-sonar-window') || '{}');
      return Number.isFinite(saved.left) ? Math.max(0, saved.left) : 8;
    } catch { return 8; }
  });
  const [sonarTop, setSonarTop] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('wilde-polissia-sonar-window') || '{}');
      return Number.isFinite(saved.top) ? Math.max(0, saved.top) : 105;
    } catch { return 8; }
  });
  const sonarDragRef = useRef<{ pointerX: number; pointerY: number; left: number; top: number } | null>(null);
  const saveSonarLayout = () => {
    try {
      localStorage.setItem('wilde-polissia-sonar-window', JSON.stringify({
        width: sonarScreenWidth, height: sonarScreenHeight, left: sonarLeft, top: sonarTop
      }));
      setShowSonarAdjust(false);
    } catch {
      // Keep the current layout in memory if browser storage is unavailable.
    }
  };
  const handleSonarDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!sonarDragRef.current) return;
    const start = sonarDragRef.current;
    setSonarLeft(Math.max(8, Math.min(window.innerWidth - Math.min(360, window.innerWidth - 16) - 8, start.left + event.clientX - start.pointerX)));
    setSonarTop(Math.max(28, Math.min(window.innerHeight - 190, start.top + event.clientY - start.pointerY)));
  };
  const stopSonarDrag = () => { sonarDragRef.current = null; };
  const [sonarRange, setSonarRange] = useState(10);
  const [sonarScan, setSonarScan] = useState(0);
  const [reticlePos, setReticlePos] = useState<{
    xPct: number;
    yPct: number;
    visible: boolean;
  }>({ xPct: 50, yPct: 56, visible: false });

  // Refs for real-time 60Hz physics loop
  const phaseRef = useRef<FishingVisualPhase>('IDLE');
  phaseRef.current = phase;
  const aimYawRef = useRef(0);
  aimYawRef.current = aimYaw;
  const castDistRef = useRef(Math.min(6, maxCastM));
  castDistRef.current = castDistM;
  const fishingDepthRef = useRef(1.8);
  const bottomLockRef = useRef(false);
  bottomLockRef.current = bottomLock;
  const waterAimActiveRef = useRef(false);
  const chargeRef = useRef(0);
  const chargeDirRef = useRef(1);
  const reelingRef = useRef(false);
  const dragRef = useRef(dragLevel);
  dragRef.current = dragLevel;
  const tensionRef = useRef(0);
  const overloadTimerRef = useRef(0);
  const looseTimerRef = useRef(0);
  const wearTimerRef = useRef(0);
  const snagProgressRef = useRef(0);
  const fishDistRef = useRef(16);
  const fishLateralRef = useRef(0);
  const rodDurabilityRef = useRef(rodDurability);
  rodDurabilityRef.current = rodDurability;
  const reelDurabilityRef = useRef(reelDurability);
  reelDurabilityRef.current = reelDurability;
  const lineDurabilityRef = useRef(lineDurability);
  lineDurabilityRef.current = lineDurability;
  const hookedTargetRef = useRef<{
    kind: 'fish' | 'loot';
    species?: FishSpeciesDef;
    lootItem?: LootItemDef;
    weightKg: number;
    fightPower: number;
    staminaLeft: number;
    maxStamina: number;
  } | null>(null);
  const waitTimerRef = useRef(0);
  const biteWindowRef = useRef(0);
  const tickAudioTimerRef = useRef(0);

  const onDamageTackleRef = useRef(onDamageTackle);
  onDamageTackleRef.current = onDamageTackle;
  const onLineSnapRef = useRef(onLineSnap);
  onLineSnapRef.current = onLineSnap;

  const currentWaterSpot = useMemo(
    () => getWaterSpotInfo(location, aimYaw, castDistM, maxCastM),
    [aimYaw, castDistM, location, maxCastM]
  );
  // Реалістична шкала 2D-сонара: поверхня вгорі, рельєф дна внизу.
  const hasProSonar = gameState.equippedGearIds.includes('gear_sonar_module');
  const sonarMaxDepth = Math.max(sonarRange, location.depthRangeM[1] + 0.8);
  // Масштаб наближений: рельєф дна займає лише нижні 10–15% дисплея.
  const sonarBottomY = 91 + (currentWaterSpot.depthM / sonarMaxDepth) * 10;
  const sonarProfile = useMemo(() => {
    return Array.from({ length: 21 }, (_, index) => {
      const distM = 3 + (index / 20) * Math.max(8, maxCastM - 3);
      const spot = getWaterSpotInfo(location, aimYaw, distM, maxCastM);
      return {
        x: index * 12,
        y: 91 + (spot.depthM / sonarMaxDepth) * 10,
      };
    });
  }, [aimYaw, location, maxCastM, sonarMaxDepth]);
  const sonarBottomLineD = useMemo(
    () => sonarProfile.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' '),
    [sonarProfile]
  );
  const sonarBottomAreaD = `${sonarBottomLineD} L240 120 L0 120 Z`;
  const sonarEchoes = useMemo(() => {
    if (!hasProSonar) return [];
    const pool = getLocationFishPool(location);
    if (!pool.length) return [];
    const count = Math.min(5, Math.max(1, Math.ceil(pool.length / 7)));
    return Array.from({ length: count }, (_, index) => {
      const species = pool[(index * 3 + sonarScan) % pool.length];
      const phaseValue = (index * 37 + sonarScan * 19 + location.anomalyActivity) % 100;
      const depthFactor =
        species.preferredDepth === 'surface' ? 0.2 :
        species.preferredDepth === 'bottom' ? 0.86 :
        species.preferredDepth === 'mid' ? 0.55 :
        0.28 + (phaseValue % 55) / 100;
      const depthM = Math.max(0.25, currentWaterSpot.depthM * depthFactor);
      return {
        x: 18 + ((index * 47 + sonarScan * 17 + 13) % 190),
        y: 18 + (depthM / Math.max(0.5, currentWaterSpot.depthM)) * Math.max(12, sonarBottomY - 30),
        strength: 0.38 + (phaseValue % 58) / 100,
      };
    });
  }, [currentWaterSpot.depthM, hasProSonar, location, sonarBottomY, sonarScan]);

  const effectiveFishingDepthM = useMemo(() => {
    const maxSafe = Math.max(0.4, Number((currentWaterSpot.depthM - 0.1).toFixed(1)));
    if (bottomLock || rigStats.hasBottomRig) return maxSafe;
    return Number(Math.max(0.4, Math.min(maxSafe, fishingDepthM)).toFixed(1));
  }, [bottomLock, currentWaterSpot.depthM, fishingDepthM, rigStats.hasBottomRig]);
  fishingDepthRef.current = effectiveFishingDepthM;

  const handleChangeFishingDepth = useCallback(
    (nextDepthM: number, lockBottom = false) => {
      const spot = getWaterSpotInfo(location, aimYawRef.current, castDistRef.current, maxCastM);
      const maxSafe = Math.max(0.4, Number((spot.depthM - 0.1).toFixed(1)));
      if (lockBottom) {
        setBottomLock(true);
        setFishingDepthM(maxSafe);
        fishingDepthRef.current = maxSafe;
      } else {
        const clamped = Number(Math.max(0.4, Math.min(maxSafe, nextDepthM)).toFixed(1));
        setBottomLock(false);
        setFishingDepthM(clamped);
        fishingDepthRef.current = clamped;
      }
    },
    [location, maxCastM]
  );

  const pickHookTarget = useCallback(() => {
    const spot = getWaterSpotInfo(location, aimYawRef.current, castDistRef.current, maxCastM);
    const isDeepSpot = spot.depthNorm >= 0.62;
    const isShallowSpot = spot.depthNorm <= 0.34;
    const hookDepth = Math.min(
      Math.max(0.4, spot.depthM - 0.1),
      Math.max(0.4, fishingDepthRef.current)
    );
    const depthRatio = hookDepth / Math.max(0.8, spot.depthM);
    const depthLayer: 'surface' | 'mid' | 'bottom' =
      rigStats.hasBottomRig
        ? 'bottom'
        : hookDepth <= 1.3 || depthRatio <= 0.32
          ? 'surface'
          : depthRatio >= 0.68 || spot.depthM - hookDepth <= 0.45
            ? 'bottom'
            : 'mid';

    const baseLootChance =
      depthLayer === 'bottom'
        ? isDeepSpot ? 0.075 : 0.028
        : depthLayer === 'mid' ? 0.009 : 0.002;
    const lootChance = Math.min(
      0.14,
      baseLootChance * (location.waterType === 'anomaly_lake' ? 1.7 : location.anomalyActivity >= 55 ? 1.25 : 1)
    );
    const anomalyLootIds = new Set([
      'loot_sunken_detector', 'loot_isotope_case', 'loot_blue_tear',
      'loot_safe', 'loot_chest', 'loot_radio', 'loot_documents', 'loot_artifact_moon',
    ]);
    const lootPool = LOOT_ITEMS.filter((item) => {
      if (item.minAnomalyReq > location.anomalyActivity) return false;
      if (anomalyLootIds.has(item.id) && location.waterType !== 'anomaly_lake' && location.anomalyActivity < 60) return false;
      if (item.id === 'loot_amber' && !['river', 'swamp'].includes(location.waterType)) return false;
      if (item.id === 'loot_amber' && spot.depthNorm > 0.58) return false;
      return true;
    });
    if (lootPool.length > 0 && Math.random() < lootChance) {
      const rarityWeight = { common: 12, uncommon: 4, rare: 1.1, legendary: 0.12 } as const;
      const totalLootWeight = lootPool.reduce((sum, item) => sum + rarityWeight[item.rarity], 0);
      let lootRoll = Math.random() * totalLootWeight;
      let chosenLoot = lootPool[lootPool.length - 1];
      for (const item of lootPool) {
        lootRoll -= rarityWeight[item.rarity];
        if (lootRoll <= 0) {
          chosenLoot = item;
          break;
        }
      }
      return {
        kind: 'loot' as const,
        lootItem: chosenLoot,
        weightKg: chosenLoot.weightKg,
        fightPower: 2.2,
        staminaLeft: 4.5,
        maxStamina: 4.5,
      };
    }

    const h = gameState.timeOfDay;
    const isNight = h >= 20.5 || h <= 5.0;
    const isDusk = (h >= 17 && h < 20.5) || (h > 5.0 && h <= 8.0);

    const pool = getLocationCatchPool(location);
    const candidates = pool.length > 0 ? pool : [FISH_SPECIES[0]];
    const weighted: FishSpeciesDef[] = [];

    const gbMutant = activeGbDef ? activeGbDef.mutantBoost : 0;
    const gbWeight = activeGbDef ? activeGbDef.weightBoost : 0;

    for (const sp of candidates) {
      let w =
        sp.rarity === 'common' ? 9 : sp.rarity === 'uncommon' ? 5 : sp.rarity === 'rare' ? 3 : 1;
      if (sp.preferredBaits.includes(bait.id)) w += 6;
      if (bait.predatorBonus && sp.fightPower >= 5.5) {
        w += Math.round(bait.predatorBonus * 8);
      }
      if (sp.preferredTime === 'night' && isNight) w += 5;
      if (sp.preferredTime === 'dusk' && isDusk) w += 4;
      if (sp.preferredTime === 'day' && !isNight && !isDusk) w += 3;

      const fishDepthPref = sp.preferredDepth ?? 'any';
      if (fishDepthPref !== 'any') {
        if (fishDepthPref === depthLayer) {
          w += 7;
        } else if (
          (fishDepthPref === 'surface' && depthLayer === 'bottom') ||
          (fishDepthPref === 'bottom' && depthLayer === 'surface')
        ) {
          w = Math.max(1, Math.floor(w * 0.28));
        }
      }

      if (isDeepSpot) {
        if (sp.preferredDepth === 'bottom' || sp.maxWeightKg >= 4.5) w += 4;
        if (sp.preferredDepth === 'surface' && sp.maxWeightKg < 2) w = Math.max(1, Math.round(w * 0.58));
      } else if (isShallowSpot) {
        if (sp.preferredDepth === 'surface' || sp.maxWeightKg <= 2.2) w += 4;
        if (sp.preferredDepth === 'bottom' && sp.maxWeightKg >= 4.5) w = Math.max(1, Math.round(w * 0.55));
      }

      if (sp.isMutant) {
        const anomalyBaseChance =
          location.waterType === 'anomaly_lake' ? 0.3 :
          location.waterType === 'swamp' ? 0.08 :
          location.anomalyActivity >= 40 ? 0.035 : 0;
        const mutantChance = Math.min(
          0.72,
          anomalyBaseChance +
            (gameState.weather === 'anomaly_surge' ? 0.18 : 0) +
            bait.mutantBonus * 0.1 +
            gbMutant * 0.12
        );
        if (Math.random() > mutantChance) continue;
        const mutMult =
          0.7 +
          bait.mutantBonus * 1.2 +
          gbMutant * 1.2 +
          (isDeepSpot ? 0.18 : 0) +
          (gameState.weather === 'anomaly_surge' ? 0.55 : 0);
        w = Math.max(1, Math.round(w * mutMult));
      }
      for (let i = 0; i < w; i++) weighted.push(sp);
    }

    const chosen = weighted[Math.floor(Math.random() * weighted.length)];
    const depthWeightBonus = isDeepSpot ? 0.035 : 0;
    // One shared size percentile controls both mass and length: a longer fish is also heavier.
    // A beta-like curve makes small/ordinary specimens common and trophy specimens genuinely rare.
    const sizeBoost = Math.min(0.12, Math.max(0, gbWeight + depthWeightBonus + rigStats.weightBoostMult));
    const sizeRoll = Math.min(0.999, Math.pow(Math.random(), 2.4) + sizeBoost);
    // Fish mass grows approximately with the cube of body length, not linearly.
    const rawW = chosen.minWeightKg + Math.pow(sizeRoll, 3) * (chosen.maxWeightKg - chosen.minWeightKg);
    // Preserve sub-gram precision for insects and other tiny catches.
    const weightKg = Number(rawW.toFixed(rawW < 0.01 ? 6 : rawW < 1 ? 3 : 2));
    return {
      kind: 'fish' as const,
      species: chosen,
      weightKg,
      fightPower: chosen.fightPower,
      staminaLeft: chosen.stamina * 3.5,
      maxStamina: chosen.stamina * 3.5,
    };
  }, [
    activeGbDef,
    bait.id,
    bait.mutantBonus,
    bait.predatorBonus,
    gameState.timeOfDay,
    gameState.weather,
    location,
    maxCastM,
    rigStats.hasBottomRig,
    rigStats.weightBoostMult,
  ]);

  const completeCatch = useCallback(
    (fin: NonNullable<typeof hookedTargetRef.current>) => {
      hookedTargetRef.current = null;
      setHookedSpecies(null);
      tensionRef.current = 0;
      reelingRef.current = false;
      setIsReeling(false);
      setTensionRatio(0);

      // Small natural wear on rod/reel/line for landing a catch
      const stressRatio = Math.min(2.2, fin.weightKg / Math.max(2, rod.maxLoadKg));
      const rodWear = -Math.max(0.4, Number((0.45 + stressRatio * 0.9).toFixed(1)));
      const reelWear = -Math.max(0.3, Number((0.35 + stressRatio * 0.7).toFixed(1)));
      const lineWear = -Math.max(0.3, Number((0.4 + stressRatio * 0.85).toFixed(1)));
      const wearDeltas: Record<string, number> = {
        [rod.id]: rodWear,
        [reel.id]: reelWear,
        [line.id]: lineWear,
      };
      if (rigStats.hasBottomRig) {
        wearDeltas[bottomRigDef.id] = -0.5;
      }
      onDamageTackleRef.current(wearDeltas);

      if (fin.kind === 'loot' && fin.lootItem) {
        const entry: FoundLootEntry = {
          uid: `${fin.lootItem.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          itemId: fin.lootItem.id,
          locationId: location.id,
          foundDay: gameState.day,
          value: fin.lootItem.sellValue,
          depthLayer: (() => {
            const spot = getWaterSpotInfo(location, aimYawRef.current, castDistRef.current, maxCastM);
            const ratio = fishingDepthRef.current / Math.max(0.8, spot.depthM);
            return rigStats.hasBottomRig || ratio >= 0.68 ? 'bottom' : ratio <= 0.32 ? 'surface' : 'mid';
          })(),
        };
        audioEngine.playCoin();
        setCaughtLoot({ def: fin.lootItem, entry });
        setPhase('CAUGHT');
        setStatusMsg(`Витягнуто з дна: ${fin.lootItem.name}!`);
      } else if (fin.species) {
        const sp = fin.species;
        // Trophy specimens are the extreme upper tail, not ordinary large fish.
        // 90% of the species' biological weight interval keeps records genuinely rare.
        const isTrophy =
          fin.weightKg >= sp.minWeightKg + (sp.maxWeightKg - sp.minWeightKg) * 0.90;
        const sizeProfile = sp.minLengthCm != null && sp.maxLengthCm != null;
        const weightRatio = Math.max(0, Math.min(1,
          (fin.weightKg - sp.minWeightKg) / Math.max(0.001, sp.maxWeightKg - sp.minWeightKg)
        ));
        const sizeRatio = sizeProfile ? Math.cbrt(weightRatio) : weightRatio;
        const lengthCm = sizeProfile
          ? Number((sp.minLengthCm! + sizeRatio * (sp.maxLengthCm! - sp.minLengthCm!)).toFixed(1))
          : Math.max(6, Math.round(14 + Math.pow(fin.weightKg, 0.42) * 26));
        const value = Math.max(
          8,
          Math.round(fin.weightKg * sp.basePricePerKg * (sp.isMutant ? 0.6 : 0.75) * (isTrophy ? 1.25 : 1.0))
        );

        const fishRecord: CaughtFish = {
          uid: `${sp.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          speciesId: sp.id,
          faunaKind: sp.faunaKind ?? (sp.isMutant ? 'mutant' : 'fish'),
          weightKg: fin.weightKg,
          lengthCm,
          value,
          isTrophy,
          isMutant: sp.isMutant,
          locationId: location.id,
          caughtDay: gameState.day,
        };

        audioEngine.playCatch(sp.isMutant);
        setCaughtResult(fishRecord);
        setPhase('CAUGHT');
        setStatusMsg(`Впіймано: ${sp.name} (${fin.weightKg} кг)!`);
      }
    },
    [bottomRigDef.id, gameState.day, line.id, location, maxCastM, reel.id, rigStats.hasBottomRig, rod.id, rod.maxLoadKg]
  );

  // Mount Three.js ShoreFishingScene once per mounted FishingView
  useEffect(() => {
    if (!mountRef.current || sceneRef.current) return;
    const scene = new ShoreFishingScene(mountRef.current, {
      location,
      rodType: rod.type,
      rodLevelIndex: Math.max(0, rodIdx),
      floatDef,
      hookedSpecies,
      timeOfDay: gameState.timeOfDay,
      weather: gameState.weather,
      phase,
      chargeRatio,
      tensionRatio,
      isReeling,
      fishDistanceM: fishDistM,
      castTargetDistanceM: castDistM,
      maxCastDistanceM: maxCastM,
      aimYaw,
      fishLateralOffset: fishLateral,
    });
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync visual state to 3D scene & keep projected screen reticle synced
  useEffect(() => {
    sceneRef.current?.updateSync({
      location,
      rodType: rod.type,
      rodLevelIndex: Math.max(0, rodIdx),
      floatDef,
      hookedSpecies,
      timeOfDay: gameState.timeOfDay,
      weather: gameState.weather,
      phase,
      chargeRatio,
      tensionRatio,
      isReeling,
      fishDistanceM: fishDistM,
      castTargetDistanceM: castDistM,
      maxCastDistanceM: maxCastM,
      aimYaw,
      fishLateralOffset: fishLateral,
      aimOutOfBounds: aimBlockedByShore,
    });
    if (sceneRef.current && (phase === 'IDLE' || phase === 'CHARGING' || isAimingRecast)) {
      setReticlePos(sceneRef.current.projectWaterToScreen(aimYaw, castDistM, maxCastM));
    } else {
      setReticlePos((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    }
  }, [
    aimBlockedByShore,
    aimYaw,
    castDistM,
    chargeRatio,
    fishDistM,
    fishLateral,
    floatDef,
    gameState.timeOfDay,
    gameState.weather,
    hookedSpecies,
    isAimingRecast,
    isReeling,
    location,
    maxCastM,
    phase,
    rod.type,
    rodIdx,
    tensionRatio,
  ]);

  const blowoutPulseCounterRef = useRef(0);

  // Game clock + radiation + sanity tick
  useEffect(() => {
    const id = window.setInterval(() => {
      if (
        isModalOpen ||
        caughtResult ||
        caughtLoot ||
        showKeepnet ||
        showRigDrawer
      ) {
        return;
      }
      const effectiveRadRes = gameState.radSuitLevel + rigStats.gearRadResistBonus;
      const radDiff = Math.max(0, location.radiationLevel - effectiveRadRes);
      const radGain = radDiff > 0 ? radDiff * 0.45 : -0.15;

      let extraRad = 0;
      if (gameState.weather === 'anomaly_surge') {
        blowoutPulseCounterRef.current += 1;
        if (blowoutPulseCounterRef.current >= 32) {
          blowoutPulseCounterRef.current = 0;
          extraRad = 0.8;
          setStatusMsg('Аномальний викид! Радіаційний фон різко зріс!');
        }
      } else {
        blowoutPulseCounterRef.current = 0;
      }

      onClockAndRadTick(0.025, radGain + extraRad);
    }, 500);
    return () => window.clearInterval(id);
  }, [
    caughtLoot,
    caughtResult,
    gameState.radSuitLevel,
    gameState.timeOfDay,
    gameState.weather,
    isModalOpen,
    location.anomalyActivity,
    location.radiationLevel,
    onClockAndRadTick,
    rigStats.gearRadResistBonus,
    rigStats.gearSanityShieldBonus,
    showKeepnet,
    showRigDrawer,
    showSonar,
  ]);

  // Real-time fishing physics loop
  useEffect(() => {
    let rafId = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const curPhase = phaseRef.current;

      if (curPhase === 'CHARGING') {
        chargeRef.current += chargeDirRef.current * dt * 1.45;
        if (chargeRef.current >= 1) {
          chargeRef.current = 1;
          chargeDirRef.current = -1;
        } else if (chargeRef.current <= 0.12) {
          chargeRef.current = 0.12;
          chargeDirRef.current = 1;
        }
        setChargeRatio(chargeRef.current);
      } else if (curPhase === 'CASTING') {
        waitTimerRef.current -= dt;
        if (waitTimerRef.current <= 0) {
          audioEngine.playSplash(0.8);
          sceneRef.current?.triggerWaterSplash(1.0);
          setPhase('WAITING');
          const gbSpeed = activeGbDef ? 1 + activeGbDef.biteRateBoost : 1;
          const baseDelay = 2.4 + Math.random() * 4.0;
          waitTimerRef.current = baseDelay / (rigStats.biteSpeedMult * gbSpeed);
          setStatusMsg(
            `Поплавок на воді (${castDistRef.current.toFixed(1)} м · спуск ${fishingDepthRef.current.toFixed(1)} м). Торкніться води щоб перекинути`
          );
        }
      } else if (curPhase === 'WAITING') {
        waitTimerRef.current -= dt;
        if (waitTimerRef.current <= 0) {
          setPhase('NIBBLE');
          waitTimerRef.current = 0.85 + Math.random() * 1.1;
          setStatusMsg('Пробує наживку... Готуйтесь підсікти!');
        }
      } else if (curPhase === 'NIBBLE') {
        waitTimerRef.current -= dt;
        if (waitTimerRef.current <= 0) {
          audioEngine.playBiteBell();
          if (rigStats.hasAcousticAlarm) {
            window.setTimeout(() => audioEngine.playBiteBell(), 140);
          }
          audioEngine.playSplash(0.65);
          sceneRef.current?.triggerWaterSplash(0.8);
          setPhase('BITE');
          biteWindowRef.current = 2.6 + rigStats.hookRetentionBonus;
          setStatusMsg('КЛЮЄ! Тисніть [ПІДСІКТИ] або [Пробіл]!');
        }
      } else if (curPhase === 'BITE') {
        biteWindowRef.current -= dt;
        if (biteWindowRef.current <= 0) {
          hookedTargetRef.current = null;
          setHookedSpecies(null);
          setPhase('IDLE');
          setStatusMsg('Риба зійшла з гачка... Закидайте знову.');
        }
      } else if (curPhase === 'SNAGGED') {
        // Slowly decay tension & check overload while snagged
        tensionRef.current = Math.max(0.25, tensionRef.current - dt * 0.28);
        setTensionRatio(Math.min(1, tensionRef.current));
        if (tensionRef.current >= 0.98) {
          overloadTimerRef.current += dt;
          if (overloadTimerRef.current >= 1.1) {
            audioEngine.playSnap();
            hookedTargetRef.current = null;
            setHookedSpecies(null);
            tensionRef.current = 0;
            overloadTimerRef.current = 0;
            setTensionRatio(0);
            setPhase('IDLE');
            onDamageTackleRef.current({ [rod.id]: -8, [line.id]: -10 });
            onLineSnapRef.current?.(bait.id);
            setStatusMsg('Обрив на зачепі! Снасть зазнала зносу.');
          }
        } else {
          overloadTimerRef.current = Math.max(0, overloadTimerRef.current - dt);
        }
      } else if (curPhase === 'FIGHTING' && hookedTargetRef.current) {
        const active = hookedTargetRef.current;
        const maxGearKg = rigStats.maxGearLoadKg;
        const dragKg = (dragRef.current / 10) * reel.dragPowerKg;

        const surgeWave =
          active.kind === 'loot'
            ? 0.45
            : 0.65 + 0.55 * Math.sin(now * 0.0038 + active.fightPower);
        const staminaFrac = Math.max(0.25, active.staminaLeft / active.maxStamina);
        const fishPullKg =
          active.weightKg * (0.55 + active.fightPower * 0.14) * surgeWave * staminaFrac;

        const activePull = reelingRef.current ? dragKg * 1.22 : dragKg * 0.38;
        const rawTensionKg = Math.max(
          0.2,
          fishPullKg * (reelingRef.current ? 1.18 : 0.72) + activePull * 0.45
        );
        const targetTension = Math.min(1.12, rawTensionKg / maxGearKg);
        tensionRef.current =
          tensionRef.current + (targetTension - tensionRef.current) * Math.min(1, dt * 6);
        setTensionRatio(Math.min(1, tensionRef.current));

        const waterMax = getWaterDistBoundsForYaw(
          location,
          aimYawRef.current,
          maxCastM
        ).maxDistM;
        const fightMaxDist = Math.max(0.35, Math.min(waterMax, maxCastM));

        // Occasional bottom/weed snag roll while reeling deep in water
        if (reelingRef.current && fishDistRef.current > 2.5 && fishDistRef.current < 4.7) {
          const spot = getWaterSpotInfo(location, aimYawRef.current, castDistRef.current, maxCastM);
          const nearBottom = fishingDepthRef.current >= spot.depthM * 0.72 || rigStats.hasBottomRig;
          if (nearBottom) {
            const snagChancePerSec = 0.022 * rigStats.snagRiskMult;
            if (Math.random() < snagChancePerSec * dt) {
              reelingRef.current = false;
              setIsReeling(false);
              snagProgressRef.current = 15;
              setSnagProgress(15);
              tensionRef.current = Math.max(tensionRef.current, 0.55);
              setTensionRatio(tensionRef.current);
              setPhase('SNAGGED');
              setStatusMsg('ЗАЧЕП ЗА КОРЧ! Смикайте [ВІДЧЕПИТИ] або обріжте жилку.');
              rafId = requestAnimationFrame(step);
              return;
            }
          }
        }

        if (reelingRef.current) {
          const pullAdvantage =
            Math.max(-1.8, (dragKg - fishPullKg * 0.65) * 0.52) * effectiveRetrieveSpeed;
          fishDistRef.current = Math.max(
            0.35,
            Math.min(fightMaxDist, fishDistRef.current - pullAdvantage * dt)
          );
          active.staminaLeft = Math.max(
            0,
            active.staminaLeft - dt * (1.2 + dragRef.current * 0.15)
          );

          tickAudioTimerRef.current -= dt;
          if (tickAudioTimerRef.current <= 0) {
            audioEngine.playReelTick(Math.min(1, tensionRef.current));
            tickAudioTimerRef.current = 0.11;
          }
        } else {
          if (fishPullKg > dragKg) {
            fishDistRef.current = Math.min(fightMaxDist, fishDistRef.current + dt * 2.0);
          }
          active.staminaLeft = Math.max(0, active.staminaLeft - dt * 0.35);
        }

        fishLateralRef.current =
          active.kind === 'loot'
            ? 0
            : Math.sin(now * 0.0021) * Math.min(1, active.fightPower / 7);
        setFishDistM(Number(fishDistRef.current.toFixed(1)));
        setFishLateral(fishLateralRef.current);

        // Wear rod/reel/line when overloaded >= 88%
        if (tensionRef.current >= 0.88) {
          wearTimerRef.current += dt;
          if (wearTimerRef.current >= 0.7) {
            wearTimerRef.current = 0;
            onDamageTackleRef.current({ [rod.id]: -1.5, [reel.id]: -1.0, [line.id]: -1.8 });
            const brokenPart = rodDurabilityRef.current <= 1.5
              ? 'Вудлище'
              : reelDurabilityRef.current <= 1
                ? 'Котушка'
                : lineDurabilityRef.current <= 1.8
                  ? 'Волосінь'
                  : null;
            if (brokenPart) {
              audioEngine.playSnap();
              hookedTargetRef.current = null;
              setHookedSpecies(null);
              tensionRef.current = 0;
              reelingRef.current = false;
              setIsReeling(false);
              setTensionRatio(0);
              setPhase('IDLE');
              if (brokenPart === 'Волосінь') onLineSnapRef.current?.(bait.id);
              setStatusMsg(`${brokenPart.toUpperCase()} ЗЛАМАНА! Виважування припинено. Полагодьте снасть у Бункері.`);
              rafId = requestAnimationFrame(step);
              return;
            }
          }
        } else {
          wearTimerRef.current = 0;
        }

        if (tensionRef.current >= 0.98) {
          overloadTimerRef.current += dt;
          setStatusMsg('ПЕРЕНАВАНТАЖЕННЯ! Ослабте фрикціон [-] або відпустіть тягу!');
          if (overloadTimerRef.current >= 1.35) {
            audioEngine.playSnap();
            hookedTargetRef.current = null;
            setHookedSpecies(null);
            tensionRef.current = 0;
            overloadTimerRef.current = 0;
            setTensionRatio(0);
            setIsReeling(false);
            reelingRef.current = false;
            setPhase('IDLE');
            onDamageTackleRef.current({ [rod.id]: -4, [line.id]: -8 });
            onLineSnapRef.current?.(bait.id);
            setStatusMsg('Обрив волосіні! Надто сильний ривок для поточної снасті.');
          }
        } else {
          overloadTimerRef.current = Math.max(0, overloadTimerRef.current - dt * 1.5);
          if (tensionRef.current < 0.14 && !reelingRef.current && active.kind === 'fish') {
            looseTimerRef.current += dt;
            if (looseTimerRef.current > 3.6 + rigStats.hookRetentionBonus * 2.5) {
              hookedTargetRef.current = null;
              setHookedSpecies(null);
              setPhase('IDLE');
              setStatusMsg('Слабка натяжка — риба зійшла з гачка.');
            }
          } else {
            looseTimerRef.current = 0;
            setStatusMsg(
              reelingRef.current
                ? `Виважування... Дистанція: ${fishDistRef.current.toFixed(1)} м`
                : `Утримуйте [ТЯГНУТИ], контролюйте натяг!`
            );
          }
        }

        // Auto-landed at shore!
        const autoLandDist = rigStats.hasLandingNet ? 0.8 : 0.55;
        if (fishDistRef.current <= autoLandDist && hookedTargetRef.current) {
          completeCatch(hookedTargetRef.current);
        }
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [
    activeGbDef,
    bait.id,
    completeCatch,
    effectiveRetrieveSpeed,
    line.id,
    location,
    maxCastM,
    reel.dragPowerKg,
    reel.id,
    rigStats.biteSpeedMult,
    rigStats.hasAcousticAlarm,
    rigStats.hasBottomRig,
    rigStats.hasLandingNet,
    rigStats.hookRetentionBonus,
    rigStats.maxGearLoadKg,
    rigStats.snagRiskMult,
    rod.id,
  ]);

  const castToWaterSpot = useCallback(
    (targetYaw: number, targetDistM: number, isRecast = false) => {
      audioEngine.init();
      if (isRodBroken) {
        setStatusMsg(
          'Вудлище зламане (0%)! Полагодьте у майстра Олега або виберіть інше в «Екіпіровці».'
        );
        return;
      }
      const qty = gameState.baitInventory[bait.id] ?? 0;
      if (!isRecast && qty <= 0) {
        setStatusMsg('Закінчилась вибрана наживка! Оберіть іншу в меню або купіть у Бункері.');
        return;
      }
      const bounded = clampCastToWaterBounds(location, targetYaw, targetDistM, maxCastM);
      const clampedYaw = bounded.yaw;
      const dist = bounded.distM;
      const spot = getWaterSpotInfo(location, clampedYaw, dist, maxCastM);

      setAimBlockedByShore(false);
      aimYawRef.current = clampedYaw;
      castDistRef.current = dist;
      setAimYaw(clampedYaw);
      setCastDistM(dist);
      setActiveCastSpot({ yaw: clampedYaw, distM: dist });
      setSonarScan((value) => value + 1);
      fishDistRef.current = dist;
      setFishDistM(dist);

      const maxSafeDepth = Math.max(0.4, Number((spot.depthM - 0.1).toFixed(1)));
      if (bottomLockRef.current || rigStats.hasBottomRig) {
        setFishingDepthM(maxSafeDepth);
        fishingDepthRef.current = maxSafeDepth;
      } else if (fishingDepthRef.current > maxSafeDepth) {
        setFishingDepthM(maxSafeDepth);
        fishingDepthRef.current = maxSafeDepth;
      }

      if (!isRecast) {
        onConsumeBait(bait.id);
      }
      audioEngine.playCast();
      waitTimerRef.current = isRecast ? 0.36 : 0.48;
      setPhase('CASTING');
      setStatusMsg(
        isRecast
          ? `Перекидаємо снасть → ${dist} м (глиб. ${spot.depthM} м · спуск ${fishingDepthRef.current.toFixed(1)} м)...`
          : `Закидання на ${dist} м (глиб. ${spot.depthM} м · ${spot.zoneLabel})...`
      );
    },
    [bait.id, gameState.baitInventory, isRodBroken, location, maxCastM, onConsumeBait, rigStats.hasBottomRig]
  );

  const startCharge = useCallback(() => {
    audioEngine.init();
    if (isTackleBroken) {
      const brokenName = isRodBroken ? 'Вудлище' : isReelBroken ? 'Котушка' : 'Волосінь';
      setStatusMsg(`${brokenName} зламана (0%)! Відремонтуйте її у майстра Олега в Бункері.`);
      return;
    }
    const qty = gameState.baitInventory[bait.id] ?? 0;
    if (qty <= 0) {
      setStatusMsg('Закінчилась вибрана наживка! Оберіть іншу в меню або купіть у Бункері.');
      return;
    }
    chargeRef.current = 0.24;
    chargeDirRef.current = 1;
    setChargeRatio(0.24);
    setPhase('CHARGING');
    setStatusMsg('Набір сили закидання... Відпустіть для кидка!');
  }, [bait.id, gameState.baitInventory, isLineBroken, isReelBroken, isRodBroken, isTackleBroken]);

  const releaseCast = useCallback(() => {
    if (phaseRef.current !== 'CHARGING') return;
    const bounds = getWaterDistBoundsForYaw(location, aimYawRef.current, maxCastM);
    const minD = bounds.hasWater ? bounds.minDistM : 6;
    const maxD = bounds.hasWater ? bounds.maxDistM : maxCastM;
    const dist = Number((minD + chargeRef.current * Math.max(0, maxD - minD)).toFixed(1));
    castToWaterSpot(aimYawRef.current, dist, false);
  }, [castToWaterSpot, location, maxCastM]);

  const performStrike = useCallback(() => {
    const cur = phaseRef.current;
    if (cur === 'NIBBLE') {
      setPhase('IDLE');
      setStatusMsg('Занадто рано підсікли! Почекайте чіткого занурення поплавка.');
      return;
    }
    if (cur !== 'BITE') return;

    const target = pickHookTarget();
    hookedTargetRef.current = target;
    setHookedSpecies(target.kind === 'fish' && target.species ? target.species : null);
    const startFightDist = Number(Math.max(0.35, Math.min(castDistRef.current, maxCastM)).toFixed(1));
    fishDistRef.current = startFightDist;
    setFishDistM(startFightDist);
    tensionRef.current = target.kind === 'loot' ? 0.25 : 0.35;
    overloadTimerRef.current = 0;
    looseTimerRef.current = 0;
    setTensionRatio(tensionRef.current);
    audioEngine.playSplash(1.25);
    sceneRef.current?.triggerWaterSplash(1.3);
    setPhase('FIGHTING');
    setStatusMsg(
      target.kind === 'loot'
        ? `На гачку донна знахідка (${startFightDist} м) — тягніть обережно!`
        : `Є! ${target.species?.name ?? 'Риба'} на гачку (${startFightDist} м) — тягніть обережно!`
    );
  }, [maxCastM, pickHookTarget]);

  const handleSnagJerk = useCallback(() => {
    if (phaseRef.current !== 'SNAGGED') return;
    audioEngine.playReelTick(0.8);
    tensionRef.current = Math.min(1.06, tensionRef.current + 0.16);
    setTensionRatio(Math.min(1, tensionRef.current));
    const gain = 24 + rigStats.gearSnagEscapeBonus * 45 + Math.random() * 14;
    const nextProg = Math.min(100, snagProgressRef.current + gain);
    snagProgressRef.current = nextProg;
    setSnagProgress(Math.round(nextProg));

    if (nextProg >= 100) {
      snagProgressRef.current = 0;
      setSnagProgress(0);
      tensionRef.current = 0.42;
      setTensionRatio(0.42);
      if (hookedTargetRef.current) {
        setPhase('FIGHTING');
        setStatusMsg('Зачеп знято! Продовжуйте виважування!');
      } else {
        setPhase('IDLE');
        setStatusMsg('Снасть успішно звільнено від корча!');
      }
    }
  }, [rigStats.gearSnagEscapeBonus]);

  const handleCutSnagLine = useCallback(() => {
    if (phaseRef.current !== 'SNAGGED') return;
    audioEngine.playSnap();
    hookedTargetRef.current = null;
    setHookedSpecies(null);
    snagProgressRef.current = 0;
    setSnagProgress(0);
    tensionRef.current = 0;
    setTensionRatio(0);
    setIsReeling(false);
    reelingRef.current = false;
    setPhase('IDLE');
    onDamageTackleRef.current({ [line.id]: -5 });
    onLineSnapRef.current?.(bait.id);
    setStatusMsg('Жилку обрізано на зачепі. Вудлище ціле — можна закидати знову.');
  }, [bait.id, line.id]);

  const handleLandingNetGrab = useCallback(() => {
    if (phaseRef.current !== 'FIGHTING' || !hookedTargetRef.current) return;
    const reach = rigStats.hasLandingNet ? 2.6 : 2.1;
    if (fishDistRef.current > reach) return;
    completeCatch(hookedTargetRef.current);
  }, [completeCatch, rigStats.hasLandingNet]);

  const handlePrimaryDown = useCallback(() => {
    const cur = phaseRef.current;
    if (cur === 'IDLE') startCharge();
    else if (cur === 'NIBBLE' || cur === 'BITE') performStrike();
    else if (cur === 'FIGHTING') {
      reelingRef.current = true;
      setIsReeling(true);
    } else if (cur === 'SNAGGED') {
      handleSnagJerk();
    }
  }, [handleSnagJerk, performStrike, startCharge]);

  const handlePrimaryUp = useCallback(() => {
    const cur = phaseRef.current;
    if (waterAimActiveRef.current) {
      waterAimActiveRef.current = false;
      setIsAimingRecast(false);
      if (cur === 'IDLE' || cur === 'WAITING') {
        castToWaterSpot(aimYawRef.current, castDistRef.current, cur === 'WAITING');
      }
    }
    if (cur === 'CHARGING') releaseCast();
    if (reelingRef.current) {
      reelingRef.current = false;
      setIsReeling(false);
    }
  }, [castToWaterSpot, releaseCast]);

  const handleReelOutReset = useCallback(() => {
    reelingRef.current = false;
    setIsReeling(false);
    hookedTargetRef.current = null;
    setHookedSpecies(null);
    setPhase('IDLE');
    setStatusMsg('Снасть вимотано. Торкніться будь-де на водоймі для нового закиду.');
  }, []);

  const handleSelectWaterSpot = useCallback(
    (yaw: number, distM: number, immediateCast = false) => {
      const bounded = clampCastToWaterBounds(location, yaw, distM, maxCastM);
      setAimBlockedByShore(false);
      aimYawRef.current = bounded.yaw;
      castDistRef.current = bounded.distM;
      setAimYaw(bounded.yaw);
      setCastDistM(bounded.distM);
      if (immediateCast && (phaseRef.current === 'IDLE' || phaseRef.current === 'WAITING')) {
        castToWaterSpot(bounded.yaw, bounded.distM, phaseRef.current === 'WAITING');
      }
    },
    [castToWaterSpot, location, maxCastM]
  );

  // Global pointerup/cancel/blur safety + modal-aware keyboard bindings
  useEffect(() => {
    const onGlobalRelease = () => {
      handlePrimaryUp();
    };
    const onGlobalCancel = () => {
      waterAimActiveRef.current = false;
      handlePrimaryUp();
    };
    const isBlocked =
      isModalOpen ||
      Boolean(caughtResult) ||
      Boolean(caughtLoot) ||
      showKeepnet ||
      showBaitDrawer ||
      showRigDrawer;

    const onKeyDown = (e: KeyboardEvent) => {
      if (isBlocked) {
        if (e.code === 'Escape') {
          setShowKeepnet(false);
          setShowBaitDrawer(false);
          setShowRigDrawer(false);
          setShowSonar(false);
        }
        return;
      }
      if (e.repeat) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handlePrimaryDown();
      } else if (e.code === 'KeyE') {
        handleLandingNetGrab();
      } else if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        setDragLevel((d) => Math.min(10, d + 1));
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        setDragLevel((d) => Math.max(1, d - 1));
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        const nextYaw = Math.max(-0.82, aimYawRef.current - 0.12);
        const bounded = clampCastToWaterBounds(location, nextYaw, castDistRef.current, maxCastM);
        setAimYaw(bounded.yaw);
        setCastDistM(bounded.distM);
        setAimBlockedByShore(false);
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        const nextYaw = Math.min(0.82, aimYawRef.current + 0.12);
        const bounded = clampCastToWaterBounds(location, nextYaw, castDistRef.current, maxCastM);
        setAimYaw(bounded.yaw);
        setCastDistM(bounded.distM);
        setAimBlockedByShore(false);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') handlePrimaryUp();
    };
    window.addEventListener('pointerup', onGlobalRelease);
    window.addEventListener('pointercancel', onGlobalCancel);
    window.addEventListener('blur', onGlobalCancel);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('pointerup', onGlobalRelease);
      window.removeEventListener('pointercancel', onGlobalCancel);
      window.removeEventListener('blur', onGlobalCancel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [
    caughtLoot,
    caughtResult,
    handleLandingNetGrab,
    handlePrimaryDown,
    handlePrimaryUp,
    isModalOpen,
    location,
    maxCastM,
    showBaitDrawer,
    showKeepnet,
    showRigDrawer,
    showSonar,
  ]);

  const { clock } = formatClock(gameState.timeOfDay);
  const caughtSpecies = caughtResult ? FISH_MAP[caughtResult.speciesId] : null;
  const canFitInKeepnet = caughtResult
    ? keepnetWeight + caughtResult.weightKg <= keepnetCap
    : true;

  const antiradQty = gameState.consumableInventory['antirad_ai2'] ?? 0;
  const energyQty = gameState.consumableInventory['energy_stalker'] ?? 0;
  const hungerFoods = LOOT_ITEMS.filter(
    (i) => i.category === 'consumable' && (i.isFood || i.sanityRestore) && (gameState.consumableInventory[i.id] ?? 0) > 0
  );

  const filteredBaits = useMemo(() => {
    return BAITS.filter((b) => baitFilter === 'all' || b.category === baitFilter).sort(
      (a, b) => {
        const qa = gameState.baitInventory[a.id] ?? 0;
        const qb = gameState.baitInventory[b.id] ?? 0;
        if (qa > 0 && qb <= 0) return -1;
        if (qb > 0 && qa <= 0) return 1;
        return 0;
      }
    );
  }, [baitFilter, gameState.baitInventory]);

  const h = gameState.timeOfDay;
  const photoBrightness =
    h >= 21 || h < 5 ? 0.52 : h >= 18 || h < 7 ? 0.85 : 1.04;

  const weatherMeta = WEATHER_INFO[gameState.weather];

  const landingReachM = rigStats.hasLandingNet ? 2.6 : 2.1;
  const canShowLandingPrompt = phase === 'FIGHTING' && fishDistM <= landingReachM;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060b09] select-none">
      {/* Real Location Photo Backdrop when configured */}
      {location.backdropPhotoUrl && (
        <img
          src={location.backdropPhotoUrl}
          alt={location.name}
          referrerPolicy="no-referrer"
          style={{ filter: `brightness(${photoBrightness})` }}
          className="fixed inset-0 w-full h-full object-cover object-center z-0 pointer-events-none select-none"
          draggable={false}
        />
      )}

      {/* 3D WebGL Shoreline / Transparent Overlay Canvas */}
      <div
        ref={mountRef}
        onPointerMove={(e) => {
          if (
            isModalOpen ||
            caughtResult ||
            caughtLoot ||
            showKeepnet ||
            showBaitDrawer ||
            showRigDrawer
          ) {
            return;
          }
          if (
            (phaseRef.current === 'IDLE' ||
              (phaseRef.current === 'WAITING' && waterAimActiveRef.current)) &&
            sceneRef.current
          ) {
            const proj = sceneRef.current.projectScreenToWater(e.clientX, e.clientY, maxCastM);
            aimYawRef.current = proj.yaw;
            castDistRef.current = proj.distM;
            setAimYaw(proj.yaw);
            setCastDistM(proj.distM);
            setAimBlockedByShore(!proj.isWater);
            if (phaseRef.current === 'WAITING') {
              const spot = getWaterSpotInfo(location, proj.yaw, proj.distM, maxCastM);
              setStatusMsg(
                proj.isWater
                  ? `Перекинути поплавок → ${proj.distM} м · Глиб. ${spot.depthM} м (${spot.zoneLabel})`
                  : `Межа берега! Перекид утримано на краю води (${proj.distM} м)`
              );
            }
          }
        }}
        onPointerDown={(e) => {
          if (
            e.button !== 0 ||
            isModalOpen ||
            caughtResult ||
            caughtLoot ||
            showKeepnet ||
            showBaitDrawer ||
            showRigDrawer
          ) {
            return;
          }
          if ((phaseRef.current === 'IDLE' || phaseRef.current === 'WAITING') && sceneRef.current) {
            audioEngine.init();
            const isRecast = phaseRef.current === 'WAITING';
            if (isRodBroken) {
              setStatusMsg(
                'Вудлище зламане (0%)! Полагодьте у майстра Олега або виберіть інше в «Монтажі».'
              );
              return;
            }
            const qty = gameState.baitInventory[bait.id] ?? 0;
            if (!isRecast && qty <= 0) {
              setStatusMsg('Закінчилась вибрана наживка! Оберіть іншу в меню або купіть у Бункері.');
              return;
            }
            const proj = sceneRef.current.projectScreenToWater(e.clientX, e.clientY, maxCastM);
            aimYawRef.current = proj.yaw;
            castDistRef.current = proj.distM;
            setAimYaw(proj.yaw);
            setCastDistM(proj.distM);

            if (!proj.isWater) {
              setAimBlockedByShore(true);
              setStatusMsg('Це берег або перешкода — торкніться поверхні води для закиду!');
              return;
            }

            setAimBlockedByShore(false);
            waterAimActiveRef.current = true;
            if (isRecast) setIsAimingRecast(true);
            const spot = getWaterSpotInfo(location, proj.yaw, proj.distM, maxCastM);
            setStatusMsg(
              isRecast
                ? `Перекинути снасть → ${proj.distM} м · Глиб. ${spot.depthM} м (${spot.zoneLabel}) — відпустіть`
                : `Точка: ${proj.distM} м · Глиб. ${spot.depthM} м (${spot.zoneLabel}) — відпустіть для закиду`
            );
            return;
          }
          handlePrimaryDown();
        }}
        onPointerUp={handlePrimaryUp}
        className="fixed inset-0 z-[1] cursor-crosshair touch-none"
      />

      {/* Projected Water Target Info Badge over the 3D water reticle */}
      {(phase === 'IDLE' || phase === 'CHARGING' || isAimingRecast) && reticlePos.visible && (
        <div
          style={{
            left: `${Math.max(12, Math.min(88, reticlePos.xPct))}%`,
            top: `${Math.max(18, Math.min(72, reticlePos.yPct))}%`,
          }}
          className={`fixed z-10 pointer-events-none -translate-x-1/2 -translate-y-8 px-2 py-0.5 rounded bg-[#07110d]/90 text-[10px] font-mono-num whitespace-nowrap shadow-md border ${
            aimBlockedByShore
              ? 'border-rose-400/70 text-rose-200'
              : 'border-amber-400/45 text-amber-200'
          }`}
        >
          {aimBlockedByShore
            ? `Берег · межа води (${castDistM.toFixed(1)} м)`
            : `${isAimingRecast ? 'Перекид: ' : ''}${castDistM.toFixed(1)} м · Глиб. ${currentWaterSpot.depthM} м · ${currentWaterSpot.zoneLabel}`}
        </div>
      )}

      {/* Visual Weather Effects Layer */}
      <WeatherEffectsOverlay
        weather={gameState.weather}
        timeOfDay={gameState.timeOfDay}
        anomalyActivity={location.anomalyActivity}
        sanity={100}
        isPhotoMode={Boolean(location.backdropPhotoUrl)}
      />

      {/* COMPACT LOCATION MENU — keeps the fishing view clear */}
      <button
        type="button"
        onClick={() => setShowLocationMenu(true)}
        className="fixed top-3 right-3 z-30 btn-tactile btn-field min-h-[44px] inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold shadow-xl"
        aria-label="Відкрити меню локації"
      >
        <Compass className="w-4 h-4 text-teal-300" />
        Меню
      </button>

      {showLocationMenu && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#020604]/80 p-3 pt-14 backdrop-blur-sm"
          onClick={() => setShowLocationMenu(false)}
        >
          <section
            className="panel-window w-full max-w-xl rounded-2xl border border-emerald-400/25 p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold text-slate-100">Меню локації</h2>
                <p className="truncate text-xs text-slate-400">{location.name} · {weatherMeta.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationMenu(false)}
                className="btn-tactile btn-field inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-lg"
                aria-label="Закрити меню"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl border border-white/10 bg-black/25 p-3 text-[11px]">
              <div><div className="text-slate-400">Час</div><div className="font-mono-num font-semibold text-amber-300">{clock}</div></div>
              <div><div className="text-slate-400">Гривні</div><div className="font-mono-num font-semibold text-emerald-300">₴ {gameState.credits}</div></div>
              <div><div className="text-slate-400">Золото</div><div className="font-mono-num font-semibold text-yellow-300">◈ {gameState.goldCoins ?? 0}</div></div>
              <div><div className="text-slate-400">Бурштин</div><div className="font-mono-num font-semibold text-orange-300">◆ {gameState.amberShards ?? 0}</div></div>
              <div><div className="text-slate-400">Садок</div><div className="font-mono-num font-semibold text-slate-100">{keepnetWeight.toFixed(1)} / {keepnetCap} кг</div></div>
              <div><div className="text-slate-400">Радіація</div><div className="font-mono-num text-slate-100">{Math.round(gameState.radiation)} мЗв</div></div>
              <div><div className="text-slate-400">Голод</div><div className="font-mono-num text-amber-200">{Math.round(gameState.hunger)}%</div></div>
              <div><div className="text-slate-400">Вудка</div><div className="truncate text-slate-100">{Math.round(rodDurability)}%</div></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" disabled={phase !== 'IDLE'} onClick={() => { setShowLocationMenu(false); setRigTab('bait'); setShowRigDrawer(true); }} className="btn-tactile btn-field min-h-[48px] rounded-xl px-3 text-left text-sm font-semibold disabled:opacity-50">Наживка · {bait.name}</button>
              <button type="button" disabled={phase !== 'IDLE'} onClick={() => { setShowLocationMenu(false); setRigTab('groundbait'); setShowRigDrawer(true); }} className="btn-tactile btn-field min-h-[48px] rounded-xl px-3 text-left text-sm font-semibold disabled:opacity-50">Прикормка · {activeGbDef?.name ?? (activeGb ? 'Активна' : 'обрати')}</button>
              {antiradQty > 0 && gameState.radiation > 5 && <button type="button" onClick={() => { onUseConsumable('antirad_ai2'); setShowLocationMenu(false); }} className="btn-tactile btn-field min-h-[44px] rounded-xl px-3 text-left text-xs font-semibold">Антирад ({antiradQty})</button>}
              {energyQty > 0 && !isEnergyActive && <button type="button" onClick={() => { onUseConsumable('energy_stalker'); setShowLocationMenu(false); }} className="btn-tactile btn-field min-h-[44px] rounded-xl px-3 text-left text-xs font-semibold">Енергетик ({energyQty})</button>}
              {gameState.hunger < 85 && hungerFoods.slice(0, 2).map((food) => {
                const qty = gameState.consumableInventory[food.id] ?? 0;
                const label = food.id === 'herbal_tea' ? 'Чай' : food.id === 'canned_stew' ? 'Тушкованка' : 'Шоколад';
                return <button key={food.id} type="button" onClick={() => { onUseConsumable(food.id); setShowLocationMenu(false); }} className="btn-tactile btn-field min-h-[44px] rounded-xl px-3 text-left text-xs font-semibold">{label} ({qty})</button>;
              })}

              <button type="button" onClick={() => { setShowLocationMenu(false); setRigTab('rod'); setShowRigDrawer(true); }} className="btn-tactile btn-field min-h-[48px] rounded-xl px-3 text-left text-sm font-semibold"><Wrench className="mr-2 inline h-4 w-4 text-sky-300" />Екіпіровка</button>
              <button type="button" onClick={() => { setShowLocationMenu(false); setShowKeepnet(true); }} className="btn-tactile btn-field min-h-[48px] rounded-xl px-3 text-left text-sm font-semibold"><Package className="mr-2 inline h-4 w-4 text-amber-300" />Садок ({gameState.keepnet.length})</button>
              <button type="button" onClick={() => { setShowLocationMenu(false); onOpenInventory(); }} className="btn-tactile btn-field min-h-[48px] rounded-xl px-3 text-left text-sm font-semibold"><Shield className="mr-2 inline h-4 w-4 text-sky-300" />Рюкзак</button>
              <button type="button" onClick={() => { setShowLocationMenu(false); onOpenJournal(); }} className="btn-tactile btn-field min-h-[48px] rounded-xl px-3 text-left text-sm font-semibold"><BookMarked className="mr-2 inline h-4 w-4 text-teal-300" />Журнал</button>
              <button type="button" onClick={() => { setShowLocationMenu(false); onOpenQuests(); }} className="btn-tactile btn-field min-h-[48px] rounded-xl px-3 text-left text-sm font-semibold"><ScrollText className="mr-2 inline h-4 w-4 text-emerald-300" />Завдання</button>
              <button type="button" onClick={() => { setShowLocationMenu(false); onOpenMap(); }} className="btn-tactile btn-field min-h-[48px] rounded-xl px-3 text-left text-sm font-semibold"><Compass className="mr-2 inline h-4 w-4 text-teal-300" />Карта</button>
              <button type="button" onClick={() => { setShowLocationMenu(false); onGoToBunker(); }} className="btn-tactile btn-primary-emerald col-span-2 min-h-[48px] rounded-xl px-3 text-sm font-bold"><Warehouse className="mr-2 inline h-4 w-4" />Повернутися до бункера</button>
              <button type="button" onClick={onToggleMusic} className="btn-tactile btn-field min-h-[44px] rounded-xl px-3 text-xs font-semibold">{musicEnabled ? 'Вимкнути музику' : 'Увімкнути музику'}</button>
              <button type="button" onClick={onToggleMute} className="btn-tactile btn-field min-h-[44px] rounded-xl px-3 text-xs font-semibold">{muted ? 'Увімкнути звук' : 'Вимкнути звук'}</button>
            </div>
          </section>
        </div>
      )}

      {/* КОМПАКТНИЙ 2D-СОНАР: поверхня, поплавок, відбиття та дно */}
      {showSonar ? (
        <div
          className="pointer-events-none fixed z-[90] w-[min(360px,calc(100vw-16px))] select-none"
          style={{ left: sonarLeft, top: sonarTop }}
        >
          <div className="relative aspect-[16/9] w-full">
            <div
              className="pointer-events-auto absolute -top-5 left-0 right-0 flex h-5 touch-none items-center justify-center rounded-t-md border border-slate-500/70 bg-slate-950/95 text-[9px] font-bold tracking-wide text-cyan-100 active:cursor-grabbing cursor-grab"
              title="Перетягніть, щоб перемістити ехолот"
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                sonarDragRef.current = { pointerX: event.clientX, pointerY: event.clientY, left: sonarLeft, top: sonarTop };
              }}
              onPointerMove={handleSonarDragMove}
              onPointerUp={stopSonarDrag}
              onPointerCancel={stopSonarDrag}
            >⠿ ПЕРЕМІСТИТИ ЕХОЛОТ</div>
            <img
              src={`${import.meta.env.BASE_URL}Ехолот_на_весь_екран_52de58a7.jpg`}
              alt="Корпус ехолота"
              className="absolute inset-0 h-full w-full object-fill drop-shadow-[0_5px_12px_rgba(0,0,0,0.55)]"
              draggable={false}
            />
            
            <button type="button" onClick={() => setShowSonar(false)} aria-label="Вимкнути ехолот" className="pointer-events-auto absolute right-[16%] top-[3%] z-30 flex h-5 w-5 items-center justify-center rounded-full border border-slate-400/60 bg-black/80 text-slate-100 shadow"><span className="text-[10px] leading-none">⏻</span></button>
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[3px] border border-[#101820] bg-[#06131d] shadow-[inset_0_0_12px_rgba(0,0,0,0.95)]"
              style={{ width: `${sonarScreenWidth}%`, height: `${sonarScreenHeight}%` }}
            >
              <svg viewBox="0 0 240 120" preserveAspectRatio="none" className="block h-full w-full" role="img" aria-label="Кольоровий ехолот: поплавок, глибина, риб'ячі відбиття та контур дна">
                <defs>
                  <linearGradient id="sonarWaterColumn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#092b43"/><stop offset="52%" stopColor="#061d31"/><stop offset="100%" stopColor="#071522"/>
                  </linearGradient>
                  <linearGradient id="sonarBottomFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#244d45"/><stop offset="28%" stopColor="#18352f"/><stop offset="100%" stopColor="#101d1c"/>
                  </linearGradient>
                  <linearGradient id="sonarBottomReturn" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38a9a0"/><stop offset="35%" stopColor="#a8d85a"/><stop offset="65%" stopColor="#e9a34a"/><stop offset="100%" stopColor="#42b7aa"/>
                  </linearGradient>
                  <filter id="sonarSoftGlow"><feGaussianBlur stdDeviation="2"/></filter>
                  <pattern id="sonarNoise" width="13" height="9" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="3" r=".65" fill="#8bd8d2" opacity=".22"/><circle cx="9" cy="7" r=".5" fill="#4b9cb7" opacity=".24"/>
                  </pattern>
                </defs>
                <rect width="240" height="120" fill="url(#sonarWaterColumn)"/>
                <rect width="240" height="120" fill="url(#sonarNoise)" opacity=".65"/>
                {Array.from({length:5},(_,i)=><g key={`sonar-grid-${i}`}>
                  <line x1="0" y1={22+i*17} x2="240" y2={22+i*17} stroke="#9ac9dc" strokeOpacity=".28" strokeDasharray="3 4"/>
                  <rect x="1" y={13+i*17} width="22" height="12" rx="2" fill="#020b13" fillOpacity=".82"/>
                  <text x="4" y={22+i*17} fontSize="9" fontWeight="bold" fill="#f1fbff" stroke="#07131d" strokeWidth=".7" paintOrder="stroke">{(sonarMaxDepth*i/5).toFixed(0)}м</text>
                </g>)}
                <text x="27" y="11" fontSize="8" fontWeight="bold" fill="#d8f1ff" letterSpacing=".4" stroke="#06131d" strokeWidth="1.5" paintOrder="stroke">POLISSIA · SONAR</text>
                <rect x="190" y="2" width="48" height="15" rx="3" fill="#020b13" fillOpacity=".9"/>
                <text x="234" y="13" textAnchor="end" fontSize="11" fontWeight="bold" fill="#ffffff" stroke="#06131d" strokeWidth=".7" paintOrder="stroke">{currentWaterSpot.depthM.toFixed(1)} м</text>

                {/* Рельєф дна займає нижню частину дисплея */}
                <path d={sonarBottomAreaD} fill="url(#sonarBottomFill)"/>
                <path d={sonarBottomLineD} fill="none" stroke="#c9ef82" strokeWidth="5" opacity=".18" filter="url(#sonarSoftGlow)"/>
                <path d={sonarBottomLineD} fill="none" stroke="url(#sonarBottomReturn)" strokeWidth="2.8" strokeLinejoin="round"/>
                <path d={sonarBottomLineD} fill="none" stroke="#f3d18a" strokeWidth=".65" opacity=".9" strokeLinejoin="round"/>
                <path d={`${sonarBottomLineD} L240 120 L0 120 Z`} fill="none" stroke="#0a1117" strokeWidth="1.1"/>

                {/* Слабкі донні/рослинні відбиття, риба — дугами */}
                <path d={`M18 ${Math.min(sonarBottomY-10,74)} q12 -7 24 0 M84 ${Math.min(sonarBottomY-12,66)} q10 -5 20 0 M166 ${Math.min(sonarBottomY-10,76)} q12 -7 24 0`} fill="none" stroke="#4aa99a" strokeWidth="1.2" opacity=".48"/>
                {hasProSonar && sonarEchoes.map((echo,index)=><g key={`sonar-echo-${index}`} opacity={0.65+echo.strength*.35}>
                  <path d={`M${echo.x-9} ${echo.y+2} Q${echo.x} ${echo.y-7-echo.strength*3} ${echo.x+9} ${echo.y+2}`} fill="none" stroke="#a7e8e7" strokeWidth="2.2" strokeLinecap="round"/>
                  <path d={`M${echo.x-7} ${echo.y+2} Q${echo.x} ${echo.y-4} ${echo.x+7} ${echo.y+2}`} fill="none" stroke="#e6f7db" strokeWidth=".8" strokeLinecap="round"/>
                </g>)}

                {/* Поплавок на поверхні та волосінь до гачка — глибина відповідає налаштуванню */}
                <line x1="120" y1="18" x2="120" y2={Math.min(sonarBottomY-7,18+(effectiveFishingDepthM/Math.max(.5,currentWaterSpot.depthM))*(sonarBottomY-28))} stroke="#d7edf2" strokeWidth="1.1" strokeDasharray="2 2" opacity=".9"/>
                <path d="M116 13 L120 8 L124 13 L123 19 L117 19 Z" fill="#f4f7f7" stroke="#17232a" strokeWidth=".8"/>
                <path d="M117 14 L123 14 L122 18 L118 18 Z" fill="#e84f43"/>
                <circle cx="120" cy="11" r="1.5" fill="#ffffff"/>
                <circle cx="120" cy={Math.min(sonarBottomY-7,18+(effectiveFishingDepthM/Math.max(.5,currentWaterSpot.depthM))*(sonarBottomY-28))} r="2.1" fill="#f0d18b" stroke="#18242b" strokeWidth=".8"/>
                <path d={`M120 ${Math.min(sonarBottomY-7,18+(effectiveFishingDepthM/Math.max(.5,currentWaterSpot.depthM))*(sonarBottomY-28))+1} q-4 4 0 7 q4 -3 0 -7`} fill="none" stroke="#f3d7a2" strokeWidth="1.1"/>
                <rect x="126" y="18" width="67" height="13" rx="3" fill="#03101a" fillOpacity=".9"/>
                <text x="130" y="27" fontSize="8.5" fontWeight="bold" fill="#fff0c5" stroke="#03101a" strokeWidth=".6" paintOrder="stroke">ПОПЛАВОК</text>
                <rect x="126" y="32" width="40" height="12" rx="3" fill="#03101a" fillOpacity=".88"/>
                <text x="130" y="41" fontSize="8.5" fontWeight="bold" fill="#ffffff" stroke="#03101a" strokeWidth=".6" paintOrder="stroke">{effectiveFishingDepthM.toFixed(1)} м</text>
                <rect x="2" y="106" width="35" height="12" rx="2" fill="#020b13" fillOpacity=".92"/>
                <text x="5" y="115" fontSize="9" fontWeight="bold" fill="#e9f8db">ДНО</text>
                <rect x="151" y="106" width="87" height="12" rx="2" fill="#020b13" fillOpacity=".92"/>
                <text x="234" y="115" textAnchor="end" fontSize="8.5" fontWeight="bold" fill="#ffffff" stroke="#020b13" strokeWidth=".6" paintOrder="stroke">ДО ДНА {Math.max(0,currentWaterSpot.depthM-effectiveFishingDepthM).toFixed(1)}м</text>
              </svg>
              <div className="pointer-events-auto absolute right-[1%] top-[17%] bottom-[13%] flex items-center">
                <input aria-label="Глибина поплавка та гачка" title="Перетягніть, щоб змінити глибину поплавкової оснастки" type="range" min="0.4" max={Math.max(0.4,currentWaterSpot.depthM-0.1)} step="0.1" value={effectiveFishingDepthM} onChange={(event) => handleChangeFishingDepth(Number(event.target.value))} className="h-full w-2 cursor-ns-resize accent-cyan-300" style={{writingMode:"vertical-lr",direction:"rtl",touchAction:"none"}}/>
              </div>
            </div>
            {true && (
              <div className="pointer-events-auto absolute left-0 right-0 top-full z-[100] mt-1 rounded-lg border-2 border-cyan-400 bg-slate-950 p-2 text-[10px] text-slate-100 shadow-2xl">
                <div className="mb-1 text-center font-black tracking-wide text-cyan-200">⚙ РЕДАГУВАННЯ ЕХОЛОТА</div><div className="mb-1 flex items-center justify-between"><span>Ширина екрана</span><span className="font-mono">{sonarScreenWidth}%</span></div>
                <input aria-label="Ширина вікна ехолота" type="range" min="45" max="94" value={sonarScreenWidth} onChange={(event)=>setSonarScreenWidth(Number(event.target.value))} className="h-3 w-full accent-cyan-300"/>
                <div className="mb-1 mt-1 flex items-center justify-between"><span>Висота екрана</span><span className="font-mono">{sonarScreenHeight}%</span></div>
                <input aria-label="Висота вікна ехолота" type="range" min="30" max="88" value={sonarScreenHeight} onChange={(event)=>setSonarScreenHeight(Number(event.target.value))} className="h-3 w-full accent-cyan-300"/>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <button type="button" onClick={()=>{setSonarScreenWidth(76);setSonarScreenHeight(58);setSonarLeft(8);setSonarTop(8);}} className="rounded bg-slate-700 px-2 py-1.5 font-semibold">Скинути</button>
                  <button type="button" onClick={saveSonarLayout} className="rounded bg-emerald-700 px-2 py-1.5 font-bold text-white">Зберегти</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setShowSonar(true)} aria-label="Увімкнути ехолот" className="pointer-events-auto fixed right-2 top-2 z-[60] flex h-7 w-7 items-center justify-center rounded-lg border border-slate-400/40 bg-[#101820]/75 text-slate-300 shadow backdrop-blur-sm"><Radar className="h-4 w-4"/></button>
      )}
      {/* CENTER STATUS, FIGHTING, SNAGGED & LANDING NET GAUGES */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 sm:bottom-24 z-20 flex flex-col items-center gap-2.5 px-4">
        {phase === 'CHARGING' && (
          <div className="w-64 panel-field rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Сила закиду</span>
              <span className="font-mono-num text-amber-300">
                {Math.round(chargeRatio * 100)}% · ~{(getWaterDistBoundsForYaw(location, aimYaw, maxCastM).minDistM + chargeRatio * (getWaterDistBoundsForYaw(location, aimYaw, maxCastM).maxDistM - getWaterDistBoundsForYaw(location, aimYaw, maxCastM).minDistM)).toFixed(1)} м
              </span>
            </div>
            <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
                style={{ width: `${chargeRatio * 100}%` }}
              />
            </div>
          </div>
        )}

        {phase === 'SNAGGED' && (
          <div className="w-88 max-w-[94vw] panel-field border-rose-400/50 rounded-xl p-3.5 space-y-2.5 pointer-events-auto">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                ЗАЧЕП ЗА КОРЧ / КАМІНЬ!
              </span>
              <span className="font-mono-num text-amber-300">{snagProgress}%</span>
            </div>
            <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${snagProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Натяг: {Math.round(tensionRatio * 100)}%</span>
              <span>Не перевантажте вище 98%!</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSnagJerk}
                className="btn-tactile btn-primary-amber flex-1 min-h-[42px] rounded-lg text-xs font-bold cursor-pointer"
              >
                Смикнути / Відчепити [Space]
              </button>
              <button
                type="button"
                onClick={handleCutSnagLine}
                className="btn-tactile min-h-[42px] px-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-950/70 border border-rose-400/45 text-rose-200 text-xs font-semibold cursor-pointer"
              >
                <Scissors className="w-3.5 h-3.5" />
                Обрізати жилку
              </button>
            </div>
          </div>
        )}

        <div
          className={`px-4 py-2 rounded-xl border text-xs font-semibold text-center shadow-xl ${
            phase === 'BITE'
              ? 'bg-amber-500 text-slate-950 border-amber-200 font-bold'
              : phase === 'SNAGGED'
                ? 'bg-rose-950/90 text-rose-100 border-rose-400/60'
                : 'panel-field text-slate-200'
          }`}
        >
          {statusMsg}
        </div>
      </div>

      {/* COMPACT RIGHT-SIDE FISHING TENSION METER */}
      {phase === 'FIGHTING' && (
        <div
          className="pointer-events-none fixed right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 rounded-xl border border-cyan-300/20 bg-[#06131b]/80 px-1.5 py-2 shadow-lg backdrop-blur-sm flex items-stretch gap-2"
          aria-label={`Риба на відстані ${fishDistM.toFixed(1)} метрів. Натяг волосіні ${Math.round(tensionRatio * 100)} відсотків`}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-[7px] font-bold uppercase tracking-wider text-cyan-200 [writing-mode:vertical-rl] rotate-180">Дистанція</span>
            <span className="font-mono-num text-[9px] font-black text-white">{fishDistM.toFixed(1)}м</span>
            <div className="relative h-32 w-3 rounded-full border border-cyan-200/25 bg-slate-950/90 overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-px bg-emerald-300/70" />
              <div className="absolute left-0 right-0 h-1 rounded-full bg-amber-300 shadow-[0_0_8px_#fbbf24] transition-[bottom] duration-100" style={{ bottom: `${Math.max(0, Math.min(100, (fishDistM / Math.max(1, maxCastM)) * 100))}%` }} />
              <div className="absolute inset-x-0 top-1/4 border-t border-white/15" />
              <div className="absolute inset-x-0 top-1/2 border-t border-white/15" />
              <div className="absolute inset-x-0 top-3/4 border-t border-white/15" />
            </div>
            <span className="text-[7px] text-slate-400">БЕРЕГ</span>
          </div>
          <div className="w-px bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[7px] font-bold uppercase tracking-wider text-slate-300 [writing-mode:vertical-rl] rotate-180">Натяг</span>
            <div className="relative h-32 w-2.5 rounded-full bg-slate-950/90 border border-white/20 overflow-hidden flex items-end">
              <div
                className={`w-full transition-all duration-75 ${
                  tensionRatio > 0.85
                    ? 'bg-rose-500'
                    : tensionRatio > 0.55
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                }`}
                style={{ height: `${Math.min(100, tensionRatio * 100)}%` }}
              />
              <div className="absolute inset-x-0 top-[15%] border-t border-white/45" />
              <div className="absolute inset-x-0 top-[45%] border-t border-white/35" />
              <div className="absolute inset-x-0 top-[70%] border-t border-white/35" />
            </div>
            <span className={`font-mono-num text-[10px] font-bold ${
              tensionRatio > 0.85
                ? 'text-rose-400'
                : tensionRatio > 0.55
                  ? 'text-amber-300'
                  : 'text-emerald-300'
            }`}>{Math.round(tensionRatio * 100)}%</span>
          </div>
        </div>
      )}

      {/* SIMPLE DIRECT FISHING CONTROLS — no separate control window */}
      <div className="fixed bottom-3 inset-x-0 z-30 flex items-end justify-center gap-2 px-3 pointer-events-none">
        {(phase === 'IDLE' || phase === 'WAITING') && (
          <div className="pointer-events-auto flex items-center gap-1 rounded-xl bg-[#06100c]/75 border border-white/10 p-1.5 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => handleChangeFishingDepth(Math.max(0.4, Number((effectiveFishingDepthM - 0.4).toFixed(1))), false)}
              disabled={rigStats.hasBottomRig}
              className="btn-tactile btn-field min-w-[38px] min-h-[44px] rounded-lg text-sm font-bold disabled:opacity-40"
              aria-label="Підняти поплавок"
            >−</button>
            <button
              type="button"
              onClick={() => handleChangeFishingDepth(currentWaterSpot.depthM, !bottomLock)}
              disabled={rigStats.hasBottomRig}
              className="btn-tactile btn-field min-h-[44px] min-w-[62px] rounded-lg px-2 text-center disabled:opacity-50"
              title="Зафіксувати гачок біля дна"
            >
              <span className="block text-[9px] text-slate-400">{rigStats.hasBottomRig ? 'ДОНКА' : bottomLock ? 'НА ДНІ' : 'СПУСК'}</span>
              <span className="block font-mono-num text-xs font-bold text-amber-300">{effectiveFishingDepthM.toFixed(1)} м</span>
            </button>
            <button
              type="button"
              onClick={() => handleChangeFishingDepth(Math.min(currentWaterSpot.depthM - 0.1, Number((effectiveFishingDepthM + 0.4).toFixed(1))), false)}
              disabled={rigStats.hasBottomRig}
              className="btn-tactile btn-field min-w-[38px] min-h-[44px] rounded-lg text-sm font-bold disabled:opacity-40"
              aria-label="Опустити гачок"
            >+</button>
          </div>
        )}

        {phase === 'FIGHTING' && (
          <div className="pointer-events-auto flex items-center gap-1 rounded-xl bg-[#06100c]/80 border border-amber-300/20 p-1.5 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setDragLevel((d) => Math.max(1, d - 1))}
              className="btn-tactile btn-field min-w-[38px] min-h-[44px] rounded-lg text-base font-bold"
              aria-label="Послабити фрикціон"
            >−</button>
            <div className="min-w-[54px] text-center">
              <span className="block text-[9px] text-slate-400">ФРИКЦІОН</span>
              <span className="block font-mono-num text-sm font-bold text-amber-300">{dragLevel}/10</span>
            </div>
            <button
              type="button"
              onClick={() => setDragLevel((d) => Math.min(10, d + 1))}
              className="btn-tactile btn-field min-w-[38px] min-h-[44px] rounded-lg text-base font-bold"
              aria-label="Затягнути фрикціон"
            >+</button>
          </div>
        )}

        {phase === 'WAITING' && (
          <button
            type="button"
            onClick={handleReelOutReset}
            className="pointer-events-auto btn-tactile btn-field min-h-[48px] rounded-xl px-3 text-xs font-semibold"
          >Вимотати</button>
        )}

        <button
          type="button"
          onPointerDown={handlePrimaryDown}
          onPointerUp={handlePrimaryUp}
          onPointerCancel={handlePrimaryUp}
          className={`pointer-events-auto btn-tactile min-h-[54px] min-w-[150px] inline-flex items-center justify-center gap-2 px-5 py-3 font-bold text-sm rounded-xl cursor-pointer touch-none shadow-lg ${
            phase === 'FIGHTING'
              ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 text-white border border-emerald-300/60 shadow-[0_6px_22px_rgba(16,185,129,0.35)]'
              : phase === 'BITE' || phase === 'NIBBLE'
                ? 'bg-gradient-to-b from-rose-500 to-rose-600 text-white border border-rose-300/60'
                : 'btn-primary-amber'
          }`}
          aria-label={phase === 'FIGHTING' ? 'Утримуйте, щоб підмотувати волосінь' : 'Основна дія риболовлі'}
        >
          <Anchor className="w-4 h-4" />
          {phase === 'IDLE'
            ? 'ЗАКИНУТИ'
            : phase === 'CHARGING'
              ? 'ВІДПУСТИТИ!'
              : phase === 'BITE' || phase === 'NIBBLE'
                ? 'ПІДСІКТИ!'
                : phase === 'FIGHTING'
                  ? isReeling ? 'ПІДМОТУВАННЯ…' : 'УТРИМУЙ: ТЯГНИ'
                  : phase === 'SNAGGED'
                    ? 'ВІДЧЕПИТИ!'
                    : 'ОЧІКУВАННЯ'}
        </button>
      </div>

      {/* TOUCH BAIT DRAWER MODAL */}
      {showBaitDrawer && (
        <div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-3 sm:p-5 bg-[#040706]/82"
          onClick={() => setShowBaitDrawer(false)}
        >
          <div
            className="w-full max-w-2xl panel-window rounded-2xl p-4 sm:p-5 space-y-3.5 max-h-[84vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-slate-100">
                  Вибір наживки або штучної приманки
                </h3>
                <p className="text-xs text-slate-400">
                  Доступно {BAITS.length} видів наживок і воблерів · Торкніться картки для встановлення
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBaitDrawer(false)}
                className="btn-tactile btn-field min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg cursor-pointer"
                aria-label="Закрити вибір наживки"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-nowrap gap-1.5 overflow-x-auto custom-scroll pb-1">
              {(
                [
                  { id: 'all', label: 'Усі' },
                  { id: 'natural', label: 'Живі' },
                  { id: 'plant', label: 'Рослинні' },
                  { id: 'lure', label: 'Штучні приманки' },
                  { id: 'anomaly', label: 'Аномальні' },
                ] as { id: BaitFilterTab; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setBaitFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                    baitFilter === tab.id
                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                      : 'bg-[#08100c] border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredBaits.map((b) => {
                const qty = gameState.baitInventory[b.id] ?? 0;
                const available = qty > 0;
                const active = bait.id === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    disabled={!available}
                    onClick={() => {
                      onSelectBait(b.id);
                      setShowBaitDrawer(false);
                    }}
                    className={`btn-tactile min-h-[64px] text-left p-3.5 rounded-xl border flex flex-col justify-between gap-1.5 ${
                      active
                        ? 'bg-amber-950/55 border-amber-400/70 text-slate-100 cursor-pointer'
                        : available
                          ? 'bg-[#09120e] border-white/12 hover:border-emerald-400/40 text-slate-200 cursor-pointer'
                          : 'bg-[#050806] border-white/5 opacity-45 cursor-not-allowed'
                    }`}
                  >
                    <CatalogPhoto query={`fishing bait ${b.name}`} fallbackQueries={['fishing bait', 'fishing lure']} alt={b.name} className="w-full h-20 rounded-lg" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-semibold truncate">{b.name}</span>
                      <span className="font-mono-num text-xs font-bold text-amber-300 shrink-0">
                        {b.category === 'lure' ? (qty > 0 ? `${qty} (багатор.)` : '0') : `${qty} шт.`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Кльов ×{b.biteSpeedBonus}</span>
                      <span className="text-emerald-300">
                        +{Math.round(b.mutantBonus * 100)}% мутанти
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* QUICK RIGGING DRAWER (МОНТАЖ СНАСТІ) */}
      {showRigDrawer && (
        <div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-3 sm:p-5 bg-[#040706]/85"
          onClick={() => setShowRigDrawer(false)}
        >
          <div
            className="w-full max-w-3xl panel-window rounded-2xl p-4 sm:p-5 space-y-3.5 max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-slate-100">
                  Екіпіровка рибалки та монтаж снасті
                </h3>
                <p className="text-xs text-slate-400">
                  Макс. закид {maxCastM.toFixed(0)} м · Ліміт навантаження{' '}
                  {rigStats.maxGearLoadKg.toFixed(1)} кг · Множник кльову ×
                  {rigStats.biteSpeedMult.toFixed(2)}
                  {phase !== 'IDLE' ? ' · Перевстановлення доступне після вимотування' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRigDrawer(false)}
                className="btn-tactile btn-field min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg cursor-pointer"
                aria-label="Закрити монтаж"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-nowrap gap-1.5 overflow-x-auto custom-scroll pb-1">
              {(
                [
                  { id: 'rod', label: 'Вудка' },
                  { id: 'reel', label: 'Котушка' },
                  { id: 'line', label: 'Волосінь' },
                  { id: 'float', label: 'Поплавок' },
                  { id: 'hooks_sinkers', label: 'Гачок і груз' },
                  { id: 'rigs', label: 'Донка / Годівн.' },
                  { id: 'flavor_acc', label: 'Фурнітура' },
                  { id: 'bait', label: 'Наживка' },
                  { id: 'groundbait', label: 'Прикормка' },
                  { id: 'gear', label: 'Одяг і спорядження' },
                ] as { id: RigTab; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRigTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                    rigTab === tab.id
                      ? 'bg-sky-500/20 border-sky-400/60 text-sky-200'
                      : 'bg-[#08100c] border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll space-y-2.5 pr-1">
              {rigTab === 'bait' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { id: 'all', label: 'Усі' },
                        { id: 'natural', label: 'Живі' },
                        { id: 'plant', label: 'Рослинні' },
                        { id: 'lure', label: 'Штучні' },
                        { id: 'anomaly', label: 'Аномальні' },
                      ] as { id: BaitFilterTab; label: string }[]
                    ).map((tab) => (
                      <button key={tab.id} type="button" onClick={() => setBaitFilter(tab.id)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${baitFilter === tab.id ? 'border-amber-400/60 bg-amber-500/20 text-amber-200' : 'border-white/10 bg-[#08100c] text-slate-400'}`}>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">Обрана наживка встановлюється на гачок. Витрата відбувається під час закиду; штучні приманки багаторазові.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredBaits.map((item) => {
                      const qty = gameState.baitInventory[item.id] ?? 0;
                      const active = bait.id === item.id;
                      return (
                        <button key={item.id} type="button" disabled={phase !== 'IDLE' || qty <= 0}
                          onClick={() => onSelectBait(item.id)}
                          className={`rounded-xl border p-3 text-left disabled:opacity-40 ${active ? 'border-amber-400/70 bg-amber-950/50' : 'border-white/10 bg-[#09120e]'}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-100">{item.name}</span>
                            <span className="text-xs font-mono-num text-amber-300">{item.category === 'lure' ? (qty > 0 ? `${qty} · багаторазова` : '0') : `${qty} шт.`}</span>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-400">{item.description}</div>
                          <div className="mt-1 text-[11px] text-emerald-300">Кльов ×{item.biteSpeedBonus} · бонус мутантів +{Math.round(item.mutantBonus * 100)}%</div>
                          {active && <div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-amber-300">Встановлено на снасть</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {rigTab === 'groundbait' && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-950/20 p-3">
                    <div className="text-xs font-bold text-emerald-300">Закормлена точка</div>
                    {activeGbDef && activeGb
                      ? <div className="mt-1 text-sm text-slate-100">{activeGbDef.name} · залишилось {activeGb.castsLeft} закидів</div>
                      : <div className="mt-1 text-xs text-slate-400">На цій локації точка ще не закормлена.</div>}
                    <p className="mt-1 text-[11px] text-slate-400">Прикормка діє на поточній водоймі протягом п’яти закидів. Повторний закорм замінює попередній.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {GROUNDBAITS.map((item) => {
                      const qty = gameState.groundbaitInventory[item.id] ?? 0;
                      const active = activeGb?.groundbaitId === item.id;
                      return (
                        <button key={item.id} type="button" disabled={phase !== 'IDLE' || qty <= 0}
                          onClick={() => { onThrowGroundbait(item.id); setShowRigDrawer(false); }}
                          className={`rounded-xl border p-3 text-left disabled:opacity-40 ${active ? 'border-emerald-400/60 bg-emerald-950/40' : 'border-white/10 bg-[#09120e]'}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-100">{item.name}</span>
                            <span className="text-xs font-mono-num text-amber-300">{qty} пач.</span>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-400">{item.description}</div>
                          <div className="mt-1 text-[11px] text-emerald-300">{item.targetNote} · ефект ×{item.biteRateBoost.toFixed(2)}</div>
                          {active && <div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-emerald-300">Активна на цій точці</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {rigTab === 'rod' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {RODS.filter((r) => gameState.ownedRodIds.includes(r.id)).map((item) => {
                    const active = item.id === rod.id;
                    const dur = Math.round(gameState.itemDurability[item.id] ?? 100);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={phase !== 'IDLE'}
                        onClick={() => onSelectRod(item.id)}
                        className={`text-left p-3 rounded-xl border transition cursor-pointer disabled:opacity-60 ${
                          active
                            ? 'bg-amber-950/50 border-amber-400/70'
                            : 'bg-[#09120e] border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-100">
                          <span>{item.name}</span>
                          <span className={dur <= 20 ? 'text-rose-400' : 'text-emerald-300'}>
                            {dur}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {item.typeLabel} · {item.lengthM}м · до {item.maxLoadKg} кг · +{item.castBonusM}м закид
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {rigTab === 'reel' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {REELS.filter((r) => gameState.ownedReelIds.includes(r.id)).map((item) => {
                    const active = item.id === reel.id;
                    const dur = Math.round(gameState.itemDurability[item.id] ?? 100);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={phase !== 'IDLE'}
                        onClick={() => onSelectReel(item.id)}
                        className={`text-left p-3 rounded-xl border transition cursor-pointer disabled:opacity-60 ${
                          active
                            ? 'bg-amber-950/50 border-amber-400/70'
                            : 'bg-[#09120e] border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-100">
                          <span>{item.name}</span>
                          <span className="text-emerald-300">{dur}%</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Фрикціон {item.dragPowerKg} кг · Тяга ×{item.retrieveSpeed} · {item.gearRatio}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {rigTab === 'line' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {LINES.filter((l) => gameState.ownedLineIds.includes(l.id)).map((item) => {
                    const active = item.id === line.id;
                    const dur = Math.round(gameState.itemDurability[item.id] ?? 100);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={phase !== 'IDLE'}
                        onClick={() => onSelectLine(item.id)}
                        className={`text-left p-3 rounded-xl border transition cursor-pointer disabled:opacity-60 ${
                          active
                            ? 'bg-amber-950/50 border-amber-400/70'
                            : 'bg-[#09120e] border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-100">
                          <span>{item.name}</span>
                          <span className="text-emerald-300">{dur}%</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {item.thicknessMm} мм · до {item.maxTensionKg} кг · {item.lengthM} м
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {rigTab === 'float' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FLOATS.filter((f) => gameState.ownedFloatIds.includes(f.id)).map((item) => {
                    const active = item.id === floatDef.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={phase !== 'IDLE'}
                        onClick={() => onSelectFloat(item.id)}
                        className={`text-left p-3 rounded-xl border transition cursor-pointer disabled:opacity-60 ${
                          active
                            ? 'bg-amber-950/50 border-amber-400/70'
                            : 'bg-[#09120e] border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-100">
                          <span className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full inline-block border border-white/40"
                              style={{ backgroundColor: item.tipHex }}
                            />
                            {item.name}
                          </span>
                          {active && <Check className="w-4 h-4 text-amber-300" />}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Чутливість +{Math.round(item.biteSensitivityBonus * 100)}%
                          {item.nightGlow ? ' · Світлячок' : ''}
                          {item.electronic ? ' · Електронний LED' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {rigTab === 'hooks_sinkers' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 mb-2">Гачки</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {HOOKS.filter((hItem) => gameState.ownedHookIds.includes(hItem.id)).map(
                        (item) => {
                          const active = item.id === hookDef.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={phase !== 'IDLE'}
                              onClick={() => onSelectHook(item.id)}
                              className={`text-left p-2.5 rounded-xl border cursor-pointer disabled:opacity-60 ${
                                active
                                  ? 'bg-amber-950/50 border-amber-400/70'
                                  : 'bg-[#09120e] border-white/10 hover:border-white/25'
                              }`}
                            >
                              <div className="text-xs font-bold text-slate-100">{item.name}</div>
                              <div className="text-[11px] text-slate-400">
                                Кльов +{Math.round(item.biteRateBonus * 100)}% · Утримання +
                                {Math.round(item.hookRetentionBonus * 100)}%
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 mb-2">Грузила</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SINKERS.filter((s) => gameState.ownedSinkerIds.includes(s.id)).map(
                        (item) => {
                          const active = item.id === sinkerDef.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={phase !== 'IDLE'}
                              onClick={() => onSelectSinker(item.id)}
                              className={`text-left p-2.5 rounded-xl border cursor-pointer disabled:opacity-60 ${
                                active
                                  ? 'bg-amber-950/50 border-amber-400/70'
                                  : 'bg-[#09120e] border-white/10 hover:border-white/25'
                              }`}
                            >
                              <div className="text-xs font-bold text-slate-100">{item.name}</div>
                              <div className="text-[11px] text-slate-400">
                                {item.weightG} г · +{item.castBonusM}м закид
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}

              {rigTab === 'rigs' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 mb-2">Донки та фідери</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {BOTTOM_RIGS.filter((r) => gameState.ownedBottomRigIds.includes(r.id)).map(
                        (item) => {
                          const active = item.id === bottomRigDef.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={phase !== 'IDLE'}
                              onClick={() => onSelectBottomRig(item.id)}
                              className={`text-left p-2.5 rounded-xl border cursor-pointer disabled:opacity-60 ${
                                active
                                  ? 'bg-amber-950/50 border-amber-400/70'
                                  : 'bg-[#09120e] border-white/10 hover:border-white/25'
                              }`}
                            >
                              <div className="text-xs font-bold text-slate-100">{item.name}</div>
                              <div className="text-[11px] text-slate-400">
                                {item.id === 'brig_none'
                                  ? 'Звичайний поплавковий або спінінговий монтаж'
                                  : `До ${item.maxLoadKg} кг · +${item.castBonusM}м · Кльов +${Math.round(
                                      item.biteRateBonus * 100
                                    )}%`}
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 mb-2">Годівниці</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {FEEDERS.filter((f) => gameState.ownedFeederIds.includes(f.id)).map(
                        (item) => {
                          const active = item.id === feederDef.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={phase !== 'IDLE'}
                              onClick={() => onSelectFeeder(item.id)}
                              className={`text-left p-2.5 rounded-xl border cursor-pointer disabled:opacity-60 ${
                                active
                                  ? 'bg-amber-950/50 border-amber-400/70'
                                  : 'bg-[#09120e] border-white/10 hover:border-white/25'
                              }`}
                            >
                              <div className="text-xs font-bold text-slate-100">{item.name}</div>
                              <div className="text-[11px] text-slate-400">
                                {item.id === 'feeder_none'
                                  ? 'Без годівниці'
                                  : `${item.capacityG}г · Кльов +${Math.round(
                                      item.biteRateBoost * 100
                                    )}% · Вага +${Math.round(item.weightBoost * 100)}%`}
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}

              {rigTab === 'flavor_acc' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 mb-2">
                      Ароматизатор для наживки
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {FLAVORINGS.map((fl) => {
                        const qty =
                          fl.id === 'flav_none'
                            ? 999
                            : gameState.flavoringInventory[fl.id] ?? 0;
                        const active = fl.id === flavoringDef.id;
                        return (
                          <button
                            key={fl.id}
                            type="button"
                            disabled={phase !== 'IDLE' || (fl.id !== 'flav_none' && qty <= 0)}
                            onClick={() => onSelectFlavoring(fl.id)}
                            className={`text-left p-2.5 rounded-xl border cursor-pointer disabled:opacity-45 ${
                              active
                                ? 'bg-amber-950/50 border-amber-400/70'
                                : 'bg-[#09120e] border-white/10 hover:border-white/25'
                            }`}
                          >
                            <CatalogPhoto query={`fishing bait flavor ${fl.name}`} fallbackQueries={['fishing bait flavor', 'fishing additive']} alt={fl.name} className="w-full h-14 rounded-lg mb-2" />
                            <div className="flex justify-between text-xs font-bold text-slate-100">
                              <span>{fl.name}</span>
                              {fl.id !== 'flav_none' && (
                                <span className="text-amber-300">{qty} доз</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{fl.targetNote}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 mb-2">
                      Додаткова фурнітура та сигналізатори
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ACCESSORIES.filter((a) => gameState.ownedAccessoryIds.includes(a.id)).map(
                        (item) => {
                          const active = gameState.equippedAccessoryIds.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={phase !== 'IDLE'}
                              onClick={() => onToggleAccessory(item.id)}
                              className={`text-left p-2.5 rounded-xl border cursor-pointer disabled:opacity-60 ${
                                active
                                  ? 'bg-emerald-950/50 border-emerald-400/70'
                                  : 'bg-[#09120e] border-white/10 hover:border-white/25'
                              }`}
                            >
                              <div className="flex justify-between text-xs font-bold text-slate-100">
                                <span>{item.name}</span>
                                <span className="text-emerald-300">
                                  {active ? 'Встановлено' : 'Знято'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400">{item.description}</div>
                            </button>
                          );
                        }
                      )}
                      {gameState.ownedAccessoryIds.length === 0 && (
                        <p className="text-xs text-slate-400 col-span-2">
                          Додаткової фурнітури поки немає — купіть у Олега в Бункері.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {rigTab === 'gear' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="col-span-full rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">
                    Одяг, захист, інструменти, техніка та транспорт. Натисни на предмет, щоб одягнути або зняти його. Активні речі впливають на характеристики рибалки.
                    <div className="mt-1 text-[11px] text-slate-500">Захист костюма: рівень {gameState.radSuitLevel} · Ехолот: вбудований, доступний із початку гри</div>
                  </div>
                  {GEAR_ITEMS.filter((g) => gameState.ownedGearIds.includes(g.id)).map((item) => {
                    const active = gameState.equippedGearIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={phase !== 'IDLE'}
                        onClick={() => onToggleGearItem(item.id)}
                        className={`text-left p-3 rounded-xl border cursor-pointer ${
                          active
                            ? 'bg-emerald-950/50 border-emerald-400/70'
                            : 'bg-[#09120e] border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="flex justify-between text-xs font-bold text-slate-100">
                          <span>{item.name}</span>
                          <span className="text-emerald-300">
                            {active ? 'Активно' : 'В рюкзаку'}
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-300 mt-1">{item.effectLabel}</div>
                      </button>
                    );
                  })}
                  {gameState.ownedGearIds.length === 0 && (
                    <p className="text-xs text-slate-400 col-span-2 py-6 text-center">
                      Польового спорядження поки немає — придбайте підсак, садок, ехолот чи човен у Олега Кравчука в Бункері.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KEEPNET POPOVER */}
      {showKeepnet && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-5 bg-[#040706]/85"
          onClick={() => setShowKeepnet(false)}
        >
          <div
            className="w-full max-w-lg panel-window rounded-2xl p-5 space-y-4 max-h-[82vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-100">
                  Садок ({keepnetWeight.toFixed(1)} / {keepnetCap} кг)
                </h3>
                <p className="text-xs text-slate-400">
                  Продайте улов Тарасу Гнатовичу в Бункері «Щит-04»
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowKeepnet(false)}
                className="btn-tactile btn-field min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Закрити
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scroll space-y-2">
              {gameState.keepnet.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">Садок порожній.</p>
              ) : (
                gameState.keepnet.map((f) => {
                  const sp = FISH_MAP[f.speciesId];
                  return (
                    <div
                      key={f.uid}
                      className="flex items-center justify-between gap-3 bg-[#070d0a] border border-white/10 rounded-xl p-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        {sp && (
                          <div className="w-14 h-9 rounded border border-white/10 overflow-hidden shrink-0">
                            <FishIllustration species={sp} className="w-full h-full" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-100">
                            {sp?.name ?? f.speciesId}{' '}
                            {f.isTrophy ? '· Трофей' : f.isMutant ? '· Мутант' : ''}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono-num">
                            {f.weightKg} кг · {f.lengthCm} см
                          </div>
                        </div>
                      </div>
                      <span className="font-mono-num font-semibold text-amber-300">
                        ~₴ {f.value}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* CATCH FISH TROPHY MODAL */}
      {phase === 'CAUGHT' && caughtResult && caughtSpecies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040706]/86">
          <div className="w-full max-w-md panel-window rounded-2xl p-6 space-y-4 text-center max-h-[92vh] overflow-y-auto custom-scroll">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-300">
                {caughtResult.isMutant
                  ? 'Аномальний мутант Полісся'
                  : caughtResult.isTrophy
                    ? 'Рекордний трофей!'
                    : 'Вдалий вилов'}
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px]">
                {FAUNA_KIND_LABEL[caughtSpecies.faunaKind ?? (caughtSpecies.isMutant ? 'mutant' : 'fish')]}
              </span>
            </div>

            <div className="w-64 h-40 mx-auto bg-[#060a08] border border-white/15 rounded-xl overflow-hidden shadow-lg">
              <FishIllustration species={caughtSpecies} className="w-full h-full" />
            </div>

            <div>
              <h3 className="font-display text-2xl font-bold text-slate-100">
                {caughtSpecies.name}
              </h3>
              <p className="text-xs text-slate-400 italic">{caughtSpecies.latinName}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs bg-[#070c09] border border-white/10 rounded p-3">
              <div>
                <span className="text-slate-400 block">Вага</span>
                <span className="font-mono-num font-semibold text-slate-100">
                  {caughtResult.weightKg} кг
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Довжина</span>
                <span className="font-mono-num font-semibold text-slate-100">
                  {caughtResult.lengthCm} см
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Ціна</span>
                <span className="font-mono-num font-semibold text-amber-300">
                  ₴ {caughtResult.value}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{caughtSpecies.description}</p>
            {caughtSpecies.uniqueTrait && (
              <p className="text-[11px] text-amber-300/90">
                Особливість: {caughtSpecies.uniqueTrait}
              </p>
            )}
            {caughtSpecies.anomalyNote && (
              <p className="text-xs text-cyan-300 leading-relaxed">{caughtSpecies.anomalyNote}</p>
            )}

            {!canFitInKeepnet && (
              <p className="text-xs text-rose-300 font-medium">
                Садок заповнений ({keepnetWeight.toFixed(1)}/{keepnetCap} кг)! Можна лише відпустити за досвід або продати улов у Бункері.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              {canFitInKeepnet && (
                <button
                  type="button"
                  onClick={() => {
                    onCatchFish(caughtResult, false);
                    setCaughtResult(null);
                    setPhase('IDLE');
                    setStatusMsg('Улов покладено в садок. Готові до нового закидання!');
                  }}
                  className="btn-tactile btn-primary-amber flex-1 min-h-[48px] inline-flex items-center justify-center gap-1.5 py-2.5 font-bold text-sm rounded-xl cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  У садок
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onCatchFish(caughtResult, true);
                  setCaughtResult(null);
                  setPhase('IDLE');
                  setStatusMsg('Улов відпущено назад у воду (+досвід).');
                }}
                className="btn-tactile btn-field flex-1 min-h-[48px] inline-flex items-center justify-center gap-1.5 py-2.5 font-semibold text-sm rounded-xl cursor-pointer"
              >
                <Droplets className="w-4 h-4 text-teal-300" />
                Відпустити (+XP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOUND ITEM / ARTIFACT MODAL */}
      {phase === 'CAUGHT' && caughtLoot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040706]/86">
          <div className="w-full max-w-md panel-window rounded-2xl p-6 space-y-4 text-center">
            <div className="text-xs font-semibold text-amber-300">
              {caughtLoot.def.category === 'artifact'
                ? 'Рідкісний аномальний артефакт!'
                : caughtLoot.def.category === 'consumable'
                  ? 'Корисна польова знахідка!'
                  : 'Донна знахідка з водойми'}
            </div>

            <div className="w-44 h-28 mx-auto bg-[#060a08] border border-white/10 rounded-xl p-3 flex items-center justify-center">
              <ItemIllustration item={caughtLoot.def} className="w-28 h-20" />
            </div>

            <div>
              <h3 className="font-display text-2xl font-bold text-slate-100">
                {caughtLoot.def.name}
              </h3>
              {caughtLoot.def.effectLabel && (
                <p className="text-xs text-emerald-300 mt-1">{caughtLoot.def.effectLabel}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-[#070c09] border border-white/10 rounded-xl p-3">
              <div>
                <span className="text-slate-400 block">Вага</span>
                <span className="font-mono-num font-semibold text-slate-100">
                  {caughtLoot.def.weightKg} кг
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Цінність</span>
                <span className="font-mono-num font-semibold text-amber-300">
                  ₴ {caughtLoot.def.sellValue}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{caughtLoot.def.description}</p>

            <button
              type="button"
              onClick={() => {
                onFindLoot(caughtLoot.def, caughtLoot.entry);
                setCaughtLoot(null);
                setPhase('IDLE');
                setStatusMsg('Предмет додано до вашого рюкзака!');
              }}
              className="btn-tactile btn-primary-amber w-full min-h-[48px] inline-flex items-center justify-center gap-2 py-2.5 font-bold text-sm rounded-xl cursor-pointer"
            >
              <Package className="w-4 h-4" />
              Забрати у рюкзак
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

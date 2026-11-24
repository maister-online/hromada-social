import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Anchor,
  BookMarked,
  Box,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudFog,
  CloudRain,
  Compass,
  Droplets,
  Music,
  Package,
  Radio,
  RotateCcw,
  Scissors,
  ScrollText,
  Shield,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
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
import { getWaterSpotInfo } from '../game/bathymetry';
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
import { EchosounderPanel } from './EchosounderPanel';
import { Fauna3DPreview } from './Fauna3DPreview';
import { FishIllustration } from './FishIllustration';
import { ItemIllustration } from './ItemIllustration';
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
  onClockAndRadTick: (deltaHours: number, radDelta: number, sanityDelta?: number) => void;
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

  const rodIdx = RODS.findIndex((r) => r.id === rod.id);
  const maxCastM = location.maxCastDistanceM + rigStats.totalCastBonusM;
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
  const [castDistM, setCastDistM] = useState(16);
  const [activeCastSpot, setActiveCastSpot] = useState<{ yaw: number; distM: number }>({
    yaw: 0,
    distM: 16,
  });
  const [fishingDepthM, setFishingDepthM] = useState(1.8);
  const [bottomLock, setBottomLock] = useState(false);
  const [isAimingRecast, setIsAimingRecast] = useState(false);
  const [aimBlockedByShore, setAimBlockedByShore] = useState(false);
  const [dragLevel, setDragLevel] = useState(5); // 1..10 friction brake
  const [tensionRatio, setTensionRatio] = useState(0);
  const [fishDistM, setFishDistM] = useState(16);
  const [fishLateral, setFishLateral] = useState(0);
  const [isReeling, setIsReeling] = useState(false);
  const [snagProgress, setSnagProgress] = useState(0);
  const [hookedSpecies, setHookedSpecies] = useState<FishSpeciesDef | null>(null);
  const [statusMsg, setStatusMsg] = useState(
    'Торкніться будь-де на водоймі для закиду або утримуйте [ЗАКИНУТИ]'
  );
  const [caughtResult, setCaughtResult] = useState<CaughtFish | null>(null);
  const [caughtTab, setCaughtTab] = useState<'photo' | '3d'>('photo');
  const [caughtLoot, setCaughtLoot] = useState<{ def: LootItemDef; entry: FoundLootEntry } | null>(
    null
  );
  const [showKeepnet, setShowKeepnet] = useState(false);
  const [showBaitDrawer, setShowBaitDrawer] = useState(false);
  const [baitFilter, setBaitFilter] = useState<BaitFilterTab>('all');
  const [showRigDrawer, setShowRigDrawer] = useState(false);
  const [rigTab, setRigTab] = useState<RigTab>('rod');
  const [showSonar, setShowSonar] = useState(false);
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
  const castDistRef = useRef(16);
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

    const lootChance =
      depthLayer === 'bottom'
        ? isDeepSpot
          ? 0.22
          : 0.16
        : depthLayer === 'mid'
          ? 0.05
          : 0.01;
    const lootPool = LOOT_ITEMS.filter(
      (item) => item.minAnomalyReq <= location.anomalyActivity + 12
    );
    if (lootPool.length > 0 && Math.random() < lootChance) {
      const chosenLoot = lootPool[Math.floor(Math.random() * lootPool.length)];
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

    const pool = location.speciesIds.map((id) => FISH_MAP[id]).filter(Boolean);
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

      if (isDeepSpot && (sp.maxWeightKg >= 5 || sp.rarity === 'rare' || sp.rarity === 'legendary')) {
        w += 3;
      } else if (isShallowSpot && sp.maxWeightKg <= 4.5 && !sp.isMutant) {
        w += 3;
      }

      if (sp.isMutant) {
        const mutMult =
          1 +
          bait.mutantBonus * 3 +
          gbMutant * 3 +
          (isDeepSpot ? 0.35 : 0) +
          (gameState.weather === 'anomaly_surge' ? 0.9 : 0);
        w = Math.max(1, Math.round(w * mutMult));
      }
      for (let i = 0; i < w; i++) weighted.push(sp);
    }

    const chosen = weighted[Math.floor(Math.random() * weighted.length)];
    const depthWeightBonus = isDeepSpot ? 0.14 : 0;
    const rawW = chosen.minWeightKg + Math.random() * (chosen.maxWeightKg - chosen.minWeightKg);
    const weightKg = Number(
      (rawW * (1 + gbWeight + depthWeightBonus + rigStats.weightBoostMult)).toFixed(2)
    );
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
        };
        audioEngine.playCoin();
        setCaughtLoot({ def: fin.lootItem, entry });
        setPhase('CAUGHT');
        setStatusMsg(`Витягнуто з дна: ${fin.lootItem.name}!`);
      } else if (fin.species) {
        const sp = fin.species;
        const isTrophy =
          fin.weightKg >= sp.minWeightKg + (sp.maxWeightKg - sp.minWeightKg) * 0.78;
        const lengthCm = Math.max(6, Math.round(14 + Math.pow(fin.weightKg, 0.42) * 26));
        const value = Math.max(
          8,
          Math.round(fin.weightKg * sp.basePricePerKg * (isTrophy ? 1.35 : 1.0))
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
        setCaughtTab('photo');
        setCaughtResult(fishRecord);
        setPhase('CAUGHT');
        setStatusMsg(`Впіймано: ${sp.name} (${fin.weightKg} кг)!`);
      }
    },
    [bottomRigDef.id, gameState.day, line.id, location.id, reel.id, rigStats.hasBottomRig, rod.id, rod.maxLoadKg]
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

      const sanityFactor = Math.max(0.4, 1 - Math.min(0.6, rigStats.gearSanityShieldBonus));
      let sanityDelta = 0;
      let extraRad = 0;
      const isNightAnomaly =
        location.anomalyActivity >= 75 &&
        (gameState.timeOfDay >= 20 || gameState.timeOfDay < 5);

      if (gameState.weather === 'anomaly_surge') {
        sanityDelta = -(0.65 + (location.anomalyActivity / 100) * 0.5) * sanityFactor;
        blowoutPulseCounterRef.current += 1;
        if (blowoutPulseCounterRef.current >= 32) {
          blowoutPulseCounterRef.current = 0;
          sanityDelta -= 4.5 * sanityFactor;
          extraRad = 0.8;
          setStatusMsg('Аномальний викид! Потужна хвиля тисне на розсудливість!');
        }
      } else {
        blowoutPulseCounterRef.current = 0;
        if (isNightAnomaly) {
          sanityDelta = -0.12 * sanityFactor;
        }
      }

      onClockAndRadTick(0.025, radGain + extraRad, sanityDelta);
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
        const fightMaxDist = Math.min(5.0, waterMax);

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
            1.2,
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
            if (rodDurabilityRef.current <= 1.5) {
              audioEngine.playSnap();
              hookedTargetRef.current = null;
              setHookedSpecies(null);
              tensionRef.current = 0;
              reelingRef.current = false;
              setIsReeling(false);
              setTensionRatio(0);
              setPhase('IDLE');
              setStatusMsg('ПОЛОМКА ВУДКИ! Вудлище не витримало. Полагодьте у Олега в Бункері.');
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
        const autoLandDist = rigStats.hasLandingNet ? 2.05 : 1.75;
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
          'Вудлище зламане (0%)! Полагодьте у майстра Олега або виберіть інше в «Монтажі».'
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
    if (isRodBroken) {
      setStatusMsg(
        'Вудлище зламане (0%)! Полагодьте у майстра Олега або виберіть інше в «Монтажі».'
      );
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
  }, [bait.id, gameState.baitInventory, isRodBroken]);

  const releaseCast = useCallback(() => {
    if (phaseRef.current !== 'CHARGING') return;
    const bounds = getWaterDistBoundsForYaw(location, aimYawRef.current, maxCastM);
    const minD = bounds.hasWater ? bounds.minDistM : 6;
    const maxD = bounds.hasWater ? bounds.maxDistM : maxCastM;
    const dist = Number((minD + chargeRef.current * Math.max(2, maxD - minD)).toFixed(1));
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
    const startFightDist = Number(Math.min(5.0, Math.max(3.0, castDistRef.current)).toFixed(1));
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
  }, [pickHookTarget]);

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

  const handleToggleSonar = useCallback(() => {
    audioEngine.init();
    audioEngine.playBiteBell();
    setShowSonar((prev) => !prev);
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
  ]);

  const { clock, phaseLabel } = formatClock(gameState.timeOfDay);
  const radTooHigh =
    location.radiationLevel > gameState.radSuitLevel + rigStats.gearRadResistBonus;
  const caughtSpecies = caughtResult ? FISH_MAP[caughtResult.speciesId] : null;
  const canFitInKeepnet = caughtResult
    ? keepnetWeight + caughtResult.weightKg <= keepnetCap
    : true;

  const antiradQty = gameState.consumableInventory['antirad_ai2'] ?? 0;
  const energyQty = gameState.consumableInventory['energy_stalker'] ?? 0;
  const sanityFoods = LOOT_ITEMS.filter(
    (i) =>
      i.category === 'consumable' &&
      i.sanityRestore &&
      (gameState.consumableInventory[i.id] ?? 0) > 0
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
  const WeatherIcon = weatherMeta.Icon;

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
        sanity={gameState.sanity}
        isPhotoMode={Boolean(location.backdropPhotoUrl)}
      />

      {/* TOP HUD & MENU BAR */}
      <div className="relative z-20 pointer-events-none flex flex-wrap items-start justify-between gap-2.5 p-2.5 sm:p-4">
        {/* Location & Telemetry Panel */}
        <div className="pointer-events-auto panel-field rounded-xl px-3.5 py-2.5 space-y-2 max-w-[94vw] sm:max-w-sm">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-mono-num text-amber-300 font-semibold">
              День {gameState.day} · {clock} ({phaseLabel})
            </span>
            <span className="font-mono-num text-emerald-300 font-bold">
              ₴ {gameState.credits}
            </span>
          </div>

          <div className="border-t border-white/10 pt-1.5 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-display text-sm sm:text-base font-bold text-slate-100 leading-tight truncate">
                {location.name}
              </h2>
              <p className="text-[11px] text-slate-400">
                {location.waterLabel} · Глиб. {location.depthRangeM[0]}–{location.depthRangeM[1]} м · Аном. {location.anomalyActivity}%
              </p>
            </div>
            <div
              className={`inline-flex items-center gap-1 text-[11px] font-medium shrink-0 ${weatherMeta.colorClass}`}
              title={`Погода: ${weatherMeta.label}`}
            >
              <WeatherIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{weatherMeta.label}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Садок</span>
                <span className="font-mono-num text-slate-200">
                  {keepnetWeight.toFixed(1)}/{keepnetCap}
                </span>
              </div>
              <div className="h-1.5 bg-slate-900/90 border border-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${Math.min(100, (keepnetWeight / keepnetCap) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Радіація</span>
                <span
                  className={`font-mono-num ${
                    gameState.radiation > 40 ? 'text-rose-400' : 'text-emerald-300'
                  }`}
                >
                  {Math.round(gameState.radiation)} мЗв
                </span>
              </div>
              <div className="h-1.5 bg-slate-900/90 border border-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    gameState.radiation > 60
                      ? 'bg-rose-500'
                      : gameState.radiation > 25
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, gameState.radiation)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Розсудл.</span>
                <span
                  className={`font-mono-num ${
                    gameState.sanity <= 30
                      ? 'text-rose-400 font-semibold'
                      : gameState.sanity <= 60
                        ? 'text-amber-300'
                        : 'text-indigo-300'
                  }`}
                >
                  {Math.round(gameState.sanity)}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-900/90 border border-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    gameState.sanity <= 30
                      ? 'bg-rose-500'
                      : gameState.sanity <= 60
                        ? 'bg-amber-400'
                        : 'bg-indigo-400'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, gameState.sanity))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Tackle Micro-Summary */}
          <div className="border-t border-white/10 pt-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-300">
            <span className="truncate">
              {rod.name} ({Math.round(rodDurability)}%) · {floatDef.name}
            </span>
            <span className="font-mono-num text-amber-300 shrink-0">
              Ліміт {rigStats.maxGearLoadKg.toFixed(1)} кг
            </span>
          </div>

          {isRodBroken && (
            <div className="flex items-center gap-1.5 text-[11px] text-rose-300 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Вудлище зламане! Полагодьте у Бункері або змініть у Монтажі.
            </div>
          )}

          {radTooHigh && (
            <div className="flex items-center gap-1.5 text-[11px] text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Слабкий захист! Радіація накопичується.
            </div>
          )}

          {gameState.weather === 'anomaly_surge' && (
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-300">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              Викид! Розсудливість зменшується — вживіть провізію або укрийтесь у Бункері.
            </div>
          )}

          {gameState.sanity <= 35 && gameState.weather !== 'anomaly_surge' && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Низька розсудливість ({Math.round(gameState.sanity)}%)! Поїжте або відпочиньте в Бункері.
            </div>
          )}

          {isEnergyActive && (
            <div className="flex items-center gap-1.5 text-[11px] text-sky-300">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              Активний енергетик (+30% тяги котушки)
            </div>
          )}
        </div>

        {/* Top-Right Touch Game Menu Buttons */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setShowRigDrawer(true)}
            className="btn-tactile btn-field min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-sky-300" />
            Монтаж
          </button>

          <button
            type="button"
            onClick={() => setShowKeepnet((s) => !s)}
            className="btn-tactile btn-field min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Package className="w-4 h-4 text-amber-300" />
            Садок ({gameState.keepnet.length})
          </button>

          <button
            type="button"
            onClick={onOpenInventory}
            className="btn-tactile btn-field min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Shield className="w-4 h-4 text-sky-300" />
            Рюкзак
          </button>

          <button
            type="button"
            onClick={onOpenJournal}
            className="btn-tactile btn-field min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <BookMarked className="w-4 h-4 text-teal-300" />
            Журнал
          </button>

          <button
            type="button"
            onClick={onOpenQuests}
            className="btn-tactile btn-field min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <ScrollText className="w-4 h-4 text-emerald-300" />
            Завдання
          </button>

          <button
            type="button"
            onClick={onOpenMap}
            className="btn-tactile btn-field min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Compass className="w-4 h-4 text-teal-300" />
            Карта
          </button>

          <button
            type="button"
            onClick={onGoToBunker}
            className="btn-tactile btn-primary-emerald min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer"
          >
            <Warehouse className="w-4 h-4" />
            Бункер
          </button>

          <button
            type="button"
            onClick={onToggleMusic}
            className={`btn-tactile min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg cursor-pointer border ${
              musicEnabled && !muted
                ? 'bg-emerald-950/75 border-emerald-400/50 text-emerald-300'
                : 'btn-field text-slate-400'
            }`}
            aria-label={musicEnabled ? 'Вимкнути музику' : 'Увімкнути музику'}
            title={musicEnabled ? 'Вимкнути музику' : 'Увімкнути музику'}
          >
            <Music className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="btn-tactile btn-field min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg cursor-pointer"
            aria-label={muted ? 'Увімкнути звук' : 'Вимкнути звук'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* VISUAL ECHOSOUNDER & FULL-WATER CASTING MAP PANEL */}
      {showSonar && (
        <div className="fixed top-44 sm:top-48 left-2.5 sm:left-4 z-20 max-h-[calc(100vh-14rem)] overflow-y-auto custom-scroll">
          <EchosounderPanel
            location={location}
            aimYaw={aimYaw}
            targetDistM={castDistM}
            activeCastYaw={activeCastSpot.yaw}
            activeCastDistM={phase === 'FIGHTING' ? fishDistM : activeCastSpot.distM}
            fishingDepthM={effectiveFishingDepthM}
            bottomLock={bottomLock || rigStats.hasBottomRig}
            maxCastM={maxCastM}
            isLineInWater={phase !== 'IDLE' && phase !== 'CHARGING' && phase !== 'CAUGHT'}
            canCastNow={phase === 'IDLE' || phase === 'WAITING'}
            timeOfDay={gameState.timeOfDay}
            weather={gameState.weather}
            hasGroundbait={Boolean(activeGbDef)}
            onSelectWaterSpot={handleSelectWaterSpot}
            onChangeFishingDepth={handleChangeFishingDepth}
            onClose={() => setShowSonar(false)}
          />
        </div>
      )}

      {/* CENTER STATUS, FIGHTING, SNAGGED & LANDING NET GAUGES */}
      <div className="pointer-events-none fixed inset-x-0 bottom-38 sm:bottom-32 z-20 flex flex-col items-center gap-2.5 px-4">
        {phase === 'CHARGING' && (
          <div className="w-64 panel-field rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Сила закиду</span>
              <span className="font-mono-num text-amber-300">
                {Math.round(chargeRatio * 100)}% · ~{(7 + chargeRatio * (maxCastM - 7)).toFixed(0)} м
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

        {phase === 'FIGHTING' && (
          <div className="w-80 max-w-[92vw] panel-field rounded-xl p-3.5 space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Навантаження на снасть</span>
              <span
                className={`font-mono-num font-semibold ${
                  tensionRatio > 0.85
                    ? 'text-rose-400'
                    : tensionRatio > 0.55
                      ? 'text-amber-300'
                      : 'text-emerald-300'
                }`}
              >
                {Math.round(tensionRatio * 100)}%
              </span>
            </div>
            <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-75 ${
                  tensionRatio > 0.85
                    ? 'bg-rose-500'
                    : tensionRatio > 0.55
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, tensionRatio * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-num">
              <span>Фрикціон: {dragLevel}/10</span>
              <span>До берега: {fishDistM.toFixed(1)} м</span>
            </div>

            {canShowLandingPrompt && (
              <button
                type="button"
                onClick={handleLandingNetGrab}
                className="btn-tactile btn-primary-emerald w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg text-xs font-bold cursor-pointer animate-pulse"
              >
                <Anchor className="w-4 h-4" />
                {rigStats.hasLandingNet
                  ? 'ПІДХОПИТИ ПІДСАКОМ! [E]'
                  : 'ВИТЯГТИ НА БЕРЕГ! [E]'}
              </button>
            )}
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

      {/* BOTTOM TOUCH & DESKTOP CONTROLS DOCK */}
      <div className="fixed bottom-3 inset-x-0 z-20 flex flex-wrap items-end justify-between gap-2.5 px-2.5 sm:px-5 pointer-events-none">
        {/* Left Thumb Cluster */}
        <div className="pointer-events-auto panel-field rounded-xl p-2 flex flex-wrap items-center gap-1.5 sm:gap-2 max-w-full lg:max-w-[64vw]">
          {(phase === 'IDLE' || phase === 'CHARGING') && (
            <div className="flex items-center gap-1 pr-2 border-r border-white/10">
              <button
                type="button"
                onClick={() => {
                  const nextYaw = Math.max(-0.82, aimYawRef.current - 0.14);
                  const bounded = clampCastToWaterBounds(location, nextYaw, castDistRef.current, maxCastM);
                  setAimYaw(bounded.yaw);
                  setCastDistM(bounded.distM);
                  setAimBlockedByShore(false);
                }}
                className="btn-tactile btn-field min-w-[44px] min-h-[46px] inline-flex items-center justify-center rounded-lg cursor-pointer"
                aria-label="Прицілитись лівіше"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextYaw = Math.min(0.82, aimYawRef.current + 0.14);
                  const bounded = clampCastToWaterBounds(location, nextYaw, castDistRef.current, maxCastM);
                  setAimYaw(bounded.yaw);
                  setCastDistM(bounded.distM);
                  setAimBlockedByShore(false);
                }}
                className="btn-tactile btn-field min-w-[44px] min-h-[46px] inline-flex items-center justify-center rounded-lg cursor-pointer"
                aria-label="Прицілитись правіше"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Touch Bait Picker Button */}
          <button
            type="button"
            onClick={() => setShowBaitDrawer(true)}
            disabled={phase !== 'IDLE'}
            className="btn-tactile btn-field min-h-[46px] inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-55"
            aria-label="Вибір наживки"
          >
            <span className="truncate max-w-[140px] sm:max-w-[180px]">{bait.name}</span>
            <span className="font-mono-num text-amber-300">
              {bait.category === 'lure'
                ? (gameState.baitInventory[bait.id] ?? 0) > 0
                  ? '∞'
                  : 0
                : gameState.baitInventory[bait.id] ?? 0}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Groundbait Touch Button */}
          {activeGbDef && activeGb ? (
            <span className="min-h-[46px] inline-flex items-center text-xs text-emerald-300 font-semibold px-3 py-2 bg-emerald-950/75 border border-emerald-500/35 rounded-lg whitespace-nowrap">
              Прикормлено ({activeGb.castsLeft})
            </span>
          ) : (
            (() => {
              const availGb = GROUNDBAITS.find(
                (g) => (gameState.groundbaitInventory[g.id] ?? 0) > 0
              );
              return availGb ? (
                <button
                  type="button"
                  onClick={() => onThrowGroundbait(availGb.id)}
                  className="btn-tactile min-h-[46px] inline-flex items-center gap-1.5 px-3 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/40 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  Прикормити
                </button>
              ) : null;
            })()
          )}

          {/* Echosounder Toggle Touch Button */}
          <button
            type="button"
            onClick={handleToggleSonar}
            className={`btn-tactile min-h-[46px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap border ${
              showSonar
                ? 'bg-emerald-950/85 border-emerald-400/60 text-emerald-200'
                : 'btn-field text-emerald-300'
            }`}
          >
            <Radio className="w-4 h-4" />
            Ехолот
          </button>

          {/* Quick Touch Fishing Depth Control */}
          <div className="flex items-center gap-1 pl-1.5 border-l border-white/10">
            <button
              type="button"
              onClick={() =>
                handleChangeFishingDepth(
                  Math.max(0.4, Number((effectiveFishingDepthM - 0.4).toFixed(1))),
                  false
                )
              }
              disabled={rigStats.hasBottomRig}
              className="btn-tactile btn-field min-w-[38px] min-h-[46px] rounded-lg text-sm font-bold cursor-pointer disabled:opacity-45"
              aria-label="Зменшити глибину спуску"
              title="Підняти поплавок вище"
            >
              −
            </button>
            <button
              type="button"
              onClick={() =>
                handleChangeFishingDepth(currentWaterSpot.depthM, !bottomLock)
              }
              disabled={rigStats.hasBottomRig}
              className={`btn-tactile min-h-[46px] px-2.5 rounded-lg text-center cursor-pointer border ${
                bottomLock || rigStats.hasBottomRig
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                  : 'btn-field text-slate-200'
              }`}
              title="Натисніть щоб поставити на дно або зняти фіксацію дна"
            >
              <div className="text-[9px] leading-none text-slate-400">
                {rigStats.hasBottomRig ? 'ДОНКА' : bottomLock ? 'НА ДНІ' : 'Спуск'}
              </div>
              <div className="font-mono-num text-xs font-bold text-amber-300 mt-0.5">
                {effectiveFishingDepthM.toFixed(1)}м
              </div>
            </button>
            <button
              type="button"
              onClick={() =>
                handleChangeFishingDepth(
                  Math.min(
                    currentWaterSpot.depthM - 0.1,
                    Number((effectiveFishingDepthM + 0.4).toFixed(1))
                  ),
                  false
                )
              }
              disabled={rigStats.hasBottomRig}
              className="btn-tactile btn-field min-w-[38px] min-h-[46px] rounded-lg text-sm font-bold cursor-pointer disabled:opacity-45"
              aria-label="Збільшити глибину спуску"
              title="Опустити гачок глибше"
            >
              +
            </button>
          </div>

          {/* Quick Consumables */}
          {antiradQty > 0 && gameState.radiation > 5 && (
            <button
              type="button"
              onClick={() => onUseConsumable('antirad_ai2')}
              className="btn-tactile min-h-[46px] inline-flex items-center gap-1.5 px-3 py-2 bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 border border-rose-400/45 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              Антирад ({antiradQty})
            </button>
          )}
          {energyQty > 0 && !isEnergyActive && (
            <button
              type="button"
              onClick={() => onUseConsumable('energy_stalker')}
              className="btn-tactile min-h-[46px] inline-flex items-center gap-1.5 px-3 py-2 bg-sky-500/25 hover:bg-sky-500/40 text-sky-200 border border-sky-400/45 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              Енергетик ({energyQty})
            </button>
          )}
          {gameState.sanity < 85 &&
            sanityFoods.slice(0, 2).map((food) => {
              const qty = gameState.consumableInventory[food.id] ?? 0;
              return (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => onUseConsumable(food.id)}
                  className="btn-tactile min-h-[46px] inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-100 border border-indigo-400/45 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap"
                  title={food.effectLabel}
                >
                  {food.id === 'herbal_tea'
                    ? 'Чай'
                    : food.id === 'canned_stew'
                      ? 'Тушкованка'
                      : 'Шоколад'}{' '}
                  ({qty})
                </button>
              );
            })}
        </div>

        {/* Right Thumb Cluster: Drag Brake & Big Primary Cast/Strike/Reel Touch Button */}
        <div className="pointer-events-auto panel-field rounded-xl p-2 flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDragLevel((d) => Math.max(1, d - 1))}
              className="btn-tactile btn-field min-w-[46px] min-h-[50px] rounded-lg text-base font-bold cursor-pointer"
              aria-label="Зменшити фрикціон"
            >
              −
            </button>
            <div className="px-1.5 text-center min-w-[42px]">
              <div className="text-[10px] text-slate-400">Фрикц.</div>
              <div className="font-mono-num text-sm font-bold text-amber-300">{dragLevel}</div>
            </div>
            <button
              type="button"
              onClick={() => setDragLevel((d) => Math.min(10, d + 1))}
              className="btn-tactile btn-field min-w-[46px] min-h-[50px] rounded-lg text-base font-bold cursor-pointer"
              aria-label="Збільшити фрикціон"
            >
              +
            </button>
          </div>

          {(phase === 'WAITING' || phase === 'NIBBLE') && (
            <button
              type="button"
              onClick={handleReelOutReset}
              className="btn-tactile btn-field min-h-[52px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Вимотати
            </button>
          )}

          <button
            type="button"
            onPointerDown={handlePrimaryDown}
            onPointerUp={handlePrimaryUp}
            className={`btn-tactile min-h-[54px] min-w-[148px] sm:min-w-[164px] inline-flex items-center justify-center gap-2 px-5 py-3 font-bold text-sm rounded-lg cursor-pointer touch-none ${
              phase === 'BITE'
                ? 'bg-gradient-to-b from-rose-500 to-rose-600 text-white border border-rose-300/60 shadow-[0_6px_22px_rgba(244,63,94,0.5)]'
                : 'btn-primary-amber'
            }`}
          >
            <Anchor className="w-4 h-4" />
            {phase === 'IDLE'
              ? 'ЗАКИНУТИ'
              : phase === 'CHARGING'
                ? 'ВІДПУСТИТИ!'
                : phase === 'BITE' || phase === 'NIBBLE'
                  ? 'ПІДСІКТИ!'
                  : phase === 'FIGHTING'
                    ? 'ТЯГНУТИ!'
                    : phase === 'SNAGGED'
                      ? 'ВІДЧЕПИТИ!'
                      : 'ОЧІКУВАННЯ'}
          </button>
        </div>
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

            <div className="flex flex-wrap gap-1.5">
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
                  Монтаж снасті та спорядження
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

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'rod', label: 'Вудка' },
                  { id: 'reel', label: 'Котушка' },
                  { id: 'line', label: 'Волосінь' },
                  { id: 'float', label: 'Поплавок' },
                  { id: 'hooks_sinkers', label: 'Гачок і груз' },
                  { id: 'rigs', label: 'Донка / Годівн.' },
                  { id: 'flavor_acc', label: 'Аромат і дрібн.' },
                  { id: 'gear', label: 'Спорядження' },
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
                  {GEAR_ITEMS.filter((g) => gameState.ownedGearIds.includes(g.id)).map((item) => {
                    const active = gameState.equippedGearIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
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

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCaughtTab('photo')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                  caughtTab === 'photo'
                    ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                    : 'bg-[#08100c] border-white/10 text-slate-400'
                }`}
              >
                Ілюстрація
              </button>
              <button
                type="button"
                onClick={() => setCaughtTab('3d')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer border inline-flex items-center gap-1 ${
                  caughtTab === '3d'
                    ? 'bg-teal-500/20 border-teal-400/60 text-teal-200'
                    : 'bg-[#08100c] border-white/10 text-slate-400'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                3D Модель
              </button>
            </div>

            {caughtTab === 'photo' ? (
              <div className="w-64 h-40 mx-auto bg-[#060a08] border border-white/15 rounded-xl overflow-hidden shadow-lg">
                <FishIllustration species={caughtSpecies} className="w-full h-full" />
              </div>
            ) : (
              <Fauna3DPreview
                species={caughtSpecies}
                className="w-full h-44 mx-auto"
              />
            )}

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

import { useCallback, useEffect, useRef, useState } from 'react';
import { BestiaryModal } from './components/BestiaryModal';
import { BunkerView } from './components/BunkerView';
import { FishingView } from './components/FishingView';
import { InventoryModal } from './components/InventoryModal';
import { JournalModal } from './components/JournalModal';
import { PolissiaMapView } from './components/PolissiaMapView';
import { QuestsModal } from './components/QuestsModal';
import { TitleScreen } from './components/TitleScreen';
import { audioEngine } from './game/audio';
import {
  ACCESSORIES,
  BAITS,
  BAIT_MAP,
  BOTTOM_RIGS,
  FEEDERS,
  FISH_MAP,
  FISH_SPECIES,
  FLAVORINGS,
  FLAVORING_MAP,
  FLOATS,
  GEAR_ITEMS,
  GEAR_MAP,
  GROUNDBAITS,
  HOOKS,
  KEEPNET_UPGRADES,
  LINES,
  LOCATIONS,
  LOOT_MAP,
  MARKET_BUNDLES,
  QUESTS,
  RADSUIT_UPGRADES,
  REELS,
  RODS,
  ROD_MAP,
  SINKERS,
  formatClock,
} from './game/data';
import {
  CaughtFish,
  FishingJournalEntry,
  FoundLootEntry,
  LocationId,
  LootItemDef,
  SaveState,
  ScreenMode,
  WeatherType,
} from './game/types';

const SAVE_KEY = 'polissia_fishing_save_v1';

const WEATHER_CYCLE: WeatherType[] = ['clear', 'fog', 'rain', 'anomaly_surge'];

function calcLevel(xp: number): number {
  return Math.floor(xp / 250) + 1;
}

function createFreshSave(): SaveState {
  return {
    day: 1,
    timeOfDay: 6.5,
    weather: 'clear',
    credits: 180,
    goldCoins: 0,
    amberShards: 0,
    xp: 0,
    level: 1,
    radiation: 0,
    sanity: 100,
    hunger: 100,
    stamina: 100,
    energyBoostUntilMs: 0,
    currentLocationId: 'rokitne_bunker',
    equippedRodId: 'rod_bamboo',
    equippedReelId: 'reel_simple',
    equippedLineId: 'line_mono_4',
    equippedBaitId: 'worm',
    equippedFloatId: 'float_wood',
    equippedHookId: 'hook_small',
    equippedSinkerId: 'sinker_small',
    equippedFeederId: 'feeder_none',
    equippedBottomRigId: 'brig_none',
    equippedFlavoringId: 'flav_none',
    equippedAccessoryIds: [],
    equippedGearIds: [],
    keepnetLevel: 1,
    radSuitLevel: 0,
    ownedRodIds: ['rod_bamboo'],
    ownedReelIds: ['reel_simple'],
    ownedLineIds: ['line_mono_4'],
    ownedFloatIds: ['float_wood'],
    ownedHookIds: ['hook_small'],
    ownedSinkerIds: ['sinker_small'],
    ownedFeederIds: ['feeder_none'],
    ownedAccessoryIds: [],
    ownedBottomRigIds: ['brig_none'],
    ownedGearIds: [],
    baitInventory: {
      worm: 20,
      bloodworm: 8,
    },
    flavoringInventory: {},
    groundbaitInventory: {
      gb_universal: 2,
    },
    consumableInventory: {
      antirad_ai2: 1,
      energy_stalker: 1,
      herbal_tea: 1,
    },
    itemDurability: {
      rod_bamboo: 100,
      reel_simple: 100,
      line_mono_4: 100,
    },
    foundLoot: [],
    activeGroundbaitByLoc: {},
    keepnet: [],
    discovered: {},
    personalRecords: {},
    fishingJournal: [],
    questProgress: {},
    completedQuestIds: [],
    visitedLocationIds: ['rokitne_bunker'],
    totalCaughtCount: 0,
    totalEarnedCredits: 0,
    haggleDay: 0,
    haggleBonusPct: 0,
  };
}

function loadSavedGame(): SaveState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SaveState>;
    if (!parsed || !parsed.equippedRodId) return null;
    const base = createFreshSave();
    return {
      ...base,
      ...parsed,
      ownedRodIds: parsed.ownedRodIds?.length ? parsed.ownedRodIds : base.ownedRodIds,
      ownedReelIds: parsed.ownedReelIds?.length ? parsed.ownedReelIds : base.ownedReelIds,
      ownedLineIds: parsed.ownedLineIds?.length ? parsed.ownedLineIds : base.ownedLineIds,
      ownedFloatIds: parsed.ownedFloatIds?.length ? parsed.ownedFloatIds : base.ownedFloatIds,
      ownedHookIds: parsed.ownedHookIds?.length ? parsed.ownedHookIds : base.ownedHookIds,
      ownedSinkerIds: parsed.ownedSinkerIds?.length ? parsed.ownedSinkerIds : base.ownedSinkerIds,
      ownedFeederIds: parsed.ownedFeederIds?.length ? parsed.ownedFeederIds : base.ownedFeederIds,
      ownedAccessoryIds: parsed.ownedAccessoryIds ?? [],
      ownedBottomRigIds: parsed.ownedBottomRigIds?.length
        ? parsed.ownedBottomRigIds
        : base.ownedBottomRigIds,
      ownedGearIds: parsed.ownedGearIds ?? [],
      equippedAccessoryIds: parsed.equippedAccessoryIds ?? [],
      equippedGearIds: parsed.equippedGearIds ?? [],
      baitInventory: { ...base.baitInventory, ...(parsed.baitInventory ?? {}) },
      flavoringInventory: {
        ...base.flavoringInventory,
        ...(parsed.flavoringInventory ?? {}),
      },
      groundbaitInventory: {
        ...base.groundbaitInventory,
        ...(parsed.groundbaitInventory ?? {}),
      },
      consumableInventory: {
        ...base.consumableInventory,
        ...(parsed.consumableInventory ?? {}),
      },
      itemDurability: {
        ...base.itemDurability,
        ...(parsed.itemDurability ?? {}),
      },
      foundLoot: parsed.foundLoot ?? [],
      hunger: 100,
      hunger: typeof parsed.hunger === 'number' ? Math.max(0, Math.min(100, parsed.hunger)) : 100,
      energyBoostUntilMs: parsed.energyBoostUntilMs ?? 0,
      activeGroundbaitByLoc: parsed.activeGroundbaitByLoc ?? {},
      keepnet: parsed.keepnet ?? [],
      discovered: parsed.discovered ?? {},
      personalRecords: parsed.personalRecords ?? {},
      fishingJournal: parsed.fishingJournal ?? [],
      questProgress: parsed.questProgress ?? {},
      completedQuestIds: parsed.completedQuestIds ?? [],
      visitedLocationIds: parsed.visitedLocationIds ?? ['rokitne_bunker'],
      haggleDay: parsed.haggleDay ?? 0,
      haggleBonusPct: parsed.haggleBonusPct ?? 0,
    };
  } catch {
    return null;
  }
}

export default function App() {
  const [existingSave] = useState<SaveState | null>(() => loadSavedGame());
  const [gameState, setGameState] = useState<SaveState>(() => existingSave ?? createFreshSave());
  const [screen, setScreen] = useState<ScreenMode>('TITLE');
  const [showGamePresentation, setShowGamePresentation] = useState(false);
  const [showRiverIntro, setShowRiverIntro] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const presentationVideoRef = useRef<HTMLVideoElement | null>(null);
  const presentationAudioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  // Музика використовується лише для вступного відео.
  const [musicEnabled, setMusicEnabled] = useState<boolean>(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showBunkerMap, setShowBunkerMap] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const stateRef = useRef(gameState);
  stateRef.current = gameState;
  const toastTimerRef = useRef<number>(0);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3800);
  }, []);

  useEffect(() => {
    audioEngine.setMusicEnabled(false);
    return audioEngine.installUnlockListener();
  }, []);

  useEffect(() => {
    if (screen === 'TITLE') return;
    // Щойно гравець переходить у гру, гарантовано вмикаємо саме ігровий BGM.
    audioEngine.init();
    audioEngine.setMusicEnabled(true);
    audioEngine.startBackgroundMusic();
    setMusicEnabled(true);
  }, [screen]);

  useEffect(() => {
    if (screen === 'TITLE') return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    } catch {
      // Ignore quota errors
    }
  }, [gameState, screen]);

  const handleToggleMute = useCallback(() => {
    audioEngine.init();
    setMuted((prev) => {
      const next = !prev;
      audioEngine.setMuted(next);
      return next;
    });
  }, []);

  const handleToggleMusic = useCallback(() => {
    audioEngine.init();
    setMusicEnabled((prev) => {
      const next = !prev;
      audioEngine.setMusicEnabled(next);
      try {
        localStorage.setItem('polissia_music_enabled', String(next));
      } catch {
        // Ignore storage error
      }
      showToast(next ? 'Музику увімкнено' : 'Музику вимкнено');
      return next;
    });
  }, [showToast]);

  const finishGamePresentation = useCallback(() => {
    const audio = presentationAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    const video = presentationVideoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setShowGamePresentation(false);
    setScreen('BUNKER');
    showToast('Ви у бункері. Відкрийте карту, щоб обрати локацію.');
  }, [showToast]);

  const handleNewGame = useCallback(() => {
    const fresh = createFreshSave();
    setGameState(fresh);
    setShowGamePresentation(true);
    const video = presentationVideoRef.current;
    const audio = presentationAudioRef.current;
    if (video) {
      video.currentTime = 0;
      video.muted = true;
      void video.play().catch(() => finishGamePresentation());
    }
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 1;
      void audio.play().catch(() => {});
    }
  }, [finishGamePresentation]);

  const handleContinue = useCallback(() => {
    audioEngine.init();
    audioEngine.setMusicEnabled(true);
    audioEngine.startBackgroundMusic();
    setMusicEnabled(true);
    const loc = stateRef.current.currentLocationId;
    setScreen(loc === 'rokitne_bunker' ? 'BUNKER' : 'FISHING');
  }, []);

  const handleSelectDestination = useCallback(
    (locId: LocationId) => {
      audioEngine.init();
      setShowBunkerMap(false);
      const target = LOCATIONS[locId];
      if (!target) return;

      const isNew = !stateRef.current.visitedLocationIds.includes(locId);
      setGameState((prev) => ({
        ...prev,
        currentLocationId: locId,
        visitedLocationIds: prev.visitedLocationIds.includes(locId)
          ? prev.visitedLocationIds
          : [...prev.visitedLocationIds, locId],
      }));

      if (target.isBunker) {
        setShowRiverIntro(false);
        setScreen('BUNKER');
        showToast('Ласкаво просимо до Бункер Рокитне.');
      } else {
        setShowRiverIntro(locId === 'rokitne');
        setScreen('FISHING');
        if (isNew) {
          showToast(`Відкрито локацію: ${target.name}!`);
        }
      }
    },
    [showToast]
  );

  const handleSelectBait = useCallback((baitId: string) => {
    setGameState((prev) => ({ ...prev, equippedBaitId: baitId }));
  }, []);

  const handleSelectFlavoring = useCallback(
    (flavId: string) => {
      const flav = FLAVORING_MAP[flavId];
      setGameState((prev) => ({ ...prev, equippedFlavoringId: flavId }));
      if (flav) {
        showToast(
          flavId === 'flav_none'
            ? 'Ароматизатор знято.'
            : `Встановлено ароматизатор: ${flav.name}`
        );
      }
    },
    [showToast]
  );

  const handleConsumeBait = useCallback((baitId: string) => {
    const baitDef = BAITS.find((b) => b.id === baitId);
    setGameState((prev) => {
      const curQty = prev.baitInventory[baitId] ?? 0;
      const nextBaits =
        baitDef?.category === 'lure'
          ? prev.baitInventory
          : { ...prev.baitInventory, [baitId]: Math.max(0, curQty - 1) };

      const flavId = prev.equippedFlavoringId;
      let nextFlavInv = prev.flavoringInventory;
      let nextEquippedFlav = flavId;
      if (flavId && flavId !== 'flav_none') {
        const fQty = prev.flavoringInventory[flavId] ?? 0;
        if (fQty > 0) {
          const leftFlav = fQty - 1;
          nextFlavInv = { ...prev.flavoringInventory, [flavId]: leftFlav };
          if (leftFlav <= 0) {
            nextEquippedFlav = 'flav_none';
          }
        } else {
          nextEquippedFlav = 'flav_none';
        }
      }

      const locId = prev.currentLocationId;
      const activeGb = prev.activeGroundbaitByLoc[locId];
      let nextActiveGb = prev.activeGroundbaitByLoc;
      if (activeGb) {
        const left = activeGb.castsLeft - 1;
        nextActiveGb = { ...prev.activeGroundbaitByLoc };
        if (left > 0) {
          nextActiveGb[locId] = { ...activeGb, castsLeft: left };
        } else {
          delete nextActiveGb[locId];
        }
      }

      return {
        ...prev,
        baitInventory: nextBaits,
        flavoringInventory: nextFlavInv,
        equippedFlavoringId: nextEquippedFlav,
        activeGroundbaitByLoc: nextActiveGb,
      };
    });
  }, []);

  const handleLineSnap = useCallback(
    (baitId: string) => {
      const baitDef = BAITS.find((b) => b.id === baitId);
      if (baitDef?.category !== 'lure') return;
      setGameState((prev) => {
        const curQty = prev.baitInventory[baitId] ?? 0;
        if (curQty <= 0) return prev;
        return {
          ...prev,
          baitInventory: { ...prev.baitInventory, [baitId]: curQty - 1 },
        };
      });
      showToast('Обрив снасті: втрачено 1 штучну приманку.');
    },
    [showToast]
  );

  const handleDamageTackle = useCallback((deltas: Record<string, number>) => {
    setGameState((prev) => {
      const nextDur = { ...prev.itemDurability };
      for (const [itemId, delta] of Object.entries(deltas)) {
        if (!itemId) continue;
        const curVal = nextDur[itemId] ?? 100;
        nextDur[itemId] = Math.max(0, Math.min(100, Number((curVal + delta).toFixed(1))));
      }
      return {
        ...prev,
        itemDurability: nextDur,
      };
    });
  }, []);

  const handleRepairTackle = useCallback(
    (itemId: string, cost: number) => {
      const cur = stateRef.current;
      if (cur.credits < cost) return;
      audioEngine.playCoin();
      showToast(`Снасть відремонтовано до 100% (-₴ ${cost}).`);
      setGameState((prev) => {
        if (prev.credits < cost) return prev;
        return {
          ...prev,
          credits: prev.credits - cost,
          itemDurability: {
            ...prev.itemDurability,
            [itemId]: 100,
          },
        };
      });
    },
    [showToast]
  );

  const handleThrowGroundbait = useCallback(
    (groundbaitId: string) => {
      const cur = stateRef.current;
      const qty = cur.groundbaitInventory[groundbaitId] ?? 0;
      if (qty <= 0) return;

      const gbDef = GROUNDBAITS.find((g) => g.id === groundbaitId);
      audioEngine.playSplash(0.75);
      showToast(`Закормлено точку: ${gbDef?.name ?? 'Прикормка'} (на 5 закидів).`);

      setGameState((prev) => {
        const count = prev.groundbaitInventory[groundbaitId] ?? 0;
        if (count <= 0) return prev;
        return {
          ...prev,
          groundbaitInventory: {
            ...prev.groundbaitInventory,
            [groundbaitId]: count - 1,
          },
          activeGroundbaitByLoc: {
            ...prev.activeGroundbaitByLoc,
            [prev.currentLocationId]: { groundbaitId, castsLeft: 5 },
          },
        };
      });
    },
    [showToast]
  );

  const handleCatchFish = useCallback(
    (fish: CaughtFish, released: boolean) => {
      const sp = FISH_MAP[fish.speciesId];
      const baseXp = Math.round(
        18 + fish.weightKg * 12 + (fish.isMutant ? 45 : 0) + (fish.isTrophy ? 30 : 0)
      );
      const earnedXp = released ? Math.round(baseXp * 1.45) : baseXp;
      const goldCoinDrop = fish.isMutant && Math.random() < (sp?.rarity === 'legendary' ? 0.28 : 0.12) ? 1 : 0;
      const amberShardDrop = fish.isMutant && Math.random() < (sp?.rarity === 'legendary' ? 0.12 : 0.035) ? 1 : 0;

      const cur = stateRef.current;
      const nextProgressMap: Record<string, number> = { ...cur.questProgress };
      const newlyReadyTitles: string[] = [];

      for (const q of QUESTS) {
        if (cur.completedQuestIds.includes(q.id)) continue;
        const prevProg = nextProgressMap[q.id] ?? 0;
        if (prevProg >= q.targetCount) continue;

        let inc = 0;
        const faunaKind = fish.faunaKind ?? sp?.faunaKind ?? (fish.isMutant ? 'mutant' : 'fish');
        const isFishCatch = faunaKind === 'fish';
        if (q.type === 'catch_at_location' && isFishCatch && fish.locationId === q.targetLocationId) {
          inc = 1;
        } else if (q.type === 'catch_species') {
          if (q.id === 'q_taras_catfish') {
            if (fish.speciesId === 'catfish' || fish.speciesId === 'catfish_glow') inc = 1;
          } else if (fish.speciesId === q.targetSpeciesId) {
            inc = 1;
          }
        } else if (q.type === 'catch_mutants' && fish.isMutant) {
          inc = 1;
        } else if (q.type === 'catch_weight' && isFishCatch) {
          inc = fish.weightKg;
        }

        if (inc > 0) {
          const updated = Number((prevProg + inc).toFixed(2));
          nextProgressMap[q.id] = updated;
          if (prevProg < q.targetCount && updated >= q.targetCount) {
            newlyReadyTitles.push(q.title);
          }
        }
      }

      const prevRecord = cur.personalRecords[fish.speciesId];
      const isRecord = !prevRecord || fish.weightKg > prevRecord.maxWeightKg;

      if (goldCoinDrop || amberShardDrop) {
        showToast(`Рідкісна здобич мутанта: ${goldCoinDrop ? '+1 золота монета ' : ''}${amberShardDrop ? '+1 шматочок бурштину' : ''}!`);
      } else if (newlyReadyTitles.length > 0) {
        showToast(`Завдання «${newlyReadyTitles[0]}» готове до здачі в Бункері!`);
      } else if (!cur.discovered[fish.speciesId] && sp) {
        showToast(`Новий вид у бестіарії: ${sp.name}!`);
      } else if (isRecord && sp) {
        showToast(`Новий особистий рекорд: ${sp.name} (${fish.weightKg} кг)!`);
      }

      setGameState((prev) => {
        const nextXp = prev.xp + earnedXp;
        const prevRec = prev.discovered[fish.speciesId];
        const prevPersonal = prev.personalRecords[fish.speciesId];
        const newRecord = !prevPersonal || fish.weightKg > prevPersonal.maxWeightKg;
        const { clock } = formatClock(prev.timeOfDay);
        const locName = LOCATIONS[fish.locationId]?.name ?? fish.locationId;
        const baitName = BAIT_MAP[prev.equippedBaitId]?.name ?? prev.equippedBaitId;
        const rodName = ROD_MAP[prev.equippedRodId]?.name ?? prev.equippedRodId;
        const faunaKind = fish.faunaKind ?? sp?.faunaKind ?? (fish.isMutant ? 'mutant' : 'fish');

        const journalEntry: FishingJournalEntry = {
          uid: fish.uid,
          speciesId: fish.speciesId,
          name: sp?.name ?? fish.speciesId,
          faunaKind,
          weightKg: fish.weightKg,
          lengthCm: fish.lengthCm,
          caughtDay: fish.caughtDay,
          clockTime: clock,
          realTimestamp: Date.now(),
          locationId: fish.locationId,
          locationName: locName,
          baitId: prev.equippedBaitId,
          baitName,
          rodId: prev.equippedRodId,
          rodName,
          isRecord: newRecord,
          isMutant: fish.isMutant,
          isTrophy: fish.isTrophy,
        };

        return {
          ...prev,
          xp: nextXp,
          level: calcLevel(nextXp),
          totalCaughtCount: prev.totalCaughtCount + 1,
          goldCoins: (prev.goldCoins ?? 0) + goldCoinDrop,
          amberShards: (prev.amberShards ?? 0) + amberShardDrop,
          keepnet: released ? prev.keepnet : [...prev.keepnet, fish],
          discovered: {
            ...prev.discovered,
            [fish.speciesId]: {
              caughtCount: (prevRec?.caughtCount ?? 0) + 1,
              maxWeightKg: Math.max(prevRec?.maxWeightKg ?? 0, fish.weightKg),
              firstLocationId: prevRec?.firstLocationId ?? fish.locationId,
            },
          },
          personalRecords: {
            ...prev.personalRecords,
            [fish.speciesId]: {
              maxWeightKg: Math.max(prevPersonal?.maxWeightKg ?? 0, fish.weightKg),
              maxLengthCm: Math.max(prevPersonal?.maxLengthCm ?? 0, fish.lengthCm),
              caughtDay: newRecord ? fish.caughtDay : prevPersonal.caughtDay,
              locationId: newRecord ? fish.locationId : prevPersonal.locationId,
            },
          },
          fishingJournal: [journalEntry, ...prev.fishingJournal].slice(0, 200),
          questProgress: nextProgressMap,
        };
      });
    },
    [showToast]
  );

  const handleFindLoot = useCallback(
    (item: LootItemDef, entry: FoundLootEntry) => {
      const cur = stateRef.current;
      const nextProgressMap: Record<string, number> = { ...cur.questProgress };
      const newlyReadyTitles: string[] = [];

      if (item.category !== 'consumable' && entry.depthLayer === 'bottom') {
        for (const q of QUESTS) {
          if (q.type !== 'find_loot' || cur.completedQuestIds.includes(q.id)) continue;
          const prevProg = nextProgressMap[q.id] ?? 0;
          if (prevProg >= q.targetCount) continue;
          const updated = prevProg + 1;
          nextProgressMap[q.id] = updated;
          if (updated >= q.targetCount) newlyReadyTitles.push(q.title);
        }
      }

      const amberShardDrop = item.id === 'loot_amber'
        ? 1 + (Math.random() < 0.2 ? 1 : 0)
        : item.rarity === 'legendary' && Math.random() < 0.3
          ? 1
          : item.category === 'artifact' && item.rarity === 'rare' && Math.random() < 0.08
            ? 1
            : 0;
      const goldCoinDrop = (item.id === 'loot_coin' || item.id === 'loot_gold_chain') && Math.random() < 0.18
        ? 1
        : item.rarity === 'legendary' && Math.random() < 0.12
          ? 1
          : 0;

      if (goldCoinDrop || amberShardDrop) {
        showToast(`Рідкісна знахідка: ${goldCoinDrop ? '+1 золота монета ' : ''}${amberShardDrop ? `+${amberShardDrop} шмат. бурштину` : ''}!`);
      } else if (newlyReadyTitles.length > 0) {
        showToast(`Завдання «${newlyReadyTitles[0]}» готове до здачі Єльцину!`);
      } else {
        showToast(`Знахідка «${item.name}» покладена до рюкзака (+35 XP)!`);
      }

      setGameState((prev) => {
        const nextXp = prev.xp + 35;
        if (item.category === 'consumable') {
          return {
            ...prev,
            xp: nextXp,
            level: calcLevel(nextXp),
            consumableInventory: {
              ...prev.consumableInventory,
              [item.id]: (prev.consumableInventory[item.id] ?? 0) + 1,
            },
          };
        }
        return {
          ...prev,
          xp: nextXp,
          level: calcLevel(nextXp),
          goldCoins: (prev.goldCoins ?? 0) + goldCoinDrop,
          amberShards: (prev.amberShards ?? 0) + amberShardDrop,
          foundLoot: [...prev.foundLoot, entry],
          questProgress: nextProgressMap,
        };
      });
    },
    [showToast]
  );

  const handleUseConsumable = useCallback(
    (itemId: string) => {
      const cur = stateRef.current;
      const qty = cur.consumableInventory[itemId] ?? 0;
      if (qty <= 0) return;
      const def = LOOT_MAP[itemId];

      if (itemId === 'antirad_ai2') {
        audioEngine.playCatch(false);
        showToast('Використано Антирад АІ-2 (-40 мЗв радіації).');
        setGameState((prev) => {
          const c = prev.consumableInventory[itemId] ?? 0;
          if (c <= 0) return prev;
          return {
            ...prev,
            radiation: Math.max(0, prev.radiation - 40),
            consumableInventory: { ...prev.consumableInventory, [itemId]: c - 1 },
          };
        });
      } else if (itemId === 'energy_stalker') {
        audioEngine.playCatch(false);
        showToast(`${def?.name ?? 'Енергетик'}: +30% швидкості котушки на 60 сек!`);
        const boostUntil = Date.now() + 60_000;
        setGameState((prev) => {
          const c = prev.consumableInventory[itemId] ?? 0;
          if (c <= 0) return prev;
          return {
            ...prev,
            stamina: 100,
            energyBoostUntilMs: boostUntil,
            consumableInventory: { ...prev.consumableInventory, [itemId]: c - 1 },
          };
        });
      } else if (def?.isFood || def?.sanityRestore) {
        if (cur.hunger >= 98 && !(def.staminaRestore && cur.stamina < 100)) {
          showToast('Ви не голодні. Збережіть їжу на потім.');
          return;
        }
        const restoreAmt = def.sanityRestore ?? 25;
        audioEngine.playCatch(false);
        showToast(
          `Вжито «${def.name}»: голод зменшився на ${restoreAmt}%${def.staminaRestore ? ', сили відновлено' : ''}.`
        );
        setGameState((prev) => {
          const c = prev.consumableInventory[itemId] ?? 0;
          if (c <= 0) return prev;
          return {
            ...prev,
            hunger: Math.min(100, prev.hunger + restoreAmt),
            stamina: def.staminaRestore ? 100 : prev.stamina,
            consumableInventory: { ...prev.consumableInventory, [itemId]: c - 1 },
          };
        });
      }
    },
    [showToast]
  );

  const handleClockAndRadTick = useCallback(
    (deltaHours: number, radDelta: number) => {
      const cur = stateRef.current;
      const nextRadProjected = Math.max(0, Math.min(100, cur.radiation + radDelta));

      if (nextRadProjected >= 100 && cur.currentLocationId !== 'rokitne_bunker') {
        const evacCost = Math.min(30, cur.credits);
        showToast(
          'Критична доза радіації! Екстрена евакуація до Бункер Рокитне.'
        );
        setGameState((prev) => ({
          ...prev,
          radiation: 20,
          credits: Math.max(0, prev.credits - evacCost),
          currentLocationId: 'rokitne_bunker',
        }));
        setScreen('BUNKER');
        return;
      }

      let nextTodCalc = cur.timeOfDay + deltaHours;
      let nextDayCalc = cur.day;
      const prevQuarter = Math.floor(cur.timeOfDay / 6);
      if (nextTodCalc >= 24) {
        nextTodCalc -= 24;
        nextDayCalc += 1;
      }
      const nextQuarter = Math.floor(nextTodCalc / 6);
      const weatherSlot = nextDayCalc * 4 + nextQuarter;
      const weatherChanged =
        nextDayCalc !== cur.day || prevQuarter !== nextQuarter;
      const shiftedWeather = weatherChanged
        ? WEATHER_CYCLE[weatherSlot % WEATHER_CYCLE.length]
        : cur.weather;

      if (weatherChanged && shiftedWeather !== cur.weather) {
        const wNames: Record<WeatherType, string> = {
          clear: 'Ясна погода',
          fog: 'Над водою спускається густий туман',
          rain: 'Починається поліський дощ',
          anomaly_surge: 'Увага: аномальний викид! Перевірте дозиметр і захист.',
        };
        showToast(wNames[shiftedWeather]);
      }

      setGameState((prev) => {
        let nextTod = prev.timeOfDay + deltaHours;
        let nextDay = prev.day;
        const pQ = Math.floor(prev.timeOfDay / 6);
        if (nextTod >= 24) {
          nextTod -= 24;
          nextDay += 1;
        }
        const nQ = Math.floor(nextTod / 6);
        const nextWeather =
          nextDay !== prev.day || pQ !== nQ
            ? WEATHER_CYCLE[(nextDay * 4 + nQ) % WEATHER_CYCLE.length]
            : prev.weather;
        const nextRad = Math.max(0, Math.min(100, prev.radiation + radDelta));
        return {
          ...prev,
          day: nextDay,
          timeOfDay: nextTod,
          weather: nextWeather,
          radiation: nextRad,
          hunger: Math.max(0, prev.hunger - deltaHours * 1.8),
        };
      });
    },
    [showToast]
  );

  // Bunker & Inventory Handlers
  const handleSellFish = useCallback(
    (uid: string) => {
      const target = stateRef.current.keepnet.find((f) => f.uid === uid);
      if (!target) return;
      audioEngine.playCoin();
      showToast(`Продано за ₴ ${target.value}`);
      setGameState((prev) => {
        const item = prev.keepnet.find((f) => f.uid === uid);
        if (!item) return prev;
        return {
          ...prev,
          credits: prev.credits + item.value,
          totalEarnedCredits: prev.totalEarnedCredits + item.value,
          keepnet: prev.keepnet.filter((f) => f.uid !== uid),
        };
      });
    },
    [showToast]
  );

  const handleSellAll = useCallback(() => {
    const cur = stateRef.current;
    if (cur.keepnet.length === 0) return;
    const sum = cur.keepnet.reduce((s, f) => s + f.value, 0);
    audioEngine.playCoin();
    showToast(`Весь улов продано Тарасу за ₴ ${sum}!`);
    setGameState((prev) => {
      const total = prev.keepnet.reduce((s, f) => s + f.value, 0);
      if (total <= 0) return prev;
      return {
        ...prev,
        credits: prev.credits + total,
        totalEarnedCredits: prev.totalEarnedCredits + total,
        keepnet: [],
      };
    });
  }, [showToast]);

  const handleSellLoot = useCallback(
    (uid: string, finalPrice?: number) => {
      const target = stateRef.current.foundLoot.find((l) => l.uid === uid);
      if (!target) return;
      const payout = finalPrice ?? target.value;
      audioEngine.playCoin();
      showToast(`Знахідку продано Єльцину за ₴ ${payout}`);
      setGameState((prev) => {
        const item = prev.foundLoot.find((l) => l.uid === uid);
        if (!item) return prev;
        return {
          ...prev,
          credits: prev.credits + payout,
          totalEarnedCredits: prev.totalEarnedCredits + payout,
          foundLoot: prev.foundLoot.filter((l) => l.uid !== uid),
        };
      });
    },
    [showToast]
  );

  const handleSellAllLoot = useCallback(
    (totalPrice?: number) => {
      const cur = stateRef.current;
      if (cur.foundLoot.length === 0) return;
      const sum = totalPrice ?? cur.foundLoot.reduce((s, l) => s + l.value, 0);
      audioEngine.playCoin();
      showToast(`Усі знахідки продано Єльцину за ₴ ${sum}!`);
      setGameState((prev) => {
        if (prev.foundLoot.length === 0) return prev;
        const payout = totalPrice ?? prev.foundLoot.reduce((s, l) => s + l.value, 0);
        return {
          ...prev,
          credits: prev.credits + payout,
          totalEarnedCredits: prev.totalEarnedCredits + payout,
          foundLoot: [],
        };
      });
    },
    [showToast]
  );

  const handleHaggleBaryga = useCallback(() => {
    const cur = stateRef.current;
    if (cur.haggleDay === cur.day && (cur.haggleBonusPct ?? 0) > 0) return;
    const bonusPct = 12 + Math.floor(Math.random() * 14);
    audioEngine.playBiteBell();
    showToast(`Торг із Єльциним вдався! +${bonusPct}% до ціни скупки на весь день.`);
    setGameState((prev) => ({
      ...prev,
      haggleDay: prev.day,
      haggleBonusPct: bonusPct,
    }));
  }, [showToast]);

  const handleBuyMarketBundle = useCallback(
    (bundleId: string) => {
      const bundle = MARKET_BUNDLES.find((b) => b.id === bundleId);
      if (!bundle || stateRef.current.credits < bundle.price) return;
      audioEngine.playCoin();
      showToast(`Придбано на ринку: ${bundle.name}`);
      setGameState((prev) => {
        if (prev.credits < bundle.price) return prev;
        const nextBaits = { ...prev.baitInventory };
        if (bundle.baits) {
          for (const [k, qty] of Object.entries(bundle.baits)) {
            nextBaits[k] = (nextBaits[k] ?? 0) + qty;
          }
        }
        const nextGbs = { ...prev.groundbaitInventory };
        if (bundle.groundbaits) {
          for (const [k, qty] of Object.entries(bundle.groundbaits)) {
            nextGbs[k] = (nextGbs[k] ?? 0) + qty;
          }
        }
        const nextCons = { ...prev.consumableInventory };
        if (bundle.consumables) {
          for (const [k, qty] of Object.entries(bundle.consumables)) {
            nextCons[k] = (nextCons[k] ?? 0) + qty;
          }
        }
        return {
          ...prev,
          credits: prev.credits - bundle.price,
          baitInventory: nextBaits,
          groundbaitInventory: nextGbs,
          consumableInventory: nextCons,
        };
      });
    },
    [showToast]
  );

  const handleBuyOrEquipRod = useCallback(
    (rodId: string) => {
      const rod = RODS.find((r) => r.id === rodId);
      if (!rod) return;
      const cur = stateRef.current;
      const owned = cur.ownedRodIds.includes(rodId);
      if (!owned && cur.credits < rod.price) return;

      audioEngine.playCoin();
      showToast(owned ? `Взято вудилище: ${rod.name}` : `Куплено вудилище: ${rod.name}`);
      setGameState((prev) => {
        const has = prev.ownedRodIds.includes(rodId);
        if (!has && prev.credits < rod.price) return prev;
        return {
          ...prev,
          credits: has ? prev.credits : prev.credits - rod.price,
          ownedRodIds: has ? prev.ownedRodIds : [...prev.ownedRodIds, rodId],
          equippedRodId: rodId,
          itemDurability: has
            ? prev.itemDurability
            : { ...prev.itemDurability, [rodId]: 100 },
        };
      });
    },
    [showToast]
  );

  const handleBuyOrEquipReel = useCallback(
    (reelId: string) => {
      const reel = REELS.find((r) => r.id === reelId);
      if (!reel) return;
      const cur = stateRef.current;
      const owned = cur.ownedReelIds.includes(reelId);
      if (!owned && cur.credits < reel.price) return;

      audioEngine.playCoin();
      showToast(owned ? `Встановлено: ${reel.name}` : `Куплено: ${reel.name}`);
      setGameState((prev) => {
        const has = prev.ownedReelIds.includes(reelId);
        if (!has && prev.credits < reel.price) return prev;
        return {
          ...prev,
          credits: has ? prev.credits : prev.credits - reel.price,
          ownedReelIds: has ? prev.ownedReelIds : [...prev.ownedReelIds, reelId],
          equippedReelId: reelId,
          itemDurability: has
            ? prev.itemDurability
            : { ...prev.itemDurability, [reelId]: 100 },
        };
      });
    },
    [showToast]
  );

  const handleBuyOrEquipLine = useCallback(
    (lineId: string) => {
      const line = LINES.find((l) => l.id === lineId);
      if (!line) return;
      const cur = stateRef.current;
      const owned = cur.ownedLineIds.includes(lineId);
      if (!owned && cur.credits < line.price) return;

      audioEngine.playCoin();
      showToast(owned ? `Намотано: ${line.name}` : `Куплено: ${line.name}`);
      setGameState((prev) => {
        const has = prev.ownedLineIds.includes(lineId);
        if (!has && prev.credits < line.price) return prev;
        return {
          ...prev,
          credits: has ? prev.credits : prev.credits - line.price,
          ownedLineIds: has ? prev.ownedLineIds : [...prev.ownedLineIds, lineId],
          equippedLineId: lineId,
          itemDurability: has
            ? prev.itemDurability
            : { ...prev.itemDurability, [lineId]: 100 },
        };
      });
    },
    [showToast]
  );

  const handleBuyOrEquipFloat = useCallback(
    (floatId: string) => {
      const item = FLOATS.find((f) => f.id === floatId);
      if (!item) return;
      const cur = stateRef.current;
      const owned = cur.ownedFloatIds.includes(floatId);
      if (!owned && cur.credits < item.price) return;

      audioEngine.playCoin();
      showToast(owned ? `Встановлено поплавок: ${item.name}` : `Куплено поплавок: ${item.name}`);
      setGameState((prev) => {
        const has = prev.ownedFloatIds.includes(floatId);
        if (!has && prev.credits < item.price) return prev;
        return {
          ...prev,
          credits: has ? prev.credits : prev.credits - item.price,
          ownedFloatIds: has ? prev.ownedFloatIds : [...prev.ownedFloatIds, floatId],
          equippedFloatId: floatId,
        };
      });
    },
    [showToast]
  );

  const handleBuyOrEquipHook = useCallback(
    (hookId: string) => {
      const item = HOOKS.find((h) => h.id === hookId);
      if (!item) return;
      const cur = stateRef.current;
      const owned = cur.ownedHookIds.includes(hookId);
      if (!owned && cur.credits < item.price) return;

      audioEngine.playCoin();
      showToast(owned ? `Встановлено гачок: ${item.name}` : `Куплено гачок: ${item.name}`);
      setGameState((prev) => {
        const has = prev.ownedHookIds.includes(hookId);
        if (!has && prev.credits < item.price) return prev;
        return {
          ...prev,
          credits: has ? prev.credits : prev.credits - item.price,
          ownedHookIds: has ? prev.ownedHookIds : [...prev.ownedHookIds, hookId],
          equippedHookId: hookId,
        };
      });
    },
    [showToast]
  );

  const handleBuyOrEquipSinker = useCallback(
    (sinkerId: string) => {
      const item = SINKERS.find((s) => s.id === sinkerId);
      if (!item) return;
      const cur = stateRef.current;
      const owned = cur.ownedSinkerIds.includes(sinkerId);
      if (!owned && cur.credits < item.price) return;

      audioEngine.playCoin();
      showToast(owned ? `Встановлено грузило: ${item.name}` : `Куплено грузило: ${item.name}`);
      setGameState((prev) => {
        const has = prev.ownedSinkerIds.includes(sinkerId);
        if (!has && prev.credits < item.price) return prev;
        return {
          ...prev,
          credits: has ? prev.credits : prev.credits - item.price,
          ownedSinkerIds: has ? prev.ownedSinkerIds : [...prev.ownedSinkerIds, sinkerId],
          equippedSinkerId: sinkerId,
        };
      });
    },
    [showToast]
  );

  const handleBuyOrEquipFeeder = useCallback(
    (feederId: string) => {
      const item = FEEDERS.find((f) => f.id === feederId);
      if (!item) return;
      const cur = stateRef.current;
      const owned = cur.ownedFeederIds.includes(feederId);
      if (!owned && cur.credits < item.price) return;

      audioEngine.playCoin();
      showToast(owned ? `Встановлено: ${item.name}` : `Куплено годівницю: ${item.name}`);
      setGameState((prev) => {
        const has = prev.ownedFeederIds.includes(feederId);
        if (!has && prev.credits < item.price) return prev;
        return {
          ...prev,
          credits: has ? prev.credits : prev.credits - item.price,
          ownedFeederIds: has ? prev.ownedFeederIds : [...prev.ownedFeederIds, feederId],
          equippedFeederId: feederId,
        };
      });
    },
    [showToast]
  );

  const handleBuyOrEquipBottomRig = useCallback(
    (rigId: string) => {
      const item = BOTTOM_RIGS.find((b) => b.id === rigId);
      if (!item) return;
      const cur = stateRef.current;
      const owned = cur.ownedBottomRigIds.includes(rigId);
      if (!owned && cur.credits < item.price) return;

      audioEngine.playCoin();
      showToast(owned ? `Активовано: ${item.name}` : `Куплено монтаж: ${item.name}`);
      setGameState((prev) => {
        const has = prev.ownedBottomRigIds.includes(rigId);
        if (!has && prev.credits < item.price) return prev;
        return {
          ...prev,
          credits: has ? prev.credits : prev.credits - item.price,
          ownedBottomRigIds: has ? prev.ownedBottomRigIds : [...prev.ownedBottomRigIds, rigId],
          equippedBottomRigId: rigId,
          itemDurability: has
            ? prev.itemDurability
            : { ...prev.itemDurability, [rigId]: 100 },
        };
      });
    },
    [showToast]
  );

  const handleBuyOrToggleAccessory = useCallback(
    (accId: string) => {
      const item = ACCESSORIES.find((a) => a.id === accId);
      if (!item) return;
      const cur = stateRef.current;
      const owned = cur.ownedAccessoryIds.includes(accId);
      if (!owned && cur.credits < item.price) return;

      audioEngine.playCoin();
      const willEquip = !owned || !cur.equippedAccessoryIds.includes(accId);
      showToast(
        !owned
          ? `Куплено та встановлено: ${item.name}`
          : willEquip
            ? `Встановлено: ${item.name}`
            : `Знято: ${item.name}`
      );
      setGameState((prev) => {
        const has = prev.ownedAccessoryIds.includes(accId);
        if (!has && prev.credits < item.price) return prev;
        const isEq = prev.equippedAccessoryIds.includes(accId);
        return {
          ...prev,
          credits: has ? prev.credits : prev.credits - item.price,
          ownedAccessoryIds: has ? prev.ownedAccessoryIds : [...prev.ownedAccessoryIds, accId],
          equippedAccessoryIds: !has
            ? [...prev.equippedAccessoryIds, accId]
            : isEq
              ? prev.equippedAccessoryIds.filter((id) => id !== accId)
              : [...prev.equippedAccessoryIds, accId],
        };
      });
    },
    [showToast]
  );

  const handleBuyOrToggleGearItem = useCallback(
    (gearId: string) => {
      const item = GEAR_ITEMS.find((g) => g.id === gearId);
      if (!item) return;
      if ((item.goldPrice || item.amberPrice) && !stateRef.current.ownedGearIds.includes(gearId)) return;
      const cur = stateRef.current;
      const owned = cur.ownedGearIds.includes(gearId);
      if (!owned && cur.credits < item.price) return;

      audioEngine.playCoin();
      const willEquip = !owned || !cur.equippedGearIds.includes(gearId);
      showToast(
        !owned
          ? `Придбано та активовано: ${item.name}`
          : willEquip
            ? `Споряджено: ${item.name}`
            : `Прибрано в рюкзак: ${item.name}`
      );
      setGameState((prev) => {
        const has = prev.ownedGearIds.includes(gearId);
        if (!has && prev.credits < item.price) return prev;
        const isEq = prev.equippedGearIds.includes(gearId);
        return {
          ...prev,
          credits: has ? prev.credits : prev.credits - item.price,
          ownedGearIds: has ? prev.ownedGearIds : [...prev.ownedGearIds, gearId],
          equippedGearIds: !has
            ? [...prev.equippedGearIds, gearId]
            : isEq
              ? prev.equippedGearIds.filter((id) => id !== gearId)
              : [...prev.equippedGearIds, gearId],
          itemDurability: has
            ? prev.itemDurability
            : { ...prev.itemDurability, [gearId]: 100 },
        };
      });
    },
    [showToast]
  );

  const handleBuyPremiumGear = useCallback(
    (gearId: string) => {
      const item = GEAR_ITEMS.find((g) => g.id === gearId);
      if (!item || (!item.goldPrice && !item.amberPrice)) return;
      const goldCost = item.goldPrice ?? 0;
      const amberCost = item.amberPrice ?? 0;
      const cur = stateRef.current;
      if (cur.ownedGearIds.includes(gearId) || (cur.goldCoins ?? 0) < goldCost || (cur.amberShards ?? 0) < amberCost) return;
      audioEngine.playCoin();
      showToast(`Придбано рідкісне спорядження: ${item.name}`);
      setGameState((prev) => {
        if (prev.ownedGearIds.includes(gearId) || (prev.goldCoins ?? 0) < goldCost || (prev.amberShards ?? 0) < amberCost) return prev;
        return {
          ...prev,
          goldCoins: (prev.goldCoins ?? 0) - goldCost,
          amberShards: (prev.amberShards ?? 0) - amberCost,
          ownedGearIds: [...prev.ownedGearIds, gearId],
          equippedGearIds: [...prev.equippedGearIds, gearId],
          itemDurability: { ...prev.itemDurability, [gearId]: 100 },
        };
      });
    },
    [showToast]
  );

  const handleBuyBaitPack = useCallback(
    (baitId: string) => {
      const b = BAITS.find((item) => item.id === baitId);
      if (!b || stateRef.current.credits < b.pricePerPack) return;
      audioEngine.playCoin();
      showToast(`Куплено: ${b.name} (+${b.packSize} шт.)`);
      setGameState((prev) => {
        if (prev.credits < b.pricePerPack) return prev;
        return {
          ...prev,
          credits: prev.credits - b.pricePerPack,
          baitInventory: {
            ...prev.baitInventory,
            [baitId]: (prev.baitInventory[baitId] ?? 0) + b.packSize,
          },
        };
      });
    },
    [showToast]
  );

  const handleBuyFlavoringPack = useCallback(
    (flavId: string) => {
      const fl = FLAVORINGS.find((f) => f.id === flavId);
      if (!fl || fl.pricePerPack <= 0 || stateRef.current.credits < fl.pricePerPack) return;
      audioEngine.playCoin();
      showToast(`Куплено ароматизатор: ${fl.name} (+${fl.packSize} доз)`);
      setGameState((prev) => {
        if (prev.credits < fl.pricePerPack) return prev;
        return {
          ...prev,
          credits: prev.credits - fl.pricePerPack,
          equippedFlavoringId:
            prev.equippedFlavoringId === 'flav_none' ? flavId : prev.equippedFlavoringId,
          flavoringInventory: {
            ...prev.flavoringInventory,
            [flavId]: (prev.flavoringInventory[flavId] ?? 0) + fl.packSize,
          },
        };
      });
    },
    [showToast]
  );

  const handleBuyGroundbaitPack = useCallback(
    (gbId: string) => {
      const g = GROUNDBAITS.find((item) => item.id === gbId);
      if (!g || stateRef.current.credits < g.pricePerPack) return;
      audioEngine.playCoin();
      showToast(`Куплено: ${g.name} (+${g.packSize} пачки)`);
      setGameState((prev) => {
        if (prev.credits < g.pricePerPack) return prev;
        return {
          ...prev,
          credits: prev.credits - g.pricePerPack,
          groundbaitInventory: {
            ...prev.groundbaitInventory,
            [gbId]: (prev.groundbaitInventory[gbId] ?? 0) + g.packSize,
          },
        };
      });
    },
    [showToast]
  );

  const handleBuyConsumable = useCallback(
    (itemId: string) => {
      const item = LOOT_MAP[itemId];
      if (!item || !item.buyPrice || stateRef.current.credits < item.buyPrice) return;
      audioEngine.playCoin();
      showToast(`Куплено: ${item.name}`);
      const cost = item.buyPrice;
      setGameState((prev) => {
        if (prev.credits < cost) return prev;
        return {
          ...prev,
          credits: prev.credits - cost,
          consumableInventory: {
            ...prev.consumableInventory,
            [itemId]: (prev.consumableInventory[itemId] ?? 0) + 1,
          },
        };
      });
    },
    [showToast]
  );

  const handleUpgradeKeepnet = useCallback(() => {
    const cur = stateRef.current;
    const next = KEEPNET_UPGRADES[cur.keepnetLevel];
    if (!next || cur.credits < next.price) return;
    audioEngine.playCoin();
    showToast(`Садок покращено: ${next.name}`);
    setGameState((prev) => {
      const upg = KEEPNET_UPGRADES[prev.keepnetLevel];
      if (!upg || prev.credits < upg.price) return prev;
      return {
        ...prev,
        credits: prev.credits - upg.price,
        keepnetLevel: prev.keepnetLevel + 1,
      };
    });
  }, [showToast]);

  const handleUpgradeRadSuit = useCallback(() => {
    const cur = stateRef.current;
    const next = RADSUIT_UPGRADES[cur.radSuitLevel + 1];
    if (!next || cur.credits < next.price) return;
    audioEngine.playCoin();
    showToast(`Придбано захист: ${next.name}`);
    setGameState((prev) => {
      const upg = RADSUIT_UPGRADES[prev.radSuitLevel + 1];
      if (!upg || prev.credits < upg.price) return prev;
      return {
        ...prev,
        credits: prev.credits - upg.price,
        radSuitLevel: prev.radSuitLevel + 1,
      };
    });
  }, [showToast]);

  const handleClearRadiation = useCallback(() => {
    const cur = stateRef.current;
    if (cur.radiation <= 0 || cur.credits < 40) return;
    audioEngine.playCoin();
    showToast('Дезактивацію проведено. Рівень радіації знижено до 0 мЗв.');
    setGameState((prev) => {
      if (prev.credits < 40) return prev;
      return {
        ...prev,
        credits: prev.credits - 40,
        radiation: 0,
      };
    });
  }, [showToast]);

  const handleClaimQuest = useCallback(
    (questId: string) => {
      const q = QUESTS.find((item) => item.id === questId);
      const cur = stateRef.current;
      if (!q || cur.completedQuestIds.includes(questId)) return;
      if ((cur.questProgress[questId] ?? 0) < q.targetCount) return;

      audioEngine.playCatch(false);
      showToast(`Завдання «${q.title}» здано! +₴ ${q.rewardCredits} · +${q.rewardGoldCoins ?? 0} зол. · +${q.rewardAmberShards ?? 0} бурштину · +${q.rewardXp} XP`);

      setGameState((prev) => {
        if (prev.completedQuestIds.includes(questId)) return prev;
        const nextXp = prev.xp + q.rewardXp;
        const nextBaits = { ...prev.baitInventory };
        if (q.rewardBaitId && q.rewardBaitQty) {
          nextBaits[q.rewardBaitId] = (nextBaits[q.rewardBaitId] ?? 0) + q.rewardBaitQty;
        }
        return {
          ...prev,
          credits: prev.credits + q.rewardCredits,
          totalEarnedCredits: prev.totalEarnedCredits + q.rewardCredits,
          goldCoins: (prev.goldCoins ?? 0) + (q.rewardGoldCoins ?? 0),
          amberShards: (prev.amberShards ?? 0) + (q.rewardAmberShards ?? 0),
          xp: nextXp,
          level: calcLevel(nextXp),
          baitInventory: nextBaits,
          completedQuestIds: [...prev.completedQuestIds, questId],
        };
      });
    },
    [showToast]
  );

  const handleRestToTime = useCallback(
    (targetHour: number, advanceDay: boolean) => {
      const cur = stateRef.current;
      const shouldAdvance = advanceDay || targetHour <= cur.timeOfDay;
      const nextDay = shouldAdvance ? cur.day + 1 : cur.day;
      const slot = nextDay * 4 + Math.floor(targetHour / 6);
      const nextWeather = WEATHER_CYCLE[slot % WEATHER_CYCLE.length];
      showToast(
        `Відпочинок у бункері завершено. Голод і сили відновлено. Час виходу — ${String(Math.floor(targetHour)).padStart(2, '0')}:${targetHour % 1 === 0.5 ? '30' : '00'}.`
      );
      setGameState((prev) => ({
        ...prev,
        day: nextDay,
        timeOfDay: targetHour,
        weather: nextWeather,
        stamina: 100,
        hunger: 100,
        radiation: Math.max(0, prev.radiation - 15),
      }));
    },
    [showToast]
  );

  const handleFullBunkerRest = useCallback(() => {
    const cur = stateRef.current;
    let nextTod = cur.timeOfDay + 2.5;
    let nextDay = cur.day;
    if (nextTod >= 24) {
      nextTod -= 24;
      nextDay += 1;
    }
    audioEngine.playCatch(false);
    showToast('Повноцінний сон у Бункері Рокитне: голод і сили відновлено!');
    setGameState((prev) => ({
      ...prev,
      day: nextDay,
      timeOfDay: nextTod,
      stamina: 100,
      hunger: 100,
      radiation: Math.max(0, prev.radiation - 20),
    }));
  }, [showToast]);

  const handleAdvanceWeather = useCallback(
    (targetWeather?: WeatherType) => {
      const cur = stateRef.current;
      const curIdx = WEATHER_CYCLE.indexOf(cur.weather);
      const nextWeather =
        targetWeather ?? WEATHER_CYCLE[(curIdx + 1) % WEATHER_CYCLE.length];
      let nextTod = cur.timeOfDay + 3.5;
      let nextDay = cur.day;
      if (nextTod >= 24) {
        nextTod -= 24;
        nextDay += 1;
      }
      const wLabels: Record<WeatherType, string> = {
        clear: 'Ясно',
        fog: 'Густий туман',
        rain: 'Мряка / Дощ',
        anomaly_surge: 'Аномальний викид',
      };
      showToast(`Зміна погоди на Поліссі: ${wLabels[nextWeather]}`);
      setGameState((prev) => ({
        ...prev,
        day: nextDay,
        timeOfDay: nextTod,
        weather: nextWeather,
        stamina: 100,
        hunger: Math.max(0, prev.hunger - 8),
        radiation: Math.max(0, prev.radiation - 8),
      }));
    },
    [showToast]
  );

  const currentLoc = LOCATIONS[gameState.currentLocationId] ?? LOCATIONS.tomashgorod;
  const keepnetGearBonus = gameState.equippedGearIds.reduce(
    (s, id) => s + (GEAR_MAP[id]?.keepnetBonusKg ?? 0),
    0
  );
  const keepnetCap =
    (KEEPNET_UPGRADES[gameState.keepnetLevel - 1]?.capacityKg ?? 15) + keepnetGearBonus;
  const keepnetWeight = gameState.keepnet.reduce((s, f) => s + f.weightKg, 0);
  const activeGroundbaitLocs = Object.keys(gameState.activeGroundbaitByLoc) as LocationId[];
  const readyQuestsCount = QUESTS.filter(
    (q) =>
      !gameState.completedQuestIds.includes(q.id) &&
      (gameState.questProgress[q.id] ?? 0) >= q.targetCount
  ).length;

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#060a08]"
    >
      <video
        ref={presentationVideoRef}
        className={showGamePresentation ? "fixed inset-0 z-[100] h-full w-full object-cover bg-black" : "hidden"}
        muted
        playsInline
        preload="auto"
        onEnded={finishGamePresentation}
        onError={finishGamePresentation}
        src="https://raw.githubusercontent.com/maister-online/hromada-social/main/Video_game_trailer_presentation_63f758c3.mp4"
      />
      {showRiverIntro && (
        <div className="fixed inset-0 z-[120] bg-black">
          <video
            className="h-full w-full object-cover"
            autoPlay
            playsInline
            preload="auto"
            onEnded={() => setShowRiverIntro(false)}
            onError={() => setShowRiverIntro(false)}
            src="https://raw.githubusercontent.com/maister-online/hromada-social/main/public/assets/aistudio/Stalker_goes_fishing_93c283a9.mp4"
          />
        </div>
      )}
      <audio
        ref={presentationAudioRef}
        preload="auto"
        src="https://raw.githubusercontent.com/maister-online/hromada-social/main/%D0%9F%D0%BE%D0%BB%D1%96%D1%81%D1%81%D1%8F%20%D0%BD%D0%B0%20%D0%B7%D0%B0%D1%81%D1%82%D0%B0%D0%B2%D0%BA%D1%83_2026_11_25_18_24_12.mp3"
      />
      {screen === 'TITLE' && (
        <>
          <div className="absolute inset-0 z-10">
            <TitleScreen
              menuVisible={true}
              hasSave={existingSave !== null}
              discoveredCount={Object.keys(gameState.discovered).length}
              totalSpeciesCount={FISH_SPECIES.length}
              onNewGame={() => setShowNewGameConfirm(true)}
              onContinue={handleContinue}
              onOpenBestiary={() => setShowBestiary(true)}
            />
          </div>
          {showNewGameConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-game-confirm-title"
                className="w-full max-w-sm rounded-2xl border border-emerald-300/30 bg-[#101b16] p-5 text-center shadow-2xl"
              >
                <h2 id="new-game-confirm-title" className="mb-3 text-xl font-bold text-white">
                  Почати нову гру?
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-white/75">
                  {existingSave
                    ? "Поточний прогрес буде замінено новою грою. Ви втратите збережені досягнення, рибу та спорядження."
                    : "Розпочати нову пригоду в аномальному Поліссі?"}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewGameConfirm(false)}
                    className="min-h-[48px] flex-1 rounded-xl border border-white/20 bg-white/10 px-4 font-semibold text-white"
                  >
                    Скасувати
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewGameConfirm(false);
                      handleNewGame();
                    }}
                    className="min-h-[48px] flex-1 rounded-xl bg-emerald-700 px-4 font-bold text-white"
                  >
                    Почати
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {screen === 'MAP' && (
        <PolissiaMapView
          currentLocationId={gameState.currentLocationId}
          day={gameState.day}
          timeOfDay={gameState.timeOfDay}
          weather={gameState.weather}
          credits={gameState.credits}
          goldCoins={gameState.goldCoins ?? 0}
          amberShards={gameState.amberShards ?? 0}
          level={gameState.level}
          radSuitLevel={gameState.radSuitLevel}
          hunger={gameState.hunger} keepnetCount={gameState.keepnet.length}
          keepnetWeightKg={keepnetWeight}
          keepnetCapacityKg={keepnetCap}
          lootCount={gameState.foundLoot.length}
          readyQuestsCount={readyQuestsCount}
          visitedLocationIds={gameState.visitedLocationIds}
          activeGroundbaitLocs={activeGroundbaitLocs}
          muted={muted}
          musicEnabled={musicEnabled}
          onSelectDestination={handleSelectDestination}
          onOpenInventory={() => setShowInventory(true)}
          onOpenQuests={() => setShowQuests(true)}
          onOpenBestiary={() => setShowBestiary(true)}
          onOpenJournal={() => setShowJournal(true)}
          onToggleMute={handleToggleMute}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {screen === 'FISHING' && !currentLoc.isBunker && (
        <FishingView
          key={currentLoc.id}
          location={currentLoc}
          gameState={gameState}
          muted={muted}
          musicEnabled={musicEnabled}
          isModalOpen={showInventory || showQuests || showBestiary || showJournal}
          onToggleMute={handleToggleMute}
          onToggleMusic={handleToggleMusic}
          onSelectBait={handleSelectBait}
          onConsumeBait={handleConsumeBait}
          onLineSnap={handleLineSnap}
          onThrowGroundbait={handleThrowGroundbait}
          onCatchFish={handleCatchFish}
          onFindLoot={handleFindLoot}
          onUseConsumable={handleUseConsumable}
          onClockAndRadTick={handleClockAndRadTick}
          onSelectRod={handleBuyOrEquipRod}
          onSelectReel={handleBuyOrEquipReel}
          onSelectLine={handleBuyOrEquipLine}
          onSelectFloat={handleBuyOrEquipFloat}
          onSelectHook={handleBuyOrEquipHook}
          onSelectSinker={handleBuyOrEquipSinker}
          onSelectFeeder={handleBuyOrEquipFeeder}
          onSelectBottomRig={handleBuyOrEquipBottomRig}
          onToggleAccessory={handleBuyOrToggleAccessory}
          onToggleGearItem={handleBuyOrToggleGearItem}
          onSelectFlavoring={handleSelectFlavoring}
          onDamageTackle={handleDamageTackle}
          onOpenInventory={() => setShowInventory(true)}
          onOpenJournal={() => setShowJournal(true)}
          onOpenQuests={() => setShowQuests(true)}
          onOpenMap={() => setScreen('MAP')}
          onGoToBunker={() => handleSelectDestination('rokitne_bunker')}
        />
      )}

      {screen === 'BUNKER' && (
        <BunkerView
          gameState={gameState}
          onOpenMap={() => setShowBunkerMap(true)}
          muted={muted}
          musicEnabled={musicEnabled}
          onToggleMute={handleToggleMute}
          onToggleMusic={handleToggleMusic}
          onOpenJournal={() => setShowJournal(true)}
          onSellFish={handleSellFish}
          onSellAll={handleSellAll}
          onSellLoot={handleSellLoot}
          onSellAllLoot={handleSellAllLoot}
          onHaggleBaryga={handleHaggleBaryga}
          onBuyMarketBundle={handleBuyMarketBundle}
          onBuyOrEquipRod={handleBuyOrEquipRod}
          onBuyOrEquipReel={handleBuyOrEquipReel}
          onBuyOrEquipLine={handleBuyOrEquipLine}
          onBuyOrEquipFloat={handleBuyOrEquipFloat}
          onBuyOrEquipHook={handleBuyOrEquipHook}
          onBuyOrEquipSinker={handleBuyOrEquipSinker}
          onBuyOrEquipFeeder={handleBuyOrEquipFeeder}
          onBuyOrEquipBottomRig={handleBuyOrEquipBottomRig}
          onBuyOrToggleAccessory={handleBuyOrToggleAccessory}
          onBuyOrToggleGearItem={handleBuyOrToggleGearItem}
          onBuyPremiumGear={handleBuyPremiumGear}
          onBuyBaitPack={handleBuyBaitPack}
          onBuyFlavoringPack={handleBuyFlavoringPack}
          onBuyGroundbaitPack={handleBuyGroundbaitPack}
          onBuyConsumable={handleBuyConsumable}
          onRepairTackle={handleRepairTackle}
          onUpgradeKeepnet={handleUpgradeKeepnet}
          onUpgradeRadSuit={handleUpgradeRadSuit}
          onClearRadiation={handleClearRadiation}
          onUseConsumable={handleUseConsumable}
          onClaimQuest={handleClaimQuest}
          onRestToTime={handleRestToTime}
          onFullRest={handleFullBunkerRest}
          onAdvanceWeather={handleAdvanceWeather}
          onExitToMap={() => setShowBunkerMap(true)}
        />
      )}

      {screen === 'BUNKER' && showBunkerMap && (
        <PolissiaMapView
          compact onClose={() => setShowBunkerMap(false)}
          currentLocationId={gameState.currentLocationId} day={gameState.day} timeOfDay={gameState.timeOfDay}
          weather={gameState.weather} credits={gameState.credits} goldCoins={gameState.goldCoins ?? 0} amberShards={gameState.amberShards ?? 0} level={gameState.level} radSuitLevel={gameState.radSuitLevel}
          hunger={gameState.hunger} keepnetCount={gameState.keepnet.length} keepnetWeightKg={keepnetWeight}
          keepnetCapacityKg={keepnetCap} lootCount={gameState.foundLoot.length} readyQuestsCount={readyQuestsCount}
          visitedLocationIds={gameState.visitedLocationIds} activeGroundbaitLocs={activeGroundbaitLocs}
          muted={muted} musicEnabled={musicEnabled} onSelectDestination={handleSelectDestination}
          onOpenInventory={() => setShowInventory(true)} onOpenQuests={() => setShowQuests(true)}
          onOpenBestiary={() => setShowBestiary(true)} onOpenJournal={() => setShowJournal(true)}
          onToggleMute={handleToggleMute} onToggleMusic={handleToggleMusic}
        />
      )}

      {showInventory && (
        <InventoryModal
          gameState={gameState}
          inFishing={screen === 'FISHING'}
          onEquipRod={handleBuyOrEquipRod}
          onEquipReel={handleBuyOrEquipReel}
          onEquipLine={handleBuyOrEquipLine}
          onEquipFloat={handleBuyOrEquipFloat}
          onEquipHook={handleBuyOrEquipHook}
          onEquipSinker={handleBuyOrEquipSinker}
          onEquipFeeder={handleBuyOrEquipFeeder}
          onEquipBottomRig={handleBuyOrEquipBottomRig}
          onToggleAccessory={handleBuyOrToggleAccessory}
          onToggleGearItem={handleBuyOrToggleGearItem}
          onEquipBait={handleSelectBait}
          onSelectFlavoring={handleSelectFlavoring}
          onUseConsumable={handleUseConsumable}
          onClose={() => setShowInventory(false)}
        />
      )}

      {showJournal && (
        <JournalModal
          gameState={gameState}
          onClose={() => setShowJournal(false)}
        />
      )}

      {showQuests && (
        <QuestsModal
          gameState={gameState}
          onClose={() => setShowQuests(false)}
        />
      )}

      {showBestiary && (
        <BestiaryModal
          discovered={gameState.discovered}
          onClose={() => setShowBestiary(false)}
        />
      )}

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 py-2 bg-[#0a1510]/95 border border-emerald-400/40 rounded-md shadow-xl text-xs font-medium text-emerald-100 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}

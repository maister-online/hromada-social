import React, { useEffect, useState } from 'react';
import {
  BedDouble,
  BookMarked,
  Box,
  CheckCircle2,
  CloudFog,
  CloudRain,
  Coffee,
  Coins,
  Compass,
  Hammer,
  Moon,
  Music,
  Scale,
  ScrollText,
  Shield,
  ShoppingBag,
  Sparkles,
  Store,
  Sun,
  TrendingUp,
  Volume2,
  VolumeX,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import {
  ACCESSORIES,
  BAITS,
  BOTTOM_RIGS,
  BUNKER_PHOTO_URL,
  CHARACTERS,
  FEEDERS,
  FISH_MAP,
  FISH_SPECIES,
  FLAVORINGS,
  FLOATS,
  GEAR_ITEMS,
  GEAR_MAP,
  GROUNDBAITS,
  HOOKS,
  KEEPNET_UPGRADES,
  LINES,
  LOOT_ITEMS,
  LOOT_MAP,
  MARKET_BUNDLES,
  QUESTS,
  RADSUIT_UPGRADES,
  REELS,
  RODS,
  SINKERS,
  formatClock,
  getBarygaOfferPrice,
  getDailyMarketDemand,
} from '../game/data';
import { CharacterId, FishSpeciesDef, SaveState, WeatherType } from '../game/types';
import { CharacterPortrait } from './CharacterPortrait';
import { Fauna3DPreview } from './Fauna3DPreview';
import { FishIllustration } from './FishIllustration';
import { ItemIllustration } from './ItemIllustration';
import { CatalogPhoto } from './CatalogPhoto';

interface BunkerViewProps {
  gameState: SaveState;
  muted: boolean;
  musicEnabled: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onOpenJournal: () => void;
  onSellFish: (uid: string) => void;
  onSellAll: () => void;
  onSellLoot: (uid: string, finalPrice?: number) => void;
  onSellAllLoot: (totalPrice?: number) => void;
  onHaggleBaryga: () => void;
  onBuyMarketBundle: (bundleId: string) => void;
  onBuyOrEquipRod: (rodId: string) => void;
  onBuyOrEquipReel: (reelId: string) => void;
  onBuyOrEquipLine: (lineId: string) => void;
  onBuyOrEquipFloat: (floatId: string) => void;
  onBuyOrEquipHook: (hookId: string) => void;
  onBuyOrEquipSinker: (sinkerId: string) => void;
  onBuyOrEquipFeeder: (feederId: string) => void;
  onBuyOrEquipBottomRig: (rigId: string) => void;
  onBuyOrToggleAccessory: (accId: string) => void;
  onBuyOrToggleGearItem: (gearId: string) => void;
  onBuyPremiumGear: (gearId: string) => void;
  onBuyBaitPack: (baitId: string) => void;
  onBuyFlavoringPack: (flavId: string) => void;
  onBuyGroundbaitPack: (gbId: string) => void;
  onBuyConsumable: (itemId: string) => void;
  onRepairTackle: (itemId: string, cost: number) => void;
  onUpgradeKeepnet: () => void;
  onUpgradeRadSuit: () => void;
  onClearRadiation: () => void;
  onUseConsumable: (itemId: string) => void;
  onClaimQuest: (questId: string) => void;
  onRestToTime: (targetHour: number, advanceDay: boolean) => void;
  onFullRest: () => void;
  onAdvanceWeather: (targetWeather?: WeatherType) => void;
  onExitToMap: () => void;
  onOpenMap: () => void;
}

type ShopCategory =
  | 'rods'
  | 'reels'
  | 'lines'
  | 'floats'
  | 'hooks_sinkers'
  | 'rigs'
  | 'baits'
  | 'lures'
  | 'groundbaits'
  | 'gear'
  | 'supplies'
  | 'repair'
  | 'quests';

interface BunkerHotspot {
  id: CharacterId;
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  labelLeftPct: number;
  labelTopPct: number;
  displayName: string;
  shortAction: string;
}

// Calibrated over Four_people_sitting_in_bunker_10fbe33d_2K_fb20483c.jpg (16:9 locked stage)
const BUNKER_HOTSPOTS: BunkerHotspot[] = [
  {
    id: 'taras',
    leftPct: 12,
    topPct: 24,
    widthPct: 21,
    heightPct: 60,
    labelLeftPct: 22.5,
    labelTopPct: 21,
    displayName: 'Комірник',
    shortAction: 'Улов · Провізія · Відпочинок',
  },
  {
    id: 'velychko',
    leftPct: 34,
    topPct: 24,
    widthPct: 16,
    heightPct: 47,
    labelLeftPct: 42,
    labelTopPct: 21,
    displayName: 'Науковець',
    shortAction: 'Дослідження · Бестіарій',
  },
  {
    id: 'oleg',
    leftPct: 51,
    topPct: 21,
    widthPct: 20,
    heightPct: 45,
    labelLeftPct: 61,
    labelTopPct: 18,
    displayName: 'Майстер',
    shortAction: 'Снасті · Ремонт',
  },
  {
    id: 'baryga',
    leftPct: 72,
    topPct: 23,
    widthPct: 21,
    heightPct: 51,
    labelLeftPct: 82.5,
    labelTopPct: 20,
    displayName: 'Єльцин',
    shortAction: 'Торговець · Скупка',
  },
];

export const BunkerView: React.FC<BunkerViewProps> = ({
  gameState,
  muted,
  musicEnabled,
  onToggleMute,
  onToggleMusic,
  onOpenJournal,
  onSellFish,
  onSellAll,
  onSellLoot,
  onSellAllLoot,
  onHaggleBaryga,
  onBuyMarketBundle,
  onBuyOrEquipRod,
  onBuyOrEquipReel,
  onBuyOrEquipLine,
  onBuyOrEquipFloat,
  onBuyOrEquipHook,
  onBuyOrEquipSinker,
  onBuyOrEquipFeeder,
  onBuyOrEquipBottomRig,
  onBuyOrToggleAccessory,
  onBuyOrToggleGearItem,
  onBuyPremiumGear,
  onBuyBaitPack,
  onBuyFlavoringPack,
  onBuyGroundbaitPack,
  onBuyConsumable,
  onRepairTackle,
  onUpgradeKeepnet,
  onUpgradeRadSuit,
  onClearRadiation,
  onUseConsumable,
  onClaimQuest,
  onRestToTime,
  onFullRest,
  onAdvanceWeather,
  onExitToMap,
  onOpenMap,
}) => {
  const [activeNpc, setActiveNpc] = useState<CharacterId | null>(null);
  const [hoveredNpc, setHoveredNpc] = useState<CharacterId | null>(null);
  const [tarasTab, setTarasTab] = useState<'catch' | 'rest' | 'quests'>('catch');
  const [shopCat, setShopCat] = useState<ShopCategory>('rods');
  const [velychkoTab, setVelychkoTab] = useState<'quests' | 'bestiary'>('quests');
  const [velychkoFilter, setVelychkoFilter] = useState<'all' | 'fish' | 'crayfish' | 'wildlife' | 'mutant'>('all');
  const [inspectSpecies, setInspectSpecies] = useState<FishSpeciesDef | null>(null);
  const [barygaTab, setBarygaTab] = useState<'buyback' | 'market' | 'quests' | 'blackmarket'>('buyback');

  useEffect(() => {
    if (!activeNpc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (inspectSpecies) setInspectSpecies(null);
        else setActiveNpc(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeNpc, inspectSpecies]);

  const npc = activeNpc ? CHARACTERS[activeNpc] : null;
  const { clock, phaseLabel } = formatClock(gameState.timeOfDay);
  const keepnetWeight = gameState.keepnet.reduce((s, f) => s + f.weightKg, 0);
  const keepnetGearBonus = gameState.equippedGearIds.reduce(
    (s, id) => s + (GEAR_MAP[id]?.keepnetBonusKg ?? 0),
    0
  );
  const keepnetCap =
    (KEEPNET_UPGRADES[gameState.keepnetLevel - 1]?.capacityKg ?? 15) + keepnetGearBonus;
  const totalSellVal = gameState.keepnet.reduce((s, f) => s + f.value, 0);
  const dailyDemand = getDailyMarketDemand(gameState.day);
  const bargainedToday =
    gameState.haggleDay === gameState.day && (gameState.haggleBonusPct ?? 0) > 0;
  const lootWithOffers = gameState.foundLoot.map((entry) => {
    const def = LOOT_MAP[entry.itemId];
    const offer = getBarygaOfferPrice(
      def,
      entry.value,
      gameState.day,
      gameState.haggleDay,
      gameState.haggleBonusPct
    );
    return { entry, def, offer };
  });
  const totalLootMarketVal = lootWithOffers.reduce((s, x) => s + x.offer.finalPrice, 0);

  const nextKeepnet = KEEPNET_UPGRADES[gameState.keepnetLevel] || null;
  const nextRadSuit = RADSUIT_UPGRADES[gameState.radSuitLevel + 1] || null;

  const getReadyQuestsCount = (cid: CharacterId) =>
    QUESTS.filter(
      (q) =>
        q.giver === cid &&
        !gameState.completedQuestIds.includes(q.id) &&
        (gameState.questProgress[q.id] ?? 0) >= q.targetCount
    ).length;

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] bg-[#050806] text-slate-100 overflow-hidden select-none">
      {/* Bunker Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-6 py-2.5 bg-[#09100c]/80 backdrop-blur-sm border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-lg sm:text-2xl font-bold text-slate-100">
            Бункер «Щит-04» · Рокитне
          </h1>
          <p className="text-xs text-slate-400">
            День {gameState.day} · {clock} ({phaseLabel}) · Рівень {gameState.level} ({gameState.xp} XP)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2.5 bg-[#060b09] border border-white/10 rounded-xl px-3.5 py-2">
            <span className="font-mono-num font-semibold text-amber-300" title="Гривні">
              ₴ {gameState.credits}
            </span>
            <span className="font-mono-num font-semibold text-yellow-300" title="Золоті монети">
              ◈ {gameState.goldCoins ?? 0}
            </span>
            <span className="font-mono-num font-semibold text-orange-300" title="Шматочки бурштину">
              ◆ {gameState.amberShards ?? 0}
            </span>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="font-mono-num text-slate-200 hidden sm:inline">
              Садок: {keepnetWeight.toFixed(1)}/{keepnetCap} кг
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span
              className={`font-mono-num ${
                gameState.radiation > 30 ? 'text-rose-400' : 'text-emerald-300'
              }`}
            >
              Радіація: {Math.round(gameState.radiation)} мЗв
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span
              className={`font-mono-num ${
                gameState.sanity <= 30
                  ? 'text-rose-400 font-semibold'
                  : gameState.sanity <= 60
                    ? 'text-amber-300'
                    : 'text-indigo-300'
              }`}
            >
              Розсудливість: {Math.round(gameState.sanity)}%
            </span>
          </div>

          <button type="button" onClick={onOpenMap} className="btn-tactile btn-primary-emerald min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs rounded-xl cursor-pointer whitespace-nowrap">
            <Compass className="w-4 h-4" />Карта
          </button>
          <button
            type="button"
            onClick={onOpenJournal}
            className="btn-tactile btn-field min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 font-semibold text-xs rounded-xl cursor-pointer whitespace-nowrap"
          >
            <BookMarked className="w-4 h-4 text-amber-300" />
            Журнал
          </button>

          <button
            type="button"
            onClick={onToggleMusic}
            className={`btn-tactile min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl cursor-pointer border ${
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
            className="btn-tactile btn-field min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl cursor-pointer"
            aria-label={muted ? 'Увімкнути звук' : 'Вимкнути звук'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

        </div>
      </header>

      {/* Main Interactive Bunker Scene */}
      <div className="absolute inset-0 overflow-hidden bg-[#040705] p-0">
        {/* Responsive portrait stage: fills all available screen height and scales down to fit narrow screens */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#070b09]">
          <img
            src={BUNKER_PHOTO_URL}
            alt="Інтер’єр бункера Щит-04 з чотирма сталкерами"
            className="absolute inset-0 block w-screen h-[100dvh] max-w-none object-cover object-center select-none pointer-events-none"
            draggable={false}
            style={{ width: "100vw", height: "100dvh", objectFit: "cover", objectPosition: "center" }}
          />

          {/* Subtle bottom/top atmospheric scrim for crisp contrast */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(4, 8, 6, 0.28) 0%, transparent 25%, transparent 72%, rgba(4, 8, 6, 0.72) 100%)',
            }}
          />

          {/* Interactive Clickable Hotspots Over Each Character in the Photo */}
          {BUNKER_HOTSPOTS.map((spot) => {
            const char = CHARACTERS[spot.id];
            const isHovered = hoveredNpc === spot.id;
            const isSelected = activeNpc === spot.id;
            const readyCount = getReadyQuestsCount(spot.id);

            return (
              <React.Fragment key={spot.id}>
                {/* Clickable hitbox over the character's figure */}
                <button
                  type="button"
                  onClick={() => setActiveNpc(spot.id)}
                  onMouseEnter={() => setHoveredNpc(spot.id)}
                  onMouseLeave={() => setHoveredNpc((prev) => (prev === spot.id ? null : prev))}
                  style={{
                    left: `${spot.leftPct}%`,
                    top: `${spot.topPct}%`,
                    width: `${spot.widthPct}%`,
                    height: `${spot.heightPct}%`,
                    borderColor:
                      isHovered || isSelected ? char.accentHex : 'rgba(255,255,255,0.08)',
                    boxShadow:
                      isHovered || isSelected
                        ? `0 0 28px ${char.accentHex}38, inset 0 0 18px ${char.accentHex}22`
                        : 'none',
                  }}
                  className="absolute rounded-2xl border-2 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  aria-label={`Відкрити: ${spot.displayName}`}
                />
                <div
                  className="bunker-npc-tag absolute z-10 pointer-events-none"
                  style={{ left: `${spot.labelLeftPct}%`, top: `${spot.labelTopPct}%`, transform: 'translateX(-50%)' }}
                >
                  <span className="block text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-emerald-200/75">
                    {readyCount > 0 ? 'Є завдання' : 'Персонаж'}
                  </span>
                  <span className="block whitespace-nowrap text-[11px] sm:text-xs font-extrabold text-white drop-shadow-lg">
                    {spot.displayName}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
          <div className="bunker-scene-footer absolute bottom-3 sm:bottom-5 left-1/2 z-20 -translate-x-1/2 pointer-events-none w-[min(92%,620px)]">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200/15 bg-[#06100c]/75 px-3.5 py-2.5 shadow-2xl backdrop-blur-md">
              <div className="min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-300/80">Щит-04 · Безпечна зона</div>
                <div className="truncate text-xs sm:text-sm font-semibold text-slate-100">Оберіть сталкера для взаємодії</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[10px] text-slate-400">Садок</div>
                <div className="font-mono-num text-xs font-bold text-amber-300">{keepnetWeight.toFixed(1)} / {keepnetCap} кг</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CHARACTER ACTION MENU OVERLAY (opened when clicking a character on the bunker photo) */}
      {activeNpc && npc && (
        <div
          className="bunker-dialog-backdrop fixed inset-0 z-40 flex items-center justify-center p-2.5 sm:p-5 bg-[#020604]/88 backdrop-blur-md"
          onClick={() => setActiveNpc(null)}
        >
          <div
            className="bunker-dialog w-full max-w-5xl max-h-[92dvh] rounded-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bunker-dialog-topbar px-4 sm:px-5 py-3 flex items-center justify-between gap-3">\n              <div className="min-w-0"><div className="text-[9px] uppercase tracking-[0.24em] text-emerald-300/75">Зв’язок · Щит-04</div><div className="text-xs font-semibold text-slate-200">Інтерактивне меню персонажа</div></div>
              <button
                type="button"
                onClick={() => setActiveNpc(null)}
                className="btn-tactile btn-field min-h-[40px] px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                aria-label="Повернутися до огляду бункера"
              >
                <X className="w-4 h-4" />
                <span>До бункера</span>
              </button>
            </div>

            {/* Scrollable Character Action Menu Content */}
            <div className="bunker-dialog-content flex-1 min-h-0 overflow-y-auto custom-scroll p-3 sm:p-5 space-y-4">
              {/* Character Dialogue Header */}
              <div className="bunker-character-card rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <CharacterPortrait
                  characterId={npc.id}
                  className="w-20 h-20 rounded-lg border border-white/15 shrink-0"
                />
                <div className="space-y-1 flex-1">
                  <div className="text-xs font-medium" style={{ color: npc.accentHex }}>
                    {npc.roomName} · {npc.callsign}
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100">
                    {BUNKER_HOTSPOTS.find((spot) => spot.id === npc.id)?.displayName ?? npc.callsign}
                  </h2>
                  <div className="bunker-dialogue-bubble"><span className="block text-[9px] uppercase tracking-[0.18em] text-emerald-300/70 mb-1">Каже</span><p className="text-xs sm:text-sm text-slate-100 italic leading-relaxed">«{npc.greeting}»</p></div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{npc.bio}</p>
                </div>
              </div>

              {/* TARAS: CATCH SELLING, FOOD FOR SANITY, RAD CLEAR, REST & FIELD QUESTS */}
              {activeNpc === 'taras' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                    <button
                      type="button"
                      onClick={() => setTarasTab('catch')}
                      className={`btn-tactile min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        tarasTab === 'catch' ? 'btn-primary-amber' : 'btn-field'
                      }`}
                    >
                      <Coins className="w-4 h-4" />
                      Улов і Провізія ({gameState.keepnet.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTarasTab('rest')}
                      className={`btn-tactile min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        tarasTab === 'rest' ? 'btn-primary-emerald' : 'btn-field'
                      }`}
                    >
                      <BedDouble className="w-4 h-4" />
                      Відпочинок і Погода
                    </button>
                    <button
                      type="button"
                      onClick={() => setTarasTab('quests')}
                      className={`btn-tactile min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        tarasTab === 'quests' ? 'bg-amber-400 text-slate-950' : 'btn-field'
                      }`}
                    >
                      <ScrollText className="w-4 h-4" />
                      Польові контракти
                    </button>
                  </div>

                  {tarasTab === 'catch' && (
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h3 className="text-base font-semibold text-slate-100">
                            Приймання улову ({gameState.keepnet.length} шт. · {keepnetWeight.toFixed(1)} кг)
                          </h3>
                          <p className="text-xs text-slate-400">
                            Мутанти та великі трофеї коштують значно дорожче за звичайну рибу
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          {gameState.radiation > 0 && (
                            <button
                              type="button"
                              onClick={onClearRadiation}
                              disabled={gameState.credits < 40}
                              className={`btn-tactile min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold ${
                                gameState.credits >= 40
                                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/45 cursor-pointer'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <Shield className="w-3.5 h-3.5" />
                              Дезактивація + Антирад (₴ 40)
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={onSellAll}
                            disabled={gameState.keepnet.length === 0}
                            className={`btn-tactile min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold ${
                              gameState.keepnet.length > 0
                                ? 'btn-primary-amber cursor-pointer'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Coins className="w-4 h-4" />
                            Продати весь улов (₴ {totalSellVal})
                          </button>
                        </div>
                      </div>

                      {gameState.keepnet.length === 0 ? (
                        <div className="bg-[#0b130f] border border-white/10 rounded-xl p-8 text-center text-xs text-slate-400">
                          У вашому садку поки порожньо. Виходьте на карту Полісся та повертайтесь із рибою!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {gameState.keepnet.map((f) => {
                            const sp = FISH_MAP[f.speciesId];
                            if (!sp) return null;
                            return (
                              <div
                                key={f.uid}
                                className="bg-[#0b130f] border border-white/10 rounded-md p-3.5 flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-16 h-11 bg-[#060a08] border border-white/15 rounded overflow-hidden shrink-0">
                                    <FishIllustration species={sp} className="w-full h-full" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold text-slate-100 truncate">
                                      {sp.name}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-mono-num">
                                      {f.weightKg} кг · {f.lengthCm} см
                                    </div>
                                    <div className="text-[10px] text-cyan-300">
                                      {f.isMutant
                                        ? 'Аномальний мутант'
                                        : sp.faunaKind === 'crayfish'
                                          ? 'Рак'
                                          : sp.faunaKind === 'beetle' ||
                                              sp.faunaKind === 'insect' ||
                                              sp.faunaKind === 'wildlife'
                                            ? 'Водна живність'
                                            : f.isTrophy
                                              ? 'Трофей'
                                              : 'Риба'}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => onSellFish(f.uid)}
                                  className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-400/35 rounded text-xs font-mono-num font-semibold shrink-0 cursor-pointer"
                                >
                                  +₴ {f.value}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Taras Food Supply for Sanity Restoration */}
                      <div className="pt-4 border-t border-white/10 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                            <Coffee className="w-4 h-4 text-emerald-300" />
                            Продовольчий склад Тараса (відновлення розсудливості)
                          </div>
                          <span className="font-mono-num text-xs text-indigo-300">
                            Ваша розсудливість: {Math.round(gameState.sanity)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {LOOT_ITEMS.filter(
                            (i) => i.category === 'consumable' && i.isFood && i.buyPrice
                          ).map((food) => {
                            const qty = gameState.consumableInventory[food.id] ?? 0;
                            const price = food.buyPrice ?? 50;
                            const canBuy = gameState.credits >= price;
                            const canUse = qty > 0 && gameState.sanity < 100;
                            return (
                              <div
                                key={food.id}
                                className="bg-[#0b130f] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between gap-3"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-14 h-11 bg-[#060a08] border border-white/10 rounded p-1 shrink-0 flex items-center justify-center">
                                    <ItemIllustration item={food} className="w-11 h-8" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[11px] font-medium text-indigo-300">
                                      {food.effectLabel} · Є: {qty} шт.
                                    </div>
                                    <div className="text-xs font-semibold text-slate-100 mt-0.5">
                                      {food.name}
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                                      {food.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => onBuyConsumable(food.id)}
                                    disabled={!canBuy}
                                    className={`btn-tactile flex-1 min-h-[40px] inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold ${
                                      canBuy
                                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    Купити (₴ {price})
                                  </button>
                                  {qty > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => onUseConsumable(food.id)}
                                      disabled={!canUse}
                                      className={`btn-tactile min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                        canUse
                                          ? 'bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-100 border border-indigo-400/45 cursor-pointer'
                                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                      }`}
                                    >
                                      Вжити
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Redirect / Hint to Yeltsin's Market */}
                      <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#0a130f] border rounded-xl p-4">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-100">
                            Маєте знахідки з дна ({gameState.foundLoot.length} шт.)?
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Копійки, шматки металу, золоті ланцюжки, стару зброю та різне дорого скуповує Єльцин на Підпільному ринку!
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveNpc('baryga')}
                          className="btn-tactile btn-primary-emerald min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          <Store className="w-4 h-4" />
                          На Ринок до Єльцина (₴ {totalLootMarketVal})
                        </button>
                      </div>
                    </div>
                  )}

                  {tarasTab === 'rest' && (
                    <div className="panel-field rounded-xl p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                          <BedDouble className="w-4 h-4 text-emerald-400" />
                          Перепочинок у бункері та вибір часу виходу
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono-num">
                          <span className="text-slate-400">Розсудливість:</span>
                          <span
                            className={
                              gameState.sanity <= 30
                                ? 'text-rose-400 font-bold'
                                : gameState.sanity <= 60
                                  ? 'text-amber-300 font-bold'
                                  : 'text-indigo-300 font-bold'
                            }
                          >
                            {Math.round(gameState.sanity)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">
                        Сон на спальниках у бункері знімає психологічне напруження після викидів (+55% розсудливості при зміні часу доби) або повністю відновлює розсудливість до 100%.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={onFullRest}
                          className="btn-tactile btn-primary-emerald min-h-[46px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          <BedDouble className="w-4 h-4" />
                          Відпочити в бункері (100% розсудливості · +2.5 год)
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <button
                          type="button"
                          onClick={() => onRestToTime(5.5, true)}
                          className="btn-tactile btn-field min-h-[46px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          <Sun className="w-3.5 h-3.5 text-amber-300" />
                          Світанок (05:30)
                        </button>
                        <button
                          type="button"
                          onClick={() => onRestToTime(11.0, false)}
                          className="btn-tactile btn-field min-h-[46px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          <Sun className="w-3.5 h-3.5 text-yellow-300" />
                          День (11:00)
                        </button>
                        <button
                          type="button"
                          onClick={() => onRestToTime(18.0, false)}
                          className="btn-tactile btn-field min-h-[46px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          <Moon className="w-3.5 h-3.5 text-orange-300" />
                          Вечір (18:00)
                        </button>
                        <button
                          type="button"
                          onClick={() => onRestToTime(22.5, false)}
                          className="btn-tactile btn-field min-h-[46px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          <Moon className="w-3.5 h-3.5 text-sky-300" />
                          Ніч (22:30)
                        </button>
                      </div>

                      <div className="pt-3 border-t border-white/10 space-y-2.5">
                        <div className="text-xs font-semibold text-slate-300">
                          Погодне зведення Полісся (перечекати в укритті до потрібної погоди):
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {(
                            [
                              ['clear', 'Ясно', Sun, 'text-amber-300'],
                              ['fog', 'Густий туман', CloudFog, 'text-teal-200'],
                              ['rain', 'Дощ / Мряка', CloudRain, 'text-sky-300'],
                              ['anomaly_surge', 'Викид', Zap, 'text-cyan-300'],
                            ] as [
                              WeatherType,
                              string,
                              React.ComponentType<{ className?: string }>,
                              string,
                            ][]
                          ).map(([wKey, label, WIcon, colorCls]) => {
                            const activeW = gameState.weather === wKey;
                            return (
                              <button
                                key={wKey}
                                type="button"
                                onClick={() => onAdvanceWeather(wKey)}
                                className={`btn-tactile min-h-[46px] inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer border ${
                                  activeW
                                    ? 'bg-emerald-950/80 border-emerald-400/60 text-emerald-200'
                                    : 'btn-field'
                                }`}
                              >
                                <WIcon className={`w-4 h-4 ${colorCls}`} />
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {tarasTab === 'quests' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {QUESTS.filter((q) => q.giver === 'taras').map((q) => {
                        const done = gameState.completedQuestIds.includes(q.id);
                        const prog = Math.min(q.targetCount, gameState.questProgress[q.id] ?? 0);
                        const ready = !done && prog >= q.targetCount;
                        return (
                          <div
                            key={q.id}
                            className={`border rounded-xl p-4 space-y-3 ${
                              done
                                ? 'bg-[#08120e] border-emerald-500/30 opacity-75'
                                : ready
                                  ? 'bg-[#0d1c18] border-amber-400/50'
                                  : 'bg-[#0b130f] border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-sm font-semibold text-slate-100">{q.title}</h4>
                              {done ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <span className="font-mono-num text-xs text-amber-300">
                                  {prog}/{q.targetCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-300">{q.description}</p>
                            <p className="text-xs text-slate-400 italic">«{q.dialoguePrompt}»</p>
                            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                              <span className="font-mono-num text-amber-300">
                                ₴ {q.rewardCredits} · +{q.rewardXp} XP
                              </span>
                              {!done && (
                                <button
                                  type="button"
                                  onClick={() => onClaimQuest(q.id)}
                                  disabled={!ready}
                                  className={`px-3.5 py-1.5 rounded-lg font-semibold ${
                                    ready
                                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  {ready ? 'Забрати нагороду' : 'Виконується'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* YELTSIN (BARYGA): UNDERGROUND MARKET, DAILY DEMAND, BARGAINING & RELIC BUYBACK */}
              {activeNpc === 'baryga' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                    <button
                      type="button"
                      onClick={() => setBarygaTab('buyback')}
                      className={`btn-tactile min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        barygaTab === 'buyback' ? 'btn-primary-amber' : 'btn-field'
                      }`}
                    >
                      <Scale className="w-4 h-4" />
                      Скупка знахідок ({gameState.foundLoot.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBarygaTab('market')}
                      className={`btn-tactile min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        barygaTab === 'market' ? 'btn-primary-emerald' : 'btn-field'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      Підпільний ринок (Лоти)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBarygaTab('blackmarket')}
                      className={`btn-tactile min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        barygaTab === 'blackmarket' ? 'border border-amber-300/50 bg-amber-400/15 text-amber-200' : 'btn-field'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      Елітний арсенал
                    </button>
                    <button
                      type="button"
                      onClick={() => setBarygaTab('quests')}
                      className={`btn-tactile min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        barygaTab === 'quests' ? 'bg-amber-400 text-slate-950' : 'btn-field'
                      }`}
                    >
                      <ScrollText className="w-4 h-4" />
                      Контракти Єльцина
                    </button>
                  </div>

                  {barygaTab === 'buyback' && (
                    <div className="space-y-4">
                      <div className="panel-field rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                            <TrendingUp className="w-4 h-4" />
                            Попит дня на ринку (+{dailyDemand.bonusPct}% до ціни):
                          </div>
                          <div className="text-sm font-bold text-slate-100">{dailyDemand.label}</div>
                          <p className="text-[11px] text-slate-400">
                            {bargainedToday
                              ? `Ви вже поторгувалися сьогодні з Єльциним: додатково +${gameState.haggleBonusPct}% до всієї скупки!`
                              : 'Можна один раз на день поторгуватися з Єльциним перед продажем.'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={onHaggleBaryga}
                            disabled={bargainedToday}
                            className={`btn-tactile min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${
                              bargainedToday
                                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-400/40 cursor-default'
                                : 'btn-field hover:border-amber-400/60 text-amber-200 cursor-pointer'
                            }`}
                          >
                            <Scale className="w-4 h-4" />
                            {bargainedToday
                              ? `Сторговано (+${gameState.haggleBonusPct}%)`
                              : 'Поторгуватися'}
                          </button>

                          <button
                            type="button"
                            onClick={() => onSellAllLoot(totalLootMarketVal)}
                            disabled={gameState.foundLoot.length === 0}
                            className={`btn-tactile min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold ${
                              gameState.foundLoot.length > 0
                                ? 'btn-primary-amber cursor-pointer'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Coins className="w-4 h-4" />
                            Продати все Єльцину (₴ {totalLootMarketVal})
                          </button>
                        </div>
                      </div>

                      {lootWithOffers.length === 0 ? (
                        <div className="bg-[#0b130f] border border-white/10 rounded-xl p-8 text-center text-xs text-slate-400">
                          У рюкзаку поки немає знахідок з дна. Опустіть глибину на дно («На дно» в інтерфейсі або ехолоті) — і витягуйте копійки, шматки металу, золоті ланцюжки, стару зброю та різне!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {lootWithOffers.map(({ entry, def, offer }) => {
                            if (!def) return null;
                            return (
                              <div
                                key={entry.uid}
                                className={`border rounded-xl p-3.5 flex items-center justify-between gap-3 ${
                                  offer.hasDemandBonus
                                    ? 'bg-[#12160c] border-amber-400/45'
                                    : 'bg-[#0b130f] border-white/10'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-14 h-11 bg-[#060a08] border border-white/10 rounded p-1 shrink-0 flex items-center justify-center">
                                    <ItemIllustration item={def} className="w-12 h-9" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold text-slate-100 truncate">
                                      {def.name}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                      {def.category === 'artifact' ? 'Артефакт' : 'Знахідка з води'} · День{' '}
                                      {entry.foundDay}
                                    </div>
                                    {offer.totalBoostPct > 0 && (
                                      <div className="text-[10px] font-semibold text-amber-300">
                                        Націнка ринку: +{offer.totalBoostPct}%
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => onSellLoot(entry.uid, offer.finalPrice)}
                                  className="btn-tactile min-h-[40px] px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-400/40 rounded-lg text-xs font-mono-num font-bold shrink-0 cursor-pointer"
                                >
                                  +₴ {offer.finalPrice}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {barygaTab === 'market' && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400">
                        Єльцин формує оптові та рідкісні набори зі знижкою для бувалих сталкерів:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {MARKET_BUNDLES.map((bundle) => {
                          const canBuy = gameState.credits >= bundle.price;
                          return (
                            <div
                              key={bundle.id}
                              className="bg-[#0b130f] border border-white/12 rounded-xl p-4 flex flex-col justify-between space-y-3"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <span className="text-amber-300 font-semibold">{bundle.tag}</span>
                                  <span className="font-mono-num font-bold text-emerald-300">
                                    ₴ {bundle.price}
                                  </span>
                                </div>
                                <h4 className="text-base font-semibold text-slate-100 mt-1">
                                  {bundle.name}
                                </h4>
                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                  {bundle.description}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => onBuyMarketBundle(bundle.id)}
                                disabled={!canBuy}
                                className={`btn-tactile w-full min-h-[44px] inline-flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold ${
                                  canBuy
                                    ? 'btn-primary-amber cursor-pointer'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                <ShoppingBag className="w-4 h-4" />
                                Купити на ринку (₴ {bundle.price})
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {barygaTab === 'blackmarket' && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-amber-400/25 bg-amber-950/15 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-black text-amber-200">Закритий склад рідкісного спорядження</h3>
                            <p className="mt-1 text-xs text-slate-400">Тут приймають тільки рідкісні трофеї Зони. Гривнями ці речі не купити.</p>
                          </div>
                          <div className="flex gap-3 text-xs font-mono-num">
                            <span className="text-yellow-300">◈ {gameState.goldCoins ?? 0}</span>
                            <span className="text-orange-300">◆ {gameState.amberShards ?? 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {GEAR_ITEMS.filter((g) => g.goldPrice || g.amberPrice).map((item) => {
                          const owned = gameState.ownedGearIds.includes(item.id);
                          const canBuy = (gameState.goldCoins ?? 0) >= (item.goldPrice ?? 0) && (gameState.amberShards ?? 0) >= (item.amberPrice ?? 0);
                          return (
                            <div key={item.id} className="rounded-xl border border-amber-300/20 bg-[#0b130f] p-4 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm font-bold text-slate-100">{item.name}</h4>
                                <span className="shrink-0 rounded-md border border-amber-300/30 px-2 py-1 text-[10px] font-bold text-amber-200">ЕКСКЛЮЗИВ</span>
                              </div>
                              <p className="text-xs leading-relaxed text-slate-400">{item.description}</p>
                              <p className="text-xs font-semibold text-emerald-300">{item.effectLabel}</p>
                              <div className="flex flex-wrap gap-3 text-xs font-mono-num">
                                {(item.goldPrice ?? 0) > 0 && <span className="text-yellow-300">◈ {item.goldPrice} золотих</span>}
                                {(item.amberPrice ?? 0) > 0 && <span className="text-orange-300">◆ {item.amberPrice} бурштину</span>}
                              </div>
                              <button type="button" disabled={owned || !canBuy} onClick={() => onBuyPremiumGear(item.id)} className={`w-full min-h-[42px] rounded-lg px-3 py-2 text-xs font-bold ${owned ? 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : canBuy ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                                {owned ? 'Вже придбано' : canBuy ? 'Обміняти рідкісні ресурси' : 'Недостатньо рідкісних ресурсів'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {barygaTab === 'quests' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {QUESTS.filter((q) => q.giver === 'baryga').map((q) => {
                        const done = gameState.completedQuestIds.includes(q.id);
                        const prog = Math.min(q.targetCount, gameState.questProgress[q.id] ?? 0);
                        const ready = !done && prog >= q.targetCount;
                        return (
                          <div
                            key={q.id}
                            className={`border rounded-xl p-4 space-y-3 ${
                              done
                                ? 'bg-[#08120e] border-emerald-500/30 opacity-75'
                                : ready
                                  ? 'bg-[#17160c] border-amber-400/55'
                                  : 'bg-[#0b130f] border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-sm font-semibold text-slate-100">{q.title}</h4>
                              <span className="font-mono-num text-xs text-amber-300">
                                {done ? 'Здано' : `${prog}/${q.targetCount}`}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300">{q.description}</p>
                            <p className="text-xs text-slate-400 italic">«{q.dialoguePrompt}»</p>
                            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                              <span className="font-mono-num text-amber-300">
                                Нагорода: ₴ {q.rewardCredits}{q.rewardGoldCoins ? ` · ◈ ${q.rewardGoldCoins}` : ''}{q.rewardAmberShards ? ` · ◆ ${q.rewardAmberShards}` : ''} · +{q.rewardXp} XP
                              </span>
                              {!done && (
                                <button
                                  type="button"
                                  onClick={() => onClaimQuest(q.id)}
                                  disabled={!ready}
                                  className={`px-3.5 py-1.5 rounded-lg font-semibold ${
                                    ready
                                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  {ready ? 'Забрати нагороду' : 'У процесі'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* OLEG: FULL TACKLE, BAITS, LURES, GROUNDBAITS, 30 GEAR ITEMS & REPAIR WORKBENCH */}
              {activeNpc === 'oleg' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 pb-3">
                    {(
                      [
                        ['rods', 'Вудки (18)'],
                        ['reels', 'Котушки (10)'],
                        ['lines', 'Волосінь'],
                        ['floats', 'Поплавки (13)'],
                        ['hooks_sinkers', 'Гачки й Грузила'],
                        ['rigs', 'Донки і Фідери'],
                        ['baits', 'Наживки і Діпи'],
                        ['lures', 'Приманки (16)'],
                        ['groundbaits', 'Прикормки'],
                        ['gear', 'Спорядження (30)'],
                        ['supplies', 'Витратники'],
                        ['repair', 'Ремонт'],
                        ['quests', 'Контракт'],
                      ] as [ShopCategory, string][]
                    ).map(([k, lbl]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setShopCat(k)}
                        className={`btn-tactile min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                          shopCat === k
                            ? 'bg-sky-400 text-slate-950 border border-sky-200/50'
                            : 'btn-field'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>

                  {shopCat === 'rods' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {RODS.map((r) => {
                        const owned = gameState.ownedRodIds.includes(r.id);
                        const equipped = gameState.equippedRodId === r.id;
                        const canBuy = gameState.credits >= r.price;
                        const dur = Math.round(gameState.itemDurability[r.id] ?? 100);
                        return (
                          <div
                            key={r.id}
                            className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                          >
                            <CatalogPhoto query={`fishing rod ${r.name}`} fallbackQueries={['fishing rod']} alt={r.name} className="w-full h-28 rounded-lg mb-3" />
                            <div>
                              <div className="flex justify-between gap-2 text-xs">
                                <span className="text-sky-300 font-medium">
                                  {r.typeLabel} · {r.lengthM} м · Тест {r.testRangeLabel}
                                </span>
                                <span className="font-mono-num text-amber-300">
                                  До {r.maxLoadKg} кг · +{r.castBonusM} м
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <h4 className="text-base font-semibold text-slate-100">{r.name}</h4>
                                {owned && (
                                  <span
                                    className={`font-mono-num text-xs font-bold ${
                                      dur <= 25
                                        ? 'text-rose-400'
                                        : dur <= 60
                                          ? 'text-amber-300'
                                          : 'text-emerald-300'
                                    }`}
                                  >
                                    {dur}%
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{r.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onBuyOrEquipRod(r.id)}
                              disabled={!owned && !canBuy}
                              className={`w-full min-h-[40px] py-2 rounded-lg text-xs font-semibold ${
                                equipped
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                  : owned
                                    ? 'bg-slate-700 hover:bg-slate-600 text-white cursor-pointer'
                                    : canBuy
                                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {equipped
                                ? 'Екіпіровано'
                                : owned
                                  ? 'Взяти в руки'
                                  : `Купити (₴ ${r.price})`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {shopCat === 'reels' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {REELS.map((r) => {
                        const owned = gameState.ownedReelIds.includes(r.id);
                        const equipped = gameState.equippedReelId === r.id;
                        const canBuy = gameState.credits >= r.price;
                        const dur = Math.round(gameState.itemDurability[r.id] ?? 100);
                        return (
                          <div
                            key={r.id}
                            className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                          >
                            <CatalogPhoto query={`fishing reel ${r.name}`} fallbackQueries={['fishing reel']} alt={r.name} className="w-full h-28 rounded-lg mb-3" />
                            <div>
                              <div className="flex justify-between gap-2 text-xs">
                                <span className="text-sky-300 font-medium">
                                  Шпуля {r.lineCapacityM} м · {r.gearRatio}
                                </span>
                                <span className="font-mono-num text-amber-300">
                                  Фрикціон {r.dragPowerKg} кг · ×{r.retrieveSpeed}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <h4 className="text-base font-semibold text-slate-100">{r.name}</h4>
                                {owned && (
                                  <span className="font-mono-num text-xs text-emerald-300">
                                    {dur}%
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{r.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onBuyOrEquipReel(r.id)}
                              disabled={!owned && !canBuy}
                              className={`w-full min-h-[40px] py-2 rounded-lg text-xs font-semibold ${
                                equipped
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                  : owned
                                    ? 'bg-slate-700 hover:bg-slate-600 text-white cursor-pointer'
                                    : canBuy
                                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {equipped
                                ? 'Встановлено'
                                : owned
                                  ? 'Встановити'
                                  : `Купити (₴ ${r.price})`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {shopCat === 'lines' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {LINES.map((l) => {
                        const owned = gameState.ownedLineIds.includes(l.id);
                        const equipped = gameState.equippedLineId === l.id;
                        const canBuy = gameState.credits >= l.price;
                        return (
                          <div
                            key={l.id}
                            className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                          >
                            <CatalogPhoto query={`fishing line spool ${l.name}`} fallbackQueries={['fishing line spool']} alt={l.name} className="w-full h-28 rounded-lg mb-3" />
                            <div>
                              <div className="flex justify-between gap-2 text-xs">
                                <span className="text-sky-300 font-medium">
                                  Ø {l.thicknessMm} мм · {l.lengthM} м
                                </span>
                                <span className="font-mono-num text-amber-300">
                                  Розрив {l.maxTensionKg} кг
                                </span>
                              </div>
                              <h4 className="text-base font-semibold text-slate-100 mt-1">{l.name}</h4>
                              <p className="text-xs text-slate-400 mt-1">{l.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onBuyOrEquipLine(l.id)}
                              disabled={!owned && !canBuy}
                              className={`w-full min-h-[40px] py-2 rounded-lg text-xs font-semibold ${
                                equipped
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                  : owned
                                    ? 'bg-slate-700 hover:bg-slate-600 text-white cursor-pointer'
                                    : canBuy
                                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {equipped
                                ? 'Намотано на шпулю'
                                : owned
                                  ? 'Намотати'
                                  : `Купити (₴ ${l.price})`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {shopCat === 'floats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {FLOATS.map((f) => {
                        const owned = gameState.ownedFloatIds.includes(f.id);
                        const equipped = gameState.equippedFloatId === f.id;
                        const canBuy = gameState.credits >= f.price;
                        return (
                          <div
                            key={f.id}
                            className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                          >
                            <CatalogPhoto query={`fishing float ${f.name}`} fallbackQueries={['fishing float']} alt={f.name} className="w-full h-28 rounded-lg mb-3" />
                            <div>
                              <div className="flex justify-between gap-2 text-xs">
                                <span className="inline-flex items-center gap-1.5 text-sky-300 font-medium">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-white/40"
                                    style={{ backgroundColor: f.tipHex }}
                                  />
                                  Чутл. ×{f.biteSensitivityBonus}
                                </span>
                                <span className="font-mono-num text-amber-300">
                                  Течія ×{f.currentStability}
                                  {f.nightGlow ? ' · Світиться' : ''}
                                  {f.electronic ? ' · LED/Сигнал' : ''}
                                </span>
                              </div>
                              <h4 className="text-base font-semibold text-slate-100 mt-1">{f.name}</h4>
                              <p className="text-xs text-slate-400 mt-1">{f.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onBuyOrEquipFloat(f.id)}
                              disabled={!owned && !canBuy}
                              className={`w-full min-h-[40px] py-2 rounded-lg text-xs font-semibold ${
                                equipped
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                  : owned
                                    ? 'bg-slate-700 hover:bg-slate-600 text-white cursor-pointer'
                                    : canBuy
                                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {equipped
                                ? 'Встановлено'
                                : owned
                                  ? 'Поставити'
                                  : `Купити (₴ ${f.price})`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {shopCat === 'hooks_sinkers' && (
                    <div className="space-y-6">
                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-200">Гачки</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {HOOKS.map((h) => {
                            const owned = gameState.ownedHookIds.includes(h.id);
                            const equipped = gameState.equippedHookId === h.id;
                            const canBuy = gameState.credits >= h.price;
                            return (
                              <div
                                key={h.id}
                                className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                              >
                            <CatalogPhoto query={`fishing hook ${h.name}`} fallbackQueries={['fishing hook']} alt={h.name} className="w-full h-28 rounded-lg mb-3" />
                                <div>
                                  <div className="flex justify-between text-xs text-sky-300">
                                    <span>Кльов ×{h.biteRateBonus}</span>
                                    <span className="text-amber-300">
                                      Утримання +{Math.round(h.hookRetentionBonus * 100)}%
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-slate-100 mt-1">{h.name}</h4>
                                  <p className="text-xs text-slate-400 mt-1">{h.description}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onBuyOrEquipHook(h.id)}
                                  disabled={!owned && !canBuy}
                                  className={`w-full min-h-[38px] py-1.5 rounded-lg text-xs font-semibold ${
                                    equipped
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                      : owned
                                        ? 'bg-slate-700 hover:bg-slate-600 text-white cursor-pointer'
                                        : canBuy
                                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  {equipped ? 'Встановлено' : owned ? 'Прив’язати' : `Купити (₴ ${h.price})`}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-200">Грузила</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {SINKERS.map((s) => {
                            const owned = gameState.ownedSinkerIds.includes(s.id);
                            const equipped = gameState.equippedSinkerId === s.id;
                            const canBuy = gameState.credits >= s.price;
                            return (
                              <div
                                key={s.id}
                                className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                              >
                            <CatalogPhoto query={`fishing sinker ${s.name}`} fallbackQueries={['fishing sinker']} alt={s.name} className="w-full h-28 rounded-lg mb-3" />
                                <div>
                                  <div className="flex justify-between text-xs text-sky-300">
                                    <span>Вага {s.weightG} г</span>
                                    <span className="text-amber-300">+{s.castBonusM} м закид</span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-slate-100 mt-1">{s.name}</h4>
                                  <p className="text-xs text-slate-400 mt-1">{s.description}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onBuyOrEquipSinker(s.id)}
                                  disabled={!owned && !canBuy}
                                  className={`w-full min-h-[38px] py-1.5 rounded-lg text-xs font-semibold ${
                                    equipped
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                      : owned
                                        ? 'bg-slate-700 hover:bg-slate-600 text-white cursor-pointer'
                                        : canBuy
                                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  {equipped ? 'Встановлено' : owned ? 'Обрати' : `Купити (₴ ${s.price})`}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    </div>
                  )}

                  {shopCat === 'rigs' && (
                    <div className="space-y-6">
                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-200">
                          Готові донки та фідерні оснастки
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {BOTTOM_RIGS.map((r) => {
                            const owned = gameState.ownedBottomRigIds.includes(r.id);
                            const equipped = gameState.equippedBottomRigId === r.id;
                            const canBuy = gameState.credits >= r.price;
                            return (
                              <div
                                key={r.id}
                                className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                              >
                            <CatalogPhoto query={`fishing rig ${r.name}`} fallbackQueries={['fishing rig']} alt={r.name} className="w-full h-28 rounded-lg mb-3" />
                                <div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-sky-300">Кльов ×{r.biteRateBonus}</span>
                                    <span className="font-mono-num text-amber-300">
                                      +{r.castBonusM} м · До {r.maxLoadKg} кг
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-slate-100 mt-1">{r.name}</h4>
                                  <p className="text-xs text-slate-400 mt-1">{r.description}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onBuyOrEquipBottomRig(r.id)}
                                  disabled={!owned && !canBuy}
                                  className={`w-full min-h-[38px] py-1.5 rounded-lg text-xs font-semibold ${
                                    equipped
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                      : owned
                                        ? 'bg-slate-700 hover:bg-slate-600 text-white cursor-pointer'
                                        : canBuy
                                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  {equipped ? 'Змонтовано' : owned ? 'Поставити' : `Купити (₴ ${r.price})`}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-200">Годівниці</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {FEEDERS.map((f) => {
                            const owned = gameState.ownedFeederIds.includes(f.id);
                            const equipped = gameState.equippedFeederId === f.id;
                            const canBuy = gameState.credits >= f.price;
                            return (
                              <div
                                key={f.id}
                                className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                              >
                            <CatalogPhoto query={`fishing feeder ${f.name}`} fallbackQueries={['fishing feeder']} alt={f.name} className="w-full h-28 rounded-lg mb-3" />
                                <div>
                                  <div className="flex justify-between text-xs text-teal-300">
                                    <span>+{Math.round(f.biteRateBoost * 100)}% кльову</span>
                                    <span className="text-amber-300">
                                      +{Math.round(f.weightBoost * 100)}% ваги
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-slate-100 mt-1">{f.name}</h4>
                                  <p className="text-xs text-slate-400 mt-1">{f.description}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onBuyOrEquipFeeder(f.id)}
                                  disabled={!owned && !canBuy}
                                  className={`w-full min-h-[38px] py-1.5 rounded-lg text-xs font-semibold ${
                                    equipped
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                      : owned
                                        ? 'bg-slate-700 hover:bg-slate-600 text-white cursor-pointer'
                                        : canBuy
                                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  {equipped ? 'Встановлено' : owned ? 'Обрати' : `Купити (₴ ${f.price})`}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-200">
                          Фурнітура та сигналізатори клювання
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {ACCESSORIES.map((a) => {
                            const owned = gameState.ownedAccessoryIds.includes(a.id);
                            const active = gameState.equippedAccessoryIds.includes(a.id);
                            const canBuy = gameState.credits >= a.price;
                            return (
                              <div
                                key={a.id}
                                className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                              >
                            <CatalogPhoto query={`fishing tackle accessory ${a.name}`} fallbackQueries={['fishing tackle accessory']} alt={a.name} className="w-full h-28 rounded-lg mb-3" />
                                <div>
                                  <div className="flex justify-between text-xs text-sky-300">
                                    <span>Кльов ×{a.biteSpeedBonus}</span>
                                    <span className="text-emerald-300">
                                      Антизачеп +{Math.round(a.snagResistBonus * 100)}%
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-slate-100 mt-1">{a.name}</h4>
                                  <p className="text-xs text-slate-400 mt-1">{a.description}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onBuyOrToggleAccessory(a.id)}
                                  disabled={!owned && !canBuy}
                                  className={`w-full min-h-[38px] py-1.5 rounded-lg text-xs font-semibold ${
                                    active
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 cursor-pointer'
                                      : owned
                                        ? 'bg-slate-700 hover:bg-slate-600 text-white cursor-pointer'
                                        : canBuy
                                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  {active
                                    ? 'Увімкнено (зняти)'
                                    : owned
                                      ? 'Увімкнути в монтаж'
                                      : `Купити (₴ ${a.price})`}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    </div>
                  )}

                  {shopCat === 'baits' && (
                    <div className="space-y-6">
                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-200">
                          Живі, рослинні та аномальні наживки
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {BAITS.filter((b) => b.category !== 'lure').map((b) => {
                            const count = gameState.baitInventory[b.id] ?? 0;
                            const canBuy = gameState.credits >= b.pricePerPack;
                            return (
                              <div
                                key={b.id}
                                className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                              >
                                <CatalogPhoto query={`fishing bait ${b.name}`} fallbackQueries={['fishing bait']} alt={b.name} className="w-full h-28 rounded-lg mb-3" />
                                <div>
                                  <div className="flex justify-between gap-2 text-xs">
                                    <span className="text-emerald-300 font-medium">
                                      У запасі: {count} шт.
                                    </span>
                                    <span className="font-mono-num text-amber-300">
                                      Кльов ×{b.biteSpeedBonus} · +{Math.round(b.mutantBonus * 100)}% мут.
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-slate-100 mt-1">{b.name}</h4>
                                  <p className="text-xs text-slate-400 mt-1">{b.description}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onBuyBaitPack(b.id)}
                                  disabled={!canBuy}
                                  className={`w-full min-h-[38px] inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold ${
                                    canBuy
                                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  Купити +{b.packSize} шт. (₴ {b.pricePerPack})
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-200">
                          Ароматизатори й діпи (10 ароматів)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {FLAVORINGS.filter((fl) => fl.id !== 'flav_none').map((fl) => {
                            const qty = gameState.flavoringInventory[fl.id] ?? 0;
                            const canBuy = gameState.credits >= fl.pricePerPack;
                            return (
                              <div
                                key={fl.id}
                                className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                              >
                                <CatalogPhoto query={`fishing bait flavor ${fl.name}`} fallbackQueries={['fishing bait flavor']} alt={fl.name} className="w-full h-28 rounded-lg mb-3" />
                                <div>
                                  <div className="flex justify-between gap-2 text-xs">
                                    <span className="text-teal-300 font-medium">
                                      У запасі: {qty} порц.
                                    </span>
                                    <span className="font-mono-num text-amber-300">
                                      +{Math.round(fl.biteRateBoost * 100)}% кльов · +
                                      {Math.round(fl.weightBoost * 100)}% вага
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-slate-100 mt-1">{fl.name}</h4>
                                  <p className="text-[11px] text-amber-200 mt-0.5">{fl.targetNote}</p>
                                  <p className="text-xs text-slate-400 mt-1">{fl.description}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onBuyFlavoringPack(fl.id)}
                                  disabled={!canBuy}
                                  className={`w-full min-h-[38px] inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold ${
                                    canBuy
                                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  Купити +{fl.packSize} порц. (₴ {fl.pricePerPack})
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    </div>
                  )}

                  {shopCat === 'lures' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {BAITS.filter((b) => b.category === 'lure').map((b) => {
                        const count = gameState.baitInventory[b.id] ?? 0;
                        const canBuy = gameState.credits >= b.pricePerPack;
                        return (
                          <div
                            key={b.id}
                            className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                          >
                            <div>
                              <div className="flex justify-between gap-2 text-xs">
                                <span className="text-emerald-300 font-medium">
                                  У коробці: {count} шт.
                                </span>
                                <span className="font-mono-num text-amber-300">
                                  Кльов ×{b.biteSpeedBonus} · Хижак ×{b.predatorBonus ?? 1.2}
                                </span>
                              </div>
                              <h4 className="text-base font-semibold text-slate-100 mt-1">{b.name}</h4>
                              <p className="text-xs text-slate-400 mt-1">{b.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onBuyBaitPack(b.id)}
                              disabled={!canBuy}
                              className={`w-full min-h-[40px] inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold ${
                                canBuy
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              Купити +{b.packSize} шт. (₴ {b.pricePerPack})
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {shopCat === 'groundbaits' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {GROUNDBAITS.map((g) => {
                        const count = gameState.groundbaitInventory[g.id] ?? 0;
                        const canBuy = gameState.credits >= g.pricePerPack;
                        return (
                          <div
                            key={g.id}
                            className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                          >
                            <CatalogPhoto query={`fishing groundbait ${g.name}`} fallbackQueries={['fishing groundbait']} alt={g.name} className="w-full h-28 rounded-lg mb-3" />
                            <div>
                              <div className="flex justify-between gap-2 text-xs">
                                <span className="text-teal-300 font-medium">
                                  У рюкзаку: {count} пачок
                                </span>
                                <span className="font-mono-num text-amber-300">
                                  +{Math.round(g.biteRateBoost * 100)}% кльов · +
                                  {Math.round(g.weightBoost * 100)}% вага
                                </span>
                              </div>
                              <h4 className="text-base font-semibold text-slate-100 mt-1">{g.name}</h4>
                              <p className="text-xs text-slate-300 mt-1">{g.targetNote}</p>
                              <p className="text-xs text-slate-400 mt-1">{g.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onBuyGroundbaitPack(g.id)}
                              disabled={!canBuy}
                              className={`w-full min-h-[40px] inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold ${
                                canBuy
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Купити +{g.packSize} пачки (₴ {g.pricePerPack})
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {shopCat === 'gear' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#0b130f] border border-white/10 rounded-xl p-5 flex flex-col justify-between space-y-4">
                          <div>
                            <span className="text-xs text-amber-300 font-mono-num">
                              Садок · Рівень {gameState.keepnetLevel}/4
                            </span>
                            <h4 className="text-base font-semibold text-slate-100 mt-1">
                              {KEEPNET_UPGRADES[gameState.keepnetLevel - 1].name}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {KEEPNET_UPGRADES[gameState.keepnetLevel - 1].description}
                            </p>
                          </div>
                          {nextKeepnet ? (
                            <button
                              type="button"
                              onClick={onUpgradeKeepnet}
                              disabled={gameState.credits < nextKeepnet.price}
                              className={`w-full min-h-[40px] py-2 rounded-lg text-xs font-semibold ${
                                gameState.credits >= nextKeepnet.price
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              Покращити до: {nextKeepnet.name} (₴ {nextKeepnet.price})
                            </button>
                          ) : (
                            <div className="text-xs text-emerald-400 font-medium">
                              Максимальний садок
                            </div>
                          )}
                        </div>

                        <div className="bg-[#0b130f] border border-white/10 rounded-xl p-5 flex flex-col justify-between space-y-4">
                          <div>
                            <span className="text-xs text-teal-300 font-mono-num">
                              Радіозахист · Рів. {gameState.radSuitLevel}/3
                            </span>
                            <h4 className="text-base font-semibold text-slate-100 mt-1">
                              {RADSUIT_UPGRADES[gameState.radSuitLevel].name}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {RADSUIT_UPGRADES[gameState.radSuitLevel].description}
                            </p>
                          </div>
                          {nextRadSuit ? (
                            <button
                              type="button"
                              onClick={onUpgradeRadSuit}
                              disabled={gameState.credits < nextRadSuit.price}
                              className={`w-full min-h-[40px] py-2 rounded-lg text-xs font-semibold ${
                                gameState.credits >= nextRadSuit.price
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              Купити: {nextRadSuit.name} (₴ {nextRadSuit.price})
                            </button>
                          ) : (
                            <div className="text-xs text-emerald-400 font-medium">
                              Максимальний антирадіаційний захист
                            </div>
                          )}
                        </div>
                      </div>

                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-200">
                          Польове спорядження рибалки (30 позицій)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {GEAR_ITEMS.filter((g) => !g.goldPrice && !g.amberPrice).map((g) => {
                            const owned = gameState.ownedGearIds.includes(g.id);
                            const active = gameState.equippedGearIds.includes(g.id);
                            const canBuy = gameState.credits >= g.price;
                            return (
                              <div
                                key={g.id}
                                className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                              >
                            <CatalogPhoto query={`fishing equipment ${g.name}`} fallbackQueries={['fishing equipment']} alt={g.name} className="w-full h-28 rounded-lg mb-3" />
                                <div>
                                  <div className="text-[11px] font-semibold text-emerald-300">
                                    {g.effectLabel}
                                  </div>
                                  <h4 className="text-sm font-semibold text-slate-100 mt-1">
                                    {g.name}
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-1">{g.description}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onBuyOrToggleGearItem(g.id)}
                                  disabled={!owned && !canBuy}
                                  className={`w-full min-h-[38px] py-1.5 rounded-lg text-xs font-semibold ${
                                    active
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 cursor-pointer'
                                      : owned
                                        ? 'bg-slate-700 hover:bg-slate-600 text-white cursor-pointer'
                                        : canBuy
                                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  {active
                                    ? 'Використовується (зняти)'
                                    : owned
                                      ? 'Екіпірувати'
                                      : `Купити (₴ ${g.price})`}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    </div>
                  )}

                  {shopCat === 'supplies' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {LOOT_ITEMS.filter((i) => i.category === 'consumable' && i.buyPrice).map(
                        (item) => {
                          const qty = gameState.consumableInventory[item.id] ?? 0;
                          const price = item.buyPrice ?? 50;
                          const canBuy = gameState.credits >= price;
                          return (
                            <div
                              key={item.id}
                              className="bg-[#0b130f] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
                            >
                              <div className="flex items-start gap-3.5">
                                <div className="w-16 h-12 bg-[#060a08] border border-white/10 rounded p-1.5 shrink-0 flex items-center justify-center">
                                  <ItemIllustration item={item} className="w-12 h-9" />
                                </div>
                                <div>
                                  <div className="text-xs font-medium text-emerald-300">
                                    У рюкзаку: {qty} шт. · {item.effectLabel}
                                  </div>
                                  <h4 className="text-base font-semibold text-slate-100 mt-0.5">
                                    {item.name}
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => onBuyConsumable(item.id)}
                                disabled={!canBuy}
                                className={`w-full min-h-[42px] inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold ${
                                  canBuy
                                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Купити 1 шт. (₴ {price})
                              </button>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}

                  {shopCat === 'repair' && (
                    <div className="space-y-4">
                      <div className="panel-field rounded-xl p-4 flex items-center gap-3 text-xs text-slate-300">
                        <Hammer className="w-5 h-5 text-sky-300 shrink-0" />
                        <span>
                          Майстер Олег ремонтує зношені вудки, котушки, донки й спорядження до 100% міцності. Своєчасний ремонт рятує бланк від поломки на трофеї!
                        </span>
                      </div>

                      {(() => {
                        const wornItems: { id: string; name: string; kind: string; basePrice: number; dur: number }[] = [];
                        for (const r of RODS) {
                          if (!gameState.ownedRodIds.includes(r.id)) continue;
                          const dur = Math.round(gameState.itemDurability[r.id] ?? 100);
                          if (dur < 100) wornItems.push({ id: r.id, name: r.name, kind: 'Вудлище', basePrice: r.price || 60, dur });
                        }
                        for (const r of REELS) {
                          if (!gameState.ownedReelIds.includes(r.id)) continue;
                          const dur = Math.round(gameState.itemDurability[r.id] ?? 100);
                          if (dur < 100) wornItems.push({ id: r.id, name: r.name, kind: 'Котушка', basePrice: r.price || 55, dur });
                        }
                        for (const l of LINES) {
                          if (!gameState.ownedLineIds.includes(l.id)) continue;
                          const dur = Math.round(gameState.itemDurability[l.id] ?? 100);
                          if (dur < 100) wornItems.push({ id: l.id, name: l.name, kind: 'Волосінь', basePrice: l.price || 45, dur });
                        }
                        for (const b of BOTTOM_RIGS) {
                          if (b.id === 'brig_none' || !gameState.ownedBottomRigIds.includes(b.id)) continue;
                          const dur = Math.round(gameState.itemDurability[b.id] ?? 100);
                          if (dur < 100) wornItems.push({ id: b.id, name: b.name, kind: 'Донка / Фідер', basePrice: b.price || 80, dur });
                        }
                        for (const g of GEAR_ITEMS) {
                          if (!gameState.ownedGearIds.includes(g.id)) continue;
                          const dur = Math.round(gameState.itemDurability[g.id] ?? 100);
                          if (dur < 100) wornItems.push({ id: g.id, name: g.name, kind: 'Спорядження', basePrice: g.price || 100, dur });
                        }

                        if (wornItems.length === 0) {
                          return (
                            <div className="p-8 text-center text-xs text-emerald-300 bg-[#0b130f] border border-emerald-500/25 rounded-xl">
                              Усі ваші вудки, котушки, волосіні та спорядження у відмінному стані (100% міцності)!
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {wornItems.map((item) => {
                              const cost = Math.max(8, Math.round(((100 - item.dur) / 100) * Math.max(40, item.basePrice) * 0.35));
                              const canRepair = gameState.credits >= cost;
                              return (
                                <div
                                  key={item.id}
                                  className="bg-[#0b130f] border border-white/12 rounded-xl p-4 flex items-center justify-between gap-3"
                                >
                                  <div className="min-w-0">
                                    <div className="text-[11px] text-sky-300">{item.kind}</div>
                                    <div className="text-sm font-semibold text-slate-100 truncate">
                                      {item.name}
                                    </div>
                                    <div
                                      className={`text-xs font-mono-num font-bold mt-0.5 ${
                                        item.dur <= 20 ? 'text-rose-400' : 'text-amber-300'
                                      }`}
                                    >
                                      {item.dur <= 0 ? 'ЗЛАМАНО (0%)' : `Стан: ${item.dur}%`}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={!canRepair}
                                    onClick={() => onRepairTackle(item.id, cost)}
                                    className={`btn-tactile min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shrink-0 ${
                                      canRepair
                                        ? 'btn-primary-amber cursor-pointer'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                                  >
                                    <Wrench className="w-3.5 h-3.5" />
                                    Полагодити (₴ {cost})
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {shopCat === 'quests' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {QUESTS.filter((q) => q.giver === 'oleg').map((q) => {
                        const done = gameState.completedQuestIds.includes(q.id);
                        const prog = Math.min(q.targetCount, gameState.questProgress[q.id] ?? 0);
                        const ready = !done && prog >= q.targetCount;
                        return (
                          <div
                            key={q.id}
                            className={`border rounded-xl p-4 space-y-3 ${
                              done
                                ? 'bg-[#08120e] border-emerald-500/30 opacity-75'
                                : ready
                                  ? 'bg-[#0d1c18] border-amber-400/50'
                                  : 'bg-[#0b130f] border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-sm font-semibold text-slate-100">{q.title}</h4>
                              <span className="font-mono-num text-xs text-sky-300">
                                {done ? 'Здано' : `${prog}/${q.targetCount}`}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300">{q.description}</p>
                            <p className="text-xs text-slate-400 italic">«{q.dialoguePrompt}»</p>
                            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                              <span className="font-mono-num text-amber-300">
                                Нагорода: ₴ {q.rewardCredits}{q.rewardGoldCoins ? ` · ◈ ${q.rewardGoldCoins}` : ''}{q.rewardAmberShards ? ` · ◆ ${q.rewardAmberShards}` : ''} · +{q.rewardXp} XP
                              </span>
                              {!done && (
                                <button
                                  type="button"
                                  onClick={() => onClaimQuest(q.id)}
                                  disabled={!ready}
                                  className={`px-3.5 py-1.5 rounded-lg font-semibold ${
                                    ready
                                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  {ready ? 'Здати звіт' : 'У процесі'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* VELCHKO (MALE PROFESSOR): SCIENTIFIC QUESTS & BESTIARY WITH 3D VIEWER */}
              {activeNpc === 'velychko' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVelychkoTab('quests')}
                        className={`btn-tactile min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                          velychkoTab === 'quests'
                            ? 'bg-teal-400 text-slate-950'
                            : 'btn-field'
                        }`}
                      >
                        Наукові завдання
                      </button>
                      <button
                        type="button"
                        onClick={() => setVelychkoTab('bestiary')}
                        className={`btn-tactile min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                          velychkoTab === 'bestiary'
                            ? 'bg-teal-400 text-slate-950'
                            : 'btn-field'
                        }`}
                      >
                        Бестіарій Полісся ({Object.keys(gameState.discovered).length}/
                        {FISH_SPECIES.length})
                      </button>
                    </div>

                    {velychkoTab === 'bestiary' && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(
                          [
                            ['all', 'Усі'],
                            ['fish', 'Риби'],
                            ['crayfish', 'Раки'],
                            ['wildlife', 'Жуки і живність'],
                            ['mutant', 'Мутанти'],
                          ] as ['all' | 'fish' | 'crayfish' | 'wildlife' | 'mutant', string][]
                        ).map(([k, lbl]) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => setVelychkoFilter(k)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                              velychkoFilter === k
                                ? 'bg-teal-400 text-slate-950'
                                : 'bg-[#0b1510] text-slate-300 border border-white/10'
                            }`}
                          >
                            {lbl}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {velychkoTab === 'quests' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {QUESTS.filter((q) => q.giver === 'velychko').map((q) => {
                        const done = gameState.completedQuestIds.includes(q.id);
                        const prog = Math.min(q.targetCount, gameState.questProgress[q.id] ?? 0);
                        const ready = !done && prog >= q.targetCount;
                        return (
                          <div
                            key={q.id}
                            className={`border rounded-xl p-4 space-y-3 ${
                              done
                                ? 'bg-[#08120e] border-emerald-500/30 opacity-75'
                                : ready
                                  ? 'bg-[#0d1c18] border-amber-400/50'
                                  : 'bg-[#0b130f] border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-sm font-semibold text-slate-100">{q.title}</h4>
                              <span className="font-mono-num text-xs text-teal-300">
                                {done ? 'Здано' : `${prog}/${q.targetCount}`}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300">{q.description}</p>
                            <p className="text-xs text-slate-400 italic">«{q.dialoguePrompt}»</p>
                            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                              <span className="font-mono-num text-amber-300">
                                Нагорода: ₴ {q.rewardCredits}{q.rewardGoldCoins ? ` · ◈ ${q.rewardGoldCoins}` : ''}{q.rewardAmberShards ? ` · ◆ ${q.rewardAmberShards}` : ''} · +{q.rewardXp} XP
                              </span>
                              {!done && (
                                <button
                                  type="button"
                                  onClick={() => onClaimQuest(q.id)}
                                  disabled={!ready}
                                  className={`px-3.5 py-1.5 rounded-lg font-semibold ${
                                    ready
                                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  {ready ? 'Здати звіт' : 'У процесі'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {FISH_SPECIES.filter((sp) => {
                        const kind = sp.faunaKind ?? (sp.isMutant ? 'mutant' : 'fish');
                        if (velychkoFilter === 'fish') return kind === 'fish' && !sp.isMutant;
                        if (velychkoFilter === 'crayfish') return kind === 'crayfish';
                        if (velychkoFilter === 'wildlife')
                          return kind === 'beetle' || kind === 'insect' || kind === 'wildlife';
                        if (velychkoFilter === 'mutant') return sp.isMutant || kind === 'mutant';
                        return true;
                      }).map((sp) => {
                        const rec = gameState.discovered[sp.id];
                        const animCls = !rec
                          ? 'brightness-0 opacity-30'
                          : sp.isMutant
                            ? 'animate-mutant-aura'
                            : sp.rarity === 'rare' || sp.rarity === 'legendary'
                              ? 'animate-rare-shimmer'
                              : '';
                        return (
                          <div
                            key={sp.id}
                            onClick={() => rec && setInspectSpecies(sp)}
                            className={`border rounded-xl p-3.5 space-y-2 ${
                              rec
                                ? sp.isMutant
                                  ? 'bg-[#091815] border-cyan-400/35 hover:border-cyan-300 cursor-pointer'
                                  : sp.rarity === 'rare' || sp.rarity === 'legendary'
                                    ? 'bg-[#12160d] border-amber-400/30 hover:border-amber-300 cursor-pointer'
                                    : 'bg-[#0b130f] border-white/15 hover:border-teal-400/45 cursor-pointer'
                                : 'bg-[#070b09] border-white/8 opacity-65'
                            }`}
                          >
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span
                                className={
                                  rec && sp.isMutant
                                    ? 'text-cyan-300 font-semibold'
                                    : rec && (sp.rarity === 'rare' || sp.rarity === 'legendary')
                                      ? 'text-amber-300 font-semibold'
                                      : ''
                                }
                              >
                                {sp.isMutant
                                  ? 'Мутант'
                                  : sp.faunaKind === 'crayfish'
                                    ? 'Рак'
                                    : sp.faunaKind === 'beetle' ||
                                        sp.faunaKind === 'insect' ||
                                        sp.faunaKind === 'wildlife'
                                      ? 'Живність'
                                      : sp.rarity === 'legendary'
                                        ? 'Легендарна'
                                        : sp.rarity === 'rare'
                                          ? 'Рідкісна'
                                          : 'Звичайна'}
                              </span>
                              <span className="font-mono-num">
                                {rec ? `Макс: ${rec.maxWeightKg} кг` : 'Не вивчено'}
                              </span>
                            </div>
                            <div
                              className={`h-24 bg-[#060908] border border-white/10 rounded overflow-hidden ${animCls}`}
                            >
                              <FishIllustration
                                species={sp}
                                className="w-full h-full"
                                dimmed={!rec}
                              />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold text-slate-100 truncate">
                                {rec ? sp.name : 'Невідомий вид'}
                              </div>
                              {rec && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-cyan-300 font-semibold shrink-0">
                                  <Box className="w-3 h-3" />
                                  3D
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                              {rec ? sp.description : 'Виловте цей вид на водоймах Полісся.'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3D Specimen Modal inside Bunker */}
      {inspectSpecies && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/84"
          onClick={() => setInspectSpecies(null)}
        >
          <div
            className="w-full max-w-lg panel-window rounded-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-100">
                  {inspectSpecies.name}
                </h3>
                <p className="text-xs text-slate-400 italic">{inspectSpecies.latinName}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectSpecies(null)}
                className="btn-tactile btn-field min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg cursor-pointer"
                aria-label="Закрити 3D огляд"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Fauna3DPreview species={inspectSpecies} className="w-full h-56" />
            <p className="text-xs text-slate-300 leading-relaxed">{inspectSpecies.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

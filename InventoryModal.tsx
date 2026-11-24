import React, { useMemo, useState } from 'react';
import { Check, Package, Shield, Sparkles, X } from 'lucide-react';
import {
  ACCESSORIES,
  BAITS,
  BOTTOM_RIGS,
  FEEDERS,
  FISH_MAP,
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
  RADSUIT_UPGRADES,
  REELS,
  RODS,
  SINKERS,
} from '../game/data';
import { SaveState } from '../game/types';
import { FishIllustration } from './FishIllustration';
import { ItemIllustration } from './ItemIllustration';

export type InventoryTabId =
  | 'rods'
  | 'reels'
  | 'lines'
  | 'floats'
  | 'hooks'
  | 'sinkers'
  | 'rigs'
  | 'baits'
  | 'lures'
  | 'fish'
  | 'wildlife'
  | 'gear'
  | 'finds'
  | 'artifacts';

interface InventoryModalProps {
  gameState: SaveState;
  inFishing?: boolean;
  onEquipRod: (rodId: string) => void;
  onEquipReel: (reelId: string) => void;
  onEquipLine: (lineId: string) => void;
  onEquipFloat: (floatId: string) => void;
  onEquipHook: (hookId: string) => void;
  onEquipSinker: (sinkerId: string) => void;
  onEquipFeeder: (feederId: string) => void;
  onEquipBottomRig: (rigId: string) => void;
  onToggleAccessory: (accId: string) => void;
  onToggleGearItem: (gearId: string) => void;
  onEquipBait: (baitId: string) => void;
  onSelectFlavoring: (flavId: string) => void;
  onUseConsumable: (itemId: string) => void;
  onClose: () => void;
}

const TABS: { id: InventoryTabId; label: string }[] = [
  { id: 'rods', label: 'Вудки' },
  { id: 'reels', label: 'Котушки' },
  { id: 'lines', label: 'Волосінь' },
  { id: 'floats', label: 'Поплавки' },
  { id: 'hooks', label: 'Гачки' },
  { id: 'sinkers', label: 'Грузила' },
  { id: 'rigs', label: 'Донки та фідери' },
  { id: 'baits', label: 'Наживки' },
  { id: 'lures', label: 'Приманки' },
  { id: 'fish', label: 'Риба' },
  { id: 'wildlife', label: 'Раки та живність' },
  { id: 'gear', label: 'Спорядження' },
  { id: 'finds', label: 'Знахідки' },
  { id: 'artifacts', label: 'Артефакти' },
];

export const InventoryModal: React.FC<InventoryModalProps> = ({
  gameState,
  inFishing = false,
  onEquipRod,
  onEquipReel,
  onEquipLine,
  onEquipFloat,
  onEquipHook,
  onEquipSinker,
  onEquipFeeder,
  onEquipBottomRig,
  onToggleAccessory,
  onToggleGearItem,
  onEquipBait,
  onSelectFlavoring,
  onUseConsumable,
  onClose,
}) => {
  const [tab, setTab] = useState<InventoryTabId>('rods');

  const keepnetDef = KEEPNET_UPGRADES[gameState.keepnetLevel - 1] ?? KEEPNET_UPGRADES[0];
  const suitDef = RADSUIT_UPGRADES[gameState.radSuitLevel] ?? RADSUIT_UPGRADES[0];
  const consumables = LOOT_ITEMS.filter((i) => i.category === 'consumable');

  const keepnetBonusKg = useMemo(
    () =>
      gameState.equippedGearIds.reduce(
        (sum, id) => sum + (GEAR_MAP[id]?.keepnetBonusKg ?? 0),
        0
      ),
    [gameState.equippedGearIds]
  );
  const totalKeepnetCap = (keepnetDef.capacityKg ?? 15) + keepnetBonusKg;
  const keepnetWeight = useMemo(
    () => gameState.keepnet.reduce((s, f) => s + f.weightKg, 0),
    [gameState.keepnet]
  );

  const fishInKeepnet = useMemo(
    () =>
      gameState.keepnet.filter((f) => {
        const sp = FISH_MAP[f.speciesId];
        const kind = f.faunaKind ?? sp?.faunaKind ?? (f.isMutant ? 'mutant' : 'fish');
        return kind === 'fish' || kind === 'mutant';
      }),
    [gameState.keepnet]
  );

  const wildlifeInKeepnet = useMemo(
    () =>
      gameState.keepnet.filter((f) => {
        const sp = FISH_MAP[f.speciesId];
        const kind = f.faunaKind ?? sp?.faunaKind ?? 'fish';
        return (
          kind === 'crayfish' ||
          kind === 'beetle' ||
          kind === 'insect' ||
          kind === 'wildlife'
        );
      }),
    [gameState.keepnet]
  );

  const relicsLoot = useMemo(
    () =>
      gameState.foundLoot.filter((e) => LOOT_MAP[e.itemId]?.category === 'relic'),
    [gameState.foundLoot]
  );
  const artifactsLoot = useMemo(
    () =>
      gameState.foundLoot.filter((e) => LOOT_MAP[e.itemId]?.category === 'artifact'),
    [gameState.foundLoot]
  );

  const durText = (id: string) => {
    const val = Math.round(gameState.itemDurability[id] ?? 100);
    return `${val}%`;
  };
  const durColor = (id: string) => {
    const val = gameState.itemDurability[id] ?? 100;
    if (val <= 20) return 'text-rose-400';
    if (val <= 55) return 'text-amber-300';
    return 'text-emerald-300';
  };

  const countBadge = (id: InventoryTabId) => {
    switch (id) {
      case 'rods':
        return gameState.ownedRodIds.length;
      case 'reels':
        return gameState.ownedReelIds.length;
      case 'lines':
        return gameState.ownedLineIds.length;
      case 'floats':
        return gameState.ownedFloatIds.length;
      case 'hooks':
        return gameState.ownedHookIds.length;
      case 'sinkers':
        return gameState.ownedSinkerIds.length;
      case 'rigs':
        return gameState.ownedBottomRigIds.filter((x) => x !== 'brig_none').length;
      case 'fish':
        return fishInKeepnet.length;
      case 'wildlife':
        return wildlifeInKeepnet.length;
      case 'gear':
        return gameState.ownedGearIds.length;
      case 'finds':
        return relicsLoot.length;
      case 'artifacts':
        return artifactsLoot.length;
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-[#040706]/88"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] panel-window rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100">
              Рюкзак, інвентар і спорядження
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {keepnetDef.name}
              {keepnetBonusKg > 0 ? ` (+${keepnetBonusKg} кг спорядження)` : ''} ·{' '}
              <span className="font-mono-num text-amber-300">
                {keepnetWeight.toFixed(1)}/{totalKeepnetCap} кг
              </span>{' '}
              · {suitDef.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-tactile btn-field min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl cursor-pointer"
            aria-label="Закрити інвентар"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 14-Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#060b09] border-b border-white/10 overflow-x-auto custom-scroll sm:flex-wrap shrink-0">
          {TABS.map((t) => {
            const cnt = countBadge(t.id);
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`btn-tactile min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'btn-primary-emerald' : 'btn-field'
                }`}
              >
                <span>{t.label}</span>
                {cnt !== null && (
                  <span
                    className={`font-mono-num text-[11px] ${
                      active ? 'text-slate-900' : 'text-amber-300'
                    }`}
                  >
                    ({cnt})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-5">
          {tab === 'rods' && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-300">
                Ваші вудки та спінінги ({gameState.ownedRodIds.length}/{RODS.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RODS.filter((r) => gameState.ownedRodIds.includes(r.id)).map((r) => {
                  const active = gameState.equippedRodId === r.id;
                  const broken = (gameState.itemDurability[r.id] ?? 100) <= 0;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onEquipRod(r.id)}
                      className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-950/60 border-emerald-400/60'
                          : 'bg-[#070d0a] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-100">{r.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`font-mono-num text-xs font-bold ${durColor(r.id)}`}>
                            {broken ? 'ЗЛАМАНА!' : `Стан ${durText(r.id)}`}
                          </span>
                          {active && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono-num mt-1">
                        {r.typeLabel} · {r.lengthM} м · {r.weightG} г · Тест {r.testRangeLabel}
                      </div>
                      <div className="text-[11px] text-amber-300 font-mono-num mt-0.5">
                        Навантаження до {r.maxLoadKg} кг · +{r.castBonusM} м закид
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {tab === 'reels' && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-300">
                Ваші котушки ({gameState.ownedReelIds.length}/{REELS.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REELS.filter((r) => gameState.ownedReelIds.includes(r.id)).map((r) => {
                  const active = gameState.equippedReelId === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onEquipReel(r.id)}
                      className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-950/60 border-emerald-400/60'
                          : 'bg-[#070d0a] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-100">{r.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`font-mono-num text-xs font-bold ${durColor(r.id)}`}>
                            {durText(r.id)}
                          </span>
                          {active && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono-num mt-1">
                        Фрикціон {r.dragPowerKg} кг · Швидк. ×{r.retrieveSpeed} · Шпуля {r.lineCapacityM} м · {r.gearRatio}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {tab === 'lines' && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-300">
                Волосінь, флюорокарбон і плетений шнур ({gameState.ownedLineIds.length}/{LINES.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LINES.filter((l) => gameState.ownedLineIds.includes(l.id)).map((l) => {
                  const active = gameState.equippedLineId === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => onEquipLine(l.id)}
                      className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-950/60 border-emerald-400/60'
                          : 'bg-[#070d0a] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-100">{l.name}</span>
                        {active && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono-num mt-1">
                        Товщина {l.thicknessMm} мм · Довж. {l.lengthM} м · Розрив до {l.maxTensionKg} кг
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {tab === 'floats' && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-300">
                Поплавки ({gameState.ownedFloatIds.length}/{FLOATS.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FLOATS.filter((f) => gameState.ownedFloatIds.includes(f.id)).map((f) => {
                  const active = gameState.equippedFloatId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onEquipFloat(f.id)}
                      className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-950/60 border-emerald-400/60'
                          : 'bg-[#070d0a] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full border border-white/40 shrink-0"
                            style={{ backgroundColor: f.tipHex }}
                          />
                          <span className="text-sm font-semibold text-slate-100 truncate">
                            {f.name}
                          </span>
                        </div>
                        {active && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Чутливість ×{f.biteSensitivityBonus} · Стійкість на течії ×{f.currentStability}
                        {f.nightGlow ? ' · Нічне світіння' : ''}
                        {f.electronic ? ' · Електронний сигнал' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {tab === 'hooks' && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-300">
                Гачки ({gameState.ownedHookIds.length}/{HOOKS.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HOOKS.filter((h) => gameState.ownedHookIds.includes(h.id)).map((h) => {
                  const active = gameState.equippedHookId === h.id;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => onEquipHook(h.id)}
                      className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-950/60 border-emerald-400/60'
                          : 'bg-[#070d0a] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-100">{h.name}</span>
                        {active && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Кльов ×{h.biteRateBonus} · Утримання +{Math.round(h.hookRetentionBonus * 100)}% · Ризик зачепу ×{h.snagRiskMod}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {tab === 'sinkers' && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-300">
                Грузила ({gameState.ownedSinkerIds.length}/{SINKERS.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SINKERS.filter((s) => gameState.ownedSinkerIds.includes(s.id)).map((s) => {
                  const active = gameState.equippedSinkerId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onEquipSinker(s.id)}
                      className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-950/60 border-emerald-400/60'
                          : 'bg-[#070d0a] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-100">{s.name}</span>
                        {active && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Вага {s.weightG} г · +{s.castBonusM} м до закиду · Стійкість дна ×{s.bottomStability}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {tab === 'rigs' && (
            <div className="space-y-6">
              <section className="space-y-2.5">
                <h3 className="text-xs font-semibold text-slate-300">
                  Донки та фідерні монтажі ({gameState.ownedBottomRigIds.filter((x) => x !== 'brig_none').length}/{BOTTOM_RIGS.length - 1})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BOTTOM_RIGS.filter((r) => gameState.ownedBottomRigIds.includes(r.id)).map(
                    (r) => {
                      const active = gameState.equippedBottomRigId === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => onEquipBottomRig(r.id)}
                          className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                            active
                              ? 'bg-emerald-950/60 border-emerald-400/60'
                              : 'bg-[#070d0a] border-white/10 hover:border-white/25'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-100">{r.name}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              {r.id !== 'brig_none' && (
                                <span className={`font-mono-num text-xs font-bold ${durColor(r.id)}`}>
                                  {durText(r.id)}
                                </span>
                              )}
                              {active && <Check className="w-4 h-4 text-emerald-400" />}
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            До {r.maxLoadKg} кг · +{r.castBonusM} м закид · Кльов ×{r.biteRateBonus}
                            {r.hasElectronicAlarm ? ' · Сигналізатор' : ''}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </section>

              <section className="space-y-2.5">
                <h3 className="text-xs font-semibold text-slate-300">Годівниці</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FEEDERS.filter((f) => gameState.ownedFeederIds.includes(f.id)).map((f) => {
                    const active = gameState.equippedFeederId === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => onEquipFeeder(f.id)}
                        className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                          active
                            ? 'bg-emerald-950/60 border-emerald-400/60'
                            : 'bg-[#070d0a] border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-100">{f.name}</span>
                          {active && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          +{Math.round(f.biteRateBoost * 100)}% до кльову · +
                          {Math.round(f.weightBoost * 100)}% до ваги
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-2.5">
                <h3 className="text-xs font-semibold text-slate-300">
                  Додаткова фурнітура та сигналізатори (натисніть щоб увімкнути в монтаж)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ACCESSORIES.filter((a) => gameState.ownedAccessoryIds.includes(a.id)).length ===
                  0 ? (
                    <p className="text-xs text-slate-400 col-span-2">
                      Вертлюги, карабіни, повідці та сигналізатори продає Олег у Бункері «Щит-04».
                    </p>
                  ) : (
                    ACCESSORIES.filter((a) => gameState.ownedAccessoryIds.includes(a.id)).map(
                      (a) => {
                        const active = gameState.equippedAccessoryIds.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => onToggleAccessory(a.id)}
                            className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                              active
                                ? 'bg-sky-950/60 border-sky-400/60'
                                : 'bg-[#070d0a] border-white/10 hover:border-white/25'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-100">{a.name}</span>
                              <span className="text-[11px] font-semibold text-sky-300">
                                {active ? 'Увімкнено' : 'Вимкнено'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{a.description}</div>
                          </button>
                        );
                      }
                    )
                  )}
                </div>
              </section>
            </div>
          )}

          {tab === 'baits' && (
            <div className="space-y-6">
              <section className="space-y-2.5">
                <h3 className="text-xs font-semibold text-slate-300">
                  Живі, рослинні та аномальні наживки (натисніть щоб встановити)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {BAITS.filter((b) => b.category !== 'lure').map((b) => {
                    const qty = gameState.baitInventory[b.id] ?? 0;
                    const active = gameState.equippedBaitId === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        disabled={qty <= 0}
                        onClick={() => onEquipBait(b.id)}
                        className={`text-left p-3 rounded-xl border transition-colors ${
                          active
                            ? 'bg-amber-950/50 border-amber-400/60 cursor-pointer'
                            : qty > 0
                              ? 'bg-[#070d0a] border-white/10 hover:border-white/25 cursor-pointer'
                              : 'bg-[#050806] border-white/5 opacity-45 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 text-xs font-semibold text-slate-100">
                          <span className="truncate">{b.name}</span>
                          <span className="font-mono-num text-amber-300 shrink-0">{qty}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Кльов ×{b.biteSpeedBonus} · +{Math.round(b.mutantBonus * 100)}% мут.
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-2.5">
                <h3 className="text-xs font-semibold text-slate-300">
                  Ароматизатори й діпи (натисніть щоб застосувати на наживку)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {FLAVORINGS.map((fl) => {
                    const qty =
                      fl.id === 'flav_none' ? 1 : gameState.flavoringInventory[fl.id] ?? 0;
                    const active = gameState.equippedFlavoringId === fl.id;
                    return (
                      <button
                        key={fl.id}
                        type="button"
                        disabled={qty <= 0}
                        onClick={() => onSelectFlavoring(fl.id)}
                        className={`text-left p-3 rounded-xl border transition-colors ${
                          active
                            ? 'bg-emerald-950/60 border-emerald-400/60 cursor-pointer'
                            : qty > 0
                              ? 'bg-[#070d0a] border-white/10 hover:border-white/25 cursor-pointer'
                              : 'bg-[#050806] border-white/5 opacity-45 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 text-xs font-semibold text-slate-100">
                          <span className="truncate">{fl.name}</span>
                          {fl.id !== 'flav_none' && (
                            <span className="font-mono-num text-teal-300 shrink-0">{qty}</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {fl.targetNote}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-2.5">
                <h3 className="text-xs font-semibold text-slate-300">Прикормки в запасі</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {GROUNDBAITS.map((g) => {
                    const qty = gameState.groundbaitInventory[g.id] ?? 0;
                    return (
                      <div
                        key={g.id}
                        className="p-3 rounded-xl border border-white/10 bg-[#070d0a] flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-100">{g.name}</div>
                          <div className="text-[11px] text-slate-400">{g.targetNote}</div>
                        </div>
                        <span className="font-mono-num font-semibold text-teal-300">{qty} шт.</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {tab === 'lures' && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-300">
                Штучні приманки (багаторазові — витрачаються лише при обриві)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {BAITS.filter((b) => b.category === 'lure').map((b) => {
                  const qty = gameState.baitInventory[b.id] ?? 0;
                  const active = gameState.equippedBaitId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      disabled={qty <= 0}
                      onClick={() => onEquipBait(b.id)}
                      className={`text-left p-3.5 rounded-xl border transition-colors ${
                        active
                          ? 'bg-amber-950/55 border-amber-400/65 cursor-pointer'
                          : qty > 0
                            ? 'bg-[#070d0a] border-white/10 hover:border-white/25 cursor-pointer'
                            : 'bg-[#050806] border-white/5 opacity-45 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-100">
                        <span className="truncate">{b.name}</span>
                        <span className="font-mono-num text-amber-300 shrink-0">{qty} шт.</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Кльов ×{b.biteSpeedBonus} · Хижак ×{b.predatorBonus ?? 1.2}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {tab === 'fish' && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-300">
                Риба та мутанти у садку ({fishInKeepnet.length} шт.)
              </h3>
              {fishInKeepnet.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-[#070d0a] border border-white/10 rounded-xl">
                  У садку поки немає риби.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fishInKeepnet.map((f) => {
                    const sp = FISH_MAP[f.speciesId];
                    if (!sp) return null;
                    return (
                      <div
                        key={f.uid}
                        className="p-3.5 rounded-xl border border-white/12 bg-[#070d0a] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-16 h-11 bg-[#040706] border border-white/10 rounded overflow-hidden shrink-0">
                            <FishIllustration species={sp} className="w-full h-full" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-100 truncate">
                              {sp.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono-num">
                              {f.weightKg} кг · {f.lengthCm} см
                            </div>
                          </div>
                        </div>
                        <span className="font-mono-num text-xs font-semibold text-amber-300 shrink-0">
                          ~₴ {f.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {tab === 'wildlife' && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-300">
                Раки, жуки, комахи та водна живність у садку ({wildlifeInKeepnet.length} шт.)
              </h3>
              {wildlifeInKeepnet.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-[#070d0a] border border-white/10 rounded-xl">
                  Ви ще не зловили раків чи іншої водної живності. Ловіть біля дна й заростей — Тарас і Віктор дорого цінують такі екземпляри!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wildlifeInKeepnet.map((f) => {
                    const sp = FISH_MAP[f.speciesId];
                    if (!sp) return null;
                    return (
                      <div
                        key={f.uid}
                        className="p-3.5 rounded-xl border border-white/12 bg-[#070d0a] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-16 h-11 bg-[#040706] border border-white/10 rounded overflow-hidden shrink-0">
                            <FishIllustration species={sp} className="w-full h-full" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-100 truncate">
                              {sp.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono-num">
                              {f.weightKg} кг · {f.lengthCm} см
                            </div>
                          </div>
                        </div>
                        <span className="font-mono-num text-xs font-semibold text-amber-300 shrink-0">
                          ~₴ {f.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {tab === 'gear' && (
            <section className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-white/12 bg-[#070d0a]">
                  <div className="text-slate-400">Садок</div>
                  <div className="font-semibold text-slate-100 mt-0.5">{keepnetDef.name}</div>
                  <div className="text-[11px] text-amber-300 mt-0.5">
                    Місткість {totalKeepnetCap} кг (у т.ч. +{keepnetBonusKg} кг від спорядження)
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-white/12 bg-[#070d0a]">
                  <div className="text-slate-400">Радіозахист</div>
                  <div className="font-semibold text-slate-100 mt-0.5">{suitDef.name}</div>
                  <div className="text-[11px] text-emerald-300 mt-0.5">{suitDef.description}</div>
                </div>
              </div>

              <h3 className="text-xs font-semibold text-slate-300">
                Польове рибальське спорядження ({gameState.ownedGearIds.length}/{GEAR_ITEMS.length})
              </h3>

              {gameState.ownedGearIds.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-[#070d0a] border border-white/10 rounded-xl">
                  Додаткове спорядження (підсак, човен, забродні чоботи, дозиметр, підводна камера, намет тощо) купується у майстра Олега в Бункері «Щит-04».
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GEAR_ITEMS.filter((g) => gameState.ownedGearIds.includes(g.id)).map((g) => {
                    const active = gameState.equippedGearIds.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => onToggleGearItem(g.id)}
                        className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                          active
                            ? 'bg-emerald-950/60 border-emerald-400/60'
                            : 'bg-[#070d0a] border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-100">{g.name}</span>
                          <span className="text-[11px] font-semibold text-emerald-300 shrink-0">
                            {active ? 'Активно' : 'В резерві'} · {durText(g.id)}
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-200 mt-1">{g.effectLabel}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {tab === 'finds' && (
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-300">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Продукти, медикаменти та витратники
                  </div>
                  <div className="font-mono-num text-slate-300">
                    Радіація:{' '}
                    <span className={gameState.radiation > 40 ? 'text-rose-400' : 'text-emerald-300'}>
                      {Math.round(gameState.radiation)} мЗв
                    </span>
                    <span className="text-slate-600 mx-2">·</span>
                    Розсудливість:{' '}
                    <span className="text-indigo-300">{Math.round(gameState.sanity)}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {consumables.map((item) => {
                    const qty = gameState.consumableInventory[item.id] ?? 0;
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-white/10 bg-[#070d0a] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-11 bg-[#040706] border border-white/10 rounded p-1 shrink-0 flex items-center justify-center">
                            <ItemIllustration item={item} className="w-12 h-9" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-100 truncate">
                              {item.name} ({qty} шт.)
                            </div>
                            <div className="text-[11px] text-emerald-300">{item.effectLabel}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={qty <= 0}
                          onClick={() => onUseConsumable(item.id)}
                          className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 ${
                            qty > 0
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Використати
                        </button>
                      </div>
                    );
                  })}
                </div>
                {inFishing && (
                  <p className="text-[11px] text-slate-400">
                    Підказка: Провізію та Антирад можна поповнити у Тараса й Олега в Бункері «Щит-04».
                  </p>
                )}
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300">
                    <Package className="w-4 h-4 text-amber-300" />
                    Донні знахідки ({relicsLoot.length})
                  </span>
                  <span className="text-slate-400">Продаються Єльцину на Ринку в Бункері</span>
                </div>
                {relicsLoot.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-[#070d0a] border border-white/10 rounded-xl">
                    Донних знахідок поки немає. Закидайте снасть на дно водойм!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {relicsLoot.map((entry) => {
                      const def = LOOT_MAP[entry.itemId];
                      if (!def) return null;
                      return (
                        <div
                          key={entry.uid}
                          className="p-3.5 rounded-xl border border-white/12 bg-[#070d0a] flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-14 h-11 bg-[#040706] border border-white/10 rounded p-1 shrink-0 flex items-center justify-center">
                              <ItemIllustration item={def} className="w-12 h-9" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-slate-100 truncate">
                                {def.name}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                День {entry.foundDay}
                              </div>
                            </div>
                          </div>
                          <span className="font-mono-num text-xs font-semibold text-amber-300 shrink-0">
                            ₴ {entry.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {tab === 'artifacts' && (
            <section className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  Аномальні артефакти ({artifactsLoot.length})
                </span>
                <span className="text-slate-400">Висока ціна у Єльцина на Підпільному ринку</span>
              </div>
              {artifactsLoot.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-[#070d0a] border border-white/10 rounded-xl">
                  Артефактів поки немає. Шукайте їх на дні аномальних зон — у Томашгороді, Сновидовичах, Боровому та Блажовому!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {artifactsLoot.map((entry) => {
                    const def = LOOT_MAP[entry.itemId];
                    if (!def) return null;
                    return (
                      <div
                        key={entry.uid}
                        className="p-3.5 rounded-xl border border-cyan-400/35 bg-[#091815] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-11 bg-[#040706] border border-white/10 rounded p-1 shrink-0 flex items-center justify-center">
                            <ItemIllustration item={def} className="w-12 h-9" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-cyan-100 truncate">
                              {def.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              Аномальний артефакт · День {entry.foundDay}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono-num text-xs font-semibold text-amber-300 shrink-0">
                          ₴ {entry.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

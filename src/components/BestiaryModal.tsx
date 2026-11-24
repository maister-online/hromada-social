import React, { useMemo, useState } from 'react';
import { Box, Search, X } from 'lucide-react';
import { BAIT_MAP, FISH_SPECIES, LOCATIONS } from '../game/data';
import { DiscoveryEntry, FishSpeciesDef } from '../game/types';
import { Fauna3DPreview } from './Fauna3DPreview';
import { FishIllustration } from './FishIllustration';

interface BestiaryModalProps {
  discovered: Record<string, DiscoveryEntry>;
  onClose: () => void;
}

type BestiaryFilter = 'all' | 'fish' | 'crayfish' | 'wildlife' | 'mutant';

export const BestiaryModal: React.FC<BestiaryModalProps> = ({ discovered, onClose }) => {
  const [filter, setFilter] = useState<BestiaryFilter>('all');
  const [query, setQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<FishSpeciesDef | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FISH_SPECIES.filter((f) => {
      const kind = f.faunaKind ?? (f.isMutant ? 'mutant' : 'fish');
      if (filter === 'fish' && (kind !== 'fish' || f.isMutant)) return false;
      if (filter === 'crayfish' && kind !== 'crayfish') return false;
      if (
        filter === 'wildlife' &&
        kind !== 'beetle' &&
        kind !== 'insect' &&
        kind !== 'wildlife'
      ) {
        return false;
      }
      if (filter === 'mutant' && !f.isMutant && kind !== 'mutant') return false;

      if (q && discovered[f.id]) {
        return (
          f.name.toLowerCase().includes(q) ||
          f.latinName.toLowerCase().includes(q) ||
          (f.habitat ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [discovered, filter, query]);

  const counts = useMemo(() => {
    let fish = 0;
    let crayfish = 0;
    let wildlife = 0;
    let mutant = 0;
    for (const f of FISH_SPECIES) {
      const k = f.faunaKind ?? (f.isMutant ? 'mutant' : 'fish');
      if (f.isMutant || k === 'mutant') mutant += 1;
      else if (k === 'crayfish') crayfish += 1;
      else if (k === 'beetle' || k === 'insect' || k === 'wildlife') wildlife += 1;
      else fish += 1;
    }
    return { all: FISH_SPECIES.length, fish, crayfish, wildlife, mutant };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#040706]/88"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl max-h-[90vh] panel-window rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100">
              Поліський бестіарій фауни та мутантів
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Досліджено видів:{' '}
              <span className="font-mono-num text-emerald-300 font-semibold">
                {Object.keys(discovered).length}/{FISH_SPECIES.length}
              </span>{' '}
              · Натисніть на досліджений вид для 3D-огляду
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-tactile btn-field min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl cursor-pointer"
            aria-label="Закрити бестіарій"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 px-5 sm:px-6 py-3 border-b border-white/10 bg-[#060c09]">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ['all', `Усі (${counts.all})`],
                ['fish', `Риби (${counts.fish})`],
                ['crayfish', `Раки (${counts.crayfish})`],
                ['wildlife', `Жуки і живність (${counts.wildlife})`],
                ['mutant', `Мутанти (${counts.mutant})`],
              ] as [BestiaryFilter, string][]
            ).map(([k, lbl]) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={`btn-tactile min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  filter === k ? 'btn-primary-emerald' : 'btn-field'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Пошук виду..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#0b1510] border border-white/12 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/60"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((sp) => {
            const rec = discovered[sp.id];
            const foundLoc = rec ? LOCATIONS[rec.firstLocationId]?.name.split('·')[0] : null;
            const iconAnimCls = !rec
              ? 'brightness-0 opacity-30'
              : sp.isMutant
                ? 'animate-mutant-aura'
                : sp.rarity === 'rare' || sp.rarity === 'legendary'
                  ? 'animate-rare-shimmer'
                  : '';

            const kindBadge = sp.isMutant
              ? 'Мутант Полісся'
              : sp.faunaKind === 'crayfish'
                ? 'Рак'
                : sp.faunaKind === 'beetle'
                  ? 'Водний жук'
                  : sp.faunaKind === 'insect'
                    ? 'Комаха'
                    : sp.faunaKind === 'wildlife'
                      ? 'Живність'
                      : sp.rarity === 'legendary'
                        ? 'Легендарний вид'
                        : sp.rarity === 'rare'
                          ? 'Рідкісний вид'
                          : 'Природний вид';

            return (
              <div
                key={sp.id}
                onClick={() => rec && setSelectedSpecies(sp)}
                className={`border rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors ${
                  rec
                    ? sp.isMutant
                      ? 'bg-[#091815] border-cyan-400/35 hover:border-cyan-300 cursor-pointer'
                      : sp.rarity === 'rare' || sp.rarity === 'legendary'
                        ? 'bg-[#12160d] border-amber-400/30 hover:border-amber-300 cursor-pointer'
                        : 'bg-[#0b1510] border-white/15 hover:border-emerald-400/45 cursor-pointer'
                    : 'bg-[#070b09] border-white/8 opacity-70'
                }`}
              >
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-2">
                    <span
                      className={
                        rec && sp.isMutant
                          ? 'text-cyan-300 font-semibold'
                          : rec && (sp.rarity === 'rare' || sp.rarity === 'legendary')
                            ? 'text-amber-300 font-semibold'
                            : ''
                      }
                    >
                      {kindBadge}
                    </span>
                    <span className="font-mono-num">
                      {sp.minWeightKg}–{sp.maxWeightKg} кг
                    </span>
                  </div>
                  <div className={`h-28 bg-[#050907] border border-white/10 rounded-lg overflow-hidden ${iconAnimCls}`}>
                    <FishIllustration species={sp} className="w-full h-full" dimmed={!rec} />
                  </div>
                  <div className="flex items-start justify-between gap-2 mt-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold text-slate-100 truncate">
                        {rec ? sp.name : 'Невідомий вид'}
                      </h3>
                      <p className="text-[11px] text-slate-400 italic truncate">
                        {rec ? sp.latinName : 'Очікує вилову на водоймах'}
                      </p>
                    </div>
                    {rec && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#060c09] border border-cyan-400/30 text-[10px] font-semibold text-cyan-300 shrink-0">
                        <Box className="w-3 h-3" />
                        3D
                      </span>
                    )}
                  </div>
                </div>

                {rec ? (
                  <div className="space-y-1.5 border-t border-white/10 pt-2.5 text-xs">
                    <p className="text-slate-300 leading-relaxed line-clamp-2">{sp.description}</p>
                    <div className="flex justify-between text-[11px] font-mono-num text-emerald-300 pt-1">
                      <span>Зловлено: {rec.caughtCount}</span>
                      <span>Рекорд: {rec.maxWeightKg} кг</span>
                    </div>
                    {foundLoc && (
                      <div className="text-[11px] text-slate-400">Вперше: {foundLoc}</div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 border-t border-white/10 pt-2.5">
                    Активність: {sp.preferredTime === 'night' ? 'Ніч' : sp.preferredTime === 'dusk' ? 'Світанок / Вечір' : sp.preferredTime === 'day' ? 'День' : 'Будь-який час'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive 3D Detail Modal */}
      {selectedSpecies && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/82"
          onClick={() => setSelectedSpecies(null)}
        >
          <div
            className="w-full max-w-xl panel-window rounded-2xl p-5 sm:p-6 space-y-4 max-h-[88vh] overflow-y-auto custom-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-100">
                  {selectedSpecies.name}
                </h3>
                <p className="text-xs text-slate-400 italic">{selectedSpecies.latinName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSpecies(null)}
                className="btn-tactile btn-field min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg cursor-pointer"
                aria-label="Закрити 3D картку"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Fauna3DPreview species={selectedSpecies} className="w-full h-60" />

            <p className="text-xs text-slate-300 leading-relaxed">{selectedSpecies.description}</p>
            {selectedSpecies.anomalyNote && (
              <p className="text-xs text-cyan-300 leading-relaxed">{selectedSpecies.anomalyNote}</p>
            )}

            <div className="grid grid-cols-2 gap-2.5 text-xs bg-[#070d0a] border border-white/10 rounded-xl p-3.5">
              <div>
                <span className="text-slate-400 block">Діапазон ваги</span>
                <span className="font-mono-num text-emerald-300 font-semibold">
                  {selectedSpecies.minWeightKg}–{selectedSpecies.maxWeightKg} кг
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Ціна за кг</span>
                <span className="font-mono-num text-amber-300 font-semibold">
                  ₴ {selectedSpecies.basePricePerKg}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Улюблена глибина</span>
                <span className="text-slate-200 font-medium">
                  {selectedSpecies.preferredDepth === 'bottom'
                    ? 'Дно / Ями'
                    : selectedSpecies.preferredDepth === 'surface'
                      ? 'Поверхня / Прибережні зарості'
                      : selectedSpecies.preferredDepth === 'mid'
                        ? 'Середні шари води'
                        : 'Будь-яка глибина'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Час активності</span>
                <span className="text-slate-200 font-medium">
                  {selectedSpecies.preferredTime === 'night'
                    ? 'Ніч'
                    : selectedSpecies.preferredTime === 'dusk'
                      ? 'Світанок / Сутінки'
                      : selectedSpecies.preferredTime === 'day'
                        ? 'День'
                        : 'Цілодобово'}
                </span>
              </div>
              {selectedSpecies.habitat && (
                <div className="col-span-2">
                  <span className="text-slate-400 block">Середовище проживання</span>
                  <span className="text-slate-200">{selectedSpecies.habitat}</span>
                </div>
              )}
              {selectedSpecies.behavior && (
                <div className="col-span-2">
                  <span className="text-slate-400 block">Поведінка при виважуванні</span>
                  <span className="text-slate-200">{selectedSpecies.behavior}</span>
                </div>
              )}
              <div className="col-span-2">
                <span className="text-slate-400 block">Улюблені наживки / приманки</span>
                <span className="text-amber-200">
                  {selectedSpecies.preferredBaits
                    .map((id) => BAIT_MAP[id]?.name ?? id)
                    .join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { BAIT_MAP, FISH_SPECIES, LOCATIONS } from '../game/data';
import { DiscoveryEntry } from '../game/types';
import { FishIllustration } from './FishIllustration';

interface BestiaryModalProps {
  discovered: Record<string, DiscoveryEntry>;
  onClose: () => void;
}

type BestiaryFilter = 'all' | 'fish' | 'crayfish' | 'wildlife' | 'mutant';

export const BestiaryModal: React.FC<BestiaryModalProps> = ({ discovered, onClose }) => {
  const [filter, setFilter] = useState<BestiaryFilter>('all');
  const [query, setQuery] = useState('');

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
              · Переглядайте характеристики та результати вилову
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-tactile btn-field min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl "
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

    </div>
  );
};

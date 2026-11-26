import React, { useMemo, useState } from 'react';
import { Award, BookMarked, Trophy, X } from 'lucide-react';
import { FISH_MAP, LOCATIONS } from '../game/data';
import { FaunaKind, FishSpeciesDef, SaveState } from '../game/types';
import { FishIllustration } from './FishIllustration';

interface JournalModalProps {
  gameState: SaveState;
  onClose: () => void;
}

type JournalFilter = 'all' | 'fish' | 'crayfish' | 'wildlife' | 'mutant';

const KIND_LABELS: Record<FaunaKind, string> = {
  fish: 'Риба',
  crayfish: 'Рак',
  beetle: 'Жук',
  insect: 'Комаха',
  wildlife: 'Водна живність',
  mutant: 'Мутант',
};

export const JournalModal: React.FC<JournalModalProps> = ({ gameState, onClose }) => {
  const [subTab, setSubTab] = useState<'history' | 'records'>('history');
  const [filter, setFilter] = useState<JournalFilter>('all');
  const [inspectSpecies, setInspectSpecies] = useState<FishSpeciesDef | null>(null);

  const filteredJournal = useMemo(() => {
    return gameState.fishingJournal.filter((entry) => {
      if (filter === 'all') return true;
      if (filter === 'mutant') return entry.isMutant || entry.faunaKind === 'mutant';
      if (filter === 'wildlife') {
        return (
          entry.faunaKind === 'beetle' ||
          entry.faunaKind === 'insect' ||
          entry.faunaKind === 'wildlife'
        );
      }
      return entry.faunaKind === filter;
    });
  }, [filter, gameState.fishingJournal]);

  const recordRows = useMemo(() => {
    return Object.entries(gameState.personalRecords)
      .map(([speciesId, rec]) => ({
        species: FISH_MAP[speciesId],
        rec,
      }))
      .filter((row): row is { species: FishSpeciesDef; rec: (typeof row)['rec'] } =>
        Boolean(row.species)
      )
      .sort((a, b) => b.rec.maxWeightKg - a.rec.maxWeightKg);
  }, [gameState.personalRecords]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#040706]/88"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] panel-window rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <BookMarked className="w-6 h-6 text-amber-300 shrink-0" />
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100">
                Журнал рибалки Полісся
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Загальний вилов:{' '}
                <span className="font-mono-num text-emerald-300 font-semibold">
                  {gameState.totalCaughtCount}
                </span>{' '}
                · Унікальних видів:{' '}
                <span className="font-mono-num text-amber-300 font-semibold">
                  {Object.keys(gameState.discovered).length}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-tactile btn-field min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl cursor-pointer"
            aria-label="Закрити журнал"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3 border-b border-white/10 bg-[#060c09]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSubTab('history')}
              className={`btn-tactile min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                subTab === 'history' ? 'btn-primary-emerald' : 'btn-field'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              Історія улову ({gameState.fishingJournal.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('records')}
              className={`btn-tactile min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                subTab === 'records' ? 'btn-primary-amber' : 'btn-field'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Особисті рекорди ({recordRows.length})
            </button>
          </div>

          {subTab === 'history' && (
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  ['all', 'Усі'],
                  ['fish', 'Риба'],
                  ['crayfish', 'Раки'],
                  ['wildlife', 'Живність і жуки'],
                  ['mutant', 'Мутанти'],
                ] as [JournalFilter, string][]
              ).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFilter(k)}
                  className={`btn-tactile px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer ${
                    filter === k
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-[#0b1510] text-slate-300 border border-white/10 hover:border-white/25'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-5 sm:p-6">
          {subTab === 'history' ? (
            filteredJournal.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400 bg-[#070d0a] border border-white/10 rounded-xl">
                Записів поки немає. Кожна спіймана риба, рак чи аномальний мутант автоматично заноситься у ваш журнал із датою, водоймою, наживкою та вудкою!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredJournal.map((entry) => {
                  const sp = FISH_MAP[entry.speciesId];
                  return (
                    <div
                      key={entry.uid}
                      className={`border rounded-xl p-3.5 flex items-center justify-between gap-3 ${
                        entry.isMutant
                          ? 'bg-[#091815] border-cyan-400/35'
                          : entry.isRecord || entry.isTrophy
                            ? 'bg-[#12160d] border-amber-400/35'
                            : 'bg-[#0b130f] border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {sp && (
                          <div className="w-18 h-13 bg-[#050907] border border-white/10 rounded-lg overflow-hidden shrink-0">
                            <FishIllustration species={sp} className="w-full h-full" />
                          </div>
                        )}
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-100 truncate">
                              {entry.name}
                            </span>
                            {entry.isRecord && (
                              <span className="text-[10px] font-bold text-amber-300 inline-flex items-center gap-0.5">
                                <Award className="w-3 h-3" /> Рекорд
                              </span>
                            )}
                            {entry.isMutant && (
                              <span className="text-[10px] font-semibold text-cyan-300">
                                · Мутант
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono-num text-emerald-300">
                            {entry.weightKg} кг · {entry.lengthCm} см ·{' '}
                            <span className="text-slate-400">{KIND_LABELS[entry.faunaKind]}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            День {entry.caughtDay} ({entry.clockTime}) ·{' '}
                            {entry.locationName.split('·')[0].trim()}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {entry.rodName} · {entry.baitName}
                          </div>
                        </div>
                      </div>

                      {sp && (
                        <button
                          type="button"
                          onClick={() => setInspectSpecies(sp)}
                          className="btn-tactile btn-field min-h-[38px] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                          title="Переглянути деталі виду"
                        >
                          Деталі
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : recordRows.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400 bg-[#070d0a] border border-white/10 rounded-xl">
              Особисті рекорди ще порожні — виловте перші трофеї на водоймах Полісся.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {recordRows.map(({ species, rec }) => {
                const loc = LOCATIONS[rec.locationId];
                return (
                  <div
                    key={species.id}
                    className={`border rounded-xl p-4 flex flex-col justify-between gap-3 ${
                      species.isMutant
                        ? 'bg-[#091815] border-cyan-400/35'
                        : 'bg-[#0b130f] border-white/12'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-[#050907] border border-white/10 rounded-lg overflow-hidden shrink-0">
                        <FishIllustration species={species} className="w-full h-full" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-100 truncate">
                          {species.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {loc ? loc.name.split('·')[0].trim() : rec.locationId} · День{' '}
                          {rec.caughtDay}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <div className="font-mono-num">
                        <span className="text-amber-300 font-bold">{rec.maxWeightKg} кг</span>
                        <span className="text-slate-500 mx-1.5">·</span>
                        <span className="text-slate-200">{rec.maxLengthCm} см</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInspectSpecies(species)}
                        className="btn-tactile btn-field px-2.5 py-1 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        Деталі
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fish details modal */}
      {inspectSpecies && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/82"
          onClick={() => setInspectSpecies(null)}
        >
          <div
            className="w-full max-w-lg panel-window rounded-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
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
                aria-label="Закрити огляд риби"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full h-56 rounded-xl overflow-hidden bg-[#050907]"><FishIllustration species={inspectSpecies} className="w-full h-full" /></div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-[#070d0a] border border-white/10 rounded-xl p-3">
              <div>
                <span className="text-slate-400 block">Вага виду</span>
                <span className="font-mono-num text-emerald-300 font-semibold">
                  {inspectSpecies.minWeightKg}–{inspectSpecies.maxWeightKg} кг
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Глибина</span>
                <span className="text-amber-200 font-semibold">
                  {inspectSpecies.preferredDepth === 'bottom'
                    ? 'Дно'
                    : inspectSpecies.preferredDepth === 'surface'
                      ? 'Поверхня'
                      : inspectSpecies.preferredDepth === 'mid'
                        ? 'Середні шари'
                        : 'Будь-яка'}
                </span>
              </div>
              {inspectSpecies.habitat && (
                <div className="col-span-2">
                  <span className="text-slate-400 block">Середовище</span>
                  <span className="text-slate-200">{inspectSpecies.habitat}</span>
                </div>
              )}
              {inspectSpecies.behavior && (
                <div className="col-span-2">
                  <span className="text-slate-400 block">Поведінка при виважуванні</span>
                  <span className="text-slate-200">{inspectSpecies.behavior}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

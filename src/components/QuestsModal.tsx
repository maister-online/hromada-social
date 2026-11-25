import React from 'react';
import { CheckCircle2, ScrollText, X } from 'lucide-react';
import { CHARACTERS, QUESTS } from '../game/data';
import { SaveState } from '../game/types';

interface QuestsModalProps {
  gameState: SaveState;
  onClose: () => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({ gameState, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#040706]/88"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[88vh] panel-window rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <ScrollText className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100">
                Журнал завдань і контрактів
              </h2>
              <p className="text-xs text-slate-400">
                Здати виконані завдання можна персонажам у Бункері «Щит-04» (Рокитне)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-tactile btn-field min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl cursor-pointer"
            aria-label="Закрити журнал завдань"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-3">
          {QUESTS.map((q) => {
            const done = gameState.completedQuestIds.includes(q.id);
            const prog = Math.min(q.targetCount, gameState.questProgress[q.id] ?? 0);
            const ready = !done && prog >= q.targetCount;
            const giver = CHARACTERS[q.giver];
            const pct = Math.min(100, (prog / q.targetCount) * 100);

            return (
              <div
                key={q.id}
                className={`p-4 rounded-md border space-y-2.5 ${
                  done
                    ? 'bg-[#07100c] border-emerald-500/30 opacity-75'
                    : ready
                      ? 'bg-[#0e1c17] border-amber-400/55'
                      : 'bg-[#070d0a] border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-medium" style={{ color: giver.accentHex }}>
                      Замовник: {giver.name} ({giver.callsign})
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100 mt-0.5">{q.title}</h3>
                  </div>
                  {done ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      Виконано
                    </span>
                  ) : ready ? (
                    <span className="text-xs font-semibold text-amber-300 shrink-0">
                      Готово до здачі!
                    </span>
                  ) : (
                    <span className="font-mono-num text-xs text-slate-300 shrink-0">
                      {Number.isInteger(prog) ? prog : prog.toFixed(1)} / {q.targetCount}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{q.description}</p>

                {!done && (
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${ready ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}

                <div className="text-[11px] font-mono-num text-amber-300/90">
                  Нагорода: ₴ {q.rewardCredits} · ◈ {q.rewardGoldCoins ?? 0} · ◆ {q.rewardAmberShards ?? 0} · +{q.rewardXp} XP
                  {q.rewardBaitQty ? ` · Додаткова наживка (${q.rewardBaitQty} шт.)` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

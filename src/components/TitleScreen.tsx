import React from 'react';
import { BookOpen } from 'lucide-react';

interface TitleScreenProps {
  menuVisible: boolean;
  hasSave: boolean;
  discoveredCount: number;
  totalSpeciesCount: number;
  onNewGame: () => void;
  onContinue: () => void;
  onOpenBestiary: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  menuVisible,
  hasSave,
  discoveredCount,
  totalSpeciesCount,
  onNewGame,
  onContinue,
  onOpenBestiary,
}) => {
  return (
    <div className="relative w-full h-full min-h-0 flex flex-col overflow-hidden bg-transparent">

      <img
        src={`${import.meta.env.BASE_URL}${encodeURIComponent('Надпис_Дике_Полісся_українською_1c88db2c_2K.jpg')}`}
        alt="Заставка гри «Дике Полісся»"
        className="absolute inset-0 w-full h-full object-cover object-center"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      <style>{`@keyframes menuReveal { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <main className={`relative z-10 flex-1 flex items-end justify-center px-4 pb-3 sm:pb-5 transition-all duration-700 ease-out ${menuVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-black/55 border border-white/15 p-3 backdrop-blur-sm animate-[menuReveal_900ms_ease-out_both]">
          {hasSave && (
            <button
              type="button"
              onClick={onContinue}
              className="btn-tactile btn-primary-emerald min-h-[52px] px-7 py-3 font-bold text-sm rounded-xl cursor-pointer"
            >
              Продовжити
            </button>
          )}
          <button
            type="button"
            onClick={onNewGame}
            className="btn-tactile btn-primary-emerald min-h-[52px] px-7 py-3 font-bold text-sm rounded-xl cursor-pointer"
          >
            Нова гра
          </button>
        </div>
      </main>

      <div className={`relative z-10 flex items-center justify-center gap-2 px-3 pb-3 sm:pb-5 transition-opacity duration-700 ${menuVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <button
          type="button"
          onClick={onOpenBestiary}
          className="btn-tactile btn-field min-h-[44px] inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer bg-black/70 border border-white/20 text-white"
        >
          <BookOpen className="w-4 h-4 text-teal-300" />
          Бестіарій ({discoveredCount}/{totalSpeciesCount})
        </button>
      </div>
    </div>
  );
};

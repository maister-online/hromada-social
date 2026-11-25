import React from 'react';
import { BookOpen, Music, Volume2, VolumeX } from 'lucide-react';

interface TitleScreenProps {
  menuVisible: boolean;
  hasSave: boolean;
  discoveredCount: number;
  totalSpeciesCount: number;
  musicEnabled: boolean;
  muted: boolean;
  onToggleMusic: () => void;
  onToggleMute: () => void;
  onNewGame: () => void;
  onContinue: () => void;
  onOpenBestiary: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  menuVisible,
  hasSave,
  discoveredCount,
  totalSpeciesCount,
  musicEnabled,
  muted,
  onToggleMusic,
  onToggleMute,
  onNewGame,
  onContinue,
  onOpenBestiary,
}) => {
  return (
    <div className="relative w-full h-full min-h-0 flex flex-col overflow-hidden bg-gradient-to-b from-[#101b18] via-[#080e0c] to-black">

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
        <button
          type="button"
          onClick={onToggleMusic}
          className="btn-tactile btn-field min-w-[44px] min-h-[44px] inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer bg-black/70 border border-white/20 text-white"
          aria-label={musicEnabled ? 'Вимкнути музику' : 'Увімкнути музику'}
        >
          <Music className="w-4 h-4" />
          <span className="hidden sm:inline">{musicEnabled ? 'Музика' : 'Без музики'}</span>
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          className="btn-tactile btn-field min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl cursor-pointer bg-black/70 border border-white/20 text-white"
          aria-label={muted ? 'Увімкнути звук' : 'Вимкнути звук'}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

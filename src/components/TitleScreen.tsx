import React from 'react';
import { BookOpen, Music, Volume2, VolumeX } from 'lucide-react';

interface TitleScreenProps {
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

const TITLE_BACKGROUND =
  'https://raw.githubusercontent.com/maister-online/hromada-social/main/%D0%9F%D1%80%D0%B8%D0%B1%D0%B5%D1%80%D0%B8_%D0%BC%D1%96%D0%B6_%D1%83%D0%B4%D0%BE%D1%87%D0%BA%D0%BE%D1%8E_%D1%96_%D0%BA%D0%B0%D1%80%D1%82%D0%BE%D1%8E%D0%B1%D1%80%D0%B8%D1%81%D0%BA%D1%83_fa85fbf4_2K.jpg';

export const TitleScreen: React.FC<TitleScreenProps> = ({
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
    <div className="relative w-full h-full min-h-0 flex flex-col overflow-hidden bg-[#060a08]">
      <img
        src={TITLE_BACKGROUND}
        alt="Заставка гри «Полісся: Аномальна риболовля»"
        className="absolute inset-0 w-full h-full object-cover object-center"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <div className="relative z-10 flex items-start justify-end gap-2 p-3 sm:p-5">
        <button
          type="button"
          onClick={onOpenBestiary}
          className="btn-tactile btn-field min-h-[44px] inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer bg-black/65 border border-white/20 text-white"
        >
          <BookOpen className="w-4 h-4 text-teal-300" />
          Бестіарій ({discoveredCount}/{totalSpeciesCount})
        </button>
        <button
          type="button"
          onClick={onToggleMusic}
          className="btn-tactile btn-field min-h-[44px] inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer bg-black/65 border border-white/20 text-white"
          aria-label={musicEnabled ? 'Вимкнути музику' : 'Увімкнути музику'}
        >
          <Music className="w-4 h-4" />
          <span className="hidden sm:inline">{musicEnabled ? 'Музика' : 'Без музики'}</span>
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          className="btn-tactile btn-field min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl cursor-pointer bg-black/65 border border-white/20 text-white"
          aria-label={muted ? 'Увімкнути звук' : 'Вимкнути звук'}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      <main className="relative z-10 flex-1 flex items-end justify-center px-4 pb-8 sm:pb-12">
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-black/55 border border-white/15 p-3 backdrop-blur-sm">
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
    </div>
  );
};

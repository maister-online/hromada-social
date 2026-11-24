import React, { useState } from 'react';
import { BookOpen, Compass, MapPin, Music, Volume2, VolumeX, Warehouse } from 'lucide-react';
import { MAP_IMAGE_URL } from '../game/data';

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
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#060a08]">
      {!imgErr ? (
        <img
          src={MAP_IMAGE_URL}
          alt="Карта Полісся: Рокитне, річки, озера та аномальні болота"
          referrerPolicy="no-referrer"
          onError={() => setImgErr(true)}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
        />
      ) : (
        <div className="absolute inset-0 bg-[#08120d]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-[#050907]/96 via-[#050907]/78 to-[#050907]/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050907] via-transparent to-[#050907]/70" />

      <header className="relative z-10 flex items-center justify-between gap-8 px-8 py-5 border-b border-white/10">
        <span className="font-display text-lg font-bold tracking-wide text-slate-100 whitespace-nowrap shrink-0">
          Полісся
        </span>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={onOpenBestiary}
            className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Бестіарій ({discoveredCount}/{totalSpeciesCount})
          </button>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleMusic}
            className={`btn-tactile min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer border ${
              musicEnabled && !muted
                ? 'bg-emerald-950/75 border-emerald-400/50 text-emerald-200'
                : 'btn-field text-slate-400'
            }`}
            aria-label={musicEnabled ? 'Вимкнути музику' : 'Увімкнути музику'}
          >
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">{musicEnabled ? 'Музика' : 'Без музики'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="btn-tactile btn-field min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl cursor-pointer"
            aria-label={muted ? 'Увімкнути звук' : 'Вимкнути звук'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={hasSave ? onContinue : onNewGame}
            className="btn-tactile btn-primary-emerald min-h-[44px] px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
          >
            {hasSave ? 'Продовжити' : 'На карту Полісся'}
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center px-8 md:px-16 max-w-4xl">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide text-emerald-300/90">
            <span>Сухопутна 3D-риболовля</span>
            <span aria-hidden="true">·</span>
            <span>Річки, озера й болота Полісся</span>
            <span aria-hidden="true">·</span>
            <span>Бункер «Щит-04» та персонажі</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-slate-50 leading-tight [text-wrap:balance]">
            Полісся: Аномальна Риболовля
          </h1>

          <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Обирайте водойми просто з карти Полісся — від тихих річок біля Масевичів і Карпилівки до
            затоплених заплав Сновидовичів і Блакитного розлому Блажового. Ловіть із берега в 3D із
            реальною фізикою виважування, прикормками та продавайте улов персонажам у підземному бункері.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {hasSave && (
              <button
                type="button"
                onClick={onContinue}
                className="btn-tactile btn-primary-emerald min-h-[48px] inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                Продовжити експедицію
              </button>
            )}

            <button
              type="button"
              onClick={onNewGame}
              className={`btn-tactile min-h-[48px] inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl cursor-pointer ${
                hasSave ? 'btn-field' : 'btn-primary-emerald'
              }`}
            >
              <MapPin className="w-4 h-4" />
              {hasSave ? 'Нова гра' : 'Відкрити карту Полісся'}
            </button>

            <button
              type="button"
              onClick={onOpenBestiary}
              className="btn-tactile btn-field min-h-[48px] inline-flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-xl cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-teal-400" />
              Бестіарій ({discoveredCount}/{totalSpeciesCount})
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 px-6 md:px-16 py-4 border-t border-white/10 bg-[#050907]/85 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span>
            <strong className="text-slate-200 font-mono-num">Дотик / Пробіл</strong> — закинути / підсікти / тягнути
          </span>
          <span>
            <strong className="text-slate-200 font-mono-num">2 пальці</strong> — зум карти
          </span>
          <span>
            <strong className="text-slate-200 font-mono-num">Фрикціон +/-</strong> — натяг снасті
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-300">
            <Warehouse className="w-3.5 h-3.5" />
            Бункер у Рокитному: продаж, снасті й завдання
          </span>
        </div>
        <span className="text-slate-500">WebGL 3D · Погода · Сенсорне керування</span>
      </footer>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { RobotState } from '../types';
import { Volume2, VolumeX, Mic, MicOff, Sparkles, UserCheck, Bot } from 'lucide-react';
const aiAvatarImg = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

interface RobotAvatarProps {
  state: RobotState;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  subtitle?: string;
  isSpeaking?: boolean;
  isListening?: boolean;
  onToggleVoice?: () => void;
  voiceEnabled?: boolean;
  onStartListening?: () => void;
}

export const RobotAvatar: React.FC<RobotAvatarProps> = ({
  state,
  onClick,
  size = 'md',
  subtitle,
  isSpeaking = false,
  isListening = false,
  onToggleVoice,
  voiceEnabled = true,
  onStartListening
}) => {
  const [usePhotoFace, setUsePhotoFace] = useState<boolean>(true);
  const [audioBarHeights, setAudioBarHeights] = useState<number[]>([12, 18, 24, 16, 20]);

  // Audio wave animation when speaking
  useEffect(() => {
    if (state === 'speaking' || isSpeaking) {
      const audioInterval = setInterval(() => {
        setAudioBarHeights([
          Math.floor(Math.random() * 20) + 8,
          Math.floor(Math.random() * 28) + 12,
          Math.floor(Math.random() * 32) + 14,
          Math.floor(Math.random() * 26) + 10,
          Math.floor(Math.random() * 18) + 6,
        ]);
      }, 120);
      return () => clearInterval(audioInterval);
    } else {
      setAudioBarHeights([6, 10, 14, 10, 6]);
    }
  }, [state, isSpeaking]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-44 h-44',
    hero: 'w-56 h-56 md:w-64 md:h-64',
  }[size];

  const getStateColor = () => {
    switch (state) {
      case 'speaking':
        return 'from-emerald-400 via-teal-500 to-cyan-500 shadow-emerald-500/40';
      case 'listening':
        return 'from-sky-400 via-blue-500 to-indigo-500 shadow-sky-500/40';
      case 'thinking':
        return 'from-amber-400 via-orange-500 to-rose-500 shadow-amber-500/40';
      case 'happy':
        return 'from-teal-400 via-emerald-400 to-cyan-400 shadow-teal-500/40';
      default:
        return 'from-cyan-500 via-sky-600 to-purple-600 shadow-cyan-500/30';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center select-none group">
      {/* Halo pulse ring around robotic head */}
      <div className="relative flex items-center justify-center">
        {/* Outer glowing aura */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${getStateColor()} blur-xl opacity-60 transition-all duration-500 animate-pulse`}
          style={{ transform: 'scale(1.2)' }}
        />

        {/* Orbiting circuit ring for thinking mode */}
        {state === 'thinking' && (
          <div className="absolute inset-0 border-2 border-dashed border-amber-400/80 rounded-full animate-spin duration-3000 pointer-events-none" style={{ margin: '-12px' }} />
        )}

        {/* Orbiting pulse ring for listening mode */}
        {(state === 'listening' || isListening) && (
          <div className="absolute inset-0 border-2 border-sky-400 rounded-full animate-ping opacity-75 pointer-events-none" style={{ margin: '-8px' }} />
        )}

        {/* Main AI Avatar Head Container */}
        <div
          onClick={onClick}
          className={`relative rounded-full p-1.5 bg-slate-950/90 border-2 border-cyan-400/80 shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer overflow-hidden ${sizeClasses}`}
        >
          {usePhotoFace ? (
            /* Photorealistic AI Cyber Face Image */
            <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950">
              <img
                src={aiAvatarImg}
                alt="AI Assistant Face"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full filter contrast-105 brightness-105 scale-105"
              />

              {/* Glowing Cyber HUD Overlay Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-purple-950/40 pointer-events-none rounded-full" />
              <div className="absolute inset-0 border-2 border-cyan-400/40 rounded-full pointer-events-none" />

              {/* Holographic HUD Ring */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60 animate-spin-slow" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 4 12 4" />
                <circle cx="50" cy="50" r="48" fill="none" stroke="#a855f7" strokeWidth="0.8" strokeDasharray="20 10 5 10" />
              </svg>

              {/* Equalizer overlay at bottom when speaking */}
              {(state === 'speaking' || isSpeaking) && (
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1 bg-slate-950/70 py-1 backdrop-blur-xs">
                  {audioBarHeights.map((h, idx) => (
                    <span
                      key={idx}
                      className="w-1 bg-emerald-400 rounded-full transition-all duration-100"
                      style={{ height: `${Math.max(4, h / 2)}px` }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Classic Vector Cyber Head */
            <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-full p-2">
              <Bot className="w-2/3 h-2/3 text-cyan-400 animate-pulse" />
            </div>
          )}

          {/* Active Status Pill (Inline, non-overlapping) */}
          {state !== 'idle' && (
            <div className="mt-2 flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-cyan-300 border border-cyan-400/50 shadow">
                <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                {state === 'speaking' ? 'Говорить...' : state === 'listening' ? 'Слухає...' : 'Аналізує...'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mode Switcher Button */}
      <button
        onClick={() => setUsePhotoFace(!usePhotoFace)}
        className="mt-2 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800 transition-colors"
      >
        <UserCheck className="w-3 h-3 text-cyan-400" />
        <span>{usePhotoFace ? 'Переключити вигляд' : 'Реалістичний вигляд'}</span>
      </button>

      {/* Subtitle & Quick Voice Controls */}
      {subtitle && (
        <p className="mt-2 text-xs text-cyan-200/90 text-center max-w-xs font-medium">
          {subtitle}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        {onToggleVoice && (
          <button
            onClick={onToggleVoice}
            className={`p-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border ${
              voiceEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
            title={voiceEnabled ? 'Озвучку увімкнено' : 'Озвучка вимкнена'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{voiceEnabled ? 'Озвучка' : 'Німо'}</span>
          </button>
        )}

        {onStartListening && (
          <button
            onClick={onStartListening}
            className={`p-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
              isListening
                ? 'bg-rose-500/30 text-rose-300 border-rose-500/60 animate-pulse'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-cyan-400" />}
            <span>{isListening ? 'Слухаю...' : 'Голос'}</span>
          </button>
        )}
      </div>
    </div>
  );
};


import React from 'react';
import { CharacterId } from '../game/types';

interface CharacterPortraitProps {
  characterId: CharacterId;
  className?: string;
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  characterId,
  className = 'w-20 h-20',
}) => {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-label={characterId}>
      <defs>
        <radialGradient id={`bg_${characterId}`} cx="50%" cy="35%" r="70%">
          <stop
            offset="0%"
            stopColor={
              characterId === 'taras'
                ? '#452b11'
                : characterId === 'baryga'
                  ? '#3d2a0d'
                  : characterId === 'oleg'
                    ? '#102d42'
                    : '#0e3633'
            }
          />
          <stop offset="100%" stopColor="#070b0e" />
        </radialGradient>
      </defs>

      <rect width="120" height="120" rx="10" fill={`url(#bg_${characterId})`} />

      {/* Subtle bunker concrete & pipe lines in background */}
      <path d="M0 95 L120 95" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
      <path d="M16 0 L16 120 M104 0 L104 120" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />

      {characterId === 'taras' && (
        <g>
          {/* Stalker parka & tactical vest */}
          <path d="M16 120 C22 84, 36 78, 60 78 C84 78, 98 84, 104 120 Z" fill="#3a3d2b" />
          <path d="M36 82 L46 120 L74 120 L84 82 Z" fill="#4f5138" />
          {/* Neck & Face */}
          <rect x="49" y="64" width="22" height="20" rx="6" fill="#c9936e" />
          <ellipse cx="60" cy="52" rx="18" ry="22" fill="#d6a17c" />
          {/* Short haircut & dark beard */}
          <path d="M41 44 C41 26, 79 26, 79 44 C73 36, 47 36, 41 44 Z" fill="#2d241d" />
          <path d="M43 56 C44 73, 51 79, 60 79 C69 79, 76 73, 77 56 C71 61, 66 62, 60 62 C54 62, 49 61, 43 56 Z" fill="#3b2f26" />
          {/* Eyes & brows */}
          <path d="M47 45 Q52 42 56 45 M64 45 Q68 42 73 45" stroke="#29211b" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <circle cx="52" cy="49" r="2.1" fill="#1e293b" />
          <circle cx="68" cy="49" r="2.1" fill="#1e293b" />
        </g>
      )}

      {characterId === 'velychko' && (
        <g>
          {/* Tactical vest over dark shirt */}
          <path d="M18 120 C22 84, 36 78, 60 78 C84 78, 98 84, 102 120 Z" fill="#243129" />
          <path d="M38 80 L48 120 L72 120 L82 80 Z" fill="#36473d" />
          {/* Neck & Face */}
          <rect x="50" y="64" width="20" height="18" rx="5" fill="#d09c77" />
          <ellipse cx="60" cy="51" rx="17" ry="21" fill="#dba884" />
          {/* Short buzzcut & trimmed beard */}
          <path d="M43 42 C44 25, 76 25, 77 42 C72 34, 48 34, 43 42 Z" fill="#332922" />
          <path d="M44 55 C45 69, 52 74, 60 74 C68 74, 75 69, 76 55" fill="none" stroke="#3c3027" strokeWidth="3.5" opacity="0.7" />
          {/* Analytical gaze */}
          <circle cx="52" cy="48" r="2" fill="#0f172a" />
          <circle cx="68" cy="48" r="2" fill="#0f172a" />
          <path d="M46 43 L57 44 M74 43 L63 44" stroke="#2d241d" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M53 62 Q60 64 67 62" stroke="#6b4430" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Glowing bio-lure glint */}
          <circle cx="88" cy="92" r="5" fill="#2dd4bf" opacity="0.85" />
          <circle cx="88" cy="92" r="9" fill="#2dd4bf" opacity="0.22" />
        </g>
      )}

      {characterId === 'oleg' && (
        <g>
          {/* Hooded mechanic parka */}
          <path d="M16 120 C22 84, 36 78, 60 78 C84 78, 98 84, 104 120 Z" fill="#2b3029" />
          <path d="M30 56 C30 20, 90 20, 90 56 L92 86 L28 86 Z" fill="#3b4036" />
          {/* Face inside hood */}
          <ellipse cx="60" cy="52" rx="16.5" ry="20" fill="#d29f7c" />
          <path d="M45 58 C47 69, 53 73, 60 73 C67 73, 73 69, 75 58" fill="none" stroke="#334155" strokeWidth="2.6" opacity="0.5" />
          <circle cx="52.5" cy="48" r="2.1" fill="#0f172a" />
          <circle cx="67.5" cy="48" r="2.1" fill="#0f172a" />
          <path d="M53 62 Q60 65 67 61" stroke="#7c4a32" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Shoulder harness & gauge detail */}
          <path d="M36 84 L48 120 M84 84 L72 120" stroke="#38bdf8" strokeWidth="2.5" opacity="0.55" />
        </g>
      )}

      {characterId === 'baryga' && (
        <g>
          {/* Hooded stalker jacket & gas mask (Baryga) */}
          <path d="M16 120 C20 82, 36 74, 60 74 C84 74, 100 82, 104 120 Z" fill="#292822" />
          <path d="M29 56 C29 18, 91 18, 91 56 L93 88 L27 88 Z" fill="#36342b" />
          {/* Gas mask shell */}
          <ellipse cx="60" cy="52" rx="17" ry="20" fill="#1e221f" stroke="#475569" strokeWidth="1.5" />
          {/* Gas mask visors */}
          <circle cx="51" cy="46" r="6" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.6" />
          <circle cx="69" cy="46" r="6" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.6" />
          <circle cx="49" cy="44" r="1.6" fill="#fbbf24" opacity="0.55" />
          <circle cx="67" cy="44" r="1.6" fill="#fbbf24" opacity="0.55" />
          {/* Filter canister & hose */}
          <circle cx="60" cy="63" r="7.5" fill="#272c2a" stroke="#64748b" strokeWidth="1.5" />
          <path d="M60 70 Q58 84 48 96" fill="none" stroke="#334155" strokeWidth="5.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

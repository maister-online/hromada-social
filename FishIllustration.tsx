import React, { useState } from 'react';
import { FishSpeciesDef } from '../game/types';

interface FishIllustrationProps {
  species: FishSpeciesDef;
  className?: string;
  dimmed?: boolean;
}

const PHOTO_SPECIES_IDS = new Set([
  'amur_sleeper',
  'asp',
  'barbel',
  'bleak',
  'blue_bream',
  'bream',
  'brown_trout',
  'burbot',
  'carp_mirror',
  'carp_mutant',
  'catfish',
  'catfish_glow',
  'chub',
  'crucian',
  'crucian_glow',
  'european_eel',
  'grass_carp',
  'gudgeon',
  'ide',
  'leviathan_polissia',
  'loach',
  'monkey_goby',
  'nase',
  'perch_river',
  'pike_ghost',
  'pike_river',
  'roach',
  'rudd',
  'ruffe',
  'sabrefish',
  'silver_bream',
  'silver_carp',
  'silver_crucian',
  'sterlet',
  'swamp_eel',
  'tench',
  'tench_moss',
  'vimba',
  'volga_zander',
  'wild_carp',
  'zander',
  'zander_crystal',
]);

export const FishIllustration: React.FC<FishIllustrationProps> = ({
  species,
  className = 'w-full h-full',
  dimmed = false,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const hasPhoto = PHOTO_SPECIES_IDS.has(species.id) && !imgFailed;
  const c = species.accentColor || '#38bdf8';
  const secondary = species.model3d?.secondaryHex || '#0f172a';
  const finColor = species.model3d?.finHex || c;
  const bodyShape = species.model3d?.bodyShape;
  const key = species.silhouetteKey;

  if (hasPhoto) {
    const filterClass = dimmed
      ? 'grayscale brightness-[0.42] contrast-125 opacity-65'
      : species.isMutant
        ? 'hue-rotate-[125deg] saturate-150 contrast-115'
        : '';

    return (
      <div className={`relative overflow-hidden bg-[#060c09] ${className}`}>
        <img
          src={`/assets/fish/${species.id}.jpg`}
          alt={species.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          draggable={false}
          onError={() => setImgFailed(true)}
          className={`w-full h-full object-cover object-center select-none transition-transform duration-300 ${filterClass}`}
        />
        {species.isMutant && !dimmed && (
          <div
            className="pointer-events-none absolute inset-0 mix-blend-screen opacity-35"
            style={{
              background: `radial-gradient(circle at 50% 45%, ${c}55 0%, transparent 72%)`,
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
      </div>
    );
  }

  const isCrayfish =
    bodyShape === 'crayfish' || species.faunaKind === 'crayfish' || key === 'crayfish';
  const isBeetle = bodyShape === 'beetle' || species.faunaKind === 'beetle' || key === 'beetle';
  const isInsect = bodyShape === 'insect' || species.faunaKind === 'insect' || key === 'insect';
  const isFrog = bodyShape === 'frog' || key === 'frog';
  const isTurtle = bodyShape === 'turtle' || key === 'turtle';
  const isSnakeOrLeech =
    bodyShape === 'snake' || bodyShape === 'leech' || key === 'snake' || key === 'leech';
  const isSturgeon =
    bodyShape === 'sturgeon' || key === 'sterlet' || key === 'leviathan_polissia';
  const isCatfish =
    bodyShape === 'catfish' ||
    key === 'catfish' ||
    key === 'catfish_glow' ||
    key === 'burbot' ||
    key === 'barbel' ||
    key === 'gudgeon';
  const isGoby = key === 'goby';
  const isLong =
    bodyShape === 'eel' ||
    key === 'pike' ||
    key === 'pike_ghost' ||
    key === 'zander' ||
    key === 'zander_crystal' ||
    key === 'eel' ||
    key === 'swamp_eel' ||
    key === 'sabrefish' ||
    key === 'bleak';
  const isRound =
    bodyShape === 'deep' ||
    key === 'crucian' ||
    key === 'crucian_glow' ||
    key === 'bream' ||
    key === 'carp' ||
    key === 'carp_mutant';
  const isTrout = key === 'trout';

  const bgDimCls = dimmed ? 'grayscale brightness-[0.38] opacity-55' : '';

  return (
    <div className={`relative overflow-hidden bg-[#060c09] flex items-center justify-center ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${c}44 0%, transparent 72%)`,
        }}
      />
      <svg
        viewBox="0 0 120 72"
        className={`w-full h-full relative z-[1] ${bgDimCls}`}
        aria-label={species.name}
      >
        <defs>
          <linearGradient id={`fg_${species.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c} stopOpacity="0.95" />
            <stop offset="55%" stopColor={secondary} stopOpacity="0.88" />
            <stop offset="100%" stopColor="#09110d" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {isCrayfish ? (
          <g>
            {/* Antennae */}
            <path d="M26 32 Q12 18 6 12 M26 40 Q12 54 6 60" stroke={c} strokeWidth="1.3" fill="none" opacity="0.8" />
            {/* Claws */}
            <path d="M35 28 C25 18, 17 16, 12 22 C16 25, 22 25, 27 29" fill={finColor} stroke={c} strokeWidth="1.4" />
            <path d="M35 44 C25 54, 17 56, 12 50 C16 47, 22 47, 27 43" fill={finColor} stroke={c} strokeWidth="1.4" />
            {/* Walking legs */}
            <path d="M46 27 L42 18 M54 27 L52 17 M62 28 L61 18 M46 45 L42 54 M54 45 L52 55 M62 44 L61 54" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
            {/* Carapace + segmented tail */}
            <ellipse cx="48" cy="36" rx="19" ry="10" fill={`url(#fg_${species.id})`} stroke={c} strokeWidth="1.5" />
            <rect x="65" y="28" width="9" height="16" rx="3" fill={c} fillOpacity="0.8" stroke={secondary} strokeWidth="1" />
            <rect x="74" y="29" width="8" height="14" rx="3" fill={c} fillOpacity="0.72" stroke={secondary} strokeWidth="1" />
            <rect x="82" y="30" width="8" height="12" rx="3" fill={c} fillOpacity="0.65" stroke={secondary} strokeWidth="1" />
            {/* Tail fan */}
            <path d="M90 31 L107 23 L103 36 L107 49 L90 41 Z" fill={finColor} stroke={c} strokeWidth="1.2" />
            <circle cx="31" cy="32" r="2.2" fill="#fde047" />
            <circle cx="31" cy="40" r="2.2" fill="#fde047" />
            <circle cx="31" cy="32" r="1" fill="#020617" />
            <circle cx="31" cy="40" r="1" fill="#020617" />
          </g>
        ) : isBeetle ? (
          <g>
            {/* Legs */}
            <path d="M44 26 L36 16 M58 24 L58 14 M72 26 L80 16 M44 46 L36 56 M58 48 L58 58 M72 46 L80 56" stroke={c} strokeWidth="2" strokeLinecap="round" />
            {/* Antennae */}
            <path d="M31 32 Q23 26 20 21 M31 40 Q23 46 20 51" stroke={c} strokeWidth="1.4" fill="none" />
            {/* Shell + pronotum */}
            <ellipse cx="64" cy="36" rx="22" ry="15" fill={`url(#fg_${species.id})`} stroke={c} strokeWidth="1.8" />
            <ellipse cx="38" cy="36" rx="9" ry="10" fill={secondary} stroke={c} strokeWidth="1.5" />
            <line x1="46" y1="36" x2="86" y2="36" stroke="#020617" strokeWidth="1.8" opacity="0.65" />
            <ellipse cx="62" cy="29" rx="10" ry="3.5" fill="#ffffff" opacity="0.22" />
            <circle cx="33" cy="32" r="2" fill="#fef08a" />
            <circle cx="33" cy="40" r="2" fill="#fef08a" />
          </g>
        ) : isInsect ? (
          <g>
            {/* Translucent Wings */}
            <ellipse cx="56" cy="21" rx="22" ry="7" transform="rotate(-14 56 21)" fill={finColor} fillOpacity="0.34" stroke={c} strokeWidth="1.2" />
            <ellipse cx="56" cy="51" rx="22" ry="7" transform="rotate(14 56 51)" fill={finColor} fillOpacity="0.34" stroke={c} strokeWidth="1.2" />
            <ellipse cx="65" cy="26" rx="15" ry="5" transform="rotate(-6 65 26)" fill={finColor} fillOpacity="0.25" stroke={c} strokeWidth="1" />
            <ellipse cx="65" cy="46" rx="15" ry="5" transform="rotate(6 65 46)" fill={finColor} fillOpacity="0.25" stroke={c} strokeWidth="1" />
            {/* Thorax & Slender Abdomen */}
            <ellipse cx="44" cy="36" rx="9" ry="6" fill={c} stroke="#0f172a" strokeWidth="1.2" />
            <rect x="52" y="33.5" width="44" height="5" rx="2.5" fill={`url(#fg_${species.id})`} stroke={c} strokeWidth="1.1" />
            <circle cx="33" cy="34" r="3" fill="#fde047" />
            <circle cx="33" cy="38" r="3" fill="#fde047" />
            <path d="M29 33 L18 26 M29 39 L18 46" stroke={c} strokeWidth="1.2" />
          </g>
        ) : isFrog ? (
          <g>
            {/* Hind legs */}
            <path d="M68 25 C82 14, 96 18, 92 29 L82 31" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" />
            <path d="M68 47 C82 58, 96 54, 92 43 L82 41" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" />
            {/* Front legs */}
            <path d="M40 27 L31 19 M40 45 L31 53" stroke={c} strokeWidth="3" strokeLinecap="round" />
            {/* Body */}
            <ellipse cx="54" cy="36" rx="21" ry="13" fill={`url(#fg_${species.id})`} stroke={c} strokeWidth="1.6" />
            <circle cx="52" cy="31" r="2.2" fill={finColor} opacity="0.7" />
            <circle cx="62" cy="38" r="2.6" fill={finColor} opacity="0.7" />
            <circle cx="37" cy="29" r="3.2" fill="#fde047" stroke="#020617" strokeWidth="1" />
            <circle cx="37" cy="43" r="3.2" fill="#fde047" stroke="#020617" strokeWidth="1" />
            <circle cx="37" cy="29" r="1.4" fill="#020617" />
            <circle cx="37" cy="43" r="1.4" fill="#020617" />
          </g>
        ) : isTurtle ? (
          <g>
            {/* Flippers */}
            <ellipse cx="44" cy="18" rx="9" ry="4.5" transform="rotate(-24 44 18)" fill={finColor} stroke={c} strokeWidth="1.2" />
            <ellipse cx="44" cy="54" rx="9" ry="4.5" transform="rotate(24 44 54)" fill={finColor} stroke={c} strokeWidth="1.2" />
            <ellipse cx="76" cy="21" rx="7" ry="4" transform="rotate(20 76 21)" fill={finColor} stroke={c} strokeWidth="1.2" />
            <ellipse cx="76" cy="51" rx="7" ry="4" transform="rotate(-20 76 51)" fill={finColor} stroke={c} strokeWidth="1.2" />
            {/* Head & tail */}
            <ellipse cx="29" cy="36" rx="9" ry="5.5" fill={finColor} stroke={c} strokeWidth="1.4" />
            <polygon points="84,34 98,36 84,38" fill={finColor} />
            {/* Shell */}
            <ellipse cx="60" cy="36" rx="24" ry="17" fill={`url(#fg_${species.id})`} stroke={c} strokeWidth="2" />
            <polygon points="60,25 71,31 71,41 60,47 49,41 49,31" fill="none" stroke="#fef3c7" strokeWidth="1.2" opacity="0.55" />
            <circle cx="26" cy="34" r="1.8" fill="#fde047" />
            <circle cx="26" cy="34" r="0.8" fill="#020617" />
          </g>
        ) : isSnakeOrLeech ? (
          <g>
            <path
              d="M15 36 C28 20, 42 52, 58 35 C72 19, 86 48, 105 34"
              fill="none"
              stroke={c}
              strokeWidth="8.5"
              strokeLinecap="round"
            />
            <path
              d="M15 36 C28 20, 42 52, 58 35 C72 19, 86 48, 105 34"
              fill="none"
              stroke={secondary}
              strokeWidth="4"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
            <circle cx="17" cy="34" r="2.2" fill="#fef08a" />
            <circle cx="17" cy="34" r="1" fill="#020617" />
          </g>
        ) : isSturgeon ? (
          <g>
            <path
              d="M8 36 L28 29 C46 25, 76 26, 98 32 L114 21 L107 36 L113 47 L98 40 C74 46, 36 45, 22 40 Z"
              fill={`url(#fg_${species.id})`}
              stroke={c}
              strokeWidth="1.5"
            />
            <path
              d="M34 27 L38 22 L42 26 L48 21 L52 25 L59 21 L63 26 L70 22 L74 27"
              fill="none"
              stroke="#fef3c7"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="34" r="2.2" fill="#fef08a" />
            <circle cx="24" cy="34" r="1" fill="#020617" />
          </g>
        ) : isCatfish ? (
          <g>
            <path
              d="M22 36 C32 22, 62 24, 92 31 L110 25 L106 36 L110 47 L92 41 C62 48, 32 50, 22 36 Z"
              fill={`url(#fg_${species.id})`}
              stroke={c}
              strokeWidth="1.6"
            />
            <path
              d="M22 34 Q8 24 5 18 M22 38 Q9 48 6 54 M25 41 Q15 50 14 57"
              stroke={c}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="33" cy="31" r="2.6" fill="#f8fafc" />
            <circle cx="33" cy="31" r="1.3" fill="#020617" />
          </g>
        ) : isGoby ? (
          <g>
            <path
              d="M16 36 C24 20, 48 22, 92 31 L108 26 L104 36 L108 46 L92 41 C48 50, 24 52, 16 36 Z"
              fill={`url(#fg_${species.id})`}
              stroke={c}
              strokeWidth="1.6"
            />
            <path d="M40 23 L60 14 L74 26 Z" fill={finColor} opacity="0.72" />
            <circle cx="29" cy="30" r="3" fill="#fef08a" />
            <circle cx="29" cy="30" r="1.4" fill="#020617" />
          </g>
        ) : isTrout ? (
          <g>
            <path
              d="M16 36 C26 21, 68 20, 94 31 L111 22 L106 36 L111 50 L94 41 C68 52, 26 51, 16 36 Z"
              fill={`url(#fg_${species.id})`}
              stroke={c}
              strokeWidth="1.5"
            />
            <path d="M48 22 L62 13 L71 24 Z" fill={finColor} opacity="0.75" />
            <circle cx="46" cy="32" r="1.6" fill="#fef2f2" opacity="0.85" />
            <circle cx="58" cy="37" r="1.8" fill="#fda4af" opacity="0.9" />
            <circle cx="70" cy="32" r="1.6" fill="#fef2f2" opacity="0.85" />
            <circle cx="80" cy="37" r="1.5" fill="#fda4af" opacity="0.85" />
            <circle cx="29" cy="32" r="2.6" fill="#f8fafc" />
            <circle cx="29" cy="32" r="1.2" fill="#020617" />
          </g>
        ) : isLong ? (
          <g>
            <path
              d="M12 36 C24 27, 74 26, 98 32 L114 23 L108 36 L114 49 L98 40 C74 46, 24 45, 12 36 Z"
              fill={`url(#fg_${species.id})`}
              stroke={c}
              strokeWidth="1.5"
            />
            <path d="M74 28 L84 18 L89 29 Z M74 44 L83 54 L88 43 Z" fill={finColor} opacity="0.72" />
            <circle cx="24" cy="33" r="2.6" fill="#fef08a" />
            <circle cx="24" cy="33" r="1.2" fill="#020617" />
          </g>
        ) : isRound ? (
          <g>
            <path
              d="M20 36 C28 16, 68 15, 92 31 L110 21 L104 36 L110 51 L92 41 C68 57, 28 56, 20 36 Z"
              fill={`url(#fg_${species.id})`}
              stroke={c}
              strokeWidth="1.6"
            />
            <path d="M46 19 L62 11 L74 21 Z" fill={finColor} opacity="0.75" />
            <path d="M48 53 L58 61 L66 52 Z" fill={finColor} opacity="0.65" />
            <circle cx="32" cy="32" r="2.8" fill="#fef9c3" />
            <circle cx="32" cy="32" r="1.3" fill="#020617" />
          </g>
        ) : (
          <g>
            <path
              d="M18 36 C28 21, 68 20, 94 32 L111 22 L105 36 L111 50 L94 40 C68 52, 28 51, 18 36 Z"
              fill={`url(#fg_${species.id})`}
              stroke={c}
              strokeWidth="1.5"
            />
            <path
              d="M46 22 L62 13 L72 24 Z"
              fill={key === 'rudd' ? '#ef4444' : finColor}
              opacity="0.82"
            />
            {key === 'rudd' && (
              <path d="M44 49 L56 59 L64 49 Z" fill="#ef4444" opacity="0.82" />
            )}
            <path
              d="M42 29 L46 43 M56 28 L60 44 M70 29 L73 43"
              stroke="#0f172a"
              strokeWidth="2.5"
              opacity="0.45"
            />
            <circle cx="30" cy="32" r="2.6" fill="#f8fafc" />
            <circle cx="30" cy="32" r="1.2" fill="#020617" />
          </g>
        )}

        {species.isMutant && (
          <g>
            <circle cx="48" cy="35" r="2" fill="#f0fdf4" opacity="0.9" />
            <circle cx="64" cy="38" r="1.6" fill={species.model3d?.glowHex || c} />
            <circle cx="78" cy="33" r="2.2" fill="#fef08a" opacity="0.85" />
            {(species.model3d?.eyeCount ?? 2) >= 3 && (
              <circle cx="38" cy="27" r="2" fill="#22d3ee" stroke="#020617" strokeWidth="0.8" />
            )}
          </g>
        )}
      </svg>
    </div>
  );
};

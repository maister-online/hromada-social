import React from 'react';
import { LootItemDef } from '../game/types';

interface ItemIllustrationProps {
  item: LootItemDef;
  className?: string;
}

export const ItemIllustration: React.FC<ItemIllustrationProps> = ({
  item,
  className = 'w-16 h-12',
}) => {
  const c = item.accentColor;

  if (item.iconKey === 'coin') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <circle cx="40" cy="30" r="19" fill="#94a3b8" fillOpacity="0.28" stroke={c} strokeWidth="2.5" />
        <circle cx="40" cy="30" r="14" fill="none" stroke={c} strokeWidth="1.2" strokeDasharray="2 2" />
        <text
          x="40"
          y="35"
          textAnchor="middle"
          fill="#f8fafc"
          fontSize="14"
          fontWeight="bold"
          fontFamily="serif"
        >
          1
        </text>
      </svg>
    );
  }

  if (item.iconKey === 'scrap') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <polygon
          points="16,38 28,17 52,14 64,28 54,46 25,45"
          fill="#78350f"
          fillOpacity="0.72"
          stroke={c}
          strokeWidth="2"
        />
        <line x1="28" y1="22" x2="48" y2="39" stroke="#d6d3d1" strokeWidth="1.6" opacity="0.6" />
        <circle cx="34" cy="31" r="2.8" fill="#1c1917" stroke="#a8a29e" strokeWidth="1" />
        <circle cx="50" cy="25" r="2.2" fill="#1c1917" stroke="#a8a29e" strokeWidth="1" />
      </svg>
    );
  }

  if (item.iconKey === 'gold_chain' || item.iconKey === 'chain') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <g fill="none" stroke={c} strokeWidth="2.6">
          <ellipse cx="24" cy="24" rx="8" ry="5" transform="rotate(-25 24 24)" />
          <ellipse cx="35" cy="31" rx="8" ry="5" transform="rotate(20 35 31)" stroke={item.iconKey === 'gold_chain' ? '#fef08a' : '#cbd5e1'} />
          <ellipse cx="46" cy="29" rx="8" ry="5" transform="rotate(-20 46 29)" />
          <ellipse cx="57" cy="35" rx="8" ry="5" transform="rotate(25 57 35)" stroke={item.iconKey === 'gold_chain' ? '#fef08a' : '#cbd5e1'} />
        </g>
        {item.iconKey === 'gold_chain' && (
          <>
            <circle cx="38" cy="21" r="1.8" fill="#fef9c3" />
            <circle cx="58" cy="23" r="1.4" fill="#fef9c3" />
          </>
        )}
      </svg>
    );
  }

  if (item.iconKey === 'ring') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <circle cx="40" cy="33" r="14" fill="none" stroke={c} strokeWidth="4.5" />
        <polygon points="40,11 47,19 40,24 33,19" fill="#fef08a" stroke={c} strokeWidth="1.5" />
      </svg>
    );
  }

  if (item.iconKey === 'weapon') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <path
          d="M15 22 L62 22 L62 30 L34 30 L28 47 L18 47 L23 30 L15 30 Z"
          fill="#475569"
          stroke={c}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M35 30 C35 37, 43 37, 43 30" fill="none" stroke="#94a3b8" strokeWidth="1.6" />
        <rect x="20" y="24.5" width="35" height="2" fill="#94a3b8" opacity="0.5" />
        <path d="M21 33 L26 44" stroke="#78350f" strokeWidth="2.5" opacity="0.8" />
      </svg>
    );
  }

  if (item.iconKey === 'knife') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <path d="M16 42 L34 32 L58 14 C64 20, 62 26, 40 36 Z" fill="#cbd5e1" stroke={c} strokeWidth="1.8" />
        <rect x="14" y="38" width="16" height="6" rx="2" transform="rotate(-28 22 41)" fill="#78350f" stroke={c} strokeWidth="1.4" />
      </svg>
    );
  }

  if (item.iconKey === 'watch') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <rect x="35" y="7" width="10" height="8" rx="2" fill="#64748b" />
        <rect x="35" y="45" width="10" height="8" rx="2" fill="#64748b" />
        <circle cx="40" cy="30" r="15" fill="#0f172a" stroke={c} strokeWidth="2.4" />
        <line x1="40" y1="30" x2="40" y2="21" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="40" y1="30" x2="47" y2="33" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="40" cy="30" r="2" fill={c} />
      </svg>
    );
  }

  if (item.iconKey === 'compass') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <circle cx="40" cy="12" r="4" fill="none" stroke={c} strokeWidth="2" />
        <circle cx="40" cy="32" r="16" fill="#1e293b" stroke={c} strokeWidth="2.4" />
        <polygon points="40,20 44,32 40,30 36,32" fill="#ef4444" />
        <polygon points="40,44 44,32 40,34 36,32" fill="#cbd5e1" />
      </svg>
    );
  }

  if (item.iconKey === 'horseshoe') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <path
          d="M25 46 C18 32, 22 14, 40 14 C58 14, 62 32, 55 46"
          fill="none"
          stroke={c}
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        <circle cx="25" cy="36" r="1.4" fill="#0f172a" />
        <circle cx="29" cy="22" r="1.4" fill="#0f172a" />
        <circle cx="51" cy="22" r="1.4" fill="#0f172a" />
        <circle cx="55" cy="36" r="1.4" fill="#0f172a" />
      </svg>
    );
  }

  if (item.iconKey === 'detector' || item.iconKey === 'phone' || item.iconKey === 'radio') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        {item.iconKey === 'radio' && <line x1="28" y1="6" x2="28" y2="16" stroke="#cbd5e1" strokeWidth="2" />}
        <rect x="23" y="12" width="34" height="38" rx="5" fill="#064e3b" stroke={c} strokeWidth="2" />
        <rect x="28" y="17" width="24" height="14" rx="2" fill="#022c22" stroke="#6ee7b7" strokeWidth="1.2" />
        <path d="M32 25 L36 22 L40 27 L44 20 L48 25" fill="none" stroke="#34d399" strokeWidth="1.6" />
        <circle cx="35" cy="39" r="3" fill="#fbbf24" />
        <circle cx="45" cy="39" r="3" fill="#ef4444" />
      </svg>
    );
  }

  if (item.iconKey === 'boot') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <path
          d="M27 12 L42 12 L42 36 L57 40 L57 49 L25 49 L25 12 Z"
          fill="#334155"
          stroke={c}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <line x1="25" y1="45" x2="57" y2="45" stroke="#0f172a" strokeWidth="2" />
      </svg>
    );
  }

  if (item.iconKey === 'bottle') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <path
          d="M36 9 L44 9 L44 19 L51 27 L51 49 C51 52 29 52 29 49 L29 27 L36 19 Z"
          fill={c}
          fillOpacity="0.28"
          stroke={c}
          strokeWidth="2"
        />
        <rect x="33" y="32" width="14" height="10" rx="1" fill="#fef3c7" opacity="0.5" />
      </svg>
    );
  }

  if (item.iconKey === 'can') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <rect x="26" y="14" width="28" height="34" rx="4" fill="#475569" stroke={c} strokeWidth="2" />
        <line x1="26" y1="24" x2="54" y2="24" stroke="#94a3b8" strokeWidth="1.4" />
        <line x1="26" y1="38" x2="54" y2="38" stroke="#94a3b8" strokeWidth="1.4" />
      </svg>
    );
  }

  if (item.iconKey === 'tire') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <circle cx="40" cy="30" r="19" fill="#0f172a" stroke={c} strokeWidth="7" />
        <circle cx="40" cy="30" r="8" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
      </svg>
    );
  }

  if (item.iconKey === 'pot' || item.iconKey === 'bucket') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <path d="M25 18 C25 8, 55 8, 55 18" fill="none" stroke="#94a3b8" strokeWidth="1.8" />
        <polygon points="22,20 58,20 52,48 28,48" fill="#475569" stroke={c} strokeWidth="2" />
        <ellipse cx="40" cy="20" rx="18" ry="4" fill="#1e293b" stroke={c} strokeWidth="1.5" />
      </svg>
    );
  }

  if (item.iconKey === 'bicycle') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <circle cx="23" cy="38" r="10" fill="none" stroke={c} strokeWidth="2.5" />
        <circle cx="57" cy="38" r="10" fill="none" stroke={c} strokeWidth="2.5" />
        <path d="M23 38 L37 22 L51 22 L57 38 M37 22 L42 38 L23 38 M42 38 L57 38" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      </svg>
    );
  }

  if (item.iconKey === 'keys') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <circle cx="28" cy="24" r="9" fill="none" stroke={c} strokeWidth="2.5" />
        <path d="M35 28 L57 42 L53 46 M48 37 L44 41" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (item.iconKey === 'net') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <rect x="18" y="14" width="44" height="32" rx="4" fill="none" stroke={c} strokeWidth="2" />
        <path d="M26 14 L26 46 M35 14 L35 46 M45 14 L45 46 M54 14 L54 46 M18 24 L62 24 M18 36 L62 36" stroke="#94a3b8" strokeWidth="1.2" opacity="0.7" />
      </svg>
    );
  }

  if (item.iconKey === 'rod_loot') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <line x1="15" y1="48" x2="65" y2="12" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <circle cx="24" cy="41" r="4" fill="#334155" stroke="#cbd5e1" strokeWidth="1.4" />
      </svg>
    );
  }

  if (item.iconKey === 'reel_loot') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <circle cx="38" cy="30" r="14" fill="#334155" stroke={c} strokeWidth="2.4" />
        <circle cx="38" cy="30" r="6" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.4" />
        <path d="M50 30 L60 22" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (item.iconKey === 'wallet' || item.iconKey === 'safe' || item.iconKey === 'chest') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <rect x="17" y="15" width="46" height="32" rx="4" fill="#334155" stroke={c} strokeWidth="2.4" />
        <rect x="23" y="21" width="34" height="20" rx="2" fill="none" stroke="#94a3b8" strokeWidth="1.2" />
        <circle cx="48" cy="31" r="4" fill="#fbbf24" />
      </svg>
    );
  }

  if (item.iconKey === 'dogtag') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <rect x="26" y="13" width="28" height="36" rx="6" fill="#64748b" stroke={c} strokeWidth="2" />
        <circle cx="40" cy="19" r="2.2" fill="#0f172a" />
        <line x1="31" y1="29" x2="49" y2="29" stroke="#e2e8f0" strokeWidth="1.6" />
        <line x1="31" y1="36" x2="45" y2="36" stroke="#e2e8f0" strokeWidth="1.6" />
      </svg>
    );
  }

  if (item.iconKey === 'documents') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <rect x="23" y="10" width="34" height="40" rx="2" fill="#d6d3d1" stroke={c} strokeWidth="2" />
        <line x1="29" y1="20" x2="51" y2="20" stroke="#334155" strokeWidth="2" />
        <line x1="29" y1="27" x2="51" y2="27" stroke="#334155" strokeWidth="2" />
        <line x1="29" y1="34" x2="44" y2="34" stroke="#334155" strokeWidth="2" />
      </svg>
    );
  }

  if (item.iconKey === 'crystal') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <polygon points="40,5 58,24 48,54 32,54 22,24" fill={c} fillOpacity="0.28" stroke={c} strokeWidth="2.5" />
        <polygon points="40,5 50,24 40,54 30,24" fill={c} fillOpacity="0.45" />
        <line x1="22" y1="24" x2="58" y2="24" stroke="#e0f2fe" strokeWidth="1.2" opacity="0.7" />
      </svg>
    );
  }

  if (item.iconKey === 'amber') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <path
          d="M22,36 C18,22 30,10 46,12 C60,14 66,28 58,42 C50,52 26,50 22,36 Z"
          fill={c}
          fillOpacity="0.65"
          stroke="#fef3c7"
          strokeWidth="2"
        />
        <ellipse cx="36" cy="24" rx="7" ry="4" transform="rotate(-22 36 24)" fill="#fef9c3" opacity="0.55" />
      </svg>
    );
  }

  if (item.iconKey === 'capsule') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <rect x="20" y="16" width="40" height="28" rx="6" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
        <rect x="27" y="21" width="26" height="18" rx="3" fill={c} fillOpacity="0.35" stroke={c} strokeWidth="1.5" />
        <circle cx="40" cy="30" r="4.5" fill={c} />
      </svg>
    );
  }

  if (item.iconKey === 'medkit') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <rect x="18" y="14" width="44" height="34" rx="5" fill="#991b1b" stroke="#fca5a5" strokeWidth="2" />
        <rect x="36" y="21" width="8" height="20" rx="1.5" fill="#fef2f2" />
        <rect x="30" y="27" width="20" height="8" rx="1.5" fill="#fef2f2" />
      </svg>
    );
  }

  if (item.iconKey === 'energy') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <rect x="28" y="10" width="24" height="40" rx="4" fill="#0f172a" stroke={c} strokeWidth="2" />
        <polygon points="43,18 34,31 41,31 37,43 47,29 40,29" fill={c} />
      </svg>
    );
  }

  if (item.iconKey === 'tea') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <rect x="29" y="10" width="22" height="7" rx="2" fill="#065f46" stroke={c} strokeWidth="1.6" />
        <rect x="26" y="17" width="28" height="33" rx="4" fill="#064e3b" stroke={c} strokeWidth="2" />
        <path d="M35 28 C37 24, 43 24, 45 28 C43 32, 37 32, 35 28 Z" fill={c} fillOpacity="0.85" />
        <path d="M40 31 L40 40" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M34 6 Q36 2 39 5" fill="none" stroke="#a7f3d0" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        <path d="M43 6 Q45 2 48 5" fill="none" stroke="#a7f3d0" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      </svg>
    );
  }

  if (item.iconKey === 'canned_food') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <ellipse cx="40" cy="18" rx="20" ry="6" fill="#334155" stroke="#cbd5e1" strokeWidth="1.6" />
        <path d="M20 18 L20 42 C20 46 60 46 60 42 L60 18" fill="#78350f" stroke={c} strokeWidth="2" />
        <rect x="23" y="25" width="34" height="12" rx="1.5" fill={c} fillOpacity="0.32" stroke={c} strokeWidth="1" />
        <line x1="28" y1="31" x2="52" y2="31" stroke="#fef3c7" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (item.iconKey === 'chocolate') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <rect x="18" y="15" width="44" height="30" rx="3" fill="#3b1f16" stroke={c} strokeWidth="2" />
        <line x1="32" y1="15" x2="32" y2="45" stroke="#5c3326" strokeWidth="1.8" />
        <line x1="48" y1="15" x2="48" y2="45" stroke="#5c3326" strokeWidth="1.8" />
        <line x1="18" y1="30" x2="62" y2="30" stroke="#5c3326" strokeWidth="1.8" />
        <polygon points="48,14 63,14 63,28" fill={c} fillOpacity="0.45" />
      </svg>
    );
  }

  if (item.iconKey === 'shell') {
    return (
      <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
        <rect x="20" y="22" width="30" height="16" rx="2" fill="#92400e" stroke="#fcd34d" strokeWidth="1.8" />
        <polygon points="50,23 64,30 50,37" fill="#78716c" stroke="#d6d3d1" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 60" className={className} aria-hidden="true">
      <path d="M16,30 C26,18 50,18 62,28 C52,38 26,40 16,30 Z" fill={c} fillOpacity="0.7" stroke="#fef3c7" strokeWidth="1.8" />
      <circle cx="52" cy="27" r="2.2" fill="#0f172a" />
      <path d="M22,36 C20,44 27,46 29,40" fill="none" stroke="#cbd5e1" strokeWidth="2" />
    </svg>
  );
};

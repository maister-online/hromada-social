import React from 'react';

interface CoatOfArmsProps {
  className?: string;
  size?: number;
}

export const CoatOfArmsIcon: React.FC<CoatOfArmsProps> = ({ className = 'w-8 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      style={size ? { width: size, height: size * 1.2 } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shieldGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="blueField" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        <linearGradient id="greenField" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Silver Crown on Top */}
      <g fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2">
        <rect x="70" y="10" width="60" height="20" rx="2" />
        <path d="M70 10 L65 0 L80 5 L80 10 Z" />
        <path d="M90 10 L100 0 L110 10 Z" />
        <path d="M130 10 L135 0 L120 5 L120 10 Z" />
        {/* Wall brick lines */}
        <line x1="70" y1="20" x2="130" y2="20" />
        <line x1="90" y1="10" x2="90" y2="20" />
        <line x1="110" y1="10" x2="110" y2="20" />
      </g>

      {/* Outer Golden Baroque Frame */}
      <path
        d="M20 50 C20 30, 180 30, 180 50 C195 90, 190 160, 100 230 C10 160, 5 90, 20 50 Z"
        fill="url(#shieldGoldGrad)"
        stroke="#78350f"
        strokeWidth="3"
        filter="url(#goldGlow)"
      />

      {/* Inner Main Shield Area */}
      <path
        d="M32 58 C32 45, 168 45, 168 58 C180 92, 175 150, 100 215 C25 150, 20 92, 32 58 Z"
        fill="#1e293b"
        stroke="#fef08a"
        strokeWidth="2.5"
      />

      {/* Shield Upper Blue Sector */}
      <g>
        <path
          d="M32 58 C32 45, 168 45, 168 58 L32 170 Z"
          fill="url(#blueField)"
        />
        {/* Golden Musket Rifle & Powder Horn Symbol */}
        <g stroke="#fef08a" strokeWidth="2" fill="#f59e0b">
          {/* Musket */}
          <line x1="55" y1="135" x2="125" y2="75" stroke="#fef08a" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M50 140 L60 132 L53 125 Z" fill="#b45309" />
          {/* Powder Horn */}
          <path d="M75 105 C85 90, 100 95, 95 110 C90 120, 80 115, 75 105 Z" fill="#fbbf24" />
        </g>
      </g>

      {/* Shield Lower Green & Yellow Diagonal Stripes Sector */}
      <g>
        <path
          d="M168 58 L32 170 C50 195, 75 210, 100 215 C175 150, 175 92, 168 58 Z"
          fill="url(#greenField)"
        />
        {/* Yellow Curved Diagonal Lines */}
        <path d="M150 72 Q110 130 50 182" stroke="#fef08a" strokeWidth="5" fill="none" />
        <path d="M162 95 Q125 150 72 200" stroke="#fef08a" strokeWidth="5" fill="none" />
        <path d="M168 122 Q140 170 92 210" stroke="#fef08a" strokeWidth="5" fill="none" />
      </g>
    </svg>
  );
};

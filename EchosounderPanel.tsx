import React, { useMemo, useState } from 'react';
import { Anchor, ArrowDownToLine, Compass, Radio, RefreshCw, X } from 'lucide-react';
import {
  FishSizeClass,
  SonarFishBlip,
  getWaterDepthMapGrid,
  getWaterSectorProfile,
  getWaterSpotInfo,
  scanSectorFish,
} from '../game/bathymetry';
import { getWaterDistBoundsForYaw, isWaterSpotValid } from '../game/waterBounds';
import { LocationDef, WeatherType } from '../game/types';

interface EchosounderPanelProps {
  location: LocationDef;
  aimYaw: number;
  targetDistM: number;
  activeCastYaw: number;
  activeCastDistM: number;
  fishingDepthM: number;
  bottomLock: boolean;
  maxCastM: number;
  isLineInWater: boolean;
  canCastNow: boolean;
  timeOfDay: number;
  weather: WeatherType;
  hasGroundbait: boolean;
  onSelectWaterSpot: (yaw: number, distM: number, immediateCast?: boolean) => void;
  onChangeFishingDepth: (depthM: number, lockBottom?: boolean) => void;
  onClose: () => void;
}

const SIZE_META: Record<
  FishSizeClass,
  {
    label: string;
    shortTag: string;
    scalePx: number;
    color: string;
    archStroke: string;
    weightHint: string;
  }
> = {
  small: {
    label: 'Дрібна',
    shortTag: 'S',
    scalePx: 14,
    color: '#86efac',
    archStroke: '#4ade80',
    weightHint: '<1 кг',
  },
  medium: {
    label: 'Середня',
    shortTag: 'M',
    scalePx: 20,
    color: '#fde047',
    archStroke: '#facc15',
    weightHint: '1–4 кг',
  },
  large: {
    label: 'Велика',
    shortTag: 'L',
    scalePx: 27,
    color: '#fb923c',
    archStroke: '#f97316',
    weightHint: '4–10 кг',
  },
  giant: {
    label: 'Гігант',
    shortTag: 'XL',
    scalePx: 34,
    color: '#22d3ee',
    archStroke: '#38bdf8',
    weightHint: '10+ кг',
  },
};

function FishSilhouetteIcon({
  sizePx,
  color,
  isMutant,
}: {
  sizePx: number;
  color: string;
  isMutant?: boolean;
}) {
  const h = Math.round(sizePx * 0.56);
  return (
    <svg
      width={sizePx}
      height={h}
      viewBox="0 0 36 20"
      className="shrink-0 overflow-visible"
      aria-hidden="true"
    >
      <path
        d="M28,10 C22,3 12,3 7,10 C12,17 22,17 28,10 Z"
        fill={color}
        fillOpacity={isMutant ? 0.95 : 0.88}
        stroke="#04100b"
        strokeWidth="1.2"
      />
      <polygon points="7,10 1,5 2.5,10 1,15" fill={color} fillOpacity="0.9" />
      <path d="M16,4.2 L20,1.2 L21.5,5" fill={color} fillOpacity="0.85" />
      <circle cx="24" cy="9" r="1.4" fill="#04100b" />
      {isMutant && (
        <circle cx="24" cy="9" r="3.2" fill="none" stroke="#a5f3fc" strokeWidth="1" opacity="0.85" />
      )}
    </svg>
  );
}

export const EchosounderPanel: React.FC<EchosounderPanelProps> = ({
  location,
  aimYaw,
  targetDistM,
  activeCastYaw,
  activeCastDistM,
  fishingDepthM,
  bottomLock,
  maxCastM,
  isLineInWater,
  canCastNow,
  timeOfDay,
  weather,
  hasGroundbait,
  onSelectWaterSpot,
  onChangeFishingDepth,
  onClose,
}) => {
  const [tab, setTab] = useState<'sonar' | 'water_map'>('sonar');
  const [scanNonce, setScanNonce] = useState(0);
  const [selectedBlipId, setSelectedBlipId] = useState<string | null>(null);

  const inspectYaw = isLineInWater ? activeCastYaw : aimYaw;
  const inspectDist = isLineInWater ? activeCastDistM : targetDistM;

  const sectorWaterBounds = useMemo(
    () => getWaterDistBoundsForYaw(location, inspectYaw, maxCastM),
    [inspectYaw, location, maxCastM]
  );

  const sectorMaxCastM = sectorWaterBounds.hasWater ? sectorWaterBounds.maxDistM : maxCastM;
  const sectorMinCastM = sectorWaterBounds.hasWater ? sectorWaterBounds.minDistM : 4.5;

  const spotInfo = useMemo(
    () => getWaterSpotInfo(location, inspectYaw, inspectDist, maxCastM),
    [inspectDist, inspectYaw, location, maxCastM]
  );

  const profile = useMemo(
    () => getWaterSectorProfile(location, inspectYaw, sectorMaxCastM, 28),
    [inspectYaw, location, sectorMaxCastM]
  );

  const blips = useMemo(
    () =>
      scanSectorFish(
        location,
        inspectYaw,
        sectorMaxCastM,
        timeOfDay,
        weather,
        hasGroundbait,
        scanNonce
      ),
    [hasGroundbait, inspectYaw, location, scanNonce, sectorMaxCastM, timeOfDay, weather]
  );

  const depthGrid = useMemo(
    () => getWaterDepthMapGrid(location, maxCastM, timeOfDay, 13, 8),
    [location, maxCastM, timeOfDay]
  );

  const maxDepthScale = useMemo(() => {
    const rawMax = Math.max(location.depthRangeM[1] + 0.8, 3);
    return Math.ceil(rawMax);
  }, [location.depthRangeM]);

  const depthTicks = useMemo(() => {
    const step = maxDepthScale <= 5 ? 1 : maxDepthScale <= 10 ? 2 : 4;
    const ticks: number[] = [];
    for (let d = 0; d <= maxDepthScale; d += step) {
      ticks.push(d);
    }
    if (ticks[ticks.length - 1] !== maxDepthScale) ticks.push(maxDepthScale);
    return ticks;
  }, [maxDepthScale]);

  const W = 320;
  const H = 165;
  const padL = 8;
  const padR = 34;
  const padT = 14;
  const padB = 20;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const distToX = (d: number) => {
    const t = Math.max(0, Math.min(1, (d - 3) / Math.max(8, sectorMaxCastM - 3)));
    return padL + t * plotW;
  };
  const depthToY = (depth: number) => {
    const t = Math.max(0, Math.min(1, depth / maxDepthScale));
    return padT + t * plotH;
  };

  const bottomPathD = useMemo(() => {
    if (profile.length === 0) return '';
    const pts = profile.map((p) => `${distToX(p.distM).toFixed(1)},${depthToY(p.depthM).toFixed(1)}`);
    const lastX = distToX(profile[profile.length - 1].distM).toFixed(1);
    const firstX = distToX(profile[0].distM).toFixed(1);
    return `M ${firstX},${H - padB} L ${pts.join(' L ')} L ${lastX},${H - padB} Z`;
  }, [profile]);

  const bottomLineD = useMemo(() => {
    if (profile.length === 0) return '';
    return profile
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${distToX(p.distM).toFixed(1)},${depthToY(p.depthM).toFixed(1)}`)
      .join(' ');
  }, [profile]);

  const clampedFishingDepth = Math.min(Math.max(0.4, spotInfo.depthM - 0.1), Math.max(0.4, fishingDepthM));
  const depthRatio = clampedFishingDepth / Math.max(0.8, spotInfo.depthM);
  const depthLayerLabel =
    clampedFishingDepth <= 1.3 || depthRatio <= 0.32
      ? 'Поверхня'
      : depthRatio >= 0.7 || spotInfo.depthM - clampedFishingDepth <= 0.45
        ? 'Біля дна'
        : 'Товща води';

  const markerX = distToX(inspectDist);
  const markerBottomY = depthToY(spotInfo.depthM);
  const hookY = depthToY(clampedFishingDepth);

  // Locate exact cell on 13x8 grid for active cast bobber and aim spot
  let bestBobberCellKey = '';
  if (isLineInWater) {
    let bestScore = Infinity;
    depthGrid.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        const score =
          Math.abs(cell.yaw - activeCastYaw) * 28 + Math.abs(cell.distM - activeCastDistM);
        if (score < bestScore) {
          bestScore = score;
          bestBobberCellKey = `${rIdx}_${cIdx}`;
        }
      });
    });
  }

  let bestAimCellKey = '';
  {
    let bestScore = Infinity;
    depthGrid.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        const score = Math.abs(cell.yaw - aimYaw) * 28 + Math.abs(cell.distM - targetDistM);
        if (score < bestScore) {
          bestScore = score;
          bestAimCellKey = `${rIdx}_${cIdx}`;
        }
      });
    });
  }

  const sectorAngleLabel =
    inspectYaw < -0.3
      ? 'Лівий сектор'
      : inspectYaw > 0.3
        ? 'Правий сектор'
        : 'Центр водойми';

  const selectedBlip: SonarFishBlip | null =
    blips.find((b) => b.id === selectedBlipId) ?? blips[blips.length - 1] ?? null;

  return (
    <div className="pointer-events-auto w-[356px] max-w-[94vw] panel-window rounded-2xl p-3 sm:p-3.5 space-y-2.5 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
              Ехолот · {sectorAngleLabel}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {isLineInWater ? (
              <span className="text-rose-300 font-semibold">
                Поплавок у воді: {activeCastDistM.toFixed(1)} м · {spotInfo.zoneLabel}
              </span>
            ) : (
              `${spotInfo.zoneLabel} · ${spotInfo.bottomLabel}`
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setScanNonce((n) => n + 1)}
            className="btn-tactile btn-field min-w-[38px] min-h-[38px] inline-flex items-center justify-center rounded-lg cursor-pointer"
            title="Оновити імпульс ехолота"
            aria-label="Оновити імпульс ехолота"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-300" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-tactile btn-field min-w-[38px] min-h-[38px] inline-flex items-center justify-center rounded-lg cursor-pointer"
            aria-label="Закрити ехолот"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Tabs + Live Depth Readout */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 bg-[#050b08] border border-white/10 rounded-lg">
          <button
            type="button"
            onClick={() => setTab('sonar')}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              tab === 'sonar'
                ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Профіль глибин
          </button>
          <button
            type="button"
            onClick={() => setTab('water_map')}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              tab === 'water_map'
                ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Карта водойми
          </button>
        </div>

        <div className="text-right font-mono-num">
          <div className="text-xs font-bold text-amber-300">
            Дно {spotInfo.depthM} м · Гачок {clampedFishingDepth.toFixed(1)} м
          </div>
          <div className="text-[10px] text-slate-400">
            Дист. {inspectDist.toFixed(1)} м · {depthLayerLabel}
          </div>
        </div>
      </div>

      {tab === 'sonar' ? (
        <>
          {/* Cross-section Depth & Fish Size Sonar Display (Tap water column to set distance + depth!) */}
          <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-[#03090c]">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto block cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const relX = (e.clientX - rect.left) / rect.width;
                const relY = (e.clientY - rect.top) / rect.height;
                const svgX = relX * W;
                const svgY = relY * H;
                const fracX = Math.max(0, Math.min(1, (svgX - padL) / plotW));
                const rawDist = Number((3 + fracX * Math.max(8, sectorMaxCastM - 3)).toFixed(1));
                const nextDist = Number(
                  Math.max(sectorMinCastM, Math.min(sectorMaxCastM, rawDist)).toFixed(1)
                );
                const fracY = Math.max(0, Math.min(1, (svgY - padT) / plotH));
                const nextSpot = getWaterSpotInfo(location, inspectYaw, nextDist, maxCastM);
                const clickedDepth = Number(
                  Math.max(0.4, Math.min(nextSpot.depthM - 0.1, fracY * maxDepthScale)).toFixed(1)
                );
                onSelectWaterSpot(inspectYaw, nextDist, canCastNow && !isLineInWater);
                onChangeFishingDepth(clickedDepth, false);
              }}
            >
              <defs>
                <linearGradient id="waterColGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f3d4c" stopOpacity="0.72" />
                  <stop offset="45%" stopColor="#082433" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#030b14" stopOpacity="0.96" />
                </linearGradient>
                <linearGradient id="bottomBedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#92400e" stopOpacity="0.95" />
                  <stop offset="35%" stopColor="#451a03" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#140904" stopOpacity="1" />
                </linearGradient>
              </defs>

              <rect x={padL} y={padT} width={plotW} height={plotH} fill="url(#waterColGrad)" />

              {/* Horizontal Depth Grid Lines & Meter Labels */}
              {depthTicks.map((d) => {
                const y = depthToY(d);
                return (
                  <g key={d}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={W - padR}
                      y2={y}
                      stroke="rgba(148, 163, 184, 0.18)"
                      strokeDasharray="2 3"
                    />
                    <text
                      x={W - padR + 5}
                      y={y + 3}
                      fill="#94a3b8"
                      fontSize="8.5"
                      fontFamily="monospace"
                    >
                      {d}м
                    </text>
                  </g>
                );
              })}

              {/* Surface water line */}
              <line
                x1={padL}
                y1={padT}
                x2={W - padR}
                y2={padT}
                stroke="#38bdf8"
                strokeWidth="1.4"
                strokeOpacity="0.75"
              />

              {/* Bottom Terrain Contour */}
              <path d={bottomPathD} fill="url(#bottomBedGrad)" />
              <path
                d={bottomLineD}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Full depth sonar ray */}
              <line
                x1={markerX}
                y1={padT}
                x2={markerX}
                y2={markerBottomY}
                stroke={isLineInWater ? 'rgba(52,211,153,0.35)' : 'rgba(251,191,36,0.35)'}
                strokeWidth="1"
                strokeDasharray="2 3"
              />

              {/* Fishing line from surface bobber down to selected hook depth */}
              <line
                x1={markerX}
                y1={padT}
                x2={markerX}
                y2={hookY}
                stroke={isLineInWater ? '#34d399' : '#fbbf24'}
                strokeWidth="1.8"
              />

              {/* Pulsing Bobber Ripple & Float Marker on Surface */}
              {isLineInWater && (
                <circle
                  cx={markerX}
                  cy={padT}
                  r="8"
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="1.6"
                  className="animate-bobber-ping"
                />
              )}
              <circle
                cx={markerX}
                cy={padT}
                r={isLineInWater ? 4.2 : 3.2}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="1.3"
              />
              {isLineInWater && (
                <text
                  x={Math.min(W - padR - 30, Math.max(padL + 24, markerX))}
                  y={padT - 3.5}
                  textAnchor="middle"
                  fill="#fda4af"
                  fontSize="7.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  ПОПЛАВОК
                </text>
              )}

              {/* Hook / Bait Depth Marker */}
              <circle
                cx={markerX}
                cy={hookY}
                r="3.4"
                fill="#fbbf24"
                stroke="#04100b"
                strokeWidth="1.2"
              />
              <text
                x={markerX + 7}
                y={Math.min(markerBottomY - 4, Math.max(padT + 9, hookY + 3))}
                fill="#fde047"
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {clampedFishingDepth.toFixed(1)}м
              </text>

              {/* Bottom Depth Intersection Dot */}
              <circle cx={markerX} cy={markerBottomY} r="3" fill="#34d399" />

              {/* Fish Sonar Arches + Scaled Visual Silhouettes */}
              {blips.map((b) => {
                const bx = distToX(b.distM);
                const by = depthToY(b.depthM);
                const meta = SIZE_META[b.sizeClass];
                const fw = meta.scalePx * 0.72;
                const fh = fw * 0.48;
                const isSelected = selectedBlip?.id === b.id;

                return (
                  <g
                    key={b.id}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBlipId(b.id);
                      onSelectWaterSpot(inspectYaw, b.distM, false);
                      onChangeFishingDepth(b.depthM, false);
                    }}
                  >
                    <path
                      d={`M ${bx - fw * 0.75} ${by - fh * 0.45} Q ${bx} ${by - fh * 1.45} ${bx + fw * 0.75} ${by - fh * 0.45}`}
                      fill="none"
                      stroke={b.isMutant ? '#22d3ee' : meta.archStroke}
                      strokeWidth={b.sizeClass === 'giant' ? 2.2 : b.sizeClass === 'large' ? 1.8 : 1.3}
                      opacity="0.88"
                    />
                    <path
                      d={`M ${bx + fw * 0.5} ${by} C ${bx + fw * 0.15} ${by - fh * 0.6}, ${bx - fw * 0.25} ${by - fh * 0.45}, ${bx - fw * 0.45} ${by} C ${bx - fw * 0.25} ${by + fh * 0.45}, ${bx + fw * 0.15} ${by + fh * 0.6}, ${bx + fw * 0.5} ${by} Z`}
                      fill={b.isMutant ? '#22d3ee' : meta.color}
                      stroke={isSelected ? '#ffffff' : '#03110c'}
                      strokeWidth={isSelected ? 1.2 : 0.7}
                    />
                    <polygon
                      points={`${bx - fw * 0.42},${by} ${bx - fw * 0.72},${by - fh * 0.42} ${bx - fw * 0.72},${by + fh * 0.42}`}
                      fill={b.isMutant ? '#22d3ee' : meta.color}
                    />
                    {(b.sizeClass === 'large' || b.sizeClass === 'giant' || isSelected) && (
                      <text
                        x={bx}
                        y={by + fh + 7.5}
                        textAnchor="middle"
                        fill={b.isMutant ? '#67e8f9' : meta.color}
                        fontSize="7.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {meta.shortTag} · {b.depthM}м
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Distance axis ticks */}
              {[0, 0.33, 0.66, 1].map((t) => {
                const distVal = Math.round(
                  sectorMinCastM + t * Math.max(4, sectorMaxCastM - sectorMinCastM)
                );
                const tx = padL + t * plotW;
                return (
                  <text
                    key={t}
                    x={tx}
                    y={H - 6}
                    textAnchor={t === 0 ? 'start' : t === 1 ? 'end' : 'middle'}
                    fill="#94a3b8"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    {distVal}м
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Interactive Fishing Depth Control Bar */}
          <div className="bg-[#050c09] border border-white/10 rounded-xl p-2 space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-300 font-semibold">
                Глибина спуску:{' '}
                <span className="font-mono-num text-amber-300">
                  {clampedFishingDepth.toFixed(1)} м
                </span>{' '}
                <span className="text-slate-400">({depthLayerLabel})</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onChangeFishingDepth(Math.max(0.4, Number((clampedFishingDepth - 0.3).toFixed(1))), false)}
                  className="btn-tactile btn-field min-w-[34px] min-h-[32px] rounded-md text-xs font-bold cursor-pointer"
                  aria-label="Підняти гачок вище"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChangeFishingDepth(
                      Math.min(spotInfo.depthM - 0.1, Number((clampedFishingDepth + 0.3).toFixed(1))),
                      false
                    )
                  }
                  className="btn-tactile btn-field min-w-[34px] min-h-[32px] rounded-md text-xs font-bold cursor-pointer"
                  aria-label="Опустити гачок глибше"
                >
                  +
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => onChangeFishingDepth(0.6, false)}
                className={`btn-tactile min-h-[30px] rounded-lg text-[10px] font-semibold cursor-pointer border ${
                  !bottomLock && depthLayerLabel === 'Поверхня'
                    ? 'bg-sky-500/25 border-sky-400/50 text-sky-200'
                    : 'btn-field text-slate-300'
                }`}
              >
                Верх (0.6м)
              </button>
              <button
                type="button"
                onClick={() => onChangeFishingDepth(Number((spotInfo.depthM * 0.5).toFixed(1)), false)}
                className={`btn-tactile min-h-[30px] rounded-lg text-[10px] font-semibold cursor-pointer border ${
                  !bottomLock && depthLayerLabel === 'Товща води'
                    ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-200'
                    : 'btn-field text-slate-300'
                }`}
              >
                Півводи
              </button>
              <button
                type="button"
                onClick={() => onChangeFishingDepth(Number(Math.max(0.4, spotInfo.depthM - 0.1).toFixed(1)), true)}
                className={`btn-tactile min-h-[30px] inline-flex items-center justify-center gap-1 rounded-lg text-[10px] font-semibold cursor-pointer border ${
                  bottomLock || depthLayerLabel === 'Біля дна'
                    ? 'bg-amber-500/25 border-amber-400/50 text-amber-200'
                    : 'btn-field text-slate-300'
                }`}
              >
                <ArrowDownToLine className="w-3 h-3" />
                На дно
              </button>
            </div>
          </div>

          {/* Visual Fish Size Scale Legend */}
          <div className="grid grid-cols-4 gap-1 bg-[#050c09] border border-white/10 rounded-xl px-2 py-1.5">
            {(['small', 'medium', 'large', 'giant'] as FishSizeClass[]).map((sz) => {
              const meta = SIZE_META[sz];
              const count = blips.filter((b) => b.sizeClass === sz).length;
              return (
                <div
                  key={sz}
                  className="flex flex-col items-center justify-end gap-0.5 text-center"
                >
                  <div className="h-5 flex items-center justify-center">
                    <FishSilhouetteIcon
                      sizePx={meta.scalePx}
                      color={meta.color}
                      isMutant={sz === 'giant'}
                    />
                  </div>
                  <div className="text-[10px] leading-tight font-semibold text-slate-200">
                    {meta.label} {count > 0 ? `(${count})` : ''}
                  </div>
                  <div className="text-[9px] font-mono-num text-slate-400">{meta.weightHint}</div>
                </div>
              );
            })}
          </div>

          {/* Selected / Best Sonar Target Info */}
          {selectedBlip && (
            <div className="flex items-center justify-between gap-2 bg-[#07110d] border border-white/10 rounded-xl px-2.5 py-2 text-[11px]">
              <div className="flex items-center gap-2 min-w-0">
                <FishSilhouetteIcon
                  sizePx={SIZE_META[selectedBlip.sizeClass].scalePx}
                  color={selectedBlip.isMutant ? '#22d3ee' : SIZE_META[selectedBlip.sizeClass].color}
                  isMutant={selectedBlip.isMutant}
                />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-100 truncate">
                    {selectedBlip.label} (~{selectedBlip.estWeightKg} кг)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono-num">
                    Глиб. риби {selectedBlip.depthM} м · Дно {selectedBlip.bottomDepthM} м · Дист.{' '}
                    {selectedBlip.distM} м
                  </div>
                </div>
              </div>
              {canCastNow && (
                <button
                  type="button"
                  onClick={() => {
                    onChangeFishingDepth(selectedBlip.depthM, false);
                    onSelectWaterSpot(inspectYaw, selectedBlip.distM, true);
                  }}
                  className="btn-tactile btn-primary-amber px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer"
                >
                  {isLineInWater ? 'Перекинути' : 'Кинути'}
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        /* TOP-DOWN INTERACTIVE WATER BODY MAP SHOWING ACTIVE BOBBER & FULL CASTING */
        <div className="space-y-2">
          <div className="rounded-xl overflow-hidden border border-amber-400/30 bg-[#040c10] p-2 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
              <span>Лівий берег</span>
              <span className="text-emerald-300 font-semibold">Протилежний берег ({maxCastM} м)</span>
              <span>Правий берег</span>
            </div>

            <div className="grid grid-cols-13 gap-0.5">
              {depthGrid.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const cellKey = `${rIdx}_${cIdx}`;
                  const cellInWater = isWaterSpotValid(location, cell.yaw, cell.distM, maxCastM);
                  const isActiveBobberCell =
                    cellInWater && isLineInWater && bestBobberCellKey === cellKey;
                  const isAimCell = cellInWater && !isLineInWater && bestAimCellKey === cellKey;

                  if (!cellInWater) {
                    return (
                      <div
                        key={cellKey}
                        title="Берег / перешкода (поза межами водойми)"
                        className="h-5 rounded-[3px] border border-stone-700/35 bg-[#1b1815]/90 flex items-center justify-center opacity-70 cursor-not-allowed"
                      >
                        <span className="w-1 h-0.5 rounded-full bg-stone-600/60" />
                      </div>
                    );
                  }

                  const bgStyle =
                    cell.depthNorm > 0.75
                      ? 'bg-cyan-900/90 border-cyan-400/35'
                      : cell.depthNorm > 0.52
                        ? 'bg-sky-900/80 border-sky-400/25'
                        : cell.depthNorm > 0.28
                          ? 'bg-teal-900/75 border-teal-500/20'
                          : 'bg-emerald-950/85 border-emerald-500/20';

                  return (
                    <button
                      key={cellKey}
                      type="button"
                      onClick={() => onSelectWaterSpot(cell.yaw, cell.distM, canCastNow)}
                      title={`Дист. ${cell.distM} м · Глибина ${cell.depthM} м`}
                      className={`relative h-5 rounded-[3px] border transition-transform cursor-pointer flex items-center justify-center hover:scale-110 hover:z-10 ${bgStyle} ${
                        isActiveBobberCell
                          ? 'ring-2 ring-rose-400 z-20 scale-115'
                          : isAimCell
                            ? 'ring-2 ring-amber-400 z-10 scale-110'
                            : ''
                      }`}
                    >
                      {cell.hasFishCluster && !isActiveBobberCell && (
                        <span
                          className={`rounded-full ${
                            cell.clusterSize === 'giant'
                              ? 'w-2 h-2 bg-cyan-300'
                              : cell.clusterSize === 'large'
                                ? 'w-1.5 h-1.5 bg-amber-300'
                                : 'w-1 h-1 bg-emerald-300'
                          }`}
                        />
                      )}
                      {isActiveBobberCell && (
                        <span className="relative flex items-center justify-center">
                          <span className="absolute w-4 h-4 rounded-full bg-rose-400/55 animate-ping" />
                          <span className="relative w-2.5 h-2.5 rounded-full bg-rose-500 border border-white shadow" />
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-amber-300 font-semibold">
              <Compass className="w-3 h-3" />
              <span>
                {isLineInWater
                  ? 'Червона мітка — поплавок · Темні зони — берег/скелі (недоступні)'
                  : 'Ваш поміст · Торкніться води (темні клітинки — берег/перешкода)'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px] px-1">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-950 border border-emerald-500/40" />
                Мілина
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-900 border border-sky-400/40" />
                Бровка
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
                Поплавок
              </span>
            </div>
            {canCastNow && (
              <button
                type="button"
                onClick={() => onSelectWaterSpot(aimYaw, targetDistM, true)}
                className="btn-tactile btn-primary-amber inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer"
              >
                <Anchor className="w-3 h-3" />
                {isLineInWater ? `Перекинути (${targetDistM.toFixed(0)} м)` : `Закинути (${targetDistM.toFixed(0)} м)`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

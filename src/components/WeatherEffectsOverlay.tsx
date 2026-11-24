import React, { useEffect, useRef } from 'react';
import { WeatherType } from '../game/types';

interface WeatherEffectsOverlayProps {
  weather: WeatherType;
  timeOfDay: number;
  anomalyActivity: number;
  sanity?: number;
  isPhotoMode?: boolean;
}

interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
  layer: number;
}

interface WaterSplash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface AnomalySpore {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  hue: 'emerald' | 'cyan' | 'violet' | 'amber';
}

export const WeatherEffectsOverlay: React.FC<WeatherEffectsOverlayProps> = ({
  weather,
  timeOfDay,
  anomalyActivity,
  sanity = 100,
  isPhotoMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isDuskOrNight = timeOfDay >= 18 || timeOfDay <= 6.2;
  const highAnomalySpot = anomalyActivity >= 55;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particle pools depending on weather
    const rainCount = weather === 'rain' ? (width < 640 ? 95 : 155) : 0;
    const drops: RainDrop[] = Array.from({ length: rainCount }, () => ({
      x: Math.random() * (width + 180) - 90,
      y: Math.random() * height,
      len: 16 + Math.random() * 24,
      speed: 620 + Math.random() * 440,
      alpha: 0.16 + Math.random() * 0.28,
      layer: Math.random(),
    }));

    const splashes: WaterSplash[] = [];

    const sporeCount =
      weather === 'anomaly_surge'
        ? width < 640
          ? 42
          : 72
        : weather === 'fog'
          ? 16
          : isDuskOrNight || highAnomalySpot
            ? 20
            : 8;

    const spores: AnomalySpore[] = Array.from({ length: sporeCount }, () => {
      const r = Math.random();
      const hue: AnomalySpore['hue'] =
        weather === 'anomaly_surge'
          ? r < 0.42
            ? 'cyan'
            : r < 0.78
              ? 'emerald'
              : 'violet'
          : highAnomalySpot
            ? r < 0.5
              ? 'emerald'
              : 'cyan'
            : 'amber';
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 22,
        vy:
          weather === 'anomaly_surge'
            ? -18 - Math.random() * 34
            : -6 - Math.random() * 14,
        radius: weather === 'anomaly_surge' ? 1.8 + Math.random() * 3.4 : 1.4 + Math.random() * 2.1,
        phase: Math.random() * Math.PI * 2,
        hue,
      };
    });

    let last = performance.now();
    let lightningFlash = 0;
    let nextLightningIn = 4 + Math.random() * 7;
    let arcTimer = 1.6 + Math.random() * 2.6;
    let activeArc: { x1: number; y1: number; x2: number; y2: number; ttl: number } | null = null;

    const drawFrame = (now: number) => {
      const dt = prefersReducedMotion ? 0 : Math.min((now - last) / 1000, 0.05);
      last = now;

      ctx.clearRect(0, 0, width, height);

      // RAIN: multi-layer angled rain streaks + water surface impact rings + occasional distant flash
      if (weather === 'rain') {
        if (!prefersReducedMotion) {
          nextLightningIn -= dt;
          if (nextLightningIn <= 0) {
            lightningFlash = 0.22;
            nextLightningIn = 7 + Math.random() * 11;
          }
          if (lightningFlash > 0) {
            ctx.fillStyle = `rgba(186, 230, 253, ${lightningFlash * 0.45})`;
            ctx.fillRect(0, 0, width, height);
            lightningFlash = Math.max(0, lightningFlash - dt * 1.4);
          }
        }

        ctx.lineCap = 'round';
        for (let i = 0; i < drops.length; i++) {
          const d = drops[i];
          if (!prefersReducedMotion) {
            d.y += d.speed * (0.7 + d.layer * 0.5) * dt;
            d.x -= d.speed * 0.17 * dt;
            if (d.y > height + 30) {
              d.y = -30 - Math.random() * 40;
              d.x = Math.random() * (width + 200) - 40;
            }
            // Spawn splash ring in the water zone (lower 44% of screen)
            if (d.y > height * 0.58 && d.y < height * 0.92 && Math.random() < 0.035 && splashes.length < 36) {
              splashes.push({
                x: d.x,
                y: d.y,
                radius: 2,
                maxRadius: 9 + Math.random() * 12,
                alpha: 0.34,
              });
            }
          }

          ctx.strokeStyle = `rgba(203, 213, 225, ${d.alpha})`;
          ctx.lineWidth = 0.8 + d.layer * 0.7;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.len * 0.17, d.y + d.len);
          ctx.stroke();
        }

        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          s.radius += dt * 24;
          s.alpha -= dt * 0.65;
          if (s.alpha <= 0 || s.radius >= s.maxRadius) {
            splashes.splice(i, 1);
            continue;
          }
          ctx.strokeStyle = `rgba(186, 230, 253, ${s.alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.radius, s.radius * 0.34, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ANOMALY SURGE / TWILIGHT FIREFLIES / FOG PARTICLES
      const t = now * 0.001;
      for (let i = 0; i < spores.length; i++) {
        const sp = spores[i];
        if (!prefersReducedMotion) {
          sp.x += (sp.vx + Math.sin(t * 1.4 + sp.phase) * 12) * dt;
          sp.y += sp.vy * dt;
          if (sp.y < -15) {
            sp.y = height + 15;
            sp.x = Math.random() * width;
          }
          if (sp.x < -15) sp.x = width + 15;
          if (sp.x > width + 15) sp.x = -15;
        }

        const pulse = 0.45 + 0.55 * Math.sin(t * 2.8 + sp.phase);
        const alpha =
          weather === 'anomaly_surge'
            ? 0.35 + pulse * 0.48
            : weather === 'fog'
              ? 0.12 + pulse * 0.18
              : 0.22 + pulse * 0.42;

        const rgb =
          sp.hue === 'cyan'
            ? '34, 211, 238'
            : sp.hue === 'emerald'
              ? '52, 211, 153'
              : sp.hue === 'violet'
                ? '192, 132, 252'
                : '251, 191, 36';

        const grad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sp.radius * 4.2);
        grad.addColorStop(0, `rgba(${rgb}, ${alpha})`);
        grad.addColorStop(0.4, `rgba(${rgb}, ${alpha * 0.45})`);
        grad.addColorStop(1, `rgba(${rgb}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius * 4.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Occasional subtle anomalous electrical discharge arc near horizon/water during anomaly_surge
      if (weather === 'anomaly_surge' && !prefersReducedMotion) {
        arcTimer -= dt;
        if (arcTimer <= 0) {
          const x1 = width * (0.15 + Math.random() * 0.7);
          const y1 = height * (0.28 + Math.random() * 0.34);
          activeArc = {
            x1,
            y1,
            x2: x1 + (Math.random() - 0.5) * 140,
            y2: y1 + 35 + Math.random() * 75,
            ttl: 0.18,
          };
          arcTimer = 2.1 + Math.random() * 3.4;
        }

        if (activeArc) {
          activeArc.ttl -= dt;
          if (activeArc.ttl <= 0) {
            activeArc = null;
          } else {
            const a = activeArc.ttl / 0.18;
            const mx = (activeArc.x1 + activeArc.x2) / 2 + (Math.random() - 0.5) * 28;
            const my = (activeArc.y1 + activeArc.y2) / 2 + (Math.random() - 0.5) * 20;
            ctx.strokeStyle = `rgba(103, 232, 249, ${a * 0.55})`;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(activeArc.x1, activeArc.y1);
            ctx.lineTo(mx, my);
            ctx.lineTo(activeArc.x2, activeArc.y2);
            ctx.stroke();
          }
        }
      }

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    rafId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [weather, isDuskOrNight, highAnomalySpot]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden select-none">
      {/* RAIN: overcast dim atmospheric grade */}
      {weather === 'rain' && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: isPhotoMode
              ? 'linear-gradient(180deg, rgba(12, 22, 34, 0.34) 0%, rgba(15, 28, 38, 0.18) 55%, rgba(8, 16, 22, 0.28) 100%)'
              : 'linear-gradient(180deg, rgba(15, 23, 34, 0.24) 0%, rgba(15, 23, 34, 0.08) 65%, rgba(6, 11, 16, 0.22) 100%)',
          }}
        />
      )}

      {/* FOG: multi-layered animated drifting volumetric mist (works on both 3D & Tomashgorod photo) */}
      {weather === 'fog' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: isPhotoMode
                ? 'linear-gradient(180deg, rgba(203, 219, 215, 0.26) 0%, rgba(169, 193, 187, 0.34) 48%, rgba(24, 38, 34, 0.22) 100%)'
                : 'linear-gradient(180deg, rgba(168, 190, 185, 0.18) 0%, rgba(148, 174, 168, 0.28) 52%, rgba(15, 28, 24, 0.18) 100%)',
            }}
          />
          <div
            className="animate-fog-a absolute -inset-x-[15%] top-[8%] h-[58%] opacity-75"
            style={{
              background:
                'radial-gradient(ellipse 46% 36% at 28% 52%, rgba(214, 232, 226, 0.34), transparent 72%), radial-gradient(ellipse 48% 38% at 74% 44%, rgba(196, 220, 214, 0.30), transparent 74%)',
            }}
          />
          <div
            className="animate-fog-b absolute -inset-x-[18%] bottom-[4%] h-[52%] opacity-80"
            style={{
              background:
                'radial-gradient(ellipse 52% 40% at 38% 55%, rgba(206, 226, 220, 0.32), transparent 72%), radial-gradient(ellipse 44% 34% at 80% 60%, rgba(186, 212, 206, 0.28), transparent 70%)',
            }}
          />
        </>
      )}

      {/* ANOMALY SURGE: shimmering bioluminescent Polissia rift glow */}
      {weather === 'anomaly_surge' && (
        <>
          <div
            className="animate-anomaly-shimmer absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 65% 42% at 50% 24%, rgba(34, 211, 238, 0.22), transparent 72%), radial-gradient(ellipse 75% 45% at 22% 72%, rgba(16, 185, 129, 0.18), transparent 72%), radial-gradient(ellipse 65% 40% at 82% 68%, rgba(168, 85, 247, 0.16), transparent 72%)',
            }}
          />
          <div
            className="animate-fog-a absolute inset-x-0 top-[30%] h-[36%] opacity-65"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(45, 212, 191, 0.16) 32%, rgba(56, 189, 248, 0.22) 55%, rgba(167, 139, 250, 0.14) 78%, transparent 100%)',
            }}
          />
        </>
      )}

      {/* CLEAR: subtle warm sun/twilight atmospheric glow */}
      {weather === 'clear' && (
        <div
          className="absolute inset-0"
          style={{
            background: isDuskOrNight
              ? 'radial-gradient(ellipse 70% 45% at 50% 10%, rgba(245, 158, 11, 0.10), transparent 72%)'
              : 'radial-gradient(ellipse 75% 48% at 55% 6%, rgba(254, 240, 199, 0.11), transparent 70%)',
          }}
        />
      )}

      {/* Low-Sanity Peripheral Vignette */}
      {sanity < 50 && (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: Math.min(0.88, ((50 - sanity) / 50) * 0.85),
            background:
              sanity <= 25
                ? 'radial-gradient(ellipse 68% 60% at 50% 50%, transparent 42%, rgba(88, 28, 135, 0.34) 78%, rgba(69, 10, 24, 0.72) 100%)'
                : 'radial-gradient(ellipse 72% 64% at 50% 50%, transparent 48%, rgba(49, 46, 129, 0.28) 82%, rgba(15, 23, 42, 0.56) 100%)',
          }}
        />
      )}

      {/* Live animated weather canvas (raindrops, water splashes, drifting anomaly spores, fireflies) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { RobotState } from '../../types';
import aiFaceImage from '../../assets/images/ai_face_avatar_1786181092852.jpg';

interface AIAvatarProps {
  state?: RobotState;
  size?: number;
  interactive?: boolean;
  onAvatarClick?: () => void;
  isSpeaking?: boolean;
  usePhotoTexture?: boolean;
}

export const AIAvatar: React.FC<AIAvatarProps> = ({
  state = 'idle',
  size = 180,
  interactive = true,
  onAvatarClick,
  isSpeaking = false,
  usePhotoTexture = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [blinkProgress, setBlinkProgress] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(0);

  // Animate mouth when speaking
  useEffect(() => {
    if (state === 'speaking' || isSpeaking) {
      const mouthInterval = setInterval(() => {
        setMouthOpen(Math.random() * 0.8 + 0.2);
      }, 120);
      return () => clearInterval(mouthInterval);
    } else {
      setMouthOpen(0);
    }
  }, [state, isSpeaking]);

  // Periodic blinking
  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setBlinkProgress(1);
      setTimeout(() => setBlinkProgress(0), 180);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(blinkTimer);
  }, []);

  // Canvas rendering mode fallback
  useEffect(() => {
    if (usePhotoTexture) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const headRadius = size * 0.32;

      const headOffsetY = Math.sin(time * 1.5) * 3;
      const headOffsetX = Math.cos(time * 1.2) * 2;

      const currentHeadX = cx + headOffsetX;
      const currentHeadY = cy + headOffsetY;

      ctx.save();

      let auraColor = 'rgba(6, 182, 212, 0.25)';
      let innerGlow = '#06b6d4';

      if (state === 'thinking') {
        auraColor = 'rgba(168, 85, 247, 0.35)';
        innerGlow = '#a855f7';
      } else if (state === 'speaking' || isSpeaking) {
        auraColor = 'rgba(16, 185, 129, 0.35)';
        innerGlow = '#10b981';
      }

      ctx.beginPath();
      ctx.arc(cx, cy, headRadius * 1.35 + Math.sin(time * 2) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = auraColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);
      ctx.lineDashOffset = -time * 10;
      ctx.stroke();

      ctx.restore();

      ctx.save();
      ctx.translate(currentHeadX, currentHeadY);

      const skullGrad = ctx.createLinearGradient(-headRadius, -headRadius, headRadius, headRadius);
      skullGrad.addColorStop(0, '#1e293b');
      skullGrad.addColorStop(0.5, '#0f172a');
      skullGrad.addColorStop(1, '#020617');

      ctx.beginPath();
      ctx.moveTo(0, -headRadius * 1.1);
      ctx.bezierCurveTo(headRadius * 0.8, -headRadius * 1.1, headRadius * 0.85, -headRadius * 0.2, headRadius * 0.75, headRadius * 0.4);
      ctx.lineTo(headRadius * 0.45, headRadius * 1.05);
      ctx.lineTo(-headRadius * 0.45, headRadius * 1.05);
      ctx.lineTo(-headRadius * 0.75, headRadius * 0.4);
      ctx.bezierCurveTo(-headRadius * 0.85, -headRadius * 0.2, -headRadius * 0.8, -headRadius * 1.1, 0, -headRadius * 1.1);
      ctx.closePath();

      ctx.fillStyle = skullGrad;
      ctx.shadowColor = innerGlow;
      ctx.shadowBlur = 15;
      ctx.fill();

      ctx.strokeStyle = innerGlow;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const eyeWidth = headRadius * 0.28;
      const eyeHeight = headRadius * 0.14;
      const leftEyeX = -headRadius * 0.32;
      const rightEyeX = headRadius * 0.32;
      const eyeY = -headRadius * 0.15;

      [leftEyeX, rightEyeX].forEach((ex) => {
        ctx.beginPath();
        ctx.ellipse(ex, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#090d16';
        ctx.fill();
        ctx.strokeStyle = innerGlow;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (blinkProgress < 0.5) {
          const gazeX = Math.sin(time) * 2;
          const gazeY = Math.cos(time * 0.8) * 1.5;

          ctx.beginPath();
          ctx.arc(ex + gazeX, eyeY + gazeY, eyeHeight * 0.65, 0, Math.PI * 2);
          ctx.fillStyle = innerGlow;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(ex + gazeX - 1.5, eyeY + gazeY - 1.5, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      });

      const mouthY = headRadius * 0.55;
      const defaultMouthWidth = headRadius * 0.32;
      const currentMouthHeight = mouthOpen * 16;

      ctx.beginPath();
      if (mouthOpen > 0.1) {
        ctx.ellipse(0, mouthY, defaultMouthWidth * 0.8, Math.max(2, currentMouthHeight), 0, 0, Math.PI * 2);
        ctx.fillStyle = '#020617';
        ctx.fill();
        ctx.strokeStyle = innerGlow;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.moveTo(-defaultMouthWidth, mouthY);
        ctx.quadraticCurveTo(0, mouthY, defaultMouthWidth, mouthY);
        ctx.strokeStyle = innerGlow;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, state, blinkProgress, mouthOpen, isSpeaking, usePhotoTexture]);

  if (usePhotoTexture) {
    return (
      <div
        onClick={interactive ? onAvatarClick : undefined}
        className={`relative inline-flex flex-col items-center justify-center select-none ${
          interactive ? 'cursor-pointer group' : ''
        }`}
        title="Машуня AI Assistant"
      >
        <div
          style={{ width: size, height: size }}
          className="relative rounded-full overflow-hidden border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all duration-300 group-hover:scale-105"
        >
          {/* Base Face Image Texture of Mashunya */}
          <img
            src={aiFaceImage}
            alt="AI Face Mashunya"
            className="w-full h-full object-cover rounded-full filter contrast-[106%] brightness-[104%]"
            referrerPolicy="no-referrer"
          />

          {/* Clean Subtle Cyan Glow Gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-blue-500/10 mix-blend-overlay pointer-events-none" />

          {/* Audio Wave / Speaking Animation Overlay */}
          {(state === 'speaking' || isSpeaking) && (
            <div className="absolute inset-0 border-2 border-emerald-400 rounded-full animate-ping opacity-70 pointer-events-none" />
          )}

          {state === 'listening' && (
            <div className="absolute inset-0 border-2 border-rose-500 rounded-full animate-pulse opacity-80 pointer-events-none" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={interactive ? onAvatarClick : undefined}
      className={`relative inline-flex flex-col items-center justify-center select-none ${
        interactive ? 'cursor-pointer group' : ''
      }`}
      title="Машуня AI Assistant"
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="transform transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
};

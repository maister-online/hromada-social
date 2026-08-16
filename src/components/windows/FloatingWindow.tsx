import React, { useState, useRef, useEffect } from 'react';
import { useWindowContext } from '../../context/WindowContext';
import { Minus, Square, X, Move } from 'lucide-react';

interface FloatingWindowProps {
  id: string;
  title: string;
  iconName?: string;
  children: React.ReactNode;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  id,
  title,
  children,
  initialX,
  initialY,
  initialWidth,
  initialHeight,
  isMinimized,
  isMaximized,
  zIndex
}) => {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    bringToFront,
    updatePosition,
    updateSize,
    activeWindowId
  } = useWindowContext();

  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: initialX, posY: initialY });
  const resizeStartRef = useRef({ x: 0, y: 0, width: initialWidth, height: initialHeight });

  const isFocused = activeWindowId === id;

  // Dragging logic
  const handleMouseDownHeader = (e: React.MouseEvent) => {
    if (isMaximized) return;
    bringToFront(id);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: pos.x,
      posY: pos.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const newX = Math.max(10, Math.min(window.innerWidth - size.width - 10, dragStartRef.current.posX + dx));
        const newY = Math.max(50, Math.min(window.innerHeight - 100, dragStartRef.current.posY + dy));
        setPos({ x: newX, y: newY });
      } else if (isResizing) {
        const dw = e.clientX - resizeStartRef.current.x;
        const dh = e.clientY - resizeStartRef.current.y;
        const newWidth = Math.max(320, Math.min(window.innerWidth - pos.x - 20, resizeStartRef.current.width + dw));
        const newHeight = Math.max(240, Math.min(window.innerHeight - pos.y - 60, resizeStartRef.current.height + dh));
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        updatePosition(id, pos.x, pos.y);
      }
      if (isResizing) {
        setIsResizing(false);
        updateSize(id, size.width, size.height);
      }
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, pos, size, id]);

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    bringToFront(id);
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };
  };

  if (isMinimized) return null;

  const windowStyle: React.CSSProperties = isMaximized
    ? {
        position: 'fixed',
        top: 52,
        left: 0,
        right: 0,
        bottom: 48,
        width: '100vw',
        height: 'calc(100vh - 100px)',
        zIndex
      }
    : {
        position: 'fixed',
        top: `${pos.y}px`,
        left: `${pos.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex
      };

  return (
    <div
      onClick={() => bringToFront(id)}
      style={windowStyle}
      className={`rounded-2xl flex flex-col overflow-hidden transition-shadow duration-200 border ${
        isFocused
          ? 'bg-slate-950/90 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/30'
          : 'bg-slate-950/80 border-slate-800 shadow-2xl opacity-95'
      } backdrop-blur-2xl animate-fadeIn`}
    >
      {/* Gothic Title Bar */}
      <div
        onMouseDown={handleMouseDownHeader}
        className={`px-4 py-2.5 flex items-center justify-between border-b select-none cursor-grab active:cursor-grabbing ${
          isFocused
            ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border-cyan-500/30 text-white'
            : 'bg-slate-900/90 border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2.5 text-xs font-bold tracking-wide">
          <Move className="w-3.5 h-3.5 text-cyan-400 opacity-70" />
          <span className="truncate max-w-[280px]">{title}</span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1.5 shrink-0" onMouseDown={e => e.stopPropagation()}>
          <button
            onClick={() => minimizeWindow(id)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Згорнути"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => maximizeWindow(id)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Розгорнути"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => closeWindow(id)}
            className="p-1 rounded-lg hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 transition-colors"
            title="Закрити"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Body Container */}
      <div className="flex-1 overflow-auto p-4 relative scrollbar-thin text-slate-100">
        {children}
      </div>

      {/* Corner Resize Handle */}
      {!isMaximized && (
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
        >
          <div className="w-2 h-2 border-r-2 border-b-2 border-cyan-400 rounded-br-sm" />
        </div>
      )}
    </div>
  );
};

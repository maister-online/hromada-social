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

const MOBILE_BREAKPOINT = 640;
const MOBILE_GAP = 8;
const MOBILE_TOP = 8;
const MOBILE_BOTTOM = 8;

export const FloatingWindow: React.FC<FloatingWindowProps> = ({ id, title, children, initialX, initialY, initialWidth, initialHeight, isMinimized, isMaximized, zIndex }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, bringToFront, updatePosition, updateSize, activeWindowId } = useWindowContext();
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT);
  const dragStartRef = useRef({ x: 0, y: 0, posX: initialX, posY: initialY });
  const resizeStartRef = useRef({ x: 0, y: 0, width: initialWidth, height: initialHeight });
  const isFocused = activeWindowId === id;

  useEffect(() => {
    const handleViewportChange = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) {
        const width = Math.max(280, window.innerWidth - MOBILE_GAP * 2);
        const height = Math.max(240, window.innerHeight - MOBILE_TOP - MOBILE_BOTTOM);
        setPos({ x: MOBILE_GAP, y: MOBILE_TOP });
        setSize({ width, height });
      }
    };
    handleViewportChange();
    window.addEventListener('resize', handleViewportChange);
    return () => window.removeEventListener('resize', handleViewportChange);
  }, []);

  const handleMouseDownHeader = (e: React.MouseEvent) => {
    if (isMaximized || isMobile) return;
    bringToFront(id);
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const newX = Math.max(10, Math.min(window.innerWidth - size.width - 10, dragStartRef.current.posX + dx));
        const newY = Math.max(50, Math.min(window.innerHeight - 100, dragStartRef.current.posY + dy));
        setPos({ x: newX, y: newY });
      } else if (isResizing && !isMobile) {
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
  }, [isDragging, isResizing, pos, size, id, isMobile, updatePosition, updateSize]);

  const handleMouseDownResize = (e: React.MouseEvent) => {
    if (isMobile) return;
    e.stopPropagation();
    bringToFront(id);
    setIsResizing(true);
    resizeStartRef.current = { x: e.clientX, y: e.clientY, width: size.width, height: size.height };
  };

  if (isMinimized) return null;

  const mobileStyle: React.CSSProperties = isMobile && !isMaximized ? {
    position: 'fixed',
    top: '8px',
    left: '8px',
    width: 'calc(100vw - 16px)',
    maxWidth: 'calc(100vw - 16px)',
    height: 'calc(100dvh - 16px)',
    maxHeight: 'calc(100dvh - 16px)',
    zIndex,
  } : {};

  const windowStyle: React.CSSProperties = isMaximized ? {
    position: 'fixed', top: 52, left: 0, right: 0, bottom: 48,
    width: '100vw', height: 'calc(100vh - 100px)', zIndex
  } : isMobile ? mobileStyle : {
    position: 'fixed', top: `${pos.y}px`, left: `${pos.x}px`,
    width: `${size.width}px`, height: `${size.height}px`, zIndex
  };

  return (
    <div onClick={() => bringToFront(id)} style={windowStyle} className={`rounded-2xl flex flex-col overflow-hidden transition-shadow duration-200 border ${isFocused ? 'bg-slate-950/90 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/30' : 'bg-slate-950/80 border-slate-800 shadow-2xl opacity-95'} backdrop-blur-2xl animate-fadeIn`}>
      <div onMouseDown={handleMouseDownHeader} className={`px-3 sm:px-4 py-2.5 flex items-center justify-between border-b select-none ${isMobile ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${isFocused ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border-cyan-500/30 text-white' : 'bg-slate-900/90 border-slate-800 text-slate-300'}`}>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wide min-w-0 flex-1"><Move className={`w-3.5 h-3.5 text-cyan-400 opacity-70 shrink-0 ${isMobile ? 'hidden' : ''}`} /><span className="truncate max-w-[calc(100vw-120px)] sm:max-w-[280px]">{title}</span></div>
        <div className="flex items-center gap-1 shrink-0" onMouseDown={e => e.stopPropagation()}>
          <button onClick={() => minimizeWindow(id)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Згорнути"><Minus className="w-3.5 h-3.5" /></button>
          {!isMobile && <button onClick={() => maximizeWindow(id)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Розгорнути"><Square className="w-3.5 h-3.5" /></button>}
          <button onClick={() => closeWindow(id)} className="p-1.5 rounded-lg hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 transition-colors" title="Закрити"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 relative scrollbar-thin text-slate-100">{children}</div>
      {!isMaximized && !isMobile && <div onMouseDown={handleMouseDownResize} className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"><div className="w-2 h-2 border-r-2 border-b-2 border-cyan-400 rounded-br-sm" /></div>}
    </div>
  );
};

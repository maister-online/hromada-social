import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WindowInstance } from '../types';

interface WindowContextType {
  windows: WindowInstance[];
  openWindow: (config: {
    id: string;
    title: string;
    iconName?: string;
    component: ReactNode;
    initialSize?: { width: number; height: number };
    initialPosition?: { x: number; y: number };
  }) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  updateSize: (id: string, width: number, height: number) => void;
  activeWindowId: string | null;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

let nextZIndex = 100;

export const WindowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  const openWindow = ({
    id,
    title,
    iconName,
    component,
    initialSize = { width: 720, height: 540 },
    initialPosition
  }: {
    id: string;
    title: string;
    iconName?: string;
    component: ReactNode;
    initialSize?: { width: number; height: number };
    initialPosition?: { x: number; y: number };
  }) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      nextZIndex += 1;

      if (existing) {
        setActiveWindowId(id);
        return prev.map(w =>
          w.id === id
            ? { ...w, isMinimized: false, zIndex: nextZIndex }
            : w
        );
      }

      // Calculate staggered position if not provided
      const offset = (prev.length % 5) * 28;
      const xPos = initialPosition ? initialPosition.x : Math.max(20, Math.min(window.innerWidth - initialSize.width - 40, 80 + offset));
      const yPos = initialPosition ? initialPosition.y : Math.max(60, Math.min(window.innerHeight - initialSize.height - 80, 70 + offset));

      const newWindow: WindowInstance = {
        id,
        title,
        iconName,
        component,
        position: { x: xPos, y: yPos },
        size: initialSize,
        isMinimized: false,
        isMaximized: false,
        zIndex: nextZIndex
      };

      setActiveWindowId(id);
      return [...prev, newWindow];
    });
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      )
    );
  };

  const bringToFront = (id: string) => {
    nextZIndex += 1;
    setWindows(prev =>
      prev.map(w =>
        w.id === id
          ? { ...w, isMinimized: false, zIndex: nextZIndex }
          : w
      )
    );
    setActiveWindowId(id);
  };

  const updatePosition = (id: string, x: number, y: number) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, position: { x, y } } : w))
    );
  };

  const updateSize = (id: string, width: number, height: number) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, size: { width, height } } : w))
    );
  };

  return (
    <WindowContext.Provider
      value={{
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        bringToFront,
        updatePosition,
        updateSize,
        activeWindowId
      }}
    >
      {children}
    </WindowContext.Provider>
  );
};

export const useWindowContext = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindowContext must be used within a WindowProvider');
  }
  return context;
};

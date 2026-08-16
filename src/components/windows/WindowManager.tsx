import React from 'react';
import { useWindowContext } from '../../context/WindowContext';
import { FloatingWindow } from './FloatingWindow';

export const WindowManager: React.FC = () => {
  const { windows } = useWindowContext();

  return (
    <>
      {windows.map(win => (
        <FloatingWindow
          key={win.id}
          id={win.id}
          title={win.title}
          iconName={win.iconName}
          initialX={win.position.x}
          initialY={win.position.y}
          initialWidth={win.size.width}
          initialHeight={win.size.height}
          isMinimized={win.isMinimized}
          isMaximized={win.isMaximized}
          zIndex={win.zIndex}
        >
          {win.component}
        </FloatingWindow>
      ))}
    </>
  );
};

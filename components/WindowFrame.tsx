import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { WindowState } from '../types';

interface WindowFrameProps {
  windowState: WindowState;
  isActive: boolean;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    onFocus(windowState.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - windowState.position.x,
      y: e.clientY - windowState.position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onMove(windowState.id, e.clientX - dragOffset.x, e.clientY - dragOffset.y);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, windowState.id, onMove]);

  if (windowState.isMinimized) return null;

  const style: React.CSSProperties = windowState.isMaximized
    ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)', transform: 'none' }
    : {
        top: windowState.position.y,
        left: windowState.position.x,
        width: windowState.size.width,
        height: windowState.size.height,
      };

  return (
    <div
      ref={windowRef}
      style={{ ...style, zIndex: windowState.zIndex }}
      className={`absolute flex flex-col rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
        isDragging ? 'shadow-cyan-500/10 cursor-grabbing' : ''
      } ${
        isActive 
          ? 'bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-black/50' 
          : 'bg-slate-900/60 backdrop-blur-sm border border-slate-700/30 opacity-90 shadow-none'
      }`}
      onMouseDown={() => onFocus(windowState.id)}
    >
      {/* Title Bar */}
      <div
        className={`h-10 flex items-center justify-between px-3 select-none cursor-grab active:cursor-grabbing transition-colors ${
           isActive ? 'bg-slate-800/50 border-b border-slate-700/50' : 'bg-slate-800/30 border-b border-slate-700/30'
        }`}
        onMouseDown={handleMouseDown}
        onDoubleClick={() => onMaximize(windowState.id)}
      >
        <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>
          {windowState.title}
        </div>
        <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => onMinimize(windowState.id)}
            className="p-1.5 hover:bg-slate-700/50 rounded-md text-slate-400 hover:text-white transition-colors"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => onMaximize(windowState.id)}
            className="p-1.5 hover:bg-slate-700/50 rounded-md text-slate-400 hover:text-white transition-colors"
          >
            {windowState.isMaximized ? <Maximize2 size={14} /> : <Square size={14} />}
          </button>
          <button
            onClick={() => onClose(windowState.id)}
            className="p-1.5 hover:bg-red-500/80 hover:text-white rounded-md text-slate-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-auto relative transition-colors ${isActive ? 'bg-slate-900/50' : 'bg-slate-900/30'}`}>
        {/* Blocker overlay for iframes when inactive/dragging to prevent event stealing */}
        {(!isActive || isDragging) && <div className="absolute inset-0 z-50 bg-transparent" />}
        {children}
      </div>
    </div>
  );
};
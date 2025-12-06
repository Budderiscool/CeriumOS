import React, { useState, useEffect } from 'react';
import { FileSystemItem } from '../types';
import { FileText, Folder, Image, File } from 'lucide-react';

interface DesktopProps {
  files: Record<string, FileSystemItem>;
  onOpenFile: (file: FileSystemItem) => void;
}

export const Desktop: React.FC<DesktopProps> = ({ files, onOpenFile }) => {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [dragState, setDragState] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter files that belong on the desktop
  const desktopItems = Object.values(files).filter(f => f.parentId === 'desktop');

  // Initialize positions grid
  useEffect(() => {
    const newPositions = { ...positions };
    desktopItems.forEach((item, index) => {
      if (!newPositions[item.id]) {
        newPositions[item.id] = { x: 20, y: 20 + (index * 100) };
      }
    });
    setPositions(newPositions);
  }, [files]);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    const pos = positions[id] || { x: 0, y: 0 };
    setDragState({
      id,
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState) {
        setPositions(prev => ({
          ...prev,
          [dragState.id]: {
            x: e.clientX - dragState.offsetX,
            y: e.clientY - dragState.offsetY
          }
        }));
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    if (dragState) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'folder': return <Folder size={40} className="text-blue-400 fill-blue-400/20" />;
      case 'image': return <Image size={40} className="text-purple-400" />;
      case 'text': return <FileText size={40} className="text-slate-300" />;
      default: return <File size={40} className="text-slate-400" />;
    }
  };

  return (
    <div 
      className="absolute inset-0 z-0" 
      onClick={() => setSelectedId(null)}
    >
      {desktopItems.map(item => {
        const pos = positions[item.id] || { x: 0, y: 0 };
        const isSelected = selectedId === item.id;
        
        return (
          <div
            key={item.id}
            style={{ 
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              position: 'absolute'
            }}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
            onDoubleClick={() => onOpenFile(item)}
            className={`
              flex flex-col items-center justify-start p-2 rounded-md w-24 cursor-default select-none transition-colors group
              ${isSelected ? 'bg-cyan-500/20 ring-1 ring-cyan-500/40' : 'hover:bg-white/5'}
            `}
          >
            <div className="mb-1 drop-shadow-md">
              {getIcon(item.type)}
            </div>
            <span className={`text-xs text-center font-medium leading-tight text-white drop-shadow-md line-clamp-2 ${isSelected ? '' : 'bg-black/20 rounded px-1'}`}>
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

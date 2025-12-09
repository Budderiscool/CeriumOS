import React, { useState, useEffect } from 'react';
import { FileSystemItem, AppDefinition, FileSystemContextType, UserSettings, Wallpaper } from '../types';
import { FileText, Folder, Image, File, Trash2, Edit2, Plus, Monitor } from 'lucide-react';

interface DesktopProps {
  files: Record<string, FileSystemItem>;
  apps: AppDefinition[];
  onOpenFile: (file: FileSystemItem) => void;
  fs?: FileSystemContextType;
  updateSettings?: (settings: Partial<UserSettings>) => void;
}

export const Desktop: React.FC<DesktopProps> = ({ files, apps, onOpenFile, fs, updateSettings }) => {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [dragState, setDragState] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId?: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');

  // Filter files that belong on the desktop
  const desktopItems = (Object.values(files) as FileSystemItem[]).filter(f => f.parentId === 'desktop');

  // Initialize positions grid
  useEffect(() => {
    const newPositions = { ...positions };
    desktopItems.forEach((item, index) => {
      if (!newPositions[item.id]) {
        // Simple grid layout
        const col = Math.floor(index / 6);
        const row = index % 6;
        newPositions[item.id] = { x: 20 + (col * 100), y: 20 + (row * 100) };
      }
    });
    setPositions(newPositions);
  }, [files]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent clearing selection
    if (e.button === 0) { // Left click
        setSelectedId(id);
        const pos = positions[id] || { x: 0, y: 0 };
        setDragState({
        id,
        offsetX: e.clientX - pos.x,
        offsetY: e.clientY - pos.y
        });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, itemId?: string) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, itemId });
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

  const handleRename = (id: string) => {
      setEditingId(id);
      setRenameName(files[id]?.name || '');
      setContextMenu(null);
  };

  const submitRename = () => {
      if (editingId && fs && renameName.trim()) {
          fs.renameItem(editingId, renameName.trim());
      }
      setEditingId(null);
  };

  const handleDelete = (id: string) => {
      if (fs && confirm('Delete this item?')) {
          fs.deleteItem(id);
      }
      setContextMenu(null);
  };

  const handleCreate = (type: 'folder' | 'text') => {
      if (fs) {
          const name = type === 'folder' ? 'New Folder' : 'New Text File.txt';
          fs.createItem('desktop', name, type, '');
      }
      setContextMenu(null);
  };

  const getIcon = (item: FileSystemItem) => {
    if (item.type === 'app' && item.content) {
      const app = apps.find(a => a.id === item.content);
      if (app) {
        const Icon = app.icon;
        return <Icon size={40} className="text-cyan-400" />;
      }
    }

    switch(item.type) {
      case 'folder': return <Folder size={40} className="text-blue-400 fill-blue-400/20" />;
      case 'image': return <Image size={40} className="text-purple-400" />;
      case 'text': return <FileText size={40} className="text-slate-300" />;
      default: return <File size={40} className="text-slate-400" />;
    }
  };

  return (
    <div 
      className="absolute inset-0 z-0" 
      onClick={() => { setSelectedId(null); setEditingId(null); }}
      onContextMenu={(e) => handleContextMenu(e)}
    >
      {desktopItems.map(item => {
        const pos = positions[item.id] || { x: 0, y: 0 };
        const isSelected = selectedId === item.id;
        const isEditing = editingId === item.id;
        
        return (
          <div
            key={item.id}
            style={{ 
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              position: 'absolute'
            }}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
            onDoubleClick={() => onOpenFile(item)}
            onContextMenu={(e) => { e.stopPropagation(); handleContextMenu(e, item.id); }}
            className={`
              flex flex-col items-center justify-start p-2 rounded-md w-24 cursor-default select-none transition-colors group
              ${isSelected && !isEditing ? 'bg-cyan-500/20 ring-1 ring-cyan-500/40' : 'hover:bg-white/5'}
            `}
          >
            <div className="mb-1 drop-shadow-md">
              {getIcon(item)}
            </div>
            {isEditing ? (
                <input 
                    type="text" 
                    value={renameName} 
                    onChange={(e) => setRenameName(e.target.value)}
                    onBlur={submitRename}
                    onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                    className="w-full text-xs text-center bg-slate-900 text-white border border-cyan-500 rounded px-1 outline-none z-50"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <span className={`text-xs text-center font-medium leading-tight text-white drop-shadow-md line-clamp-2 ${isSelected ? '' : 'bg-black/20 rounded px-1'}`}>
                {item.name}
                </span>
            )}
          </div>
        );
      })}

      {/* Context Menu */}
      {contextMenu && (
        <div 
            className="fixed z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 w-48 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
        >
            {contextMenu.itemId ? (
                <>
                    <button onClick={() => handleRename(contextMenu.itemId!)} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm flex items-center gap-2 text-slate-200">
                        <Edit2 size={14} /> Rename
                    </button>
                    <button onClick={() => handleDelete(contextMenu.itemId!)} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm flex items-center gap-2 text-red-400">
                        <Trash2 size={14} /> Delete
                    </button>
                </>
            ) : (
                <>
                    <button onClick={() => handleCreate('folder')} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm flex items-center gap-2 text-slate-200">
                        <Folder size={14} /> New Folder
                    </button>
                    <button onClick={() => handleCreate('text')} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm flex items-center gap-2 text-slate-200">
                        <FileText size={14} /> New Text File
                    </button>
                    <div className="h-px bg-slate-700 my-1" />
                    <button onClick={() => { 
                         if (updateSettings) updateSettings({ wallpaper: Wallpaper.ABSTRACT });
                         setContextMenu(null);
                    }} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm flex items-center gap-2 text-slate-200">
                        <Monitor size={14} /> Next Wallpaper
                    </button>
                </>
            )}
        </div>
      )}
    </div>
  );
};
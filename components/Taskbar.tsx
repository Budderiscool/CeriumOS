import React, { useState, useEffect } from 'react';
import { AppDefinition, WindowState } from '../types';
import { Circle, Power, Wifi, Volume2, Battery, Pin, Trash, X } from 'lucide-react';

interface TaskbarProps {
  apps: AppDefinition[];
  openWindows: WindowState[];
  activeWindowId: string | null;
  pinnedAppIds: string[];
  onLaunch: (appId: string) => void;
  onFocus: (windowId: string) => void;
  onToggleMinimize: (windowId: string) => void;
  onLogout: () => void;
  onPinApp: (appId: string) => void;
  onUnpinApp: (appId: string) => void;
  onReorderPinnedApps: (newOrder: string[]) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  apps,
  openWindows,
  activeWindowId,
  pinnedAppIds,
  onLaunch,
  onFocus,
  onToggleMinimize,
  onLogout,
  onPinApp,
  onUnpinApp,
  onReorderPinnedApps
}) => {
  const [time, setTime] = useState(new Date());
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; appId: string; isPinned: boolean } | null>(null);
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close context menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleAppClick = (appId: string) => {
    // If app has open windows, toggle the most recent one
    const appWindows = openWindows.filter(w => w.appId === appId);
    if (appWindows.length > 0) {
      const lastActive = appWindows[appWindows.length - 1];
      if (activeWindowId === lastActive.id && !lastActive.isMinimized) {
        onToggleMinimize(lastActive.id);
      } else {
        onFocus(lastActive.id);
      }
    } else {
      onLaunch(appId);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      appId,
      isPinned: pinnedAppIds.includes(appId)
    });
  };

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    if (!pinnedAppIds.includes(appId)) {
        e.preventDefault();
        return;
    }
    setDraggingAppId(appId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetAppId: string) => {
    e.preventDefault();
    if (!draggingAppId || draggingAppId === targetAppId) return;
    if (!pinnedAppIds.includes(targetAppId)) return; // Only reorder pinned items

    const currentIndex = pinnedAppIds.indexOf(draggingAppId);
    const targetIndex = pinnedAppIds.indexOf(targetAppId);

    if (currentIndex !== -1 && targetIndex !== -1) {
      const newOrder = [...pinnedAppIds];
      newOrder.splice(currentIndex, 1);
      newOrder.splice(targetIndex, 0, draggingAppId);
      onReorderPinnedApps(newOrder);
    }
  };

  // Combine pinned apps and unpinned-but-open apps
  const runningUnpinnedIds = openWindows
    .map(w => w.appId)
    .filter(id => !pinnedAppIds.includes(id))
    .filter((value, index, self) => self.indexOf(value) === index); // Unique

  const displayAppIds = [...pinnedAppIds, ...runningUnpinnedIds];

  return (
    <>
      {/* Start Menu */}
      {startMenuOpen && (
        <div 
          className="absolute bottom-14 left-2 w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-1">Cerium OS</h2>
            <p className="text-xs text-slate-400">Version 1.0.0</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-4">
            {apps.map(app => (
              <button 
                key={app.id}
                onClick={() => {
                  onLaunch(app.id);
                  setStartMenuOpen(false);
                }}
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-slate-800 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-900/20">
                  <app.icon size={20} />
                </div>
                <span className="text-xs text-slate-300">{app.name}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs">US</div>
                 <div className="text-sm font-medium">User</div>
             </div>
             <button 
               onClick={onLogout}
               className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
               title="Sign Out"
             >
               <Power size={18} />
             </button>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div 
            className="fixed z-[100] bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 w-40 animate-in fade-in zoom-in-95 duration-100"
            style={{ bottom: '50px', left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
        >
            {contextMenu.isPinned ? (
                <button 
                    className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm flex items-center gap-2"
                    onClick={() => { onUnpinApp(contextMenu.appId); setContextMenu(null); }}
                >
                    <X size={14} /> Unpin
                </button>
            ) : (
                <button 
                    className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm flex items-center gap-2"
                    onClick={() => { onPinApp(contextMenu.appId); setContextMenu(null); }}
                >
                    <Pin size={14} /> Pin to Taskbar
                </button>
            )}
        </div>
      )}

      {/* Taskbar */}
      <div className="absolute bottom-0 w-full h-12 bg-slate-950/80 backdrop-blur-2xl border-t border-slate-800/50 flex items-center justify-between px-2 z-50">
        <div className="flex items-center gap-2 h-full">
          {/* Start Button */}
          <button 
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className={`p-2 rounded-lg transition-all duration-300 ${startMenuOpen ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <Circle size={20} className={startMenuOpen ? "fill-cyan-500/20" : ""} />
          </button>

          <div className="w-px h-6 bg-slate-800 mx-1" />

          {/* Apps */}
          <div className="flex gap-1">
            {displayAppIds.map(appId => {
              const app = apps.find(a => a.id === appId);
              if (!app) return null;
              
              const isOpen = openWindows.some(w => w.appId === appId);
              const isActive = openWindows.find(w => w.id === activeWindowId)?.appId === appId;
              const isPinned = pinnedAppIds.includes(appId);
              
              return (
                <div
                    key={app.id}
                    draggable={isPinned}
                    onDragStart={(e) => handleDragStart(e, app.id)}
                    onDragOver={(e) => handleDragOver(e, app.id)}
                    className="relative"
                >
                    <button
                        onClick={() => handleAppClick(app.id)}
                        onContextMenu={(e) => handleContextMenu(e, app.id)}
                        className={`
                        relative group p-2 rounded-lg transition-all duration-200
                        ${isActive ? 'bg-slate-800' : 'hover:bg-slate-800/50'}
                        ${draggingAppId === app.id ? 'opacity-50' : 'opacity-100'}
                        `}
                    >
                        <app.icon 
                        size={20} 
                        className={`transition-colors ${isOpen ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} 
                        />
                        {isOpen && (
                        <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'w-4 bg-cyan-400' : 'bg-slate-500'}`} />
                        )}
                    </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-4 px-2 h-full">
            <div className="flex items-center gap-3 text-slate-400">
                <Wifi size={16} />
                <Volume2 size={16} />
                <Battery size={16} />
            </div>
            <div className="flex flex-col items-end justify-center text-xs text-slate-300 leading-tight border-l border-slate-800 pl-4 h-8">
                <span className="font-medium">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-slate-500">{time.toLocaleDateString()}</span>
            </div>
        </div>
      </div>
      
      {/* Close start menu when clicking outside */}
      {startMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setStartMenuOpen(false)} />
      )}
    </>
  );
};

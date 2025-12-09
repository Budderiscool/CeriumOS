import React, { useState, useEffect, useRef } from 'react';
import { AppDefinition, WindowState } from '../types';
import { Circle, Power, Wifi, Volume2, Battery, BatteryCharging, BatteryFull, BatteryMedium, BatteryLow, Pin, X, ChevronLeft, ChevronRight, Cloud, Sun, CloudRain, CloudSnow, Loader2, Calendar as CalendarIcon } from 'lucide-react';

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

const MiniCalendar = () => {
  const [date, setDate] = useState(new Date());

  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  const nextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));

  const today = new Date();
  const isToday = (d: number) => 
    d === today.getDate() && 
    date.getMonth() === today.getMonth() && 
    date.getFullYear() === today.getFullYear();

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="p-4 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-slate-200">
      <div className="flex items-center justify-between mb-4">
        <span className="font-medium pl-1">
          {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-800 rounded-md transition-colors"><ChevronLeft size={16} /></button>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-800 rounded-md transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {days.map(d => <div key={d} className="text-slate-500 font-medium">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          return (
            <div 
              key={d} 
              className={`
                h-8 flex items-center justify-center rounded-md cursor-default
                ${isToday(d) ? 'bg-cyan-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}
              `}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; appId: string; isPinned: boolean } | null>(null);
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);
  
  // Widget States
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Battery API
  useEffect(() => {
    const nav = navigator as any;
    if (nav.getBattery) {
      nav.getBattery().then((batt: any) => {
        const updateBattery = () => {
          setBattery({
            level: batt.level,
            charging: batt.charging
          });
        };
        updateBattery();
        batt.addEventListener('levelchange', updateBattery);
        batt.addEventListener('chargingchange', updateBattery);
      });
    } else {
      // Fallback
      setBattery({ level: 1, charging: false });
    }
  }, []);

  // Weather API (Open-Meteo)
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
        const data = await res.json();
        const code = data.current.weather_code;
        let condition = 'Sun';
        if (code > 0 && code <= 3) condition = 'Cloud';
        if (code >= 45) condition = 'Cloud';
        if (code >= 51) condition = 'Rain';
        if (code >= 71) condition = 'Snow';
        
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          condition
        });
      } catch (e) {
        setWeather({ temp: 20, condition: 'Sun' });
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => setWeather({ temp: 20, condition: 'Sun' })
      );
    } else {
      setWeather({ temp: 20, condition: 'Sun' });
    }
  }, []);

  // Close menus on click elsewhere
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.taskbar-calendar-trigger') && !target.closest('.calendar-popup')) {
            setCalendarOpen(false);
        }
        setContextMenu(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleAppClick = (appId: string) => {
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
    if (!pinnedAppIds.includes(targetAppId)) return;

    const currentIndex = pinnedAppIds.indexOf(draggingAppId);
    const targetIndex = pinnedAppIds.indexOf(targetAppId);

    if (currentIndex !== -1 && targetIndex !== -1) {
      const newOrder = [...pinnedAppIds];
      newOrder.splice(currentIndex, 1);
      newOrder.splice(targetIndex, 0, draggingAppId);
      onReorderPinnedApps(newOrder);
    }
  };

  const runningUnpinnedIds = openWindows
    .map(w => w.appId)
    .filter(id => !pinnedAppIds.includes(id))
    .filter((value, index, self) => self.indexOf(value) === index);

  const displayAppIds = [...pinnedAppIds, ...runningUnpinnedIds];

  const getWeatherIcon = () => {
    if (!weather) return <Sun size={16} />;
    switch(weather.condition) {
      case 'Rain': return <CloudRain size={16} />;
      case 'Snow': return <CloudSnow size={16} />;
      case 'Cloud': return <Cloud size={16} />;
      default: return <Sun size={16} />;
    }
  };

  const getBatteryIcon = () => {
    if (!battery) return <Battery size={16} />;
    if (battery.charging) return <BatteryCharging size={16} />;
    if (battery.level > 0.9) return <BatteryFull size={16} />;
    if (battery.level > 0.3) return <BatteryMedium size={16} />;
    return <BatteryLow size={16} className="text-red-400" />;
  };

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

      {/* Calendar Popup */}
      {calendarOpen && (
        <div 
          className="calendar-popup absolute bottom-14 right-2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <MiniCalendar />
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
            onClick={(e) => { e.stopPropagation(); setStartMenuOpen(!startMenuOpen); }}
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
        <div className="flex items-center gap-3 px-2 h-full">
            {/* Weather */}
            <div className="hidden md:flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded-md transition-colors cursor-default text-slate-300" title={weather?.condition}>
               {getWeatherIcon()}
               <span className="text-xs font-medium">{weather ? `${weather.temp}°` : '--'}</span>
            </div>

            {/* Icons Group */}
            <div className="flex items-center gap-3 text-slate-400 px-2">
                <Wifi size={16} className="cursor-pointer hover:text-white transition-colors" />
                <Volume2 size={16} className="cursor-pointer hover:text-white transition-colors" />
                
                {/* Battery with hover percentage */}
                <div className="relative group cursor-default flex items-center gap-1">
                    {getBatteryIcon()}
                    {battery && (
                        <span className="text-xs group-hover:block hidden absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            {Math.round(battery.level * 100)}% {battery.charging ? '(Charging)' : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Clock / Calendar Trigger */}
            <button 
              className="taskbar-calendar-trigger flex flex-col items-end justify-center text-xs text-slate-300 leading-tight border-l border-slate-800 pl-3 h-8 hover:bg-slate-800/50 rounded px-1 transition-colors"
              onClick={(e) => { e.stopPropagation(); setCalendarOpen(!calendarOpen); }}
            >
                <span className="font-medium">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-slate-500">{time.toLocaleDateString()}</span>
            </button>
        </div>
      </div>
      
      {/* Close menus when clicking outside (handled by useEffect) */}
      {(startMenuOpen || calendarOpen) && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setStartMenuOpen(false); setCalendarOpen(false); }} />
      )}
    </>
  );
};
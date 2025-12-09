import React, { useState, useEffect } from 'react';
import { AppProps } from '../../types';
import { Clock, Timer, Play, Pause, RotateCcw } from 'lucide-react';

export const ClockApp: React.FC<AppProps> = () => {
  const [tab, setTab] = useState<'clock' | 'stopwatch'>('clock');
  const [time, setTime] = useState(new Date());

  // Stopwatch state
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Tabs */}
      <div className="flex bg-slate-950 border-b border-slate-800">
        <button 
          onClick={() => setTab('clock')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${tab === 'clock' ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Clock size={16} /> World Clock
        </button>
        <button 
          onClick={() => setTab('stopwatch')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${tab === 'stopwatch' ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Timer size={16} /> Stopwatch
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {tab === 'clock' ? (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4">
             <div className="text-6xl md:text-8xl font-thin tracking-wider text-white mb-2 font-mono">
               {time.toLocaleTimeString([], { hour12: false })}
             </div>
             <div className="text-xl text-cyan-400 font-light">
               {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
             </div>
             <div className="mt-12 grid grid-cols-2 gap-8 text-center">
                <div>
                   <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">New York</div>
                   <div className="text-xl text-slate-300">{time.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                </div>
                <div>
                   <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">London</div>
                   <div className="text-xl text-slate-300">{time.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                </div>
                <div>
                   <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Tokyo</div>
                   <div className="text-xl text-slate-300">{time.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                </div>
                <div>
                   <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Sydney</div>
                   <div className="text-xl text-slate-300">{time.toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
             <div className="text-7xl font-mono font-light text-white mb-12 tracking-wider tabular-nums">
                {formatStopwatch(elapsed)}
             </div>
             <div className="flex gap-4">
               <button 
                 onClick={() => setIsRunning(!isRunning)}
                 className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRunning ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
               >
                 {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
               </button>
               <button 
                 onClick={() => { setIsRunning(false); setElapsed(0); }}
                 className="w-16 h-16 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition-colors"
               >
                 <RotateCcw size={24} />
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
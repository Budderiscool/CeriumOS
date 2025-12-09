import React, { useState } from 'react';
import { AppProps } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarApp: React.FC<AppProps> = () => {
  const [date, setDate] = useState(new Date());

  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    return day === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 bg-slate-800 border-b border-slate-700">
        <h2 className="text-xl font-light">
          {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-7 mb-4">
          {days.map(d => (
            <div key={d} className="text-center text-xs font-bold text-slate-500 uppercase">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 h-[calc(100%-2rem)] gap-1">
          {/* Empty cells for prev month */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-transparent" />
          ))}
          
          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            return (
              <div 
                key={day} 
                className={`
                  flex items-center justify-center rounded-lg text-sm transition-all hover:bg-slate-800 cursor-default relative
                  ${isToday(day) ? 'bg-cyan-600 text-white font-bold hover:bg-cyan-500 shadow-lg shadow-cyan-900/50' : 'text-slate-300'}
                `}
              >
                {day}
                {/* Random simulated event dots */}
                {day % 7 === 0 && (
                  <div className="absolute bottom-2 w-1 h-1 bg-purple-400 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
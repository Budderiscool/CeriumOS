import React from 'react';
import { UserSettings, Wallpaper } from '../../types';
import { User, Monitor, Lock, Palette } from 'lucide-react';

interface SettingsAppProps {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({ settings, updateSettings }) => {
  const sections = [
    { id: 'personalization', icon: Palette, label: 'Personalization' },
    { id: 'account', icon: User, label: 'Account' },
    { id: 'display', icon: Monitor, label: 'Display' },
    { id: 'privacy', icon: Lock, label: 'Privacy & Security' },
  ];

  const wallpapers = [
    { name: 'Abstract', url: Wallpaper.ABSTRACT },
    { name: 'Mountains', url: Wallpaper.MOUNTAIN },
    { name: 'City', url: Wallpaper.CITY },
    { name: 'Minimal', url: Wallpaper.MINIMAL },
  ];

  return (
    <div className="flex h-full bg-slate-900 text-slate-200">
      {/* Sidebar */}
      <div className="w-48 bg-slate-950/30 border-r border-slate-700 p-4 flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-400 mb-2 px-2">Settings</h2>
        {sections.map(s => (
          <button key={s.id} className={`flex items-center gap-3 p-2 rounded-lg text-sm text-left ${s.id === 'personalization' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-800 text-slate-300'}`}>
            <s.icon size={16} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-light mb-8">Personalization</h1>
          
          {/* Wallpaper Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Background</h3>
            <div className="grid grid-cols-2 gap-4">
              {wallpapers.map((wp) => (
                <button 
                  key={wp.name}
                  onClick={() => updateSettings({ wallpaper: wp.url })}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${settings.wallpaper === wp.url ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-transparent hover:border-slate-600'}`}
                >
                  <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2">
                    <span className="text-xs font-medium">{wp.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* User Name Section */}
          <div className="mb-8">
             <h3 className="text-lg font-medium mb-4">User Profile</h3>
             <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <label className="block text-xs text-slate-400 mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={settings.username}
                  onChange={(e) => updateSettings({ username: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm focus:border-cyan-500 outline-none transition-colors"
                />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

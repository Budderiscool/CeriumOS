import React, { useState } from 'react';
import { UserSettings, Wallpaper } from '../../types';
import { User, Monitor, Lock, Palette, Volume2, Wifi, Bluetooth, Battery, Sun, Moon, Type } from 'lucide-react';

interface SettingsAppProps {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({ settings, updateSettings }) => {
  const [activeSection, setActiveSection] = useState('personalization');

  const sections = [
    { id: 'personalization', icon: Palette, label: 'Personalization' },
    { id: 'account', icon: User, label: 'Account' },
    { id: 'display', icon: Monitor, label: 'Display & Sound' },
    { id: 'privacy', icon: Lock, label: 'Privacy & Security' },
  ];

  const wallpapers = [
    { name: 'Abstract', url: Wallpaper.ABSTRACT },
    { name: 'Mountains', url: Wallpaper.MOUNTAIN },
    { name: 'City', url: Wallpaper.CITY },
    { name: 'Minimal', url: Wallpaper.MINIMAL },
  ];

  const colors = ['cyan', 'blue', 'purple', 'green', 'orange', 'red'];

  const renderContent = () => {
    switch(activeSection) {
      case 'personalization':
        return (
          <div className="max-w-2xl animate-in fade-in duration-300">
            <h1 className="text-2xl font-light mb-8">Personalization</h1>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Background</h3>
              <div className="grid grid-cols-2 gap-4">
                {wallpapers.map((wp) => (
                  <button 
                    key={wp.name}
                    onClick={() => updateSettings({ wallpaper: wp.url })}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${settings.wallpaper === wp.url ? `border-${settings.themeColor}-500 ring-2 ring-${settings.themeColor}-500/20` : 'border-transparent hover:border-slate-600'}`}
                  >
                    <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2">
                      <span className="text-xs font-medium">{wp.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Accent Color</h3>
              <div className="flex gap-4">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => updateSettings({ themeColor: color })}
                    className={`w-10 h-10 rounded-full bg-${color}-500 border-2 transition-transform hover:scale-110 ${settings.themeColor === color ? 'border-white' : 'border-transparent'}`}
                  />
                ))}
              </div>
            </div>

             <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Theme</h3>
              <div className="flex gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                 <div className="flex items-center gap-2">
                    <Sun size={20} className={!settings.darkMode ? 'text-yellow-400' : 'text-slate-500'} />
                    <span className="text-sm">Light</span>
                 </div>
                 <button 
                    onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.darkMode ? `bg-${settings.themeColor}-600` : 'bg-slate-600'}`}
                 >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.darkMode ? 'left-7' : 'left-1'}`} />
                 </button>
                 <div className="flex items-center gap-2">
                    <Moon size={20} className={settings.darkMode ? 'text-blue-400' : 'text-slate-500'} />
                    <span className="text-sm">Dark</span>
                 </div>
                 <span className="text-xs text-slate-500 ml-2">(Simulated)</span>
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="max-w-2xl animate-in fade-in duration-300">
             <h1 className="text-2xl font-light mb-8">Account</h1>
             
             <div className="flex items-center gap-6 mb-8">
               <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-xl p-1">
                 <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop" className="w-full h-full rounded-full object-cover border-4 border-slate-900" alt="Avatar" />
               </div>
               <div>
                 <h2 className="text-2xl font-medium">{settings.username}</h2>
                 <p className="text-slate-400 text-sm">Administrator</p>
               </div>
             </div>

             <div className="space-y-6">
               <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                  <h3 className="font-medium mb-4">Profile Information</h3>
                  
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Display Name</label>
                      <input 
                        type="text" 
                        value={settings.username}
                        onChange={(e) => updateSettings({ username: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm focus:border-cyan-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Bio</label>
                      <textarea 
                        value={settings.bio || ''}
                        onChange={(e) => updateSettings({ bio: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm focus:border-cyan-500 outline-none transition-colors resize-none h-24"
                      />
                    </div>
                  </div>
               </div>

               <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                  <h3 className="font-medium mb-4">Security</h3>
                  <div>
                      <label className="block text-xs text-slate-400 mb-1">Change Password</label>
                      <input 
                        type="password" 
                        value={settings.password || ''}
                        onChange={(e) => updateSettings({ password: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm focus:border-cyan-500 outline-none transition-colors"
                      />
                    </div>
               </div>
             </div>
          </div>
        );

      case 'display':
        return (
          <div className="max-w-2xl animate-in fade-in duration-300">
            <h1 className="text-2xl font-light mb-8">Display & Sound</h1>
            
            <div className="space-y-6">
               <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                     <Sun size={20} className="text-yellow-400" />
                     <h3 className="font-medium">Brightness</h3>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="100" 
                    value={settings.brightness}
                    onChange={(e) => updateSettings({ brightness: parseInt(e.target.value) })}
                    className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-${settings.themeColor}-500`}
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>Dim</span>
                    <span>{settings.brightness}%</span>
                    <span>Bright</span>
                  </div>
               </div>

               <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                     <Volume2 size={20} className="text-blue-400" />
                     <h3 className="font-medium">Volume</h3>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={settings.volume}
                    onChange={(e) => updateSettings({ volume: parseInt(e.target.value) })}
                    className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-${settings.themeColor}-500`}
                  />
                  <div className="text-right text-xs text-slate-400 mt-2">{settings.volume}%</div>
               </div>

               <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                  <h3 className="font-medium mb-4">Connectivity</h3>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Wifi size={20} className="text-green-400" />
                           <span>Wi-Fi</span>
                        </div>
                        <button 
                           onClick={() => updateSettings({ wifiEnabled: !settings.wifiEnabled })}
                           className={`w-12 h-6 rounded-full relative transition-colors ${settings.wifiEnabled ? `bg-${settings.themeColor}-600` : 'bg-slate-600'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.wifiEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Bluetooth size={20} className="text-blue-500" />
                           <span>Bluetooth</span>
                        </div>
                        <button 
                           onClick={() => updateSettings({ bluetoothEnabled: !settings.bluetoothEnabled })}
                           className={`w-12 h-6 rounded-full relative transition-colors ${settings.bluetoothEnabled ? `bg-${settings.themeColor}-600` : 'bg-slate-600'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.bluetoothEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        );

      case 'privacy':
         return (
          <div className="max-w-2xl animate-in fade-in duration-300">
            <h1 className="text-2xl font-light mb-8">Privacy & Security</h1>
            
            <div className="space-y-6">
               <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                  <h3 className="font-medium mb-4 text-red-400">App Permissions</h3>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <span>Location Services</span>
                        <button 
                           onClick={() => updateSettings({ privacyLocation: !settings.privacyLocation })}
                           className={`w-12 h-6 rounded-full relative transition-colors ${settings.privacyLocation ? `bg-${settings.themeColor}-600` : 'bg-slate-600'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.privacyLocation ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                     <div className="flex items-center justify-between">
                        <span>Camera Access</span>
                        <button 
                           onClick={() => updateSettings({ privacyCamera: !settings.privacyCamera })}
                           className={`w-12 h-6 rounded-full relative transition-colors ${settings.privacyCamera ? `bg-${settings.themeColor}-600` : 'bg-slate-600'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.privacyCamera ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-4">These settings simulate OS-level permissions. In a real browser environment, the browser handles these.</p>
               </div>
            </div>
          </div>
         );
    }
  };

  return (
    <div className="flex h-full bg-slate-900 text-slate-200">
      {/* Sidebar */}
      <div className="w-56 bg-slate-950/30 border-r border-slate-700 p-4 flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-400 mb-4 px-2 tracking-wider uppercase">Settings</h2>
        {sections.map(s => (
          <button 
            key={s.id} 
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-3 p-3 rounded-lg text-sm text-left transition-colors ${activeSection === s.id ? `bg-${settings.themeColor}-500/20 text-${settings.themeColor}-400` : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <s.icon size={18} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
         {renderContent()}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { AppDefinition, WindowState, UserSettings, FileSystemItem } from './types';
import { INITIAL_SETTINGS, INITIAL_FILES } from './constants';
import { Taskbar } from './components/Taskbar';
import { WindowFrame } from './components/WindowFrame';
import { LoginScreen } from './components/LoginScreen';
import { Desktop } from './components/Desktop';
import { BrowserApp } from './components/apps/BrowserApp';
import { FilesApp } from './components/apps/FilesApp';
import { SettingsApp } from './components/apps/SettingsApp';
import { GeminiAssistant } from './components/apps/GeminiAssistant';
import { TextEditorApp } from './components/apps/TextEditorApp';
import { ImageViewerApp } from './components/apps/ImageViewerApp';
import { Globe, Folder, Settings, Cpu, FileText, Image } from 'lucide-react';

// App Definitions
const APPS: AppDefinition[] = [
  { id: 'browser', name: 'Browser', icon: Globe, component: BrowserApp, defaultWidth: 900, defaultHeight: 600 },
  { id: 'files', name: 'Files', icon: Folder, component: FilesApp, defaultWidth: 700, defaultHeight: 500 },
  { id: 'settings', name: 'Settings', icon: Settings, component: SettingsApp, defaultWidth: 600, defaultHeight: 500 },
  { id: 'assistant', name: 'Cerium AI', icon: Cpu, component: GeminiAssistant, defaultWidth: 400, defaultHeight: 600 },
  { id: 'text-editor', name: 'Text Editor', icon: FileText, component: TextEditorApp, defaultWidth: 600, defaultHeight: 400 },
  { id: 'image-viewer', name: 'Image Editor', icon: Image, component: ImageViewerApp, defaultWidth: 800, defaultHeight: 600 },
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [files, setFiles] = useState<Record<string, FileSystemItem>>(INITIAL_FILES);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(10);

  // Load settings from local storage on login
  const handleLogin = (userSettings?: Partial<UserSettings>) => {
     if (userSettings) {
       setSettings(prev => ({ ...prev, ...userSettings }));
     }
     setIsLoggedIn(true);
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    // Persist
    localStorage.setItem('cerium_user', JSON.stringify(updated));
  };

  // Window Management Actions
  const launchApp = (appId: string, content?: string) => {
    const app = APPS.find(a => a.id === appId);
    if (!app) return;

    const newWindow: WindowState = {
      id: `${appId}-${Date.now()}`,
      appId,
      title: app.name,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      position: { x: 50 + (windows.length * 20), y: 50 + (windows.length * 20) },
      size: { width: app.defaultWidth || 600, height: app.defaultHeight || 400 },
      zIndex: nextZIndex,
      content: content
    };

    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
    setNextZIndex(prev => prev + 1);
  };

  const openFile = (file: FileSystemItem) => {
    if (file.type === 'text') {
      launchApp('text-editor', file.content);
    } else if (file.type === 'image') {
      launchApp('image-viewer', file.content);
    } else {
      // Default to text editor
      launchApp('text-editor', `Cannot open binary file: ${file.name}`);
    }
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const focusWindow = (id: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w
    ));
    setActiveWindowId(id);
    setNextZIndex(prev => prev + 1);
  };

  const minimizeWindow = (id: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    ));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const toggleMinimize = (id: string) => {
    const win = windows.find(w => w.id === id);
    if (win?.isMinimized) {
      focusWindow(id); 
    } else {
      if (activeWindowId === id) {
        minimizeWindow(id);
      } else {
        focusWindow(id);
      }
    }
  };

  const maximizeWindow = (id: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMaximized: !w.isMaximized, isMinimized: false } : w
    ));
    focusWindow(id);
  };

  const moveWindow = (id: string, x: number, y: number) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, position: { x, y } } : w
    ));
  };

  if (!isLoggedIn) {
    return <LoginScreen settings={settings} onLogin={handleLogin} />;
  }

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center select-none"
      style={{ backgroundImage: `url(${settings.wallpaper})` }}
    >
      {/* Desktop Icons */}
      <Desktop files={files} onOpenFile={openFile} />

      {/* Window Layer */}
      <div className="absolute inset-0 pb-12 pointer-events-none">
        {windows.map(win => {
          const app = APPS.find(a => a.id === win.appId);
          if (!app) return null;
          
          return (
            <div key={win.id} className="pointer-events-auto">
              <WindowFrame
                windowState={win}
                isActive={activeWindowId === win.id}
                onClose={closeWindow}
                onMinimize={minimizeWindow}
                onMaximize={maximizeWindow}
                onFocus={focusWindow}
                onMove={moveWindow}
              >
                <app.component 
                  settings={settings} 
                  updateSettings={handleUpdateSettings}
                  files={files}
                  onOpenFile={openFile}
                  initialContent={win.content}
                />
              </WindowFrame>
            </div>
          );
        })}
      </div>

      <Taskbar 
        apps={APPS}
        openWindows={windows}
        activeWindowId={activeWindowId}
        onLaunch={launchApp}
        onFocus={focusWindow}
        onToggleMinimize={toggleMinimize}
        onLogout={() => setIsLoggedIn(false)}
      />
    </div>
  );
}
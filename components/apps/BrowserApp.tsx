import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Lock, Plus, X } from 'lucide-react';

interface Tab {
  id: string;
  url: string;
  history: string[];
  historyIndex: number;
  loading: boolean;
  title: string;
}

export const BrowserApp: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { 
      id: '1', 
      url: 'https://en.wikipedia.org/wiki/Operating_system', 
      history: ['https://en.wikipedia.org/wiki/Operating_system'], 
      historyIndex: 0,
      loading: false,
      title: 'Operating System - Wikipedia'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [inputUrl, setInputUrl] = useState('https://en.wikipedia.org/wiki/Operating_system');

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs(tabs.map(t => t.id === id ? { ...t, ...updates } : t));
    // If updating active tab's URL, update input bar
    if (id === activeTabId && updates.url) {
      setInputUrl(updates.url);
    }
  };

  const addTab = () => {
    const newId = Date.now().toString();
    const newTab: Tab = {
      id: newId,
      url: 'https://www.google.com/webhp?igu=1',
      history: ['https://www.google.com/webhp?igu=1'],
      historyIndex: 0,
      loading: false,
      title: 'New Tab'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setInputUrl(newTab.url);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Don't close last tab
    
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
      setInputUrl(newTabs[newTabs.length - 1].url);
    }
  };

  const navigate = (newUrl: string) => {
    let finalUrl = newUrl;
    if (!newUrl.startsWith('http')) {
      finalUrl = `https://${newUrl}`;
    }
    
    // Simple logic to extract title
    let title = finalUrl;
    try {
        const hostname = new URL(finalUrl).hostname;
        title = hostname.replace('www.', '');
    } catch (e) {}

    updateTab(activeTabId, {
      url: finalUrl,
      title: title,
      loading: true,
      history: [...activeTab.history.slice(0, activeTab.historyIndex + 1), finalUrl],
      historyIndex: activeTab.historyIndex + 1
    });

    setTimeout(() => updateTab(activeTabId, { loading: false }), 1000);
  };

  const goBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const newUrl = activeTab.history[newIndex];
      updateTab(activeTabId, {
        historyIndex: newIndex,
        url: newUrl
      });
    }
  };

  const goForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const newUrl = activeTab.history[newIndex];
      updateTab(activeTabId, {
        historyIndex: newIndex,
        url: newUrl
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Tab Bar */}
      <div className="flex items-end bg-slate-950 px-2 pt-2 gap-1 overflow-x-auto border-b border-slate-800">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => {
              setActiveTabId(tab.id);
              setInputUrl(tab.url);
            }}
            className={`
              group relative flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs max-w-[200px] min-w-[120px] cursor-pointer transition-colors
              ${activeTabId === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-900/30 text-slate-500 hover:bg-slate-900/50 hover:text-slate-300'}
            `}
          >
            <span className="truncate flex-1">{tab.title}</span>
            <button 
              onClick={(e) => closeTab(e, tab.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
            >
              <X size={12} />
            </button>
            {activeTabId === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500" />
            )}
          </div>
        ))}
        <button 
          onClick={addTab}
          className="p-1.5 mb-1 hover:bg-slate-800 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Browser Chrome */}
      <div className="flex items-center gap-2 p-2 bg-slate-900 border-b border-slate-800">
        <button onClick={goBack} disabled={activeTab.historyIndex === 0} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <button onClick={goForward} disabled={activeTab.historyIndex === activeTab.history.length - 1} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30 transition-colors">
          <ArrowRight size={16} />
        </button>
        <button onClick={() => navigate(inputUrl)} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors">
          <RotateCw size={16} className={activeTab.loading ? "animate-spin" : ""} />
        </button>
        
        <div className="flex-1 flex items-center bg-slate-950 border border-slate-700 rounded-full px-3 py-1.5 text-sm shadow-sm focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/10 transition-all">
          <Lock size={12} className="text-green-500 mr-2" />
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigate(inputUrl)}
            className="flex-1 bg-transparent outline-none text-slate-200 placeholder:text-slate-600"
            placeholder="Search or enter website name"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-white">
        {activeTab.loading && (
          <div className="absolute top-0 left-0 w-full h-0.5 bg-slate-900 z-10">
             <div className="h-full bg-cyan-500 animate-[progress_1s_ease-in-out_infinite]" style={{width: '50%'}}></div>
          </div>
        )}
        <iframe 
          key={activeTab.id} // Re-render iframe on tab switch to ensure correct content
          src={activeTab.url} 
          className="w-full h-full border-none bg-white" 
          title={activeTab.title}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
};
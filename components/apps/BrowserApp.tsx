import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Lock, Plus, X, Search, Globe, AlertCircle, Home } from 'lucide-react';

interface Tab {
  id: string;
  url: string;         // The actual URL being visited
  displayUrl: string;  // What is shown in the address bar
  history: string[];
  historyIndex: number;
  loading: boolean;
  title: string;
  isProxyEnabled: boolean;
}

const NEW_TAB_URL = 'cerium://newtab';
const SEARCH_URL_BASE = 'https://www.google.com/search?igu=1&q=';

export const BrowserApp: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { 
      id: '1', 
      url: NEW_TAB_URL, 
      displayUrl: '', 
      history: [NEW_TAB_URL], 
      historyIndex: 0,
      loading: false,
      title: 'New Tab',
      isProxyEnabled: true
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [inputUrl, setInputUrl] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Sync input bar with active tab
  useEffect(() => {
    if (activeTab.url === NEW_TAB_URL) {
      setInputUrl('');
    } else {
      setInputUrl(activeTab.displayUrl || activeTab.url);
    }
  }, [activeTab.id, activeTab.url, activeTab.displayUrl]);

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addTab = () => {
    const newId = Date.now().toString();
    const newTab: Tab = {
      id: newId,
      url: NEW_TAB_URL,
      displayUrl: '',
      history: [NEW_TAB_URL],
      historyIndex: 0,
      loading: false,
      title: 'New Tab',
      isProxyEnabled: true
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Don't close last tab
    
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  // --- URL Logic ---

  const isUrl = (str: string) => {
    // Regex to detect domain names (e.g., example.com, localhost:3000, 192.168.1.1)
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
  };

  const handleNavigate = (input: string) => {
    let targetUrl = input.trim();
    let display = input.trim();

    if (!targetUrl) return;

    // 1. Check if it's a URL or a Search
    if (isUrl(targetUrl)) {
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
    } else {
      // It's a search
      targetUrl = SEARCH_URL_BASE + encodeURIComponent(targetUrl);
      display = targetUrl; // Or keep the search query, but for now let's show full URL logic
    }

    const newHistory = [...activeTab.history.slice(0, activeTab.historyIndex + 1), targetUrl];
    
    updateTab(activeTabId, {
      url: targetUrl,
      displayUrl: targetUrl,
      title: 'Loading...',
      loading: true,
      history: newHistory,
      historyIndex: newHistory.length - 1
    });

    setTimeout(() => {
        updateTab(activeTabId, { loading: false, title: getTitleFromUrl(targetUrl) });
    }, 1500);
  };

  const getTitleFromUrl = (url: string) => {
    try {
      if (url.startsWith(SEARCH_URL_BASE)) return 'Google Search';
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Page';
    }
  };

  const getProxyUrl = (url: string) => {
    // Whitelist sites that allow direct iframing (rare, but useful)
    if (url.includes('google.com/search?igu=1')) return url;
    if (url.includes('bing.com')) return url;
    if (url.includes('wikipedia.org')) return url;
    
    // For everything else, use a CORS proxy to strip X-Frame-Options
    // Note: This is a public demo proxy. In production, you'd want your own Vercel API route.
    return `https://corsproxy.io/?${encodeURIComponent(url)}`;
  };

  const goBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const newUrl = activeTab.history[newIndex];
      updateTab(activeTabId, {
        historyIndex: newIndex,
        url: newUrl,
        displayUrl: newUrl,
        title: getTitleFromUrl(newUrl)
      });
    }
  };

  const goForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const newUrl = activeTab.history[newIndex];
      updateTab(activeTabId, {
        historyIndex: newIndex,
        url: newUrl,
        displayUrl: newUrl,
        title: getTitleFromUrl(newUrl)
      });
    }
  };

  // --- Render Components ---

  const NewTabScreen = () => {
    const [localSearch, setLocalSearch] = useState('');
    const time = new Date();
    const greeting = time.getHours() < 12 ? 'Good Morning' : time.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

    const shortcuts = [
      { name: 'Google', url: 'https://google.com', icon: 'G' },
      { name: 'Wikipedia', url: 'https://wikipedia.org', icon: 'W' },
      { name: 'GitHub', url: 'https://github.com', icon: 'Gh' },
      { name: 'HackerNews', url: 'https://news.ycombinator.com', icon: 'Y' },
    ];

    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 animate-in fade-in duration-500">
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl px-4">
          
          <div className="text-center">
            <h1 className="text-4xl font-light text-slate-800 mb-2">{greeting}</h1>
            <p className="text-slate-500">{time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-400" size={20} />
            </div>
            <input 
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter') handleNavigate(localSearch);
              }}
              placeholder="Search the web or type a URL"
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-full shadow-lg shadow-slate-200/50 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all text-lg"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            {shortcuts.map(s => (
              <button 
                key={s.name}
                onClick={() => handleNavigate(s.url)}
                className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                  {s.icon}
                </div>
                <span className="text-sm text-slate-600">{s.name}</span>
              </button>
            ))}
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Tab Bar */}
      <div className="flex items-end bg-slate-950 px-2 pt-2 gap-1 overflow-x-auto border-b border-slate-800 scrollbar-hide">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`
              group relative flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs max-w-[200px] min-w-[120px] cursor-pointer transition-colors select-none
              ${activeTabId === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-900/30 text-slate-500 hover:bg-slate-900/50 hover:text-slate-300'}
            `}
          >
            <Globe size={12} className={activeTabId === tab.id ? "text-cyan-400" : "text-slate-600"} />
            <span className="truncate flex-1">{tab.title}</span>
            <button 
              onClick={(e) => closeTab(e, tab.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-opacity"
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

      {/* Browser Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-slate-900 border-b border-slate-800 shadow-sm z-10">
        <button onClick={goBack} disabled={activeTab.historyIndex === 0} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md disabled:opacity-30 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <button onClick={goForward} disabled={activeTab.historyIndex === activeTab.history.length - 1} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md disabled:opacity-30 transition-colors">
          <ArrowRight size={16} />
        </button>
        <button onClick={() => { if(activeTab.url !== NEW_TAB_URL) handleNavigate(activeTab.url); }} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-colors">
          <RotateCw size={16} className={activeTab.loading ? "animate-spin" : ""} />
        </button>
        <button onClick={() => { updateTab(activeTabId, { url: NEW_TAB_URL, title: 'New Tab', displayUrl: '' }); }} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-colors">
          <Home size={16} />
        </button>
        
        <div className="flex-1 flex items-center bg-slate-950 border border-slate-700 rounded-full px-3 py-1.5 text-sm shadow-inner focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/10 transition-all">
          <div className="mr-2">
            {activeTab.url.startsWith('https') ? <Lock size={12} className="text-green-500" /> : <AlertCircle size={12} className="text-slate-500" />}
          </div>
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate(inputUrl)}
            onFocus={(e) => e.target.select()}
            className="flex-1 bg-transparent outline-none text-slate-200 placeholder:text-slate-600"
            placeholder="Search or enter address"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-white overflow-hidden">
        {activeTab.loading && (
          <div className="absolute top-0 left-0 w-full h-0.5 bg-slate-100 z-20">
             <div className="h-full bg-cyan-500 animate-[progress_1s_ease-in-out_infinite]" style={{width: '50%'}}></div>
          </div>
        )}
        
        {activeTab.url === NEW_TAB_URL ? (
           <NewTabScreen />
        ) : (
          <iframe 
            ref={iframeRef}
            key={activeTab.id} // Forces remount on tab switch
            src={activeTab.isProxyEnabled ? getProxyUrl(activeTab.url) : activeTab.url}
            className="w-full h-full border-none bg-white" 
            title={activeTab.title}
            // Sandbox is important for security, but too restrictive might break sites.
            // allow-same-origin is needed for some sites, but dangerous if we didn't trust the content.
            // Since we are simulating a browser, we are permissive.
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-modals"
            onError={() => alert('Failed to load')}
          />
        )}
      </div>
    </div>
  );
};

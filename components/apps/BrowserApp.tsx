import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Lock, Plus, X, Search, Globe, AlertCircle, Home, ExternalLink } from 'lucide-react';

interface Tab {
  id: string;
  url: string;         // The intended URL
  displayUrl: string;  // Text in address bar
  history: string[];
  historyIndex: number;
  loading: boolean;
  title: string;
  content: string;     // The actual HTML content to render via srcDoc
  mode: 'proxy' | 'direct'; // Proxy (fetch+rewrite) or Direct (iframe src)
}

const NEW_TAB_URL = 'cerium://newtab';
const SEARCH_URL_BASE = 'https://www.google.com/search?q=';
const PROXY_BASE = 'https://corsproxy.io/?'; // Fallback: 'https://api.allorigins.win/raw?url='

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
      content: '',
      mode: 'proxy'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [inputUrl, setInputUrl] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Sync input bar
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
      content: '',
      mode: 'proxy'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) setActiveTabId(newTabs[newTabs.length - 1].id);
  };

  // --- Core Navigation Logic ---

  const isUrl = (str: string) => {
    // Basic heuristics for URL vs Search
    return str.includes('.') && !str.includes(' ') && !str.startsWith('?');
  };

  const normalizeUrl = (input: string) => {
    let url = input.trim();
    if (!isUrl(url)) {
      return SEARCH_URL_BASE + encodeURIComponent(url);
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const fetchPageContent = async (url: string): Promise<string> => {
    // If it's a search URL or explicitly whitelisted for direct access, we might treat it differently,
    // but for consistency with the "White Screen" fix, we'll try to proxy everything we can 
    // EXCEPT internal urls.
    
    if (url === NEW_TAB_URL) return '';

    // Direct mode check for specific sites that might break with proxying or allow framing
    if (url.includes('bing.com') || url.includes('wikipedia.org')) {
       // We can return a special marker or handle this in render
       return `__DIRECT__`;
    }

    try {
      const targetUrl = url;
      // We use the proxy to fetch the raw HTML
      const response = await fetch(`${PROXY_BASE}${encodeURIComponent(targetUrl)}`);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      let html = await response.text();

      // --- CRITICAL FIX: INJECT BASE TAG ---
      // This forces all relative links (css, js, images) to resolve against the original URL
      // instead of the broken iframe environment.
      const baseTag = `<base href="${targetUrl}" />`;
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${baseTag}`);
      } else {
        html = `${baseTag}${html}`;
      }

      // Optional: Script injection to handle link clicks within the iframe
      const scriptFix = `
        <script>
          document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.href) {
              e.preventDefault();
              window.parent.postMessage({ type: 'LINK_CLICK', url: link.href }, '*');
            }
          });
        </script>
      `;
      html = html + scriptFix;

      return html;

    } catch (error: any) {
      console.error("Proxy Error:", error);
      return `
        <html>
          <body style="font-family: sans-serif; padding: 2rem; color: #333;">
            <h2>Unable to load page</h2>
            <p>The requested URL <strong>${url}</strong> could not be retrieved.</p>
            <p>Reason: ${error.message || 'Network Error'}</p>
            <hr/>
            <p><em>Tip: Some websites block access from proxies or iframes.</em></p>
          </body>
        </html>
      `;
    }
  };

  const handleNavigate = async (input: string) => {
    if (!input) return;
    const url = normalizeUrl(input);
    const display = url.startsWith(SEARCH_URL_BASE) ? input : url;

    // Update History
    const newHistory = [...activeTab.history.slice(0, activeTab.historyIndex + 1), url];
    
    updateTab(activeTabId, {
      url,
      displayUrl: display,
      title: 'Loading...',
      loading: true,
      history: newHistory,
      historyIndex: newHistory.length - 1
    });

    const content = await fetchPageContent(url);
    
    updateTab(activeTabId, {
      loading: false,
      title: getTitleFromUrl(url),
      content: content
    });
  };

  const getTitleFromUrl = (url: string) => {
    if (url.startsWith(SEARCH_URL_BASE)) return 'Search';
    try {
      return new URL(url).hostname;
    } catch {
      return 'Page';
    }
  };

  const handleMessage = (e: MessageEvent) => {
    // Handle clicks from inside the iframe (if script injection worked)
    if (e.data && e.data.type === 'LINK_CLICK' && e.data.url) {
      handleNavigate(e.data.url);
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeTabId, tabs]); // Re-bind if tabs change to ensure fresh closure state if needed

  // Navigation Buttons
  const goBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const url = activeTab.history[newIndex];
      // Re-fetch content for history navigation
      updateTab(activeTabId, { historyIndex: newIndex, url, loading: true });
      fetchPageContent(url).then(content => {
          updateTab(activeTabId, { 
              loading: false, 
              title: getTitleFromUrl(url),
              content,
              displayUrl: url
          });
      });
    }
  };

  const goForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const url = activeTab.history[newIndex];
      updateTab(activeTabId, { historyIndex: newIndex, url, loading: true });
      fetchPageContent(url).then(content => {
          updateTab(activeTabId, { 
              loading: false, 
              title: getTitleFromUrl(url),
              content,
              displayUrl: url
          });
      });
    }
  };

  const refresh = () => handleNavigate(activeTab.url);

  // --- New Tab Page ---
  const NewTabScreen = () => {
    const [term, setTerm] = useState('');
    const time = new Date();
    
    const handleSearch = () => handleNavigate(term);

    const shortcuts = [
      { name: 'Google', url: 'https://www.google.com', icon: 'G' },
      { name: 'Bing', url: 'https://www.bing.com', icon: 'B' }, // Bing allows iframing often
      { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: 'W' },
      { name: 'Example', url: 'https://example.com', icon: 'Ex' },
    ];

    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 animate-in fade-in duration-500 overflow-y-auto">
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl px-4 py-12">
          
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-light text-slate-800 tracking-tight">
              {time.getHours() < 12 ? 'Good morning' : time.getHours() < 18 ? 'Good afternoon' : 'Good evening'}
            </h1>
          </div>

          <div className="w-full relative shadow-2xl shadow-cyan-900/10 rounded-full">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="text-slate-400" size={20} />
            </div>
            <input 
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search the web or type a URL"
              className="w-full pl-14 pr-6 py-4 bg-white border-0 rounded-full text-lg outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 transition-shadow"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-4 gap-6 w-full max-w-lg mt-4">
            {shortcuts.map(s => (
              <button 
                key={s.name}
                onClick={() => handleNavigate(s.url)}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-700 font-bold text-xl group-hover:scale-110 group-hover:shadow-md transition-all">
                  {s.icon}
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-cyan-600 transition-colors">{s.name}</span>
              </button>
            ))}
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Tabs */}
      <div className="flex items-end bg-slate-950 px-2 pt-2 gap-1 overflow-x-auto border-b border-slate-800 scrollbar-hide select-none">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`
              group relative flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs max-w-[200px] min-w-[120px] cursor-pointer transition-colors
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
            {activeTabId === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500" />}
          </div>
        ))}
        <button onClick={addTab} className="p-1.5 mb-1 hover:bg-slate-800 rounded-md text-slate-500 hover:text-slate-300">
          <Plus size={16} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-slate-900 border-b border-slate-800 shadow-sm z-10">
        <button onClick={goBack} disabled={activeTab.historyIndex === 0} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md disabled:opacity-30">
          <ArrowLeft size={16} />
        </button>
        <button onClick={goForward} disabled={activeTab.historyIndex === activeTab.history.length - 1} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md disabled:opacity-30">
          <ArrowRight size={16} />
        </button>
        <button onClick={refresh} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md">
          <RotateCw size={16} className={activeTab.loading ? "animate-spin" : ""} />
        </button>
        <button onClick={() => { updateTab(activeTabId, { url: NEW_TAB_URL, title: 'New Tab', displayUrl: '' }); }} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md">
          <Home size={16} />
        </button>
        
        <div className="flex-1 flex items-center bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm shadow-inner focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/10 transition-all">
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

        <button 
           onClick={() => window.open(activeTab.url, '_blank')}
           className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md"
           title="Open in real tab"
        >
          <ExternalLink size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-white overflow-hidden">
        {activeTab.loading && (
          <div className="absolute top-0 left-0 w-full h-0.5 bg-slate-100 z-20">
             <div className="h-full bg-cyan-500 animate-[progress_1s_ease-in-out_infinite]" style={{width: '50%'}}></div>
          </div>
        )}
        
        {activeTab.url === NEW_TAB_URL ? (
           <NewTabScreen />
        ) : (
           activeTab.content === '__DIRECT__' ? (
             <iframe 
               src={activeTab.url}
               className="w-full h-full border-none bg-white"
               title="Direct View"
               sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
             />
           ) : (
            <iframe 
                srcDoc={activeTab.content}
                className="w-full h-full border-none bg-white"
                title="Proxy View"
                // No sandbox needed for srcDoc usually, but good for safety. 
                // We must be careful not to block valid scripts from the proxied page.
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
           )
        )}
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { AppProps } from '../../types';

export const TextEditorApp: React.FC<AppProps> = ({ initialContent }) => {
  const [content, setContent] = useState(initialContent || '');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(14);

  const toggleMenu = (name: string) => {
    setActiveMenu(activeMenu === name ? null : name);
  };

  const closeMenus = () => setActiveMenu(null);

  // Menu Actions
  const handleNew = () => {
    if (confirm("Discard unsaved changes?")) {
      setContent('');
    }
    closeMenus();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    closeMenus();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent(content + text);
    } catch (err) {
      alert("Failed to paste: Permission denied or not supported.");
    }
    closeMenus();
  };

  const handleZoomIn = () => {
    setFontSize(prev => Math.min(prev + 2, 32));
    closeMenus();
  };

  const handleZoomOut = () => {
    setFontSize(prev => Math.max(prev - 2, 8));
    closeMenus();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200" onClick={closeMenus}>
      {/* Menu Bar */}
      <div className="relative h-8 bg-slate-800 border-b border-slate-700 flex items-center px-2 gap-1 text-xs select-none">
        
        {/* File Menu */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleMenu('file'); }}
            className={`px-3 py-1 rounded hover:bg-slate-700 ${activeMenu === 'file' ? 'bg-slate-700 text-white' : ''}`}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded shadow-xl z-50">
              <button onClick={handleNew} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">New</button>
              <button onClick={() => { alert("Feature available in File System"); closeMenus(); }} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">Open...</button>
              <div className="h-px bg-slate-700 my-1"></div>
              <button onClick={() => { alert("Saved locally!"); closeMenus(); }} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">Save</button>
              <button onClick={() => { closeMenus(); }} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">Exit</button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleMenu('edit'); }}
            className={`px-3 py-1 rounded hover:bg-slate-700 ${activeMenu === 'edit' ? 'bg-slate-700 text-white' : ''}`}
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded shadow-xl z-50">
              <button onClick={handleCopy} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">Copy All</button>
              <button onClick={handlePaste} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">Paste</button>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleMenu('view'); }}
            className={`px-3 py-1 rounded hover:bg-slate-700 ${activeMenu === 'view' ? 'bg-slate-700 text-white' : ''}`}
          >
            View
          </button>
          {activeMenu === 'view' && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded shadow-xl z-50">
              <button onClick={handleZoomIn} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">Zoom In</button>
              <button onClick={handleZoomOut} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">Zoom Out</button>
            </div>
          )}
        </div>

        {/* Help Menu */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleMenu('help'); }}
            className={`px-3 py-1 rounded hover:bg-slate-700 ${activeMenu === 'help' ? 'bg-slate-700 text-white' : ''}`}
          >
            Help
          </button>
          {activeMenu === 'help' && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded shadow-xl z-50">
              <button onClick={() => { alert("Cerium Text Editor v1.0"); closeMenus(); }} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">About</button>
            </div>
          )}
        </div>

      </div>

      <textarea
        className="flex-1 bg-slate-900 p-4 outline-none resize-none font-mono leading-relaxed"
        style={{ fontSize: `${fontSize}px` }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        spellCheck={false}
      />
      <div className="h-6 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-3 text-[10px] text-slate-500 select-none">
        <span>Ln {content.split('\n').length}, Col {content.length}</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
};
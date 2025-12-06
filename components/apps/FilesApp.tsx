import React, { useState, useEffect } from 'react';
import { FileSystemItem, AppProps } from '../../types';
import { Folder, FileText, Image, ChevronRight, Home, ArrowUp, File } from 'lucide-react';

export const FilesApp: React.FC<AppProps> = ({ files: globalFiles, onOpenFile }) => {
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fallback if no files passed (shouldn't happen in full app)
  const files = globalFiles || {};

  const currentFolderId = currentPath[currentPath.length - 1];
  const currentFolder = files[currentFolderId];

  const getBreadcrumbs = () => {
    return currentPath.map(id => files[id]?.name || 'Unknown');
  };

  const handleOpen = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      setCurrentPath([...currentPath, item.id]);
      setSelectedId(null);
    } else {
      if (onOpenFile) {
        onOpenFile(item);
      }
    }
  };

  const handleUp = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedId(null);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'folder': return <Folder size={48} className="text-blue-400 fill-blue-400/20" />;
      case 'image': return <Image size={48} className="text-purple-400" />;
      case 'text': return <FileText size={48} className="text-slate-400" />;
      default: return <File size={48} className="text-slate-500" />;
    }
  };

  if (!currentFolder) return <div className="p-4 text-slate-400">Directory not found.</div>;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Toolbar */}
      <div className="h-12 border-b border-slate-700 flex items-center px-4 gap-4 bg-slate-800/50">
        <div className="flex items-center gap-2">
           <button onClick={handleUp} disabled={currentPath.length <= 1} className="p-1.5 hover:bg-slate-700 rounded-md disabled:opacity-30 transition-colors">
             <ArrowUp size={18} />
           </button>
        </div>
        
        <div className="flex-1 flex items-center gap-1 bg-slate-950/50 border border-slate-700 rounded-md px-3 py-1.5 text-sm overflow-hidden">
          <Home size={14} className="text-slate-400 flex-shrink-0" />
          {getBreadcrumbs().map((name, i) => (
             <React.Fragment key={i}>
                <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
                <span 
                  className="hover:text-cyan-400 cursor-pointer whitespace-nowrap"
                  onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
                >
                  {name}
                </span>
             </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
          {currentFolder.children?.map(childId => {
            const item = files[childId];
            if (!item) return null;
            return (
              <div 
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                onDoubleClick={() => handleOpen(item)}
                className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-colors border border-transparent ${
                  selectedId === item.id ? 'bg-cyan-500/10 border-cyan-500/30' : 'hover:bg-slate-800'
                }`}
              >
                <div className="mb-2">
                  {getIcon(item.type)}
                </div>
                <span className="text-xs text-center break-all line-clamp-2 select-none">
                  {item.name}
                </span>
              </div>
            );
          })}
          
          {(!currentFolder.children || currentFolder.children.length === 0) && (
            <div className="col-span-full text-center text-slate-500 mt-10">
              This folder is empty
            </div>
          )}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="h-6 bg-slate-800 border-t border-slate-700 flex items-center px-4 text-xs text-slate-400">
        {currentFolder.children?.length || 0} items
      </div>
    </div>
  );
};

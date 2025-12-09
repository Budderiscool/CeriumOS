import React, { useState } from 'react';
import { FileSystemItem, AppProps } from '../../types';
import { Folder, FileText, Image, ChevronRight, Home, ArrowUp, File, FolderPlus, FilePlus, Trash2, Edit2 } from 'lucide-react';

export const FilesApp: React.FC<AppProps> = ({ files: globalFiles, fs, onOpenFile, settings }) => {
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fallback if no files passed
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

  const handleCreateFolder = () => {
    const name = prompt("Enter folder name:", "New Folder");
    if (name && fs) {
        fs.createItem(currentFolderId, name, 'folder');
    }
  };

  const handleCreateFile = () => {
    const name = prompt("Enter file name:", "New Text Document.txt");
    if (name && fs) {
        fs.createItem(currentFolderId, name, 'text', '');
    }
  };

  const handleRename = () => {
    if (selectedId && fs) {
        const item = files[selectedId];
        const newName = prompt("Enter new name:", item.name);
        if (newName && newName !== item.name) {
            fs.renameItem(selectedId, newName);
        }
    }
  };

  const handleDelete = () => {
    if (selectedId && fs) {
        if (confirm(`Are you sure you want to delete "${files[selectedId]?.name}"?`)) {
            fs.deleteItem(selectedId);
            setSelectedId(null);
        }
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'folder': return <Folder size={48} className={`text-${settings?.themeColor || 'cyan'}-400 fill-${settings?.themeColor || 'cyan'}-400/20`} />;
      case 'image': return <Image size={48} className="text-purple-400" />;
      case 'text': return <FileText size={48} className="text-slate-400" />;
      default: return <File size={48} className="text-slate-500" />;
    }
  };

  if (!currentFolder) return <div className="p-4 text-slate-400">Directory not found.</div>;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Toolbar */}
      <div className="h-12 border-b border-slate-700 flex items-center px-2 gap-2 bg-slate-800/50">
        <div className="flex items-center gap-1">
           <button onClick={handleUp} disabled={currentPath.length <= 1} className="p-1.5 hover:bg-slate-700 rounded-md disabled:opacity-30 transition-colors">
             <ArrowUp size={18} />
           </button>
           <div className="h-6 w-px bg-slate-700 mx-1" />
           <button onClick={handleCreateFolder} className="p-1.5 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white transition-colors" title="New Folder">
             <FolderPlus size={18} />
           </button>
           <button onClick={handleCreateFile} className="p-1.5 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white transition-colors" title="New File">
             <FilePlus size={18} />
           </button>
           <div className="h-6 w-px bg-slate-700 mx-1" />
           <button 
             onClick={handleRename}
             disabled={!selectedId}
             className="p-1.5 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
             title="Rename"
           >
             <Edit2 size={18} />
           </button>
           <button 
             onClick={handleDelete} 
             disabled={!selectedId} 
             className="p-1.5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-md disabled:opacity-30 transition-colors" 
             title="Delete"
           >
             <Trash2 size={18} />
           </button>
        </div>
        
        <div className="flex-1 flex items-center gap-1 bg-slate-950/50 border border-slate-700 rounded-md px-3 py-1.5 text-sm overflow-hidden ml-2">
          <Home size={14} className="text-slate-400 flex-shrink-0" />
          {getBreadcrumbs().map((name, i) => (
             <React.Fragment key={i}>
                <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
                <span 
                  className={`hover:text-${settings?.themeColor || 'cyan'}-400 cursor-pointer whitespace-nowrap`}
                  onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
                >
                  {name}
                </span>
             </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 p-4 overflow-y-auto" onClick={() => setSelectedId(null)}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
          {currentFolder.children?.map(childId => {
            const item = files[childId];
            if (!item) return null;
            return (
              <div 
                key={item.id}
                onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); }}
                onDoubleClick={(e) => { e.stopPropagation(); handleOpen(item); }}
                className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-colors border border-transparent ${
                  selectedId === item.id ? `bg-${settings?.themeColor || 'cyan'}-500/10 border-${settings?.themeColor || 'cyan'}-500/30` : 'hover:bg-slate-800'
                }`}
              >
                <div className="mb-2 pointer-events-none">
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
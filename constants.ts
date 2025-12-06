import { FileSystemItem, Wallpaper } from './types';

export const INITIAL_FILES: Record<string, FileSystemItem> = {
  'root': { id: 'root', name: 'Root', type: 'folder', parentId: null, children: ['desktop', 'documents', 'pictures'], createdAt: '2024-01-01' },
  'desktop': { id: 'desktop', name: 'Desktop', type: 'folder', parentId: 'root', children: ['shortcut-browser', 'shortcut-files', 'shortcut-settings', 'welcome-txt'], createdAt: '2024-01-01' },
  'documents': { id: 'documents', name: 'Documents', type: 'folder', parentId: 'root', children: ['project-plan'], createdAt: '2024-01-01' },
  'pictures': { id: 'pictures', name: 'Pictures', type: 'folder', parentId: 'root', children: ['img1'], createdAt: '2024-01-01' },
  
  // Desktop Items
  'shortcut-browser': { id: 'shortcut-browser', name: 'Browser', type: 'app', parentId: 'desktop', content: 'browser', createdAt: '2024-01-01' },
  'shortcut-files': { id: 'shortcut-files', name: 'Files', type: 'app', parentId: 'desktop', content: 'files', createdAt: '2024-01-01' },
  'shortcut-settings': { id: 'shortcut-settings', name: 'Settings', type: 'app', parentId: 'desktop', content: 'settings', createdAt: '2024-01-01' },
  'welcome-txt': { id: 'welcome-txt', name: 'Welcome.txt', type: 'text', parentId: 'desktop', content: 'Welcome to Cerium OS! This is a simulated operating system built with React.', createdAt: '2024-01-02' },
  
  // Other files
  'project-plan': { id: 'project-plan', name: 'Project Alpha.txt', type: 'text', parentId: 'documents', content: 'Phase 1: Design\nPhase 2: Develop\nPhase 3: Launch', createdAt: '2024-01-03' },
  'img1': { id: 'img1', name: 'Mountain.jpg', type: 'image', parentId: 'pictures', content: Wallpaper.MOUNTAIN, createdAt: '2024-01-04' },
};

export const INITIAL_SETTINGS = {
  username: 'User',
  themeColor: 'cyan',
  wallpaper: Wallpaper.ABSTRACT,
};

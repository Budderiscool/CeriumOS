import { ReactNode } from 'react';

export interface AppProps {
  initialContent?: string;
  settings?: UserSettings;
  updateSettings?: (newSettings: Partial<UserSettings>) => void;
  files?: Record<string, FileSystemItem>;
  onNavigate?: (path: string[]) => void;
  onOpenFile?: (file: FileSystemItem) => void;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: any; // Lucide Icon component
  component: React.FC<AppProps>;
  defaultWidth?: number;
  defaultHeight?: number;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  content?: string; // Content to pass to the app (e.g. file content)
}

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'image' | 'text' | 'app';
  content?: string;
  parentId: string | null;
  children?: string[]; // IDs of children
  createdAt: string;
}

export interface UserSettings {
  username: string;
  themeColor: string;
  wallpaper: string;
  password?: string; // Stored locally
}

export enum Wallpaper {
  ABSTRACT = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
  MOUNTAIN = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop',
  CITY = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop',
  MINIMAL = 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=2676&auto=format&fit=crop'
}

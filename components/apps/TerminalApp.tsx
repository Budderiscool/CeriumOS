import React, { useState, useRef, useEffect } from 'react';
import { AppProps } from '../../types';

export const TerminalApp: React.FC<AppProps> = ({ files, settings, fs }) => {
  const [history, setHistory] = useState<string[]>(['Welcome to Cerium OS Terminal v1.1', 'Type "help" for available commands.']);
  const [input, setInput] = useState('');
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();
      const newHistory = [...history, `${settings?.username || 'user'}@cerium:~${getPathString()}$ ${cmd}`];
      
      if (cmd) {
        const output = execute(cmd);
        if (output) newHistory.push(output);
      }
      
      setHistory(newHistory);
      setInput('');
    }
  };

  const getPathString = () => {
    if (currentPath.length === 1) return '/';
    return '/' + currentPath.slice(1).map(id => files?.[id]?.name || id).join('/');
  };

  const execute = (cmdStr: string): string | null => {
    const args = cmdStr.split(' ');
    const cmd = args[0].toLowerCase();
    const currentDirId = currentPath[currentPath.length - 1];

    switch (cmd) {
      case 'help':
        return "Available commands: help, clear, echo, date, whoami, ls, pwd, cd [dir], mkdir [name], touch [name], rm [name]";
      case 'clear':
        setTimeout(() => setHistory([]), 10);
        return null;
      case 'echo':
        return args.slice(1).join(' ');
      case 'date':
        return new Date().toString();
      case 'whoami':
        return settings?.username || 'user';
      case 'pwd':
        return getPathString();
      case 'ls': {
        const currentDir = files?.[currentDirId];
        if (!currentDir || !currentDir.children) return '';
        if (currentDir.children.length === 0) return '(empty)';
        return currentDir.children.map(childId => {
          const item = files?.[childId];
          const suffix = item?.type === 'folder' ? '/' : '';
          return (item?.name || childId) + suffix;
        }).join('  ');
      }
      case 'cd': {
        const target = args[1];
        if (!target || target === '.') return null;
        if (target === '..') {
          if (currentPath.length > 1) {
            setCurrentPath(prev => prev.slice(0, -1));
          }
          return null;
        }
        
        const currentDir = files?.[currentDirId];
        const targetId = currentDir?.children?.find(childId => files?.[childId]?.name === target);
        
        if (targetId && files?.[targetId]?.type === 'folder') {
            setCurrentPath(prev => [...prev, targetId]);
            return null;
        }
        return `cd: no such file or directory: ${target}`;
      }
      case 'mkdir': {
        const name = args[1];
        if (!name) return "mkdir: missing operand";
        if (fs) {
            fs.createItem(currentDirId, name, 'folder');
            return null;
        }
        return "Error: File system not available";
      }
      case 'touch': {
        const name = args[1];
        if (!name) return "touch: missing operand";
        if (fs) {
            fs.createItem(currentDirId, name, 'text', '');
            return null;
        }
        return "Error: File system not available";
      }
      case 'rm': {
        const name = args[1];
        if (!name) return "rm: missing operand";
        const currentDir = files?.[currentDirId];
        const targetId = currentDir?.children?.find(childId => files?.[childId]?.name === name);
        if (targetId && fs) {
            fs.deleteItem(targetId);
            return null;
        }
        return `rm: cannot remove '${name}': No such file or directory`;
      }
      default:
        return `command not found: ${cmd}`;
    }
  };

  const themeColor = settings?.themeColor || 'green';
  const textColor = themeColor === 'green' ? 'text-green-400' : `text-${themeColor}-400`;

  return (
    <div 
      className={`flex flex-col h-full bg-slate-950 ${textColor} font-mono text-sm p-4 overflow-hidden`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto space-y-1" ref={scrollRef}>
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">{line}</div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-${settings?.themeColor || 'cyan'}-400`}>{settings?.username || 'user'}@cerium:~{getPathString()}$</span>
        <input 
          ref={inputRef}
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className={`flex-1 bg-transparent outline-none border-none ${textColor}`}
          autoFocus
        />
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types';
import { ArrowRight, Lock, UserPlus } from 'lucide-react';

interface LoginScreenProps {
  settings: UserSettings;
  onLogin: (settings?: Partial<UserSettings>) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ settings, onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [storedUser, setStoredUser] = useState<UserSettings | null>(null);

  useEffect(() => {
    // Check local storage for existing user
    const saved = localStorage.getItem('cerium_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setStoredUser(parsed);
      setUsername(parsed.username);
      setMode('signin');
    } else {
      setMode('signup');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!username || !password) {
        setError('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      const newUser = { ...settings, username, password };
      localStorage.setItem('cerium_user', JSON.stringify(newUser));
      onLogin(newUser);
    } else {
      // Sign In
      if (storedUser && password === storedUser.password) {
        onLogin(storedUser);
      } else {
        setError('Incorrect password');
      }
    }
  };

  return (
    <div 
      className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${storedUser?.wallpaper || settings.wallpaper})` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      
      <div className="z-10 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500 max-w-sm w-full px-4">
        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-2xl">
           <img 
             src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop" 
             alt="User" 
             className="w-full h-full rounded-full object-cover border-4 border-black/20"
           />
        </div>
        
        <div className="text-center mb-2">
          <h1 className="text-3xl font-light mb-1">
            {mode === 'signin' ? (storedUser?.username || 'User') : 'Create Account'}
          </h1>
          <p className="text-sm text-white/60">Cerium OS</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-64">
          {mode === 'signup' && (
             <input
             type="text"
             value={username}
             onChange={(e) => setUsername(e.target.value)}
             placeholder="Username"
             className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:bg-white/20 focus:border-cyan-400/50 transition-all placeholder:text-white/40 backdrop-blur-sm"
           />
          )}

          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 pr-10 outline-none focus:bg-white/20 focus:border-cyan-400/50 transition-all placeholder:text-white/40 backdrop-blur-sm"
              autoFocus
            />
            {mode === 'signin' && (
              <button 
                type="submit"
                className="absolute right-1 top-1 p-1.5 rounded-md hover:bg-white/10 text-white/70 transition-colors"
              >
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          {mode === 'signup' && (
             <>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:bg-white/20 focus:border-cyan-400/50 transition-all placeholder:text-white/40 backdrop-blur-sm"
              />
              <button 
                type="submit" 
                className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-lg transition-colors font-medium shadow-lg shadow-cyan-900/50"
              >
                Create Account
              </button>
             </>
          )}
        </form>
        
        {error && <p className="text-red-300 text-xs bg-red-500/20 px-3 py-1 rounded-full">{error}</p>}
        
        {storedUser && mode === 'signin' && (
          <div className="mt-4">
             <button 
               onClick={() => {
                 setMode('signup');
                 setUsername('');
                 setPassword('');
                 setConfirmPassword('');
               }}
               className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition-colors"
             >
               <UserPlus size={12} /> Create new user
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

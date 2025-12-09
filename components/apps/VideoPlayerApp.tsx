import React, { useState } from 'react';
import { AppProps } from '../../types';
import { Play, Pause, Volume2, Maximize } from 'lucide-react';

export const VideoPlayerApp: React.FC<AppProps> = () => {
  const [videoSrc, setVideoSrc] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  
  const playlist = [
    { title: 'Big Buck Bunny', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { title: 'Elephant Dream', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    { title: 'For Bigger Blazes', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
  ];

  return (
    <div className="flex h-full bg-black text-white">
      {/* Sidebar List */}
      <div className="w-48 bg-slate-900 border-r border-slate-800 p-4 hidden md:flex flex-col gap-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Playlist</h3>
        {playlist.map((item) => (
          <button
            key={item.url}
            onClick={() => setVideoSrc(item.url)}
            className={`text-left p-2 rounded text-sm truncate ${videoSrc === item.url ? 'bg-cyan-900/50 text-cyan-400' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* Player Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative group bg-black">
        <video 
            src={videoSrc} 
            controls 
            className="w-full h-full max-h-full object-contain"
            autoPlay={false}
        />
      </div>
    </div>
  );
};
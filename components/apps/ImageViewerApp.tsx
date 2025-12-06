import React, { useRef, useEffect, useState } from 'react';
import { AppProps } from '../../types';
import { Pencil, Eraser, Trash2, Download, MousePointer } from 'lucide-react';

export const ImageViewerApp: React.FC<AppProps> = ({ initialContent }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
  const [color, setColor] = useState('#ef4444'); // Red default
  const [brushSize, setBrushSize] = useState(4);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    
    // Fit canvas to container on mount
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match container or image
    canvas.width = containerRef.current.clientWidth;
    canvas.height = containerRef.current.clientHeight;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialContent && !imgLoaded) {
      const img = new window.Image();
      img.src = initialContent;
      img.onload = () => {
        // Center image
        const aspect = img.width / img.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.width / aspect;

        if (drawHeight > canvas.height) {
            drawHeight = canvas.height;
            drawWidth = canvas.height * aspect;
        }

        const x = (canvas.width - drawWidth) / 2;
        const y = (canvas.height - drawHeight) / 2;
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        setImgLoaded(true);
      };
    } else if (!imgLoaded) {
      // Fill white background if no image
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setImgLoaded(true);
    }
  }, [initialContent, imgLoaded]);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#1e293b' : color;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Reload image if exists
    setImgLoaded(false); 
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Toolbar */}
      <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4 select-none">
        
        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700">
          <button 
            onClick={() => setTool('pencil')}
            className={`p-1.5 rounded ${tool === 'pencil' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Pencil"
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded ${tool === 'eraser' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Eraser"
          >
            <Eraser size={18} />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-700" />

        <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={color}
              onChange={(e) => { setColor(e.target.value); setTool('pencil'); }}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
              title="Color Picker"
            />
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24 accent-cyan-500"
              title="Brush Size"
            />
        </div>

        <div className="flex-1" />

        <button 
          onClick={clearCanvas}
          className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors"
          title="Clear Canvas"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} className="flex-1 bg-slate-950 relative overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="block w-full h-full"
        />
      </div>
    </div>
  );
};
import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
  currentFile: File | null;
  onClear: () => void;
  isLoading: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileAccepted, currentFile, onClear, isLoading }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isLoading) setIsDragOver(true);
  }, [isLoading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileAccepted(file);
      }
    }
  }, [onFileAccepted, isLoading]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileAccepted(e.target.files[0]);
    }
  }, [onFileAccepted]);

  if (currentFile) {
    const imageUrl = URL.createObjectURL(currentFile);
    return (
      <div className="relative w-full max-w-xl mx-auto mb-8 animate-fade-in">
        <div className={`
          relative rounded-2xl overflow-hidden border bg-slate-900/50 backdrop-blur-sm transition-all duration-500
          ${isLoading 
            ? 'border-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.4)]' 
            : 'border-cyan-500/30 neon-glow'}
        `}>
          <img 
            src={imageUrl} 
            alt="Upload preview" 
            className={`w-full h-64 object-contain bg-black/40 transition-opacity duration-300 ${isLoading ? 'opacity-80' : 'opacity-100'}`} 
          />
          
          {/* Scanning Animation Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] animate-scan" />
                <div className="absolute inset-0 bg-cyan-500/10" />
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-cyan-400 text-[10px] font-bold tracking-widest px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                    SCANNING TARGET
                </div>
            </div>
          )}

          <div className="absolute top-2 right-2 z-30">
            <button 
              onClick={onClear}
              disabled={isLoading}
              className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-full backdrop-blur-md border border-red-500/30 transition-colors disabled:opacity-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-3 bg-slate-900/80 border-t border-cyan-900/50 flex justify-between items-center relative z-30">
            <span className="text-cyan-400 text-sm truncate">{currentFile.name}</span>
            <span className="text-slate-500 text-xs uppercase tracking-wider">
                {isLoading ? 'Analysis in Progress' : 'Ready to Analyze'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full max-w-xl mx-auto mb-8 h-64 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
        flex flex-col items-center justify-center gap-4 group overflow-hidden
        ${isDragOver 
          ? 'border-cyan-400 bg-cyan-900/20 scale-105 neon-glow' 
          : 'border-slate-600 bg-slate-800/30 hover:border-cyan-500/50 hover:bg-slate-800/50'
        }
        ${isLoading ? 'opacity-50 pointer-events-none grayscale' : ''}
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        disabled={isLoading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className={`
        p-4 rounded-full transition-transform duration-500
        ${isDragOver ? 'bg-cyan-500/20 rotate-12' : 'bg-slate-700/50 group-hover:scale-110'}
      `}>
        <UploadCloud className={`w-10 h-10 ${isDragOver ? 'text-cyan-300' : 'text-slate-400'}`} />
      </div>
      
      <div className="text-center z-0">
        <h3 className={`text-lg font-bold mb-1 ${isDragOver ? 'text-cyan-300' : 'text-slate-200'}`}>
          Drop Image Here
        </h3>
        <p className="text-slate-400 text-sm">
          or <span className="text-cyan-400 underline decoration-cyan-500/30 underline-offset-4">click to browse</span>
        </p>
      </div>

      <div className="absolute bottom-4 flex gap-4 text-slate-500 text-xs">
        <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> JPG</span>
        <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> PNG</span>
      </div>
      
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10 cyber-grid z-[-1]" />
    </div>
  );
};
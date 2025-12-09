import React, { useState, useEffect } from 'react';
import { X, Key, Trash2, Save, Check, ShieldAlert } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onClearData }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('GEMINI_API_KEY');
      if (storedKey) setApiKey(storedKey);
      else setApiKey('');
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
      setApiKey('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)] overflow-hidden m-4">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <h2 className="text-lg font-bold text-cyan-400 tracking-wider uppercase brand-font">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-cyan-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* API Key Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Key className="w-3 h-3" /> Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="Enter your API Key (starts with AIza...)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
              />
              <button
                onClick={handleSaveKey}
                className={`absolute right-2 top-2 p-1.5 rounded-md transition-all ${
                  isSaved 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                }`}
                title="Save Key"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Your key is saved locally in your browser. Leave empty to use the system default (if configured).
            </p>
          </div>

          <div className="h-px bg-slate-800/50" />

          {/* Session Management */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-3 h-3" /> Danger Zone
            </label>
            <button 
              onClick={() => {
                onClearData();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-900/10 border border-red-500/20 text-red-300/80 hover:bg-red-900/30 hover:border-red-500/40 hover:text-red-200 transition-all group"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Clear History & Reset App</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
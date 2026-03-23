import React from 'react';
import { Sparkles, ShieldCheck, Cpu, Settings } from 'lucide-react';
import { config } from '../lib/config';
import { SettingsModal } from './SettingsModal';

interface NavbarProps {
  onStart?: () => void;
  showProviderToggle?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onStart, showProviderToggle = true }) => {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  return (
    <nav className="fixed top-0 w-full z-50 px-3 sm:px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onStart}>
        <div className="w-10 h-10 md:w-11 md:h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight truncate">StudySathi <span className="text-primary">AI</span></h1>
          <p className="hidden sm:block text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold truncate">Private Exam Copilot</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-300/20">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Private</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-300 bg-cyan-300/10 px-3 py-1 rounded-full border border-cyan-300/20">
            <Cpu className="w-4 h-4" />
            <span>On-Device AI</span>
          </div>
        </div>

        {showProviderToggle && (
          <button 
            disabled
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 border bg-primary/10 border-primary/30 text-primary"
          >
            <Cpu className="w-4 h-4" />
            <span>{config.strictOffline ? 'RunAnywhere (Locked)' : 'RunAnywhere'}</span>
          </button>
        )}

        <button 
          onClick={() => setSettingsOpen(true)}
          className="p-2 md:p-2.5 hover:bg-white/10 rounded-full transition-colors border border-white/10 bg-white/5 shrink-0 hover:border-primary/30"
        >
          <Settings className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
        </button>
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </nav>
  );
};

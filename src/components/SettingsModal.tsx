import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Ear, Shield, Info, Zap, Download, Lock, BarChart3 } from 'lucide-react';
import { config } from '../lib/config';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [voiceInput, setVoiceInput] = React.useState(true);
  const [voiceOutput, setVoiceOutput] = React.useState(true);
  const [sessionTime] = React.useState(new Date().toLocaleString());
  const [cacheSize, setCacheSize] = React.useState('0 MB');

  React.useEffect(() => {
    // Calculate local storage size
    let size = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    setCacheSize(`${(size / 1024 / 1024).toFixed(2)} MB`);
  }, []);

  const clearCache = () => {
    localStorage.clear();
    setCacheSize('0 MB');
    alert('Cache cleared successfully');
  };

  return (
    <AnimatePresence>
      {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-50 w-[90%] max-w-2xl max-h-[75vh] overflow-hidden flex flex-col bg-background border border-white/10 rounded-3xl shadow-2xl m-4"
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/10 bg-background/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Voice I/O Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Volume2 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">Voice Controls</h3>
                </div>

                <div className="glass p-4 rounded-2xl border border-white/5 space-y-4 mx-auto max-w-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Ear className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="font-semibold text-sm">Speech Recognition (STT)</p>
                        <p className="text-xs text-muted-foreground">Voice input for questions</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={voiceInput}
                        onChange={(e) => setVoiceInput(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 border border-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/30" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="font-semibold text-sm">Text-to-Speech (TTS)</p>
                        <p className="text-xs text-muted-foreground">Voice output for responses</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={voiceOutput}
                        onChange={(e) => setVoiceOutput(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 border border-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/30" />
                    </label>
                  </div>
                </div>
              </div>

              {/* AI Provider Status */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">AI Provider Status</h3>
                </div>

                <div className="glass p-4 rounded-2xl border border-white/5 space-y-3 mx-auto max-w-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Provider</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                      RunAnywhere
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Mode</span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      config.strictOffline
                        ? 'bg-green-500/10 text-green-300 border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'
                    }`}>
                      {config.strictOffline ? '🔒 Offline Mode' : '☁️ Hybrid Mode'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Processing</span>
                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-300 text-xs font-bold rounded-full border border-cyan-500/20">
                      Local + Browser
                    </span>
                  </div>
                </div>
              </div>

              {/* Privacy & Data Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">Privacy & Data</h3>
                </div>

                <div className="glass p-4 rounded-2xl border border-white/5 space-y-4 mx-auto max-w-sm">
                  <div className="flex items-start gap-3 pb-3 border-b border-white/5">
                    <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-center">
                      <p className="font-semibold text-sm">End-to-End Private</p>
                      <p className="text-xs text-muted-foreground">Your study notes never leave your device. All processing happens locally.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-3 border-b border-white/5">
                    <Download className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-center">
                      <p className="font-semibold text-sm">Local Cache</p>
                      <p className="text-xs text-muted-foreground">Size: {cacheSize}</p>
                      <button
                        onClick={clearCache}
                        className="mt-2 px-3 py-1 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold rounded-lg transition-colors"
                      >
                        Clear Cache
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-center">
                    <BarChart3 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">No Tracking</p>
                      <p className="text-xs text-muted-foreground">StudySathi AI does not collect analytics, usage data, or personal information.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">Session Information</h3>
                </div>

                <div className="glass p-4 rounded-2xl border border-white/5 space-y-2 mx-auto max-w-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Session Started</span>
                    <span className="text-sm font-semibold">{sessionTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Browser</span>
                    <span className="text-sm font-semibold">{navigator.userAgent.split(' ').slice(-1)[0]}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Platform</span>
                    <span className="text-sm font-semibold">{navigator.platform}</span>
                  </div>
                </div>
              </div>

              {/* About & Help */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">About StudySathi AI</h3>
                </div>

                <div className="glass p-4 rounded-2xl border border-white/5 space-y-3 mx-auto max-w-sm text-center">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">StudySathi AI</span> is a private exam preparation copilot powered by local AI models. Transform your study notes into exams, flashcards, and interactive learning experiences.
                  </p>
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Features:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>✓ Smart Summarization</li>
                      <li>✓ Exam Answer Generation</li>
                      <li>✓ Quiz & Flashcard Creation</li>
                      <li>✓ AI Chat Tutor with Voice I/O</li>
                      <li>✓ 100% Private & Offline</li>
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-white/5">
                    <p className="text-xs text-muted-foreground">
                      Built with ❤️ | Powered by RunAnywhere SDK & WebLLM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 p-6 border-t border-white/10 bg-background/95 backdrop-blur flex justify-center gap-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                ✕ Close
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

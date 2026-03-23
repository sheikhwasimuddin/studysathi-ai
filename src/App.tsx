import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Dashboard } from './pages/Dashboard';

function App() {
  const [view, setView] = React.useState<'landing' | 'dashboard'>('landing');

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30">
      <Navbar 
        onStart={() => setView('landing')} 
        showProviderToggle={view === 'dashboard'} 
      />
      
      <main>
        {view === 'landing' ? (
          <Hero onStart={() => setView('dashboard')} />
        ) : (
          <Dashboard />
        )}
      </main>

      {/* Footer (Simplified) */}
      <footer className="mt-20 py-12 border-t border-white/10 text-center text-muted-foreground text-sm bg-white/[0.02]">
        <p className="text-foreground/90 font-medium">&copy; 2026 StudySathi AI. Built for the On-Device AI Hackathon.</p>
        <div className="flex items-center justify-center gap-4 mt-4 text-[10px] uppercase font-bold tracking-[0.2em]">
           <span>Privacy First</span>
           <span className="w-1 h-1 bg-primary/60 rounded-full" />
           <span>On-Device Intelligence</span>
           <span className="w-1 h-1 bg-accent/80 rounded-full" />
           <span>Offline Ready</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

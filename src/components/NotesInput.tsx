import React from 'react';
import { FileText, Upload, Trash2, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';

const DEMO_NOTES = `Object-Oriented Programming (OOP) is a programming paradigm based on the concept of "objects", which can contain data and code. Data in the form of fields (often known as attributes or properties), and code, in the form of procedures (often known as methods).

Core Principles of OOP:
- Encapsulation: Bundling of data and methods within a single unit.
- Abstraction: Hiding internal implementation details and showing only necessary features.
- Inheritance: Mechanism where a new class inherits properties from an existing class.
- Polymorphism: Ability of different objects to respond to the same message in their own way.

Key Benefits:
1. Reusability
2. Scalability
3. Maintainability`;

interface NotesInputProps {
  onNotesChange: (notes: string) => void;
  initialNotes?: string;
}

export const NotesInput: React.FC<NotesInputProps> = ({ onNotesChange, initialNotes = '' }) => {
  const [notes, setNotes] = React.useState(initialNotes);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    onNotesChange(val);
    storageService.saveNotes(val);
  };

  const loadDemoNotes = () => {
    setNotes(DEMO_NOTES);
    onNotesChange(DEMO_NOTES);
    storageService.saveNotes(DEMO_NOTES);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setNotes(content);
      onNotesChange(content);
      storageService.saveNotes(content);
    };
    reader.readAsText(file);
  };

  const clearNotes = () => {
    if (window.confirm('Clear all notes?')) {
      setNotes('');
      onNotesChange('');
      storageService.clear();
    }
  };

  return (
    <div className="flex flex-col h-full soft-panel rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white/[0.03]">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="text-primary w-5 h-5" />
          <h2 className="font-bold tracking-tight truncate">Study Material</h2>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button 
            onClick={loadDemoNotes}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary border border-primary/25 transition-colors font-semibold whitespace-nowrap"
          >
            Load Demo
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/6 hover:bg-white/10 text-muted-foreground border border-white/12 transition-colors flex items-center gap-1 font-semibold whitespace-nowrap"
          >
            <Upload className="w-3 h-3" />
            Upload .txt
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".txt" 
            className="hidden" 
          />
          <button 
            onClick={clearNotes}
            className="text-xs px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition-colors whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="relative flex-1">
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Paste your study notes here or upload a file..."
          className="w-full h-full p-6 bg-transparent resize-none focus:outline-none text-foreground/90 leading-relaxed custom-scrollbar"
        />
        {notes.length > 0 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-mono font-bold bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
            {notes.length} Characters
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground bg-white/[0.03]">
        <div className="flex items-center gap-2">
          {notes.length > 0 ? (
            <div className="flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 className="w-3 h-3" />
              <span>Session Loaded</span>
            </div>
          ) : (
            <span>Ready for Input</span>
          )}
        </div>
        <span className="font-mono">study_sathi_v1.0</span>
      </div>
    </div>
  );
};

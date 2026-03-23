import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  BrainCircuit, 
  BookOpen, 
  MessageSquare, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { NotesInput } from '../components/NotesInput';
// import { aiService } from '../services/ai/aiService';
import { SummarizerView } from './views/SummarizerView';
import { ExamAnswersView } from './views/ExamAnswersView';
import { QuizView } from './views/QuizView';
import { FlashcardsView } from './views/FlashcardsView';
import { ChatView } from './views/ChatView';

export const Dashboard: React.FC = () => {
  const [notes, setNotes] = React.useState('');
  const [activeView, setActiveView] = React.useState<'overview' | 'summary' | 'exam' | 'quiz' | 'flashcards' | 'chat'>('overview');

  const menuItems = [
    { id: 'summary', icon: <FileText className="w-5 h-5" />, label: 'Summarizer', desc: 'Generate smart summaries' },
    { id: 'exam', icon: <BrainCircuit className="w-5 h-5" />, label: 'Exam Prep', desc: '2, 5, 10 mark answers' },
    { id: 'quiz', icon: <BookOpen className="w-5 h-5" />, label: 'Quiz System', desc: 'MCQs & short questions' },
    { id: 'flashcards', icon: <Zap className="w-5 h-5" />, label: 'Flashcards', desc: 'Interactive revision' },
    { id: 'chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Chat Tutor', desc: 'Ask anything about your notes' },
  ];

  return (
    <div className="pt-28 md:pt-30 min-h-screen bg-background text-foreground flex flex-col md:flex-row p-4 md:p-6 gap-6 max-w-7xl mx-auto">
      {/* Sidebar / Left Panel */}
      <div className="w-full md:w-80 flex flex-col gap-6">
        <NotesInput onNotesChange={setNotes} />
        
        <div className="soft-panel p-4 rounded-2xl">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 px-2">Assistant Features</h3>
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                disabled={!notes}
                className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                  activeView === item.id 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                  : 'hover:bg-white/5 text-muted-foreground border border-transparent hover:border-white/10'
                } ${!notes && 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeView === item.id ? 'bg-white/20' : 'bg-white/5 ring-1 ring-white/5 group-hover:bg-white/10'}`}>
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${activeView === item.id ? 'text-primary-foreground' : 'group-hover:text-foreground'}`}>{item.label}</p>
                    <p className={`text-[10px] ${activeView === item.id ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeView === item.id ? 'translate-x-0' : 'translate-x-[-4px] group-hover:translate-x-0'}`} />
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          {!notes ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full glass rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-12"
            >
              <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mb-6 badge-glow">
                <FileText className="w-10 h-10 text-primary opacity-50" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Welcome to your Study Hub</h2>
              <p className="text-muted-foreground max-w-md">
                Add your study material on the left to unlock summaries, exam prep, and quizzes.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full w-full"
            >
              {activeView === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="soft-panel p-8 rounded-3xl col-span-2">
                     <h2 className="text-3xl font-bold mb-2">Material Overview</h2>
                     <p className="text-muted-foreground mb-6">Explore what StudySathi AI can do with your notes.</p>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {menuItems.map((item) => (
                           <button 
                             key={item.id}
                             onClick={() => setActiveView(item.id as any)}
                             className="p-6 rounded-2xl border border-white/8 hover:border-primary/35 transition-all text-left group bg-white/[0.03]"
                           >
                             <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                               {item.icon}
                             </div>
                             <h4 className="font-bold mb-1">{item.label}</h4>
                             <p className="text-xs text-muted-foreground">{item.desc}</p>
                           </button>
                        ))}
                     </div>
                   </div>
                </div>
              )}

              {activeView === 'summary' && <SummarizerView notes={notes} />}
              {activeView === 'exam' && <ExamAnswersView notes={notes} />}
              {activeView === 'quiz' && <QuizView notes={notes} />}
              {activeView === 'flashcards' && <FlashcardsView notes={notes} />}
              {activeView === 'chat' && <ChatView notes={notes} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

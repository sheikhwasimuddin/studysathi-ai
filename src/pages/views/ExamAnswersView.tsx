import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Loader2, Sparkles, Volume2, Copy } from 'lucide-react';
import { aiService } from '../../services/ai/aiService';
import type { ExamMarkType } from '../../services/ai/types';
import { voiceService } from '../../services/voiceService';

interface ExamAnswersViewProps {
  notes: string;
}

export const ExamAnswersView: React.FC<ExamAnswersViewProps> = ({ notes }) => {
  const [question, setQuestion] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [answer, setAnswer] = React.useState<string | null>(null);
  const [markType, setMarkType] = React.useState<ExamMarkType>('5');

  const handleGenerate = async (type: ExamMarkType) => {
    if (!question.trim()) return;
    setMarkType(type);
    setLoading(true);
    try {
      const res = await aiService.generateAnswer(notes, question, type);
      setAnswer(res.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BrainCircuit className="text-primary" />
          Exam Answer Generator
        </h2>
        <p className="text-sm text-muted-foreground">Generate structured answers for common exam questions.</p>
      </div>

      <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col gap-4">
        <div className="relative">
          <input 
            type="text" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type a question (e.g., 'What is Encapsulation?')"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            <button 
              disabled={loading || !question.trim()}
              onClick={() => handleGenerate('2')}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded-lg border border-primary/20 transition-all uppercase"
            >
              2 Marks
            </button>
            <button 
              disabled={loading || !question.trim()}
              onClick={() => handleGenerate('5')}
              className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-[10px] font-bold rounded-lg transition-all uppercase shadow-lg shadow-primary/20"
            >
              5 Marks
            </button>
            <button 
              disabled={loading || !question.trim()}
              onClick={() => handleGenerate('10')}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold rounded-lg transition-all uppercase shadow-lg shadow-purple-600/20"
            >
              10 Marks
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex-1 glass rounded-3xl flex flex-col items-center justify-center p-12">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground animate-pulse">Drafting your {markType}-mark answer...</p>
        </div>
      )}

      {answer && !loading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 glass p-8 rounded-3xl border border-white/10 relative group prose prose-invert max-w-none"
        >
          <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => voiceService.speak(answer)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-muted-foreground">
              <Volume2 className="w-4 h-4" />
            </button>
            <button onClick={() => navigator.clipboard.writeText(answer)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-muted-foreground">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 mb-6">
             <div className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full border border-primary/30 uppercase tracking-widest">
               {markType} MARKS
             </div>
             <div className="h-1 flex-1 bg-white/5 rounded-full" />
          </div>

          <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed font-serif text-lg italic">
            {answer}
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Exam Ready Structure</span>
             </div>
             <p className="text-[10px] text-muted-foreground uppercase font-mono">Verified by StudySathi AI</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

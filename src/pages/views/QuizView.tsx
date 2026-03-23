import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, HelpCircle, CheckCircle2, XCircle, ArrowRight, Loader2, Zap } from 'lucide-react';
import { aiService } from '../../services/ai/aiService';
import type { QuizQuestion } from '../../services/ai/types';

interface QuizViewProps {
  notes: string;
}

export const QuizView: React.FC<QuizViewProps> = ({ notes }) => {
  const [loading, setLoading] = React.useState(false);
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [showResult, setShowResult] = React.useState(false);
  const [score, setScore] = React.useState(0);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await aiService.generateQuiz(notes);
      const jsonStr = res.content.match(/\[[\s\S]*\]/)?.[0] || '[]';
      const data = JSON.parse(jsonStr);
      setQuestions(data);
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    if (option === questions[currentIndex].answer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 glass rounded-3xl flex flex-col items-center justify-center p-12 h-full">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Designing your personalized quiz...</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 glass rounded-3xl p-12 flex flex-col items-center justify-center text-center"
      >
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-primary/20">
          <Zap className="w-10 h-10 text-primary fill-primary" />
        </div>
        <h2 className="text-4xl font-bold mb-2">Quiz Complete!</h2>
        <p className="text-xl text-muted-foreground mb-8">You scored {score} out of {questions.length}</p>
        <div className="flex gap-4">
           <button onClick={handleGenerate} className="px-8 py-3 bg-primary text-white rounded-xl font-bold">Try New Quiz</button>
           <button onClick={() => setShowResult(false)} className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold">Review</button>
        </div>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex-1 glass rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center p-12 text-center">
        <BookOpen className="w-12 h-12 text-primary opacity-30 mb-4" />
        <h2 className="text-xl font-bold mb-2">Ready to test your knowledge?</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">Generate a 10-question MCQ quiz based on your study material.</p>
        <button 
          onClick={handleGenerate}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
        >
          <Zap className="w-4 h-4 fill-white" />
          Generate MCQ Quiz
        </button>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="text-primary" />
            Active Quiz
          </h2>
          <p className="text-sm text-muted-foreground">Question {currentIndex + 1} of {questions.length}</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-sm">
           <span className="text-green-500 font-bold">{score}</span>
           <span className="text-muted-foreground">/</span>
           <span className="text-muted-foreground">{questions.length}</span>
        </div>
      </div>

      <motion.div 
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 glass p-8 rounded-3xl border border-white/10 flex flex-col"
      >
        <h3 className="text-xl md:text-2xl font-bold mb-8 leading-tight">{q.question}</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {q.options?.map((opt, i) => {
            const isCorrect = opt === q.answer;
            const isSelected = selectedAnswer === opt;
            const showCorrect = selectedAnswer && isCorrect;
            const showWrong = isSelected && !isCorrect;

            return (
              <button
                key={i}
                disabled={!!selectedAnswer}
                onClick={() => handleAnswerSelect(opt)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                  showCorrect ? 'bg-green-500/10 border-green-500/50 text-green-400' :
                  showWrong ? 'bg-red-500/10 border-red-500/50 text-red-500' :
                  isSelected ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' :
                  'bg-white/5 border-white/5 hover:border-white/20 text-muted-foreground hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    showCorrect ? 'bg-green-500/20' : 
                    showWrong ? 'bg-red-500/20' : 
                    'bg-white/5 border border-white/10'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="font-medium">{opt}</span>
                </div>
                {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        {selectedAnswer && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Explanation</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{q.explanation || 'The answer is verified by StudySathi AI.'}</p>
          </motion.div>
        )}

        <div className="mt-auto pt-8 flex justify-end">
           <button 
             disabled={!selectedAnswer}
             onClick={nextQuestion}
             className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
           >
             {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
             <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </motion.div>
    </div>
  );
};

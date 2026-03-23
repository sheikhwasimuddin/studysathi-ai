import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronLeft, ChevronRight, RotateCcw, Loader2 } from 'lucide-react';
import { aiService } from '../../services/ai/aiService';
import type { Flashcard } from '../../services/ai/types';

interface FlashcardsViewProps {
  notes: string;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ notes }) => {
  const [loading, setLoading] = React.useState(false);
  const [cards, setCards] = React.useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await aiService.generateFlashcards(notes);
      const jsonStr = res.content.match(/\[[\s\S]*\]/)?.[0] || '[]';
      const data = JSON.parse(jsonStr);
      setCards(data);
      setCurrentIndex(0);
      setFlipped(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex < cards.length - 1) {
      setFlipped(false);
      setTimeout(() => setCurrentIndex(c => c + 1), 200);
    }
  };

  const prevCard = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setFlipped(false);
      setTimeout(() => setCurrentIndex(c => c - 1), 200);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 glass rounded-3xl flex flex-col items-center justify-center p-12 h-full">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Generating revision flashcards...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex-1 glass rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 ring-4 ring-primary/5">
           <Zap className="w-8 h-8 fill-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Ready for Revision?</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">Generate smart flashcards to memorize key concepts from your notes.</p>
        <button 
          onClick={handleGenerate}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
        >
          <Zap className="w-4 h-4 fill-white" />
          Create Flashcards
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col gap-6 h-full items-center">
      <div className="w-full flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
            <Zap className="w-6 h-6 fill-primary" />
            Revision Flashcards
          </h2>
          <p className="text-sm text-muted-foreground">Master {currentIndex + 1} of {cards.length}</p>
        </div>
        <button onClick={handleGenerate} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-muted-foreground border border-white/10">
           <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 w-full max-w-xl flex flex-col items-center justify-center perspective-1000">
        <motion.div
          onClick={() => setFlipped(!flipped)}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative w-full aspect-[4/3] cursor-pointer preserve-3d"
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden glass p-12 rounded-[2rem] border-2 border-primary/20 flex flex-col items-center justify-center text-center shadow-2xl shadow-primary/5">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-8 font-mono">Question</p>
            <h3 className="text-2xl md:text-3xl font-bold leading-tight">{currentCard.front}</h3>
            <p className="mt-12 text-[10px] uppercase font-bold text-muted-foreground/40 tracking-[0.2em]">Click to Reveal Answer</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden glass p-12 rounded-[2rem] border-2 border-green-500/20 flex flex-col items-center justify-center text-center shadow-2xl shadow-green-500/5 [transform:rotateY(180deg)]">
            <p className="text-xs font-bold uppercase tracking-widest text-green-500/60 mb-8 font-mono">Answer</p>
            <h3 className="text-2xl md:text-3xl font-bold leading-relaxed">{currentCard.back}</h3>
            <p className="mt-12 text-[10px] uppercase font-bold text-muted-foreground/40 tracking-[0.2em]">Verified Context</p>
          </div>
        </motion.div>

        <div className="mt-12 flex items-center gap-8">
           <button 
             onClick={prevCard}
             disabled={currentIndex === 0}
             className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center border border-white/10 disabled:opacity-20 transition-all group"
           >
              <ChevronLeft className="w-6 h-6 group-hover:scale-110" />
           </button>
           
           <div className="text-sm font-bold tracking-widest text-muted-foreground bg-white/5 px-4 py-2 rounded-full border border-white/10">
              {currentIndex + 1} / {cards.length}
           </div>

           <button 
             onClick={nextCard}
             disabled={currentIndex === cards.length - 1}
             className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/20 disabled:opacity-20 transition-all group"
           >
              <ChevronRight className="w-6 h-6 group-hover:scale-110" />
           </button>
        </div>
      </div>
    </div>
  );
};

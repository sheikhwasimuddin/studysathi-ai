import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, BrainCircuit, FileText, Zap } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden aurora-grid">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full hero-gradient -z-10" />
      
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 text-sm font-semibold text-primary mb-8 badge-glow">
            <Zap className="w-4 h-4 fill-primary" />
            <span>Offline study intelligence, now production-ready</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-7 tracking-tight leading-[0.95]">
            Study Smarter, <br />
            <span className="gradient-text">StudySathi AI</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-11 leading-relaxed">
            Turn raw notes into exam-ready summaries, answers, quizzes, and flashcards in one flow. Everything runs locally so your preparation stays fast, private, and distraction-free.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-lg transition-all shadow-xl shadow-primary/30 group"
            >
              Launch Study Workspace
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/15 rounded-2xl font-bold text-lg transition-all text-foreground/90">
              Explore Features
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <FeatureMiniCard 
            icon={<FileText className="w-6 h-6" />}
            title="Smart Summaries"
            description="Bullet points & keywords"
          />
          <FeatureMiniCard 
            icon={<BrainCircuit className="w-6 h-6" />}
            title="Exam Answers"
            description="2, 5, 10 mark ready"
          />
          <FeatureMiniCard 
            icon={<BookOpen className="w-6 h-6" />}
            title="Interactive Quizzes"
            description="MCQs & Revision"
          />
          <FeatureMiniCard 
            icon={<Zap className="w-6 h-6" />}
            title="Voice Tutor"
            description="Speak & Learn"
          />
        </motion.div>
      </div>
    </section>
  );
};

const FeatureMiniCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="soft-panel p-6 rounded-2xl hover:border-primary/40 transition-all duration-300 group text-left hover:-translate-y-1">
    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="font-bold mb-1 text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground/90">{description}</p>
  </div>
);

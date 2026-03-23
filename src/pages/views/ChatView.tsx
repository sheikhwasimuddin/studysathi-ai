import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, User, Loader2, Mic2 } from 'lucide-react';
import { aiService } from '../../services/ai/aiService';
import { voiceService } from '../../services/voiceService';
import { runAnywhereGenerateStream } from '../../services/ai/providers/runAnywhereSdk';
import type { ChatMessage, ChatMode } from '../../services/ai/types';

interface ChatViewProps {
  notes: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ notes }) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [streamMsg, setStreamMsg] = React.useState<{role: string, content: string, reasoning: string} | null>(null);
  const [mode, setMode] = React.useState<ChatMode>('exam');
  const [isListening, setIsListening] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setStreamMsg({ role: 'assistant', content: '', reasoning: '' });

    try {
      // Try streaming first
      let streamed = false;
      for await (const token of runAnywhereGenerateStream(newMessages)) {
        streamed = true;
        setStreamMsg(prev => prev ? { ...prev, content: prev.content + token } : null);
      }

      if (streamed) {
        // If streaming worked, get final message
        setMessages([...newMessages, { role: 'assistant', content: streamMsg?.content || '' }]);
      } else {
        // Fallback to regular chat
        const res = await aiService.chat(notes, newMessages, mode, {
          onChunk: (chunk: any) => {
            setStreamMsg(prev => {
              if (!prev) return prev;
              if (chunk.type === 'reasoning') return { ...prev, reasoning: chunk.fullText };
              if (chunk.type === 'content') return { ...prev, content: chunk.fullText };
              return prev;
            });
          }
        });
        setMessages([...newMessages, { role: 'assistant', content: res.content }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setStreamMsg(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full max-h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="text-primary" />
            AI Chat Tutor
          </h2>
          <p className="text-sm text-muted-foreground">Personalized tutoring based on your notes.</p>
        </div>
        
        <div className="flex items-center gap-2 glass p-1 rounded-xl border border-white/5">
           {(['exam', 'beginner', 'concise'] as ChatMode[]).map((m) => (
             <button
               key={m}
               onClick={() => setMode(m)}
               className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                 mode === m ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-white/5'
               }`}
             >
               {m}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 glass rounded-3xl border border-white/10 overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
                <Bot className="w-12 h-12 text-primary mb-4" />
                <p className="max-w-xs text-sm">Ask me questions about your study material. I'll use the context of your notes to help you.</p>
             </div>
          )}
          
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-primary' : 'bg-white/10 border border-white/10'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-primary" />}
                  </div>
                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10' 
                    : 'bg-white/5 border border-white/10 rounded-tl-none text-foreground/90'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {streamMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/10 border border-white/10">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none text-foreground/90 flex flex-col gap-2">
                    {streamMsg.reasoning && (
                      <div className="text-xs text-muted-foreground bg-black/20 p-3 rounded-xl border border-white/5 mb-1 font-mono whitespace-pre-wrap">
                         <span className="text-primary font-bold block mb-2 flex items-center gap-2">
                           <Loader2 className="w-3 h-3 animate-spin"/> Thinking...
                         </span>
                         {streamMsg.reasoning}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {streamMsg.content || (!streamMsg.reasoning && <Loader2 className="w-4 h-4 animate-spin text-primary inline-block" />)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && !streamMsg && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                 <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary animate-pulse" />
                 </div>
                 <div className="p-4 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                 </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white/[0.02] border-t border-white/10">
          <div className="relative flex items-center gap-2">
            <button 
              onClick={async () => {
                setIsListening(true);
                try {
                  const text = await voiceService.recognize();
                  setInput(text);
                } catch (err) {
                  console.error('Voice recognition failed:', err);
                } finally {
                  setIsListening(false);
                }
              }}
              disabled={loading || isListening}
              className={`p-3 rounded-2xl text-muted-foreground transition-colors group ${
                isListening ? 'bg-destructive/20 border border-destructive' : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Mic2 className={`w-5 h-5 ${isListening ? 'text-destructive animate-pulse' : 'group-hover:text-primary'}`} />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={notes ? "Ask about your notes..." : "Paste notes first to ask questions..."}
              disabled={!notes}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-all disabled:opacity-50"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Copy, Volume2, Search, Zap, Loader2 } from 'lucide-react';
import { aiService } from '../../services/ai/aiService';
import { voiceService } from '../../services/voiceService';

interface SummarizerViewProps {
  notes: string;
}

type ParsedSummary = {
  summary: string;
  points: string[];
  terms: string[];
};

const cleanListPrefix = (text: string) => text.replace(/^[-*\d).\s]+/, '').trim();

const isSeparatorLike = (line: string) => /^(?:[-=_*#]{6,}|[=\-]{4,}\s*\d+\.?\s*)$/.test(line.trim());

const sanitizeSummaryText = (text: string) =>
  text
    .split(/\s+/)
    .join(' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();

function hasMainConceptSummary(summary: string): boolean {
  const cleaned = sanitizeSummaryText(summary).toLowerCase();
  if (!cleaned) return false;
  if (/[=*_\-]{6,}/.test(cleaned)) return false;

  const words = cleaned.match(/[a-z][a-z0-9-]*/g) || [];
  if (words.length < 10) return false;

  const alphaChars = cleaned.replace(/[^a-z]/g, '').length;
  const symbolChars = cleaned.replace(/[a-z0-9\s.,;:!?()-]/g, '').length;
  if (alphaChars === 0) return false;
  if (symbolChars > alphaChars * 0.6) return false;

  return true;
}

function buildFallbackSummary(points: string[], terms: string[]): string {
  const topPoints = points.filter(Boolean).slice(0, 3);
  const topTerms = terms.filter(Boolean).slice(0, 5);

  if (topPoints.length === 0 && topTerms.length === 0) return '';

  const pointsText = topPoints.join(' ');
  const termsText = topTerms.length > 0 ? ` Key concepts: ${topTerms.join(', ')}.` : '';
  return sanitizeSummaryText(`${pointsText}${termsText}`);
}

function parseSummaryContent(content: string): ParsedSummary {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return {
      summary: '',
      points: [],
      terms: [],
    };
  }

  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let section: 'summary' | 'points' | 'terms' = 'summary';
  const summaryLines: string[] = [];
  const points: string[] = [];
  const terms: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    const isHeading = /^#+\s*/.test(line);
    if (isSeparatorLike(line)) {
      continue;
    }

    if (isHeading || lower.includes('summary:') || lower.includes('concise summary')) {
      section = 'summary';
      continue;
    }

    if (isHeading || lower.includes('key points') || lower.includes('bullet points') || /^\d+[).]?\s*key\s*points?/.test(lower)) {
      section = 'points';
      continue;
    }

    if (isHeading || lower.includes('terms') || lower.includes('keywords') || lower.includes('technical terms')) {
      section = 'terms';
      continue;
    }

    if (section === 'points') {
      points.push(cleanListPrefix(line));
      continue;
    }

    if (section === 'terms') {
      const chunks = line
        .split(',')
        .map((term) => cleanListPrefix(term))
        .filter(Boolean);
      terms.push(...chunks);
      continue;
    }

    summaryLines.push(line);
  }

  const paragraphChunks = normalized.split('\n\n').map((chunk) => chunk.trim()).filter(Boolean);
  const fallbackSummary = paragraphChunks[0] || normalized;
  const fallbackPoints = (paragraphChunks[1] || '')
    .split('\n')
    .map((line) => cleanListPrefix(line))
    .filter(Boolean);
  const fallbackTerms = (paragraphChunks[2] || '')
    .split(',')
    .map((term) => cleanListPrefix(term))
    .filter(Boolean);

  const summary = sanitizeSummaryText(summaryLines.join(' ').trim() || fallbackSummary);
  const normalizedPoints = (points.length ? points : fallbackPoints)
    .map((p) => sanitizeSummaryText(cleanListPrefix(p)))
    .filter((p) => p.length > 5 && !isSeparatorLike(p));
  const normalizedTerms = [...new Set(terms.length ? terms : fallbackTerms)]
    .map((t) => sanitizeSummaryText(cleanListPrefix(t)))
    .filter((t) => t.length > 2 && !isSeparatorLike(t));

  return {
    summary,
    points: normalizedPoints,
    terms: normalizedTerms,
  };
}

export const SummarizerView: React.FC<SummarizerViewProps> = ({ notes }) => {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<{ summary: string; points: string[]; terms: string[] } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [rawReasoning, setRawReasoning] = React.useState<string>('');
  const [rawContent, setRawContent] = React.useState<string>('');

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setRawReasoning('');
    setRawContent('');
    try {
      const res = await aiService.summarize(notes, {
        onChunk: (chunk: any) => {
          if (chunk.type === 'reasoning') {
            setRawReasoning(chunk.fullText);
          } else if (chunk.type === 'content') {
            setRawContent(chunk.fullText);
          }
        }
      });
      setData(parseSummaryContent(res.content || ''));
    } catch (err: any) {
      console.error('Generation Error:', err);
      setError(err?.message || 'Failed to generate summary. Please check API keys and connection.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const computedSummary = data
    ? hasMainConceptSummary(data.summary)
      ? data.summary
      : buildFallbackSummary(data.points, data.terms)
    : '';
  const showSummary = !!computedSummary;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-primary" />
            Smart Summarizer
          </h2>
          <p className="text-sm text-muted-foreground">Get a structured overview of your notes.</p>
        </div>
        {!data && !loading && (
           <button 
             onClick={handleGenerate}
             className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
           >
             <Zap className="w-4 h-4 fill-white" />
             Generate Summary
           </button>
        )}
      </div>

      {loading && !rawReasoning && !rawContent && (
        <div className="flex-1 glass rounded-3xl flex flex-col items-center justify-center p-12">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground animate-pulse">Analyzing your study material...</p>
        </div>
      )}

      {loading && (rawReasoning || rawContent) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col gap-6"
        >
          {rawReasoning && (
            <div className="glass p-6 rounded-3xl border border-white/5 bg-primary/5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking Process
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap font-mono">{rawReasoning}</p>
            </div>
          )}
          
          {rawContent && (
            <div className="glass p-8 rounded-3xl border border-white/5 opacity-70">
               <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Drafting Summary...
               </h3>
               <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">{rawContent}</p>
            </div>
          )}
        </motion.div>
      )}

      {error && !loading && (
        <div className="flex-1 glass rounded-3xl flex flex-col items-center justify-center p-12 border-destructive/30 text-destructive text-center">
          <p className="font-bold text-lg mb-2">Error Occurred</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={handleGenerate}
            className="mt-6 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {data && !error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col gap-6"
        >
          {showSummary ? (
            <div className="glass p-8 rounded-3xl border border-white/5 relative group">
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => voiceService.speak(computedSummary)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-muted-foreground">
                    <Volume2 className="w-4 h-4" />
                 </button>
                 <button onClick={() => copyToClipboard(computedSummary)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-muted-foreground">
                    <Copy className="w-4 h-4" />
                 </button>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Concise Summary</h3>
              <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">{computedSummary}</p>
            </div>
          ) : (
            <div className="glass p-5 rounded-3xl border border-white/5 text-sm text-muted-foreground">
              Summary not available yet. Try regenerating to get better concept coverage.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-3xl border border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Key Points
              </h3>
              <ul className="space-y-3">
                {data.points.map((point, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground break-words">
                     <span className="text-primary font-bold">0{i+1}</span>
                     {cleanListPrefix(point)}
                  </li>
                ))}
                {data.points.length === 0 && (
                  <li className="text-sm text-muted-foreground">No key points were detected in this response.</li>
                )}
              </ul>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Core Terms</h3>
              <div className="flex flex-wrap gap-2">
                {data.terms.map((term, i) => (
                  <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20">
                    {cleanListPrefix(term)}
                  </span>
                ))}
                {data.terms.length === 0 && (
                  <span className="text-sm text-muted-foreground">No core terms were detected in this response.</span>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleGenerate}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-colors mt-auto"
          >
            Regenerate Summary
          </button>
        </motion.div>
      )}
    </div>
  );
};
